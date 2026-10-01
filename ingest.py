from langchain_community.document_loaders import DirectoryLoader,TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

direc_load=DirectoryLoader(
    "data",
    glob="*.txt",
    loader_cls=TextLoader,
)
load=direc_load.load()

text_splitter=RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    
)

chunks=text_splitter.split_documents(load)

hf=HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

chroma=Chroma.from_documents(
    documents=chunks,
    embedding=hf,
    persist_directory="chroma_db"
)