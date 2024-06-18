import jwt

from django.conf import settings
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from core.settings import SECRET_KEY


User = get_user_model()

@database_sync_to_async
def returnUser(token_string):
	try:
		# Decode and verify the JWT token
		decoded = jwt.decode(token_string, SECRET_KEY, algorithms=["HS256"])
		user_id = decoded["user_id"]
		user = User.objects.get(pk=user_id)
	except Exception as e:
		print(f"Exception: {e}")
		user = AnonymousUser()
	return user


class TokenAuthMiddleWare:
	def __init__(self, app):
		self.app = app

	async def __call__(self, scope, receive, send):
		query_string = scope["query_string"]
		query_params = query_string.decode()
		query_dict = parse_qs(query_params)
		if "token" not in query_dict:
			user = AnonymousUser()
		else:
			token = query_dict["token"][0]
			user = await returnUser(token)
		scope["user"] = user
		return await self.app(scope, receive, send)
