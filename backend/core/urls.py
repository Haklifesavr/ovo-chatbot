from allauth import account
from django.contrib import admin
from django.urls import path, include
from django.views.defaults import page_not_found

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/account/', include('core_account.urls')),
    path('accounts/', include('allauth.urls')),
    path('accounts/login/', page_not_found, {'exception': Exception()}),
    path('accounts/signup/', page_not_found, {'exception': Exception()}),
    path('api/chat/', include('chat.urls'))
]
