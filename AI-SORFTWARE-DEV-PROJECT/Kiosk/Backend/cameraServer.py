version = 1.0

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import cv2

PRED_SERVER_URL = "http://localhost:3000"
HOST="localhost"
PORT=3001

app = FastAPI()
cam = cv2.VideoCapture(0)
origins = [r'^http:\/\/localhost($|:\d+$)']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True
)

face_detector_path = "./model/haarcascade_frontalface_default.xml"
detector = cv2.CascadeClassifier(face_detector_path)


def camera_stream():
    try:
        ret, frame = cam.read()
        cv2.imwrite('loggetfile.jpg',frame)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x-int(w*0.1), y-int(h*0.3)), (x + w+int(w*0.2), y + h+(int(h*0.5))), (255, 255, 255), 2)
        return cv2.imencode('.jpg', frame)[1].tobytes()
    except Exception as e:
            print(f"camera stream error : {e}")

def gen_frame():
    while True:
        try:
            frame = camera_stream()
            yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n') 
        except Exception as e:
            print(f"gen frame error : {e}")

@app.get('/video_feed')
def video_feed():
    try:
        return StreamingResponse(gen_frame(),
                        media_type='multipart/x-mixed-replace; boundary=frame')
    except Exception as e:
            print(f"video feed error : {e}")

if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(app, host=HOST, port=PORT, log_level="info")
    except Exception as e:
        print(f"app runtime error : {e}")
        raise SystemExit
