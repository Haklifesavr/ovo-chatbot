import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from elasticsearch.helpers import scan, bulk

load_dotenv()


class ElasticClient:
    """
    Provides helpful wrapper methods for document indexing, querying,
    deleting and index creation and deletion.
    Looks for ELASTIC_CLOUD_ID, ELASTIC_USERNAME and ELASTIC_PASSWORD env vars.
    """

    def __init__(self) -> None:
        self.es = Elasticsearch(
            hosts=os.getenv('ELASTIC_HOSTS'),
            http_auth=(
                os.getenv('ELASTIC_USERNAME'),
                os.getenv('ELASTIC_PASSWORD')
            )
        )
    
    def get_file_source_query(self, index_name):
        return {
            "_source": ["source"],
            "query": {
                "match_all": {}
            },
            "aggs": {
                "distinct_values": {
                    "terms": {
                        "field": "source.keyword"
                    }
                }
            }
        }

    def create_index(self, index_name):
        # if input(f"Create {index_name}? (y)") == 'y':
        mappings = {
            "properties": {
                "embeddings": {
                    "type": "dense_vector",
                    "dims": 1536,
                    "similarity": "cosine"
                },
                "page_content": {
                    "type": "text"
                },
                "start": {
                    "type": "text"
                },
                "end": {
                    "type": "text"
                },
                "user_id": {
                    "type": "text"
                },
                "id": {
                    "type": "text"
                },
                "source": {
                    "type": "text"
                }
            }
        }
        self.es.indices.create(index=index_name, mappings=mappings, ignore=400)

    def query(self, index_name, query, **kwargs):
        results = self.es.search(index=index_name, query=query, **kwargs)
        return results

    def insert(self, index_name, document, id=None):
        # TODO: return ok response?
        try:
            self.es.index(index=index_name, document=document, id=id)
        except Exception as e:
            print(e)

    def get_by_id(self, index_name, _id):
        return self.es.get(index=index_name, id=_id)

    def scroll(self, query, index_name, scroll='5m', size=1000):
        """
        Uses scroll api to return all results that satisfy the query.
        """
        results = list(scan(self.es, query, index=index_name, scroll=scroll, size=size))
        return results

    def delete_by_query(self, index_name, body):
        try:
            self.es.delete_by_query(index=index_name, body=body)
        except Exception as e:
            print(e)

    def export_docs_in_bulk(self, index_name, docs):
        """docs: list of dictionaries (documents)"""

        # print("")

        def gen_docs(docs):
            for doc in docs:
                doc['_index'] = index_name
                yield doc

        # print('Uploading documents in bulk to ' + index_name)
        bulk(self.es, gen_docs(docs))
        # print('Done')

    def delete_index(self, index_name):
        if input(f"Delete the index {index_name}? (type yes)") == 'yes':
            self.es.indices.delete(index=index_name, ignore=[400, 404])

    @staticmethod
    def make_query(text, embeddings=None):
        if embeddings:
            return {
                "bool": {
                    "must": [
                        {
                        "match": {
                            "page_content": text
                        }
                        },
                        {
                        "script_score": {
                            "query": {
                            "match_all": {}
                            },
                            "script": {
                            "source": "cosineSimilarity(params.query_vector, 'embeddings') + 1.0",
                            "params": {
                                "query_vector": embeddings
                            }
                            }
                        }
                    }
                ]
            }
        }

        else:
            return {
                "bool": {
                    "should": [
                        {
                            "match": {
                                "page_content": {
                                    "query": text,
                                    "boost": 2
                                }
                            }
                        },
                        {
                            "match": {
                                "page_content": {
                                    "query": text,
                                    "fuzziness": "auto"
                                }
                            }
                        }
                    ]
                }
            }


if __name__ == '__main__':
    es = ElasticClient()
    query = {
        "match_all": {}
    }
    res = es.query('tech_check_1', query, size=1)
    print(res)
