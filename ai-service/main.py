import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

class FailureRequest(BaseModel):
    agentId: str
    action: str
    errorMessage: str

@app.get("/")
def root():
    return {"message": "AgentTrace AI service is running"}

@app.post("/analyze-failure")
def analyze_failure(req: FailureRequest):
    prompt = f"""An AI agent failed while performing an action. Explain the likely root cause in 2-3 sentences, in plain English.

Agent ID: {req.agentId}
Action: {req.action}
Error: {req.errorMessage}
"""
    response = model.generate_content(prompt)
    return {"analysis": response.text}