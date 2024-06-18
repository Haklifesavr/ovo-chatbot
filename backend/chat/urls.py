from django.urls import path
from .views import SignedURLView, ChatView, ConversationView

urlpatterns = [
    path('signed-url/', SignedURLView.as_view(), name='signed-url'),
    # path('ingest-data/', IngestData.as_view(), name='ingest-data'),
    path('chats/', ChatView.as_view(), name='chats-view'),
    path('conversations/', ConversationView.as_view(), name='conversations-view')
    # path('chats/<int:owner_id>/', get_chat, name='get_chat'),
]