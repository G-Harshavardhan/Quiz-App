from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path('register', views.RegisterView.as_view(), name='register'),
    path('login', views.LoginView.as_view(), name='login'),
    path('logout', views.LogoutView.as_view(), name='logout'),
    path('profile', views.UserProfileView.as_view(), name='profile'),
    path('delete', views.DeleteAccountView.as_view(), name='delete-account'),
    path('token/refresh', TokenRefreshView.as_view(), name='token-refresh'),
]
