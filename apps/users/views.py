from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ChangePasswordSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)


class UserRegistrationView(
    generics.CreateAPIView
):

    serializer_class = (
        UserRegistrationSerializer
    )

    permission_classes = [
        permissions.AllowAny
    ]


class UserProfileView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = (
        UserProfileSerializer
    )

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={
                "request": request
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        request.user.set_password(
            serializer.validated_data[
                "new_password"
            ]
        )

        request.user.save(
            update_fields=[
                "password",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": (
                    "Password changed successfully."
                )
            }
        )