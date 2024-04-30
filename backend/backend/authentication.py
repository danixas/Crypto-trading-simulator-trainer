from django.shortcuts import get_object_or_404
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(token)
        return jwt_auth.get_user(validated_token)