# imports

import os
import ast
import json
import openai
from asgiref.sync import sync_to_async
from .models import Chat, Conversation
from channels.db import database_sync_to_async
from .utils.elastic_search import ElasticClient
from django.contrib.auth.models import AnonymousUser
from channels.generic.websocket import AsyncWebsocketConsumer
from .serializers import ChatSerializer, ConversationSerializer

try:
    # openai.api_key = "ambsngdjssjhshs"
    openai.api_key = os.getenv("OPENAI_API_KEY")  
except Exception as e:
    print("no such api key", e)

es = ElasticClient()
embed_model = "text-embedding-ada-002"
# messages = [{"role": "system", "content": "You are a helpful assistant."}]

def reverse_two_elements(lst):
    if len(lst) <= 1:
        return lst
    elif len(lst) == 2:
        return lst[::-1]

    reversed_lst = []
    for i in range(0, len(lst), 2):
        reversed_lst.extend(lst[i:i+2][::-1])
    return reversed_lst

def extract_query_from_prompt(prompt, query):
    index = prompt.find(query)
    return prompt[:index] + prompt[index + len(query):]


def create_embeddings(text):
    try:
        res = openai.Embedding.create(input=text, engine=embed_model)
        embeddings = res['data'][0]['embedding']
        return embeddings
    except Exception as e:
        return f"Can't create embeddings {e}"


sort = [
    {
        "_score": {
            "order": "desc"
        }
    }
]

# Testing deployment on dashboarding project

class ChatBotConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting to Chatbot...")
        user = self.scope["user"]
        print(f"User: {user}")
        if isinstance(user, AnonymousUser):
            print("Disconnecting...")
            await self.close(code=403)
        else:
            print("User connecting to websocket...")
            await self.accept()

    @database_sync_to_async
    def get_all_chats(self):
        return list(Chat.objects.all())
    
    @database_sync_to_async
    def store_chat(self, text, user_id):
        serializer = ChatSerializer(data={'name': text, 'owner': user_id})
        if serializer.is_valid():
            serializer.save()
            print("debug inside method", serializer.data)
        return serializer.data
    
    @database_sync_to_async
    def get_all_conversations(self):
        return list(Conversation.objects.all())

    async def save_chat_serializer(self, parsed_data):
        print("parsed data in save_chat_serializer", parsed_data)
        serializer = await sync_to_async(ChatSerializer)(
            data={
                'name': " ".join(parsed_data["text"].split(" ")[:3]),
                'owner': int(parsed_data["owner_id"]),
                'model':  "3.5" if parsed_data["model"] == "gpt-3.5-turbo" else "4"
            }
        )
        is_valid = await sync_to_async(serializer.is_valid)()

        if is_valid:
            await sync_to_async(serializer.save)()
            print("debug chats object", serializer.data)
            return dict(serializer.data)
        
    async def save_conversation_serializer(self, parsed_data):
        serializer = await sync_to_async(ConversationSerializer)(data={
            # 'speaker': parsed_data["speaker"],  # Set the desired speaker value here
            'question': parsed_data["question"],
            'answer': parsed_data["answer"],
            'chat': parsed_data["chat_id"],
        })
        is_valid = await sync_to_async(serializer.is_valid)()

        if is_valid:
            await sync_to_async(serializer.save)()
            print("debug conversations object", serializer.data)
            return dict(serializer.data)
        
    async def receive(self, text_data):  # noqa
        messages = []
        parsed_data = ast.literal_eval(text_data)
        embeddings = create_embeddings(parsed_data["text"])
        query = es.make_query(parsed_data["text"], embeddings)
        ES_INDEX = parsed_data["es_index"]  # noqa

        print("debug owner-id, chat-id, model",parsed_data["owner_id"], parsed_data["chat_id"], parsed_data["model"])
        print("messages from front", parsed_data["messages"])

        if parsed_data["messages"]:
            # reversed_list = reverse_two_elements(parsed_data["messages"])
            # reversed_list.reverse()
            for i in range(len(parsed_data["messages"])):
                if i % 2 == 0:
                    messages.append({"role": "user", "content": parsed_data["messages"][i]})
                else:
                    messages.append({"role": "assistant", "content": parsed_data["messages"][i]})
                if len(messages) >= 20:
                    break

        while int(parsed_data["chat_id"]) == -1:
            chat = await self.save_chat_serializer(parsed_data)
            print("Chat: ", chat, type(chat))
            if chat and 'id' in chat:
                parsed_data["chat_id"] = chat["id"]

        # all_chats = await self.get_all_chats()
        # print(all_chats)

        res = es.query(ES_INDEX, query, sort=sort, size=2)
        try:
            context = "".join(
                res['hits']['hits'][i]['_source']['page_content']
                for i in range(len(res['hits']['hits']))
            )
            context = context.replace("\t", " ")
        except Exception:
            context = ""


        if parsed_data["model"] == "gpt-4":
            prompt = f"""
                You are a helpful AI assistant.
                I am going to provide you question and some text for context.
                If the context of the question is not related to the provided context then provide the answer
                of the question based on previous context or based on your knowledge. Don't talk about the context if it 
                is not related to the question. 
                If there is no question then respond based on your knowledge.
                Return descriptive answer.
                Question: {parsed_data["text"]}
                Context: {context}
            """
        else:
            prompt = f"""
                You are a helpful AI assistant.
                I am going to provide you question and some text for context.
                If the context of the question is not related to the provided context then provide the answer
                of the question based on previous context or based on your knowledge. Don't talk about the context if it 
                is not related to the question. 
                If there is no question then respond based on your knowledge.
                Simply return the answer in plain text don't rewrite the question again.
                Question: {parsed_data["text"]}
                Context: {context}
            """

        # if len(messages) >=1:
        #     messages[-1]["content"] = prompt
        # else:
        #     messages.append(
        #         {"role": "user", "content": prompt}
        #     )

        messages.append(
                {"role": "user", "content": prompt}
            )

        print("after role user", messages)
        is_done = False
        complete_answer = ""
        while not is_done:
            try:
                response = openai.ChatCompletion.create(model=parsed_data["model"], messages=messages, temperature=0,
                                                        max_tokens=400, stream=True)
                is_done = True
                for chatgpt_res in response:
                    answer = chatgpt_res['choices'][0]['delta'].get('content', '')
                    stop_flag = chatgpt_res['choices'][0].get('finish_reason', '')
                    complete_answer += answer
                    if stop_flag == 'stop':
                        answer = '.___stop___.'
                    data = json.dumps({"chatgpt_res": answer, "chat_id": parsed_data["chat_id"]})
                    await self.send(text_data=data)
                    print(answer, parsed_data["chat_id"], end='', flush=True)
            except Exception as e:
                print(f"Error in completion:{e}")
                if len(messages) >= 3:
                    messages.pop(0)
                    messages.pop(0)

        # messages[-1]["content"] = parsed_data["text"]

        # messages.append(
        #     {"role": "assistant", "content": complete_answer}
        # )

        conversation = await self.save_conversation_serializer(parsed_data={"answer": complete_answer, "question": parsed_data["text"], "chat_id": parsed_data["chat_id"]})
        print("Conversation: ", conversation)
        print("after role assistant", messages)