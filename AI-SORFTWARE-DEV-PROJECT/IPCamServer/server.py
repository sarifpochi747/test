version = 1.0

from rtsp import Client

from module.deepface.commons import functions
from module.deepface.basemodels import (VGGFace,Facenet512)
from module.deepface.extendedmodels import Age, Gender, Emotion
from sklearn.metrics.pairwise import cosine_similarity

import asyncio
import socketio

import os
import cv2
import time
import json
import signal
import base64
import requests
import numpy as np
from concurrent.futures import ThreadPoolExecutor,wait

isSpeak = False

CAMERA_URL = 'rtsp://admin:Admin12345@192.168.15.64/1'
SERVER_URL = "http://192.168.15.227:5000"

cam = cv2.VideoCapture(CAMERA_URL)
organizationId = "681fa225-9244-4875-9b5d-0e5f6716cf7e"
cameraId = '97f952e2-772f-4440-990d-8115748fc2a0'
global accessToken

threshold = 0.68
alertThreshold = 0.68
timeThreshold = 30
model_name="VGG-Face"
# model_name="Facenet512"
enforce_detection=True
detector_backend="opencv"
align=True

newFace = 0
faceLog = []
alertFace = []
faceTreeRoot = None

def buildTree(node,insertNode):
    try:
        try:
            insertNode['child']
        except:
            insertNode['child'] = []
            
        global faceTreeRoot
        if(faceTreeRoot == None):
            faceTreeRoot = {}
            faceTreeRoot = insertNode
        
        else:
            if(len(node['child'])<4):
                node['child'].append(insertNode)
            else:
                nearestIndex = 0
                similarityLog = None
                for index, childNode in enumerate(node['child']):
                    similarity = cosine_similarity(np.array(json.loads(childNode["embedding"])).reshape(1,-1),np.array(json.loads(insertNode["embedding"])).reshape(1,-1))
                    if(not similarityLog or similarityLog == None or similarity > similarityLog ):
                        nearestIndex = index
                        similarityLog = similarity
                buildTree(node['child'][nearestIndex],insertNode)
    except Exception as e:
        print(f"buildTree error : {e}")

def seachNode(node,newNode,similarity):
    try:
        nextTarget = {}
        nextTargetSim = None 
        for childNode in node['child']:
            similarity = cosine_similarity(np.array(json.loads(childNode["embedding"])).reshape(1,-1),np.array(json.loads(newNode["embedding"])).reshape(1,-1))
            if(not nextTargetSim or nextTargetSim == None or similarity > nextTargetSim ):
                nextTargetSim = similarity
                nextTarget = childNode
        
        nearestNode = {}
        nearestNodeSim = None
        if(len(nextTarget['child']) > 0):
            nearestNodeSim , nearestNode  = seachNode(nextTarget,newNode,nextTargetSim)
            if(similarity > nextTargetSim and similarity > nearestNodeSim):
                return [similarity,{"embeddedId":node['embeddedId'],"name":node['employee']['name']}]
            elif(nextTargetSim > nearestNodeSim):
                return [nextTargetSim,{"embeddedId":nextTarget['embeddedId'],"name":nextTarget['employee']['name']}]
            else:
                return [nearestNodeSim,{"embeddedId":nearestNode['embeddedId'],"name":nearestNode['employee']['name']}]
        else:
            if(similarity > nextTargetSim):
                return [similarity,{"embeddedId":node['embeddedId'],"name":node['employee']['name']}]
            return [nextTargetSim,{"embeddedId":nextTarget['embeddedId'],"name":nextTarget['employee']['name']}]
    except Exception as e:
        print(f"buildTree error : {e}")

def getAlert():
    global alertFace
    try:
        response = requests.get(f"{SERVER_URL}/facial-alert/camera-get-alert?organizationId={organizationId}",
                    json={'cameraId': cameraId, 'accessToken': accessToken})
        alertFace = (json.loads(response.text))['data']
    except Exception as e:
        print(e)

def getEmbedded():
    global faceTreeRoot
    try:
        response = requests.get(f"{SERVER_URL}/embedded?organizationId={organizationId}",
                    json={'cameraId': cameraId, 'accessToken': accessToken})
        response = (json.loads(response.text))['data']
        for face in response:
            buildTree(faceTreeRoot,face)
    except Exception as e:
        print(e)

try:
    authRequests = requests.post(SERVER_URL+'/auth/camera-client', json={'cameraId':cameraId ,'organizationId':organizationId})
    authRequests = json.loads(authRequests.text)
    accessToken = authRequests['data']['accessToken']
