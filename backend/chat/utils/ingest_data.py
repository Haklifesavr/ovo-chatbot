import os
import re
import uuid
import openai
from time import sleep
from tqdm.auto import tqdm
from dotenv import load_dotenv
from .elastic_search import ElasticClient
from langchain.document_loaders import PyPDFLoader

openai.api_key = os.getenv("OPENAI_API_KEY")

load_dotenv()
es = ElasticClient()
embed_model = "text-embedding-ada-002"

def split_text(text):

    text.split(" ")
    chunk_size = 1000
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    return chunks

def overlap_list(text_list):

    overlapping_strings = [
        text_list[i] + text_list[i + 1][:3] for i in range(len(text_list) - 1)
    ]
    return overlapping_strings

def split_pages(docs, user_id, sentences_per_page=5):
    data = []
    page_number = 1

    for doc in tqdm(docs):
        # Split the page into sentences using regular expressions
        sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', doc.page_content)
        
        # Keep track of sentences for the current page
        page_sentences = []

        # Iterate through the sentences and add them to the dictionary
        for i, sentence in enumerate(sentences):
            page_sentences.append(sentence)
            paragraphs = "".join(page_sentences)

            # If the required number of sentences per page is reached, add to the dictionary
            if (i + 1) % sentences_per_page == 0 or i == len(sentences) - 1:
                pages_dict = {
                    'page_content': paragraphs,
                    'source': doc.metadata['source'],
                    'page': doc.metadata['page'],
                    'user_id': user_id,
                    'id': f"{uuid.uuid4()}-{doc.metadata['page']}"
                }
                data.append(pages_dict)
                page_number += 1
                page_sentences = []

    return data

def overlap_page(data):
    new_data = []

    window = 5  # number of sentences to combine
    stride = 3  # number of sentences to 'stride' over, used to create overlap

    for i in tqdm(range(0, len(data), stride)):
        i_end = min(len(data)-1, i+window)
        meta_batch = data[i:i_end]
        page_content = "".join([x["page_content"] for x in meta_batch])

        # create the new merged dataset
        new_data.append({
            'start': data[i]['page'],
            'end': data[i_end]['page'],
            'page_content': page_content,
            'source': data[i]['source'],
            'user_id': data[i]['user_id'],
            'id': data[i]['id']
        })

    return new_data

def insert_embeddings_in_elasticsearch(new_data, indexname):
    batch_size = 1  # how many embeddings we create and insert at once

    for i in tqdm(range(0, len(new_data), batch_size)):
        i_end = min(len(new_data), i+batch_size)
        meta_batch = new_data[i:i_end]
        texts = [x['page_content'] for x in meta_batch]
        paragraph = ".".join(texts)

        # create embeddings (try-except added to avoid RateLimitError)
        try:
            res = openai.Embedding.create(input=paragraph, engine=embed_model)
        except Exception as e:
            done = False
            while not done:
                sleep(5)
                try:
                    res = openai.Embedding.create(input=paragraph, engine=embed_model)
                    done = True
                except Exception as e:
                    text_list = split_text(paragraph)
                    overlaped_list = overlap_list(text_list)
                    for overlaped_text in overlaped_list:
                        res = openai.Embedding.create(input=overlaped_text, engine=embed_model)
                    done = True

        embeds = [record['embedding'] for record in res['data']]
        # cleanup metadata
        meta_batch = [{
            'id': x['id'],
            'start': x['start'],
            'end': x['end'],
            'page_content': x['page_content'],
            'source': x['source'],
            'user_id': x['user_id']
        } for x in meta_batch]

        for i,embed in enumerate(embeds):
            meta_batch[i]['embeddings'] = embed

        es.export_docs_in_bulk(indexname, meta_batch)

def ingest_data(indexname, filepath, user_id):
    try:
        loader = PyPDFLoader(filepath)
        docs = loader.load()

        data = split_pages(docs, user_id)
        
        data = overlap_page(data)

        insert_embeddings_in_elasticsearch(data, indexname)

        # print("before my dict")
        # my_list = []
        # for doc in docs:
        #     print(doc.metadata["page"])

        #     my_list.append(
        #         {
        #             "page_no": doc.metadata["page"],
        #             "source": doc.metadata["source"],
        #             "page_content": doc.page_content,
        #             "user_id": user_id
        #         }
        #     )
        # print("after my dict", my_list)

        # es.export_docs_in_bulk(indexname, my_list)

        return "data ingested"
    except Exception as e:
        print("exception in ingest data",e)
        return str(e)
