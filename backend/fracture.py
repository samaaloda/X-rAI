import os
import shutil
import cv2
from fastapi.responses import JSONResponse
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

model = tf.keras.models.load_model('../fracture_classes.h5')

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
async def upload_image(image: UploadFile = File(...)):
    try:
        file_path = f"./uploads/{image.filename}"
        print(f"Saving image to: {file_path}")
        with open(file_path, "wb") as buffer:
            contents = await image.read()
            buffer.write(contents)
        processed_img = preprocess_image(file_path)
        predicted_class, confidence = predict_image(processed_img, model, class_names)
        return {
            "message": "File uploaded and processed successfully",
            "filename": image.filename,
            "predicted_class": predicted_class,
            "confidence": float(confidence)
        }
    except Exception as e:
        print(f"Error: {str(e)}")
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

if __name__ == "__main__":
    uvicorn.run("fracture:app", host="0.0.0.0", port=5000, reload=True)