import os
import numpy as np
from module.deepface.basemodels import VGGFace
import requests
from keras.models import Model, Sequential
from keras.layers import Convolution2D, Flatten, Activation

# ----------------------------------------


def loadModel(
    jsonAuth,host = 'http://localhost:5000'
) -> Model:
    # print("age_model_weights.h5 will be downloaded...")
    # try:
    #     url=host+'/model/age'
    #     return requests.get(url,jsonAuth)
    # except:
        print("load model error : start with defult model age")
        url="https://github.com/serengil/deepface_models/releases/download/v1.0/age_model_weights.h5"
        model = VGGFace.baseModel()

        classes = 101
        base_model_output = Sequential()
        base_model_output = Convolution2D(classes, (1, 1), name="predictions")(model.layers[-4].output)
        base_model_output = Flatten()(base_model_output)
        base_model_output = Activation("softmax")(base_model_output)

        # --------------------------

        age_model = Model(inputs=model.input, outputs=base_model_output)

        output = "age_model_weights.h5"
        
        if not os.path.isfile(output):
            response = requests.get(url, verify=False) 
            if response.status_code == 200:
                with open(output, 'wb') as f:
                    f.write(response.content)
                print("File downloaded successfully.")
            else:
                print("Failed to download the file. Status code:", response.status_code)

        age_model.load_weights(output)

        return age_model


def findApparentAge(age_predictions) -> np.float64:
    output_indexes = np.array(list(range(0, 101)))
    apparent_age = np.sum(age_predictions * output_indexes)
    return apparent_age