except Exception as e:
    os.kill(os.getpid(), signal.SIGTERM)
    print(f'Authentication failed : {e}')
    
jsonAuth = {'cameraId': cameraId, 'accessToken': accessToken}

models = {}
models["VGGFace"] = VGGFace.loadModel(jsonAuth,SERVER_URL)
models["Facenet512"] = Facenet512.loadModel(jsonAuth,SERVER_URL)
models["emotion"] = Emotion.loadModel(jsonAuth,SERVER_URL)
models["age"] = Age.loadModel(jsonAuth,SERVER_URL)
models["gender"] = Gender.loadModel(jsonAuth,SERVER_URL)
    
getAlert()
getEmbedded()

sioClient = socketio.Client()
sioClient.connect(SERVER_URL)

@sioClient.event
def connect():
    print('Connected to server')

@sioClient.event
def disconnect():
    print('Disconnected from server')

@sioClient.on(str(accessToken)+'recieved')
def recievedData(data):
    print(data)

@sioClient.on(str(organizationId)+'-camera-isActive')
def isActive():
    sioClient.emit('cameara-active-response', {'cameraId':cameraId,'organizationId':organizationId})

@sioClient.on(str(organizationId)+'-camera-alert-listening')
def alretListening(data):
    data = json.loads(data)
    if data['method'] == 'add':
        alertFace.append(data)
        #checked
    else:
        for i in range(0, len(alertFace)):
            if(alertFace[i]['alertId'] == data['alertId']):
                alertFace.pop(i)
                #checked
                break

@sioClient.on(str(accessToken)+'-force-exit')
def forceExit():
    os.kill(os.getpid(), signal.SIGTERM)

