import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from rag import ask_question

app = FastAPI()

# Enable CORS so your Vercel frontend can talk to your Render backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you can replace "*" with your Vercel frontend URL for extra security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=1)
    
@app.post("/ask")
def ask(q: QuestionRequest):
    answer = ask_question(q.question)
    return {"answer": answer}

# This block ensures Uvicorn starts correctly on Render using the dynamic port
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("api:app", host="0.0.0.0", port=port)