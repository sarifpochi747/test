import os
import requests

from keras.models import Model, Sequential
from keras.layers import (
    Convolution2D,
    ZeroPadding2D,
    MaxPooling2D,
    Flatten,
    Dropout,
    Activation,
    Lambda,
)
from keras import backend as K


def baseModel() -> Sequential:
    model = Sequential()
    model.add(ZeroPadding2D((1, 1), input_shape=(224, 224, 3)))
    model.add(Convolution2D(64, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(64, (3, 3), activation="relu"))
    model.add(MaxPooling2D((2, 2), strides=(2, 2)))

    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(128, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(128, (3, 3), activation="relu"))
    model.add(MaxPooling2D((2, 2), strides=(2, 2)))

    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(256, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(256, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(256, (3, 3), activation="relu"))
    model.add(MaxPooling2D((2, 2), strides=(2, 2)))

    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(512, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(512, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(512, (3, 3), activation="relu"))
    model.add(MaxPooling2D((2, 2), strides=(2, 2)))

    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(512, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(512, (3, 3), activation="relu"))
    model.add(ZeroPadding2D((1, 1)))
    model.add(Convolution2D(512, (3, 3), activation="relu"))
    model.add(MaxPooling2D((2, 2), strides=(2, 2)))

    model.add(Convolution2D(4096, (7, 7), activation="relu"))
    model.add(Dropout(0.5))
    model.add(Convolution2D(4096, (1, 1), activation="relu"))
    model.add(Dropout(0.5))
    model.add(Convolution2D(2622, (1, 1)))
    model.add(Flatten())
    model.add(Activation("softmax"))

    return model


def loadModel(
    jsonAuth,host = 'http://localhost:5000'
) -> Model:
    # print("vgg_face_weights.h5 will be downloaded...")
    # try:
    #     url=host+'/model/vgg',
    #     return requests.get(url,jsonAuth)
    # except:
        print("load model error : start with defult model vgg")
        url="https://github.com/serengil/deepface_models/releases/download/v1.0/vgg_face_weights.h5"
        model = baseModel()

        output = "vgg_face_weights.h5"

        if not os.path.isfile(output):
            response = requests.get(url, verify=False) 
            if response.status_code == 200:
                with open(output, 'wb') as f:
                    f.write(response.content)
                print("File downloaded successfully.")
            else:
                print("Failed to download the file. Status code:", response.status_code)

        base_model_output = Sequential()
        base_model_output = Flatten()(model.layers[-5].output)
        base_model_output = Lambda(lambda x: K.l2_normalize(x, axis=1), name="norm_layer")(
            base_model_output
        )
        vgg_face_descriptor = Model(inputs=model.input, outputs=base_model_output)

        return vgg_face_descriptor
