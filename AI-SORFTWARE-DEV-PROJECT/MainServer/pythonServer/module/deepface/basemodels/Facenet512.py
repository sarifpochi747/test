import os
import requests
from module.deepface.basemodels import Facenet


from keras.models import Model


def loadModel(
    url="https://github.com/serengil/deepface_models/releases/download/v1.0/facenet512_weights.h5",
) -> Model:

    model = Facenet.InceptionResNetV2(dimension=512)
    output = "facenet512_weights.h5"
    
    if not os.path.isfile(output):
        print("facenet512_weights.h5 will be downloaded...")
        response = requests.get(url, verify=False) 
        if response.status_code == 200:
            with open(output, 'wb') as f:
                f.write(response.content)
            print("File downloaded successfully.")
        else:
            print("Failed to download the file. Status code:", response.status_code)
   
    model.load_weights(output)
    return model
