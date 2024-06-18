"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

from . import django_asgi_app
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.middleware import TokenAuthMiddleWare
from chat import routing as chat_routing

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': TokenAuthMiddleWare(URLRouter(
        chat_routing.websocket_urlpatterns
    )),
    "static": django_asgi_app,
})
