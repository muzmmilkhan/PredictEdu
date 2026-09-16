import os

from fastapi import FastAPI, status
import pickle
import pandas as pd
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.server_api import ServerApi


uri = os.environ["MONGODB_URI"]
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client.muzmmilaws_db
performance_index_collection = db.performance_index


app = FastAPI()

with open('linear_regression_model.pkl', 'rb') as f:
    model, scaler, le = pickle.load(f)

class PerformanceIndexRequest(BaseModel):
    hours_studied: int
    previous_scores: int
    extracurricular_activities: str
    sleep_hours: int
    sample_question_papers_practiced: int

@app.post("/predict", status_code=status.HTTP_201_CREATED)
def predict(request: PerformanceIndexRequest):
    features = pd.DataFrame({
        'Hours Studied': [request.hours_studied],
        'Previous Scores': [request.previous_scores],
        'Extracurricular Activities': [le.transform([request.extracurricular_activities])[0]],
        'Sleep Hours': [request.sleep_hours],
        'Sample Question Papers Practiced': [request.sample_question_papers_practiced]
    })
    features = scaler.transform(features)
    prediction = model.predict(features)
    performance_index_collection.insert_one({
        "hours_studied": request.hours_studied,
        "previous_scores": request.previous_scores,
        "extracurricular_activities": request.extracurricular_activities,
        "sleep_hours": request.sleep_hours,
        "sample_question_papers_practiced": request.sample_question_papers_practiced,
        "performance_index": prediction[0]
    })
    return {"performance_index": prediction[0]}

    