from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


def _build_token_pair(user):
    """Generate access + refresh tokens for a given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


class RegisterView(APIView):
    """POST /api/accounts/register/  — create a new account."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        tokens = _build_token_pair(user)
        user_data = UserSerializer(user).data

        return Response(
            {'user': user_data, 'tokens': tokens},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/accounts/login/  — authenticate and get tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'errors': serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.validated_data['user']
        tokens = _build_token_pair(user)
        user_data = UserSerializer(user).data

        return Response(
            {'user': user_data, 'tokens': tokens},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """POST /api/accounts/logout/  — blacklist the refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'errors': {'refresh': 'Refresh token is required.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {'errors': {'refresh': 'Token is invalid or already expired.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {'message': 'Logged out successfully.'},
            status=status.HTTP_200_OK,
        )


class UserProfileView(APIView):
    """GET /api/accounts/profile/  — return the current user's info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """DELETE /api/accounts/delete/  — permanently delete the user account."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(
            {'message': 'Account deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
