version = 1.0

import random

from module.deepface.commons import functions
from module.deepface.basemodels import (VGGFace,Facenet512)
from module.deepface.extendedmodels import Age, Gender, Emotion
from sklearn.metrics.pairwise import cosine_similarity
import pyttsx3

import asyncio
import socketio

from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

import os
import cv2
import time
import json
import signal
import base64
import requests
import subprocess
import numpy as np
from pathlib import Path
from starlette.staticfiles import StaticFiles
from concurrent.futures import ThreadPoolExecutor,wait

engine = pyttsx3.init()
TH_voice_id = "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_THAI"

engine.setProperty('volume', 0.9)  # Volume 0-1
engine.setProperty('rate', 120)  #148
engine.setProperty('voice', TH_voice_id)

isSpeak = False

SERVER_URL = "http://192.168.15.227:5000"
HOST="localhost"
PORT=3000

organizationId = "50d76fd2-8257-4875-b193-46eb38a5ccc6"
cameraId = 'a0d5afd3-f38e-4d49-86d5-f136607c6f6f'
global accessToken

threshold = 0.4
alertThreshold = 0.6
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
greeting ={
    'happy':[],
    'surprise':[],
    'surprise':[],
    'sad':[],
    'fear':[],
    'disgust':[],
    'angry' :[],
    'neutral':[],
}

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
        print(f"seachNode error : {e}")

def getAlert():
    global alertFace
    try:
        response = requests.get(f"{SERVER_URL}/facial-alert/camera-get-alert?organizationId={organizationId}",
                    json={'cameraId': cameraId, 'accessToken': accessToken})
        alertFace = (json.loads(response.text))['data']
        print(alertFace)
    except Exception as e:
        print(e)

def getGreeting():
    try:
        response = requests.get(f"{SERVER_URL}/greeting/{organizationId}?pageSize=100000",
                    json={'cameraId': cameraId, 'accessToken': accessToken})
        data = (json.loads(response.text))['data']
        for greet in data:
            if greeting[greet['emotion']] == None :
                greeting[greet['emotion']] = []
            greeting[greet['emotion']].append(greet)
            print(greeting)
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
        print(faceTreeRoot)
    except Exception as e:
        print(e)

try:
    authRequests = requests.post(SERVER_URL+'/auth/camera-client', json={'cameraId':cameraId ,'organizationId':organizationId})
    authRequests = json.loads(authRequests.text)
    accessToken = authRequests['data']['accessToken']
except Exception as e:
    print(f'Authentication failed : {e}')
    os.kill(os.getpid(), signal.SIGTERM)
    
jsonAuth = {'cameraId': cameraId, 'accessToken': accessToken}

models = {}
models["VGGFace"] = VGGFace.loadModel(jsonAuth,SERVER_URL)
models["Facenet512"] = Facenet512.loadModel(jsonAuth,SERVER_URL)
models["emotion"] = Emotion.loadModel(jsonAuth,SERVER_URL)
models["age"] = Age.loadModel(jsonAuth,SERVER_URL)
models["gender"] = Gender.loadModel(jsonAuth,SERVER_URL)

getGreeting()
getAlert()
getEmbedded()

app = FastAPI()
origins = [r'^http:\/\/localhost($|:\d+$)']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["get"]
)

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

@sioClient.on('server-restarted')
def serverRestarted(data):
    print(data)
    global accessToken
    try:
        authRequests = requests.post(SERVER_URL+'/auth/camera-client', json={'cameraId':cameraId ,'organizationId':organizationId})
        authRequests = json.loads(authRequests.text)
        accessToken = authRequests['data']['accessToken']
    except Exception as e:
        os.kill(os.getpid(), signal.SIGTERM)
        print(f'Authentication failed : {e}')
    
@sioClient.on(str(organizationId)+'-camera-alert-listening')
def alretListening(data):
    print(data)
    try:
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
    except Exception as e:
        print(f"alretListening error: {e}")
    

@sioClient.on(str(organizationId)+'-camera-greeting-listening')
def greetingListening(data):
    print(data)
    try:
        data = json.loads(data)
        if data['method'] == 'add':
            greeting[data['emotion']].append(data)
        elif data['method'] == 'update':
            for i in range(0, len(greeting[data['emotion']])-1):
                if(greeting[data['emotion']][i]['greetingId'] == data['greetingId']):
                    greeting[data['emotion']][i]['message'] = data['message']
                    greeting[data['emotion']][i]['emotion'] = data['emotion']
                    #checked
                    break
        else:
            for i in range(0, len(greeting[data['emotion']])-1):
                if(greeting[data['emotion']][i]['greetingId'] == data['greetingId']):
                    #checked
                    break
    except Exception as e:
        print(f"greetingListening error: {e}")

@sioClient.on(str(accessToken)+'-force-exit')
def forceExit():
    os.kill(os.getpid(), signal.SIGTERM)


