import os
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import chromadb

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # we'll tighten this later once we have real URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ChromaDB setup — persists to a local folder called chroma_data
chroma_client = chromadb.PersistentClient(path="./chroma_data")
collection = chroma_client.get_or_create_collection(name="failures")


class FailureRequest(BaseModel):
    agentId: str
    action: str
    errorMessage: str


@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"message": "AgentTrace AI service is running"}


@app.post("/analyze-failure")
def analyze_failure(req: FailureRequest):
    query_text = f"{req.action}: {req.errorMessage}"

    # 1. Search ChromaDB for similar past failures
    results = collection.query(
        query_texts=[query_text],
        n_results=3,
    )

    similar_failures = []
    if results["documents"] and results["documents"][0]:
        similar_failures = results["documents"][0]

    # 2. Build context from similar past failures (if any)
    context_block = ""
    if similar_failures:
        context_block = "Similar past failures:\n" + "\n".join(
            f"- {doc}" for doc in similar_failures
        )
    else:
        context_block = "No similar past failures found — this looks like a new type of issue."

    # 3. Ask Gemini, now with historical context
    prompt = f"""An AI agent failed while performing an action. Explain the likely root cause in 2-3 sentences, in plain English.

Current failure:
Agent ID: {req.agentId}
Action: {req.action}
Error: {req.errorMessage}

{context_block}

If similar past failures are shown above, mention whether this looks like a recurring pattern.
"""
    response = model.generate_content(prompt)

    # 4. Store this failure in ChromaDB for future comparisons
    collection.add(
        documents=[query_text],
        ids=[str(uuid.uuid4())],
        metadatas=[{"agentId": req.agentId, "action": req.action}],
    )

    return {
        "analysis": response.text,
        "similar_past_failures": similar_failures,
    }