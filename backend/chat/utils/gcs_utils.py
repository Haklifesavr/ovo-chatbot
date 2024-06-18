
from google.cloud import storage
from langchain.llms import OpenAI
import os
# from langchain.document_loaders import PyPDFLoader

CLIENT = storage.Client()

def pull_from_gcs(filename, bucket):
    print("filename", filename)
    bucket = CLIENT.get_bucket(bucket)
    blob = bucket.get_blob(filename) 
    print("blob",blob)

    # foldername will be "" in case of no "/" present in the filename
    foldername, basename = os.path.split(filename)

    # Create the local folder if it doesn't exist. 
    if foldername and not os.path.exists(foldername):
        os.makedirs(foldername)

    try:
        blob.download_to_filename(filename)
        return filename
    except Exception as e:
        return e