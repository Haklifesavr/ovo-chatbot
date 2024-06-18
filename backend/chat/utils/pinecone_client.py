import os
import pinecone
from dotenv import load_dotenv
# from langchain.vectorstores.pinecone import Pinecone
# from langchain.embeddings.openai import OpenAIEmbeddings

load_dotenv()

def pinecone_client():
    if os.getenv("PINECONE_API_KEY") and os.getenv("PINECONE_ENVIRONMENT"):
        pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_ENVIRONMENT"))
        return pinecone
    else:
        print("Pinecone API key or Environment missing")
        return None
