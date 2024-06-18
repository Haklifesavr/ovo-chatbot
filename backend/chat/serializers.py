from .models import Chat, Conversation
from rest_framework import serializers

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'name', 'owner', 'model', "created_at", "updated_at"]

    # def validate(self, data):
    #     # Perform custom validations on the data
    #     name = data.get('name')
    #     owner = data.get('owner')

    #     # Example custom validation: Ensure name is unique for a specific owner
    #     if Chat.objects.filter(name=name, owner=owner).exists():
    #         raise serializers.ValidationError("A chat with the same name already exists for this owner.")

    #     return data
    
class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        # fields = ('id', 'speaker', 'message', 'chat', 'created_at', 'updated_at')
        fields = ('question', 'answer', 'chat')
        # read_only_fields = ('id', 'created_at', 'updated_at')