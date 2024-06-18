from django.contrib import admin
from .models import Chat, Conversation


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'owner', 'model', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    search_fields = ('name', 'owner', 'id', 'model')
    fields = ('name', 'owner', 'id', 'model')
    list_editable = ["name", "owner", 'model']

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'answer', 'chat', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    search_fields = ('question', 'answer', 'chat')
    fields = ('question', 'answer', 'chat')
    list_editable = ["question", "answer", 'chat']