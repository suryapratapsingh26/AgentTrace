# AgentLens

Real-time observability dashboard for AI agents — tracks what an agent did, why, cost, and failures, with AI-powered root-cause analysis using historical pattern matching.

## Status
🚧 In progress

## Tech Stack
- **Backend:** Node.js, Express.js, Socket.io
- **Database:** MongoDB (agent run logs)
- **Vector Store:** ChromaDB (embeddings of past runs/failures for RAG)
- **Frontend:** React, Tailwind CSS, Recharts
- **AI Microservice:** Python, FastAPI, Groq (Llama 3) — RAG pipeline for failure analysis
- **Demo Agent:** Node.js script simulating a real AI agent sending logs