async def pred(img_show):
    try:
        imgPath = img_show
        if(len(img_show) <= 0) :
            return []
        target_size = functions.find_target_size(model_name=model_name)
        img_objs = functions.extract_faces(
                    img=img_show,
                    target_size=target_size,
                    detector_backend=detector_backend,
                    grayscale=False,
                    enforce_detection=enforce_detection,
                    align=align,
                )
        faceDetected = []
        alertDetected = []
        global newFace
        newFace = 0
        stamp = time.time() + (7 * 3600)
        async def multiPred(img_content, region):
            count = 0
            if img_content.shape[0] > 0 and img_content.shape[1] > 0 :
                
                obj = {}
                img_gray = cv2.cvtColor(img_content[0], cv2.COLOR_BGR2GRAY)
                img_gray = cv2.resize(img_gray, (48, 48))
                img_gray = np.expand_dims(img_gray, axis=0)
                
                def predict_embedding():
                    try:
                        newSize = (160, 160)
                        img = cv2.resize(img_content[0],newSize)
                        img = np.expand_dims(img, axis=0)
                        if "keras" in str(type(models["Facenet512"])):
                            embedding = models["Facenet512"](img, training=False).numpy()[0].tolist()
                        else:
                            embedding = models["Facenet512"].predict(img)[0].tolist()
                        
                        obj["embedding"] = embedding
                        obj["facePosition"] = region
                    except Exception as e:
                        print(f"embedding prediction error : {e}")
                        return []
                
                def search_name():
                    try:
                        global faceTreeRoot
                        similarity = cosine_similarity(np.array(obj["embedding"]).reshape(1,-1),np.array(json.loads(faceTreeRoot["embedding"])).reshape(1,-1))
                        newNode = {
                            'embedding':json.dumps(obj["embedding"]),
                        }
                        found = seachNode(faceTreeRoot,newNode,similarity)
                        if(found[0][0][0]>threshold):
                            obj['embeddedId'] = found[1]['embeddedId'] if "embeddedId" in found[1]and found[1]['embeddedId'] else None
                            obj['name'] = found[1]['name'] if "name" in found[1]and found[1]['name'] else "Unknow" 
                        else:
                            obj['embeddedId'] =  None
                            obj['name'] =  "Unknow"
                    except Exception as e:
                        obj['embeddedId'] =  None
                        obj['name'] =  "Unknow"
                        print(f"name error : {e}")
                    
                def predict_emotion():
                    try:
                        emotion_predictions = models["emotion"].predict(img_gray, verbose=0)[0, :]
                        obj["emotion"] = Emotion.labels[np.argmax(emotion_predictions)]
                        
                    except Exception as e:
                        print(f"emotion prediction error : {e}")

                def predict_age():
                    try:
                        age_predictions = models["age"].predict(img_content, verbose=0)[0, :]
                        apparent_age = Age.findApparentAge(age_predictions)
                        obj["age"] = int(apparent_age)
                    except Exception as e:
                        print(f"age prediction error : {e}")

                def predict_gender():
                    try:
                        gender_predictions = models["gender"].predict(img_content, verbose=0)[0, :]
                        obj["gender"] = Gender.labels[np.argmax(gender_predictions)]
                    except Exception as e:
                        print(f"gender prediction error : {e}")
                        
                def predict_alert():
                    try:
                        global alertFace
                        for face in alertFace:
                            similarity = cosine_similarity(np.array(obj["embedding"]).reshape(1,-1),np.array(json.loads(face["embedding"])).reshape(1,-1)) #float 0.xxx
                            if(similarity[0][0]>alertThreshold):
                                x=region['x']
                                w=region['w']
                                y=region['y']
                                h=region['h']
                                
                                x_start = x-int(w*0.1) if x-int(w*0.1) >= 0 else x
                                x_end =  x + w+int(w*0.2)  if  x + w+int(w*0.2) <= imgPath.shape[0] else x+w
                                y_start = y-int(h/3) if y-int(h/3) >= 0 else y
                                y_end =  y + h+(2*int(h/3))  if  y + h+(2*int(h/3)) <= imgPath.shape[0] else y+h
                                
                                cv2.rectangle(img_show, (x_start, y_start), (x_end,y_end), (0, 0, 255), 2)
                                alertDetected.append(
                                    {
                                        'alertId':eval(face['alertId']),
                                        'cameraId':cameraId,
                                        'timeStamp':stamp,
                                        'detectionArray':[json.dumps(region)]
                                    }
                                )
                                break
                    except Exception as e:
                        print(f"alert prediction error : {e}")
                        
                with ThreadPoolExecutor() as executor:
                    futures = [
                        executor.submit(predict_embedding),
                    ]
                    wait(futures)
                    
                    obj['timeStamp'] = stamp
                    for index,face in enumerate(faceLog):
                        print(len(faceLog))
                        print(stamp - face["timeStamp"])
                        similarity = cosine_similarity(np.array(obj["embedding"]).reshape(1,-1),np.array(face["embedding"]).reshape(1,-1)) #float 0.xxx
                        if(stamp - face["timeStamp"] > timeThreshold):
                            print(faceLog.pop(index))
                            print(len(faceLog))
                            # faceLog.pop(index)
                            continue
                        if(similarity[0][0]>threshold):
                            count += 1
                            break
                            
                    if(count == 0):
                        with ThreadPoolExecutor() as executor:
                            futures = [
                                executor.submit(predict_alert),
                                executor.submit(predict_emotion),
                                executor.submit(predict_age),
                                executor.submit(predict_gender),
                                executor.submit(search_name),
                                ]
                            wait(futures)
                        faceLog.append(obj)
                        faceDetected.append({
                            'facePosition' : json.dumps(obj["facePosition"]),
                            'embedding' : json.dumps(obj["embedding"]),
                            'emotion' : obj["emotion"],
                            'age' : obj["age"],
                            'gender' : obj["gender"],
                            'name' : obj["name"] if "name" in obj and obj["name"] else None,
                            'embeddedId':int(obj["embeddedId"]) if "embeddedId" in obj and obj["embeddedId"] else None
                        })
                        global newFace
                        newFace += 1

        try:
            await asyncio.gather(*[multiPred(img_content, region) for img_content, region, confidence in img_objs])
        except Exception as e:
            print(f'error : {e}')
        if(newFace > 0):
            img_encoded = cv2.imencode('.png', img_show)[1]
            img_base64 = base64.b64encode(img_encoded).decode('utf-8')
            try:
                requests.post(SERVER_URL+'/detection/create', 
                            json={
                                'imgFile':img_base64,
                                'detectionArray':faceDetected,
                                'timeStamp': stamp,
                                'cameraId':cameraId,
                                'accessToken':accessToken,
                                'alertDetectionArray':alertDetected
                                })
            except Exception as e:
                print(e)

        return []
    except Exception as e:
        print(f"prediction error : {e}")

if __name__ == "__main__":
    print(f"server is running for camera : {CAMERA_URL}")
    with Client(rtsp_server_uri=CAMERA_URL) as client:
        while True:
            try:
                frame = client.read(raw=True)
                if frame is not None:
                    asyncio.run(pred(frame))
                time.sleep(0.3)
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")