import os
import requests
from module.deepface.basemodels import VGGFace

from keras.models import Model, Sequential
from keras.layers import Convolution2D, Flatten, Activation
# -------------------------------------

# Labels for the genders that can be detected by the model.
labels = ["Woman", "Man"]


def loadModel(
    jsonAuth,host = 'http://localhost:5000'
) -> Model:
    # print("gender_model_weights.h5 will be downloaded...")
    # try:
    #     url=host+'/model/gender'
    #     return requests.get(url,jsonAuth)
    # except:
        print("load model error : start with defult model gender")
        url="https://github.com/serengil/deepface_models/releases/download/v1.0/gender_model_weights.h5"
        model = VGGFace.baseModel()

        classes = 2
        base_model_output = Sequential()
        base_model_output = Convolution2D(classes, (1, 1), name="predictions")(model.layers[-4].output)
        base_model_output = Flatten()(base_model_output)
        base_model_output = Activation("softmax")(base_model_output)

        # --------------------------

        gender_model = Model(inputs=model.input, outputs=base_model_output)

        output = "gender_model_weights.h5"

        if not os.path.isfile(output):
            response = requests.get(url, verify=False) 
            if response.status_code == 200:
                with open(output, 'wb') as f:
                    f.write(response.content)
                print("File downloaded successfully.")
            else:
                print("Failed to download the file. Status code:", response.status_code)

        gender_model.load_weights(output)

        return gender_model
