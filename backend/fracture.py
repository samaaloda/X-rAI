import os
import shutil
import cv2
import requests
from fastapi.responses import JSONResponse
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import io


import boto3
bucket_name = 'x-rai-store'
model_key = 'fracture_classes.h5'
local_path = 'model.h5'


s3= boto3.client('s3', region_name='us-east-2') #initialize client
s3.download_file(bucket_name, model_key, local_path) #download file to local_path


model = tf.keras.models.load_model(local_path) #load it




class_names = [
    'Avulsion fracture',
    'Comminuted fracture',
    'Fracture Dislocation',
    'Greenstick fracture',
    'Hairline Fracture',
    'Impacted fracture',
    'Longitudinal fracture',
    'Oblique fracture',
    'Pathological fracture',
    'Spiral Fracture'
]


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if not os.path.exists('./uploads'):
    os.makedirs('./uploads')


@app.get("/")
def read_root():
    return {"message": "Welcome to the fracture prediction API"}


@app.post("/upload/")
async def upload_images(images: List[UploadFile] = File(...)):
    try:
        if not images:
            return JSONResponse(
                content={"message": "No images were uploaded. Please upload at least one image."},
                status_code=400
            )


        clear_image_path = None
        max_laplacian_var = 0


        for image in images:
            file_path = f"./uploads/{image.filename}"
            with open(file_path, "wb") as buffer:
                contents = await image.read()
                buffer.write(contents)


            laplacian_var = calculate_laplacian_variance(file_path)


            if laplacian_var > max_laplacian_var:
                max_laplacian_var = laplacian_var
                clear_image_path = file_path


        if clear_image_path is None:
            return JSONResponse(
                content={"message": "All uploaded images are too blurry. Please upload clearer images."},
                status_code=400
            )


        processed_img = preprocess_image(clear_image_path)
        predicted_class, confidence = predict_image(processed_img, model, class_names)
        return {
            "message": "File uploaded and processed successfully",
            "clearest_image": clear_image_path.split("/")[-1],
            "predicted_class": predicted_class,
            "confidence": float(confidence)
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


def preprocess_image(img_path):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError(f"Unable to read the image file at {img_path}.")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (256, 256))
    img = img / 255.0
    img_array = np.expand_dims(img, axis=0)
    return img_array


def predict_image(processed_img, model, class_names):
    prediction = model.predict(processed_img)
    predicted_class = class_names[np.argmax(prediction)]
    confidence = np.max(prediction)
    return predicted_class, confidence


def calculate_laplacian_variance(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Unable to read the image file at {img_path}.")
    return cv2.Laplacian(img, cv2.CV_64F).var()


if __name__ == "__main__":
    uvicorn.run("fracture:app", host="0.0.0.0", port=5000, reload=True)

