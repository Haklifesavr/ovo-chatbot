import os
from dotenv import load_dotenv
from google.cloud import storage
from rest_framework import status
from django.http import JsonResponse
from .serializers import ChatSerializer, ConversationSerializer
from datetime import timezone
from datetime import datetime, timedelta
from rest_framework.views import APIView
from core_account.models import User
from rest_framework.response import Response
from .models import Chat, Conversation
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

load_dotenv()


def get_distinct_values(list1, list2):
    set1 = set(list1)
    set2 = set(list2)

    distinct_values = set2 - set1  # This is the difference operation

    return list(distinct_values)


class ChatView(APIView):
    def post(self, request):
        name = request.POST.get('name')
        owner_id = request.POST.get('owner_id')
        try:
            owner = User.objects.get(id=owner_id)
        except User.DoesNotExist:
            return Response({'error': 'Invalid owner ID.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ChatSerializer(data={'name': name, 'owner': owner.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        owner_id = request.GET.get('owner_id')
        try:
            chats = Chat.objects.filter(owner=int(owner_id))
            serializer = ChatSerializer(chats, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'Invalid owner ID.'}, status=status.HTTP_400_BAD_REQUEST)
    

    # This view is to update chat name
    def put(self, request):
        chat_id = request.data.get('chat_id')
        new_chat_name = request.data.get('new_chat_name')
        try:
            chat = Chat.objects.get(id=chat_id)
            chat.name = new_chat_name
            chat.save()
            return Response("updated", status=status.HTTP_200_OK)
        except Exception:
            return Response("failed to update", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
    def delete(self, request):
        chat_id = request.data.get('chat_id')
        try:
            chat = Chat.objects.get(id=chat_id)
            chat.delete()
            return Response("deleted", status=status.HTTP_200_OK)
        except Exception:
            return Response("failed to delete", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConversationView(APIView):
    def get(self, request):
        chat_id = request.GET.get('chat_id')
        try:
            chats = Conversation.objects.filter(chat=int(chat_id)).order_by('created_at')
            serializer = ConversationSerializer(chats, many=True)
            print(serializer.data)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'Invalid owner ID.'}, status=status.HTTP_400_BAD_REQUEST)


class SignedURLView(APIView):
    def post(self, request):
        try:
            bucket_name = os.getenv("BUCKET_NAME")
            object_name = request.data.get('file_name', '')
            client = storage.Client()

            # Get the bucket you want to upload to
            bucket = client.bucket(bucket_name)

            # Create a signed URL with an expiration time of 10 minutes
            expiration = datetime.now(timezone.utc) + timedelta(days=7)
            url = bucket.blob(object_name).generate_signed_url(
                expiration=expiration,
                method='POSt',
                version='v4')

            # Return the signed URL to the client
            print(f'Signed URL: {url} \n Object Name: {object_name}')
            return JsonResponse({'signed_url': url})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

# class IngestData(APIView):
#     def post(self, request):  # sourcery skip: extract-method
#         try:

#             print("STRTING TIME: ", datetime.now())
#             es = ElasticClient()
#             bucket = os.getenv("BUCKET_NAME")
#             chat = get_object_or_404(Chat, owner=request.user.id)
#             serializer = ChatSerializer(chat)
#             company = Company.objects.filter(user=request.user).values_list('id', 'name', 'es_index')[0]
#             # file_path = request.POST.get("file_path")
#             file_paths = serializer.data["file_path"]['file_paths']

#             company_id = company[0]
#             company_name = company[1].lower()
#             user_id = request.user.pk
#             index_name = company[2]
#             file_source_query = es.get_file_source_query(index_name)
#             res = es.query(index_name, file_source_query, size=1000)
#             es_file_paths = []

#             for docs in res['hits']['hits']:
#                 es_file_paths.extend(iter(docs['_source']['source']))

#             file_paths = get_distinct_values(es_file_paths, file_paths)

#             es.create_index(index_name)
#             for file_path in file_paths:
#                 file = pull_from_gcs(file_path, bucket)

#                 res = ingest_data(index_name, file, user_id)
#                 print(res)

#             print('ENDING TIME: ', datetime.now())
#             return Response(res, 200)
#         except Exception as e:
#             print(e)
#             return Response('Internal server error', 500)
