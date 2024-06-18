from django.db import models
from django.conf import settings
# from django.contrib.auth import get_user_model

user = settings.AUTH_USER_MODEL

class Chat(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(user, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    model = models.CharField(max_length=100)
    # file_path = models.JSONField()

    def __str__(self):
        return self.name


class Conversation(models.Model):
    # class Speaker(models.TextChoices):
    #     USER = "U", "User"
    #     BOT = "B", "Bot"

    # speaker = models.CharField(max_length=1, choices=Speaker.choices, default=Speaker.USER)
    question = models.TextField()
    answer = models.TextField()
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


