from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user registration with password confirmation."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
    )
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'display_name',
            'password', 'confirm_password',
        ]

    def validate_email(self, value):
        normalised = value.lower().strip()
        if User.objects.filter(email=normalised).exists():
            raise serializers.ValidationError(
                'An account with this email already exists.'
            )
        return normalised

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                'This username is already taken.'
            )
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.',
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            display_name=validated_data.get('display_name', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Validates login credentials and returns the user object."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError('Both username and password are required.')

        # 1. Identify if the user exists (allow username or email)
        from django.db.models import Q
        user_obj = User.objects.filter(
            Q(username=username_or_email) | Q(email__iexact=username_or_email)
        ).first()

        if user_obj is None:
            raise serializers.ValidationError({
                "username": "This user / email does not exist."
            })

        # 2. If user exists, try to authenticate with password
        user = authenticate(username=user_obj.username, password=password)

        if user is None:
            raise serializers.ValidationError({
                "password": "Incorrect password. Please try again."
            })
        if not user.is_active:
            raise serializers.ValidationError(
                'This account has been deactivated.'
            )
        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for returning user profile data."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'display_name', 'created_at']
        read_only_fields = fields
