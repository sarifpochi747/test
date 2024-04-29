import os
import requests
from module.deepface.basemodels import Facenet


from keras.models import Model


def loadModel(
    jsonAuth,host = 'http://localhost:5000'
) -> Model:
    # print("facenet512_weights.h5 will be downloaded...")
    # try:
    #     url = host+'/model/facenet512'
    #     return requests.get(url,jsonAuth)
    # except:
        print("load model error : start with defult model facenet512")
        url="https://github.com/serengil/deepface_models/releases/download/v1.0/facenet512_weights.h5"
        model = Facenet.InceptionResNetV2(dimension=512)
        output = "facenet512_weights.h5"
        
        if not os.path.isfile(output):
            response = requests.get(url, verify=False) 
            if response.status_code == 200:
                with open(output, 'wb') as f:
                    f.write(response.content)
                print("File downloaded successfully.")
            else:
                print("Failed to download the file. Status code:", response.status_code)
    
        model.load_weights(output)
        return model
