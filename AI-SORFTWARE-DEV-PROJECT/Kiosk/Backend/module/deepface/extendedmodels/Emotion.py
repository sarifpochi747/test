import os
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, AveragePooling2D, Flatten, Dense, Dropout
import requests

labels = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]


def loadModel(
    jsonAuth,host = 'http://localhost:5000'
) -> Sequential:
    # print("facial_expression_model_weights.h5 will be downloaded...")
    # try:
    #     url=host+'/model/emotion'
    #     return requests.get(url,jsonAuth)
    # except:
        print("load model error : start with defult model emotion")
        url="https://github.com/serengil/deepface_models/releases/download/v1.0/facial_expression_model_weights.h5",
        num_classes = 7

        model = Sequential()

        # 1st convolution layer
        model.add(Conv2D(64, (5, 5), activation="relu", input_shape=(48, 48, 1)))
        model.add(MaxPooling2D(pool_size=(5, 5), strides=(2, 2)))

        # 2nd convolution layer
        model.add(Conv2D(64, (3, 3), activation="relu"))
        model.add(Conv2D(64, (3, 3), activation="relu"))
        model.add(AveragePooling2D(pool_size=(3, 3), strides=(2, 2)))

        # 3rd convolution layer
        model.add(Conv2D(128, (3, 3), activation="relu"))
        model.add(Conv2D(128, (3, 3), activation="relu"))
        model.add(AveragePooling2D(pool_size=(3, 3), strides=(2, 2)))

        model.add(Flatten())

        # fully connected neural networks
        model.add(Dense(1024, activation="relu"))
        model.add(Dropout(0.2))
        model.add(Dense(1024, activation="relu"))
        model.add(Dropout(0.2))

        model.add(Dense(num_classes, activation="softmax"))

        # ----------------------------
        output = "facial_expression_model_weights.h5"
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
