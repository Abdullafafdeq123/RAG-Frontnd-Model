from fastapi import FastAPI
# we use this so that fast api can use ir
from rag import ask_question
from pydantic import BaseModel,Field

app=FastAPI()

class QuestionRequest(BaseModel):
    question:str=Field(...,min_length=1)
    
@app.post("/ask")
def ask(q:QuestionRequest):
    answer=ask_question(q.question)
    return {"answer":answer}