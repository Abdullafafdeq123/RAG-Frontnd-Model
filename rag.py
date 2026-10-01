from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda,RunnablePassthrough
import os
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

chat=ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="openai/gpt-oss-120b",
    temperature=0.2
)

hf=HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

chroma=Chroma(
    persist_directory="chroma_db",
    embedding_function=hf
)

ret=chroma.as_retriever(
    search_kwargs={"k":5}
)



def format_doc(docs):
    return "\n\n".join(doc.page_content for doc in docs)



lambd=RunnableLambda(format_doc)


prompt = ChatPromptTemplate.from_template(""" Answer the question using only the provided context. If the answer is not available in the context, say: "I don't have enough information to answer that." Keep the answer clear and concise. Context: {context} Question: {question} """)
s_parser=StrOutputParser()

chain={
    "context":ret|lambd,
    "question":RunnablePassthrough(),
}|prompt|chat|s_parser



def ask_question(question):
    res=chain.invoke(
        question
    )
    return res
    
