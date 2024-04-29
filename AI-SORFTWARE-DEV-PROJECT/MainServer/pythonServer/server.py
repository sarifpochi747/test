import sys
sys.path.append('./baseModel')
sys.path.append('./module')

from module.deepface.commons import functions
from module.deepface.basemodels import (VGGFace,Facenet512)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sklearn.metrics.pairwise import cosine_similarity

import cv2
import json
import base64
import numpy as np
from PIL import Image
from io import BytesIO

from baseModel import ImgReq,checkImgRes,cropImgReq,verifyFace

threshold = 0.68


HOST="localhost"
PORT=5001

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model_name = "Facenet512"
enforce_detection = True
detector_backend = "opencv"
align = True
normalization = "base"

# VGGFace = VGGFace.loadModel()
Facenet512_Model = Facenet512.loadModel()

@app.post('/crop-image')
async def cropImage(data:cropImgReq):
    try:
        try:
            imgB64 = data.imgB64
            region = json.loads(data.region)
            
            base64_string = imgB64.split(",")[-1]
            image_bytes = base64.b64decode(base64_string)
            image_pil = Image.open(BytesIO(image_bytes))
            img_show = np.array(image_pil)
            
            x=region['x']
            w=region['w']
            y=region['y']
            h=region['h']
            
            x_start = x-int(w*0.1) if x-int(w*0.1) >= 0 else x
            x_end =  x + w+int(w*0.2)  if  x + w+int(w*0.2) <= img_show.shape[0] else x+w
            
            y_start = y-int(h/3) if y-int(h/3) >= 0 else y
            y_end =  y + h+(2*int(h/3))  if  y + h+(2*int(h/3)) <= img_show.shape[0] else y+h
                        
            img_show = cv2.cvtColor(img_show[y_start:y_end,x_start:x_end], cv2.COLOR_BGR2RGB)
            _, encoded_img = cv2.imencode('.png',img_show)
            faceImg = base64.b64encode(encoded_img).decode('utf-8')
            
            return f'data:image/png;base64,{faceImg}'
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail=f"Internal server error : {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error : {e}")


@app.post('/predict-embedding')
async def predict_embedding(data:ImgReq):
    try:
        try:
            imgB64 = data.imgB64
            base64_string = imgB64.split(",")[-1]
            image_bytes = base64.b64decode(base64_string)
            image_pil = Image.open(BytesIO(image_bytes))
            img_show = np.array(image_pil)
            
            target_size = functions.find_target_size(model_name=model_name)
            img_objs = functions.extract_faces(
                img=img_show,
                target_size=target_size,
                detector_backend=detector_backend,
                grayscale=False,
                enforce_detection=enforce_detection,
                align=align,
            )
            img_content, region, confidence = img_objs[0]
        except:
           raise HTTPException(status_code=500, detail=f"Internal server error : {e}")
        
        if img_content.shape[0] > 0 and img_content.shape[1] > 0:
            img_gray = cv2.cvtColor(img_content[0], cv2.COLOR_BGR2GRAY)
            img_gray = cv2.resize(img_gray, (48, 48))
            img_gray = np.expand_dims(img_gray, axis=0)
            img = functions.normalize_input(img=img_content, normalization=normalization)
            
            if "keras" in str(type(Facenet512_Model)):
                embedding = Facenet512_Model(img, training=False).numpy()[0].tolist()
            else:
                embedding = Facenet512_Model.predict(img)[0].tolist()
            return json.dumps(embedding)

        raise HTTPException(status_code=500, detail=f"Internal server error : {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error : {e}")


@app.post('/verify-face')
async def verify_Face(data:verifyFace):
    try: 
        similarity = cosine_similarity(np.array(json.loads(data.coreface)).reshape(1,-1),np.array(json.loads(data.detectface)).reshape(1,-1))
        return (similarity[0][0] > threshold).item() 
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal server error : {e}")


@app.post('/verify-img')
async def verifyImg(data:ImgReq):
    try: 
        imgB64 = data.imgB64
        base64_string = imgB64.split(",")[-1]
        image_bytes = base64.b64decode(base64_string)
        image_pil = Image.open(BytesIO(image_bytes))
        
        img_show = np.array(image_pil)
        target_size = functions.find_target_size(model_name=model_name)
        
        shape = img_show.shape
        try:
            img_objs = functions.extract_faces(
                img=img_show,
                target_size=target_size,
                detector_backend=detector_backend,
                grayscale=False,
                enforce_detection=enforce_detection,
                align=align,
            )
        except:
            body:checkImgRes = {
                'isPass': False,
                'message': 'ตรวจไม่พบใบหน้าในภาพ'
            }
            return JSONResponse(content=body)
        
        img_content, region, confidence = img_objs[0]
        
        x=region['x']
        w=region['w']
        y=region['y']
        h=region['h']
        
        x_start = x-int(w*0.1) if x-int(w*0.1) >= 0 else x
        x_end =  x + w+int(w*0.2)  if  x + w+int(w*0.2) <= img_content.shape[0] else x+w
        y_start = y-int(h/3) if y-int(h/3) >= 0 else y
        y_end =  y + h+(2*int(h/3))  if  y + h+(2*int(h/3)) <= img_content.shape[0] else y+h
        
        img_log = cv2.cvtColor(img_show, cv2.COLOR_BGR2RGB)
        _, encoded_img = cv2.imencode('.png', img_log[y_start:y_end,x_start:x_end])
        faceImg_base64 = base64.b64encode(encoded_img).decode('utf-8')
        body:checkImgRes = {
            'isPass': True,
            'message': '',
            'imgB64' : f'data:image/png;base64,{faceImg_base64}'
        }
        return JSONResponse(content=body)
            
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal server error : {e}")
        


if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(app, host=HOST, port=PORT, log_level="info")
    except Exception as e:
        print(f"app runtime error : {e}")
        raise SystemExit