script_dir = os.path.dirname(os.path.realpath(__file__))
app.mount("/assets", StaticFiles(directory=Path(os.path.join(script_dir,"dist/assets")), html=True), name="assets")
@app.get('/')
async def index():
    try:
        sioClient.connect(SERVER_URL)
    except:
        pass
    file_path = os.path.join(script_dir, "dist/index.html")
    return HTMLResponse(content=open(file_path).read())

@app.get('/pred')
async def pred():
    try:
        img_show = cv2.imread('loggetfile.jpg')
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
        retFace = []
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
                            obj['embeddedId'] = found[1]['embeddedId'] if "embeddedId" in found[1] and found[1]['embeddedId'] else None
                            obj['name'] = found[1]['name'] if "name" in found[1] and found[1]['name'] else None 
                        else:
                            obj['embeddedId'] =  None
                            obj['name'] =  "Unknow"
                    except Exception as e:
                        obj['embeddedId'] =  None
                        obj['name'] =  "Unknow"
                        print(f"name error : {e}")
                
                def cropImg():
                    try:
                        x=region['x']
                        w=region['w']
                        y=region['y']
                        h=region['h']
                        
                        x_start = x-int(w*0.1) if x-int(w*0.1) >= 0 else x
                        x_end =  x + w+int(w*0.2)  if  x + w+int(w*0.2) <= imgPath.shape[0] else x+w
                        y_start = y-int(h/3) if y-int(h/3) >= 0 else y
                        y_end =  y + h+(2*int(h/3))  if  y + h+(2*int(h/3)) <= imgPath.shape[0] else y+h
                        
                        _, encoded_img = cv2.imencode('.png', imgPath[y_start:y_end,x_start:x_end])
                        faceImg_base64 = base64.b64encode(encoded_img).decode('utf-8')
                        obj["image"] = faceImg_base64
                    except Exception as e:
                        print(f"crop img error : {e}")
                        
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
                                        'detectionArray':[json.dumps(region)],
                                        'accessToken':accessToken,
                                        'organizationId':organizationId
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
                    for index,face in enumerate(faceLog):
                        similarity = cosine_similarity(np.array(obj["embedding"]).reshape(1,-1),np.array(face["embedding"]).reshape(1,-1)) #float 0.xxx
                        if(stamp - face["timeStamp"] > timeThreshold):
                            faceLog.pop(index)
                            continue
                        if(similarity[0][0]>threshold):
                            count += 1
                            break
                        
                            
                            
                    if(count == 0):
                        if(region['w']>50):
                            with ThreadPoolExecutor() as executor:
                                futures = [
                                    executor.submit(predict_alert),
                                    executor.submit(cropImg),
                                    executor.submit(predict_emotion),
                                    executor.submit(predict_age),
                                    executor.submit(predict_gender),
                                    executor.submit(search_name),
                                    ]
                                wait(futures)
                                json_data = json.dumps({'detection':obj})
                                try:
                                    retFace.append(json_data)
                                except Exception  as e:
                                    print(f"sending error : {e}")
                            
                        obj['timeStamp'] = stamp
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
                        random_number = 0
                        
                        global greeting
                        global isSpeak
                        
                        try:
                            try:
                                random_number = random.randint(0, len(greeting[obj['emotion']])-1)
                            except :
                                random_number = 0
                            if(random_number<0):
                                random_number = 0
                            if isSpeak == False:
                                speekTxt = ''
                                if len(greeting[obj['emotion']])>0:
                                    speekTxt+=greeting[obj['emotion']][random_number]['message']
                                else:
                                    speekTxt+='สวัสดี'
                                try:
                                    if(obj['name'] != 'Unknow'):
                                        speekTxt+= (' คุณ'+obj['name'])                                
                                except:
                                    pass
                                isSpeak = True
                                engine.say(speekTxt)
                                engine.runAndWait()   
                                isSpeak = False
                            
                        except Exception as e:
                            isSpeak = False
                            print(f"speak error : {e}")
                        global newFace
                        newFace += 1 
        try:
            await asyncio.gather(*[multiPred(img_content, region) for img_content, region, confidence in img_objs])
        except Exception as e:
            print(e)
        if(newFace > 0):
            img_encoded = cv2.imencode('.png', img_show)[1]
            img_base64 = base64.b64encode(img_encoded).decode('utf-8')
            requests.post(SERVER_URL+'/detection/create', 
                          json={
                              'imgFile':img_base64,
                              'detectionArray':faceDetected,
                              'timeStamp': stamp,
                              'cameraId':cameraId,
                              'accessToken':accessToken,
                              'alertDetectionArray':alertDetected
                              })
        if(retFace and len(retFace)!=0):
            return retFace
        return []
    except Exception as e:
        print(f"prediction error : {e}")

        


if __name__ == "__main__":
    import uvicorn
    try:
        subprocess.Popen(['start', 'chrome', '--start-fullscreen', 'http://localhost:3000'], shell=True)
        uvicorn.run(app, host=HOST, port=PORT, log_level="info")
    except Exception as e:
        print(f"app runtime error : {e}")
        raise SystemExit