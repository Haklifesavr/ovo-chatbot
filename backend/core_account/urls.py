from . import views
from .views import get_user, get_company
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenVerifyView

app_name = "core_accounts_urls"


urlpatterns = [
    path("auth/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
    path('user/<int:user_id>/', get_user, name='get_user'),
    path('company/', get_company, name='get_company'),
    path("login_redirect/", views.social_login_redirect, name="login_redirect"),

]
