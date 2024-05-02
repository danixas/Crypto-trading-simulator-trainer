from ninja import NinjaAPI, Router
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from ninja.security import HttpBearer
from .models import UserProfile, Trade
from .schemas import AuthSchema, TokenSchema, UserProfileSchema, RegistrationSchema, MessageSchema, TradeSchema, UpdateBalanceSchema
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from typing import List
from backend.authentication import JWTAuth
import logging

logger = logging.getLogger(__name__)

users_router = Router()

@users_router.post('register/', response={
    201: MessageSchema,
    400: MessageSchema,
    409: MessageSchema,
    401: MessageSchema
})
def register(request, payload: RegistrationSchema):
    try:
        user = User.objects.create_user(username=payload.username, password=payload.password)
        return 201, {"message": "User created successfully"}
    except IntegrityError:
        return 409, {"message": "A user with that username already exists"}
    except Exception as e:
        # Handle unexpected errors
        return 400, {"message": str(e)}

@users_router.post('login/', response={200: TokenSchema})
def login(request, payload: AuthSchema):
    username = payload.username
    password = payload.password
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }
    else:
        return users_router.create_response(request, {"detail": "Invalid credentials"}, status=401)


@users_router.get('profile/', response={200: UserProfileSchema, 401: dict, 500: dict}, auth=JWTAuth())
def get_user_profile(request):
    user = request.auth
    if not user:
        return 401, {"detail": "Authentication credentials were not provided or are invalid."}

    try:
        profile = UserProfile.objects.get(user=user)
        return 200, {
            "user": user.username,
            "balance": profile.balance,
            "total_trades": profile.total_trades,
            "profit_loss": profile.profit_loss,
        }
    except UserProfile.DoesNotExist:
        return 404, {"detail": "UserProfile does not exist for the given user."}
    except Exception as e:
        print(f"Error when fetching user profile: {str(e)}")  # Log the error for debugging
        return 500, {"detail": "Internal Server Error"}

@users_router.get('me/')
def get_me(request):
    user = request.user
    return user

@users_router.get('balance/', response={200: dict, 401: dict, 404: dict, 500: dict}, auth=JWTAuth())
def get_balance(request):
    user = request.auth
    profile = get_object_or_404(UserProfile, user=user)
    return 200, {"balance": profile.balance}

@users_router.post('update_balance/', response={200: dict, 400: dict, 401: dict, 404: dict, 500: dict}, auth=JWTAuth())
def update_balance(request, data: UpdateBalanceSchema):
    user = request.auth
    try:
        profile = UserProfile.objects.get(user=user)
        if data.balance < 0:
            return 400, {"detail": "Balance cannot be negative"}
        profile.balance = data.balance
        profile.save()
        return 200, {"balance": profile.balance}
    except ValueError:
        return 400, {"detail": "Invalid input for balance"}
    except UserProfile.DoesNotExist:
        return 404, {"detail": "UserProfile does not exist for the given user."}
    except Exception as e:
        return 500, {"detail": f"Internal Server Error: {str(e)}"}