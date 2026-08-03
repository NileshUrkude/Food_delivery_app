from rest_framework import generics, serializers, filters
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import IsRestaurantOwner
from django_filters.rest_framework import DjangoFilterBackend

from .models import Restaurant
from .serializers import (
    RestaurantSerializer,
    RestaurantListSerializer,
    RestaurantDetailSerializer
)

class RestaurantCreateView(
    generics.CreateAPIView
):

    serializer_class = RestaurantSerializer

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def perform_create(
        self,
        serializer,
    ):

        if hasattr(
            self.request.user,
            "restaurant",
        ):
            raise serializers.ValidationError(
                "Restaurant already exists."
            )

        serializer.save(
            owner=self.request.user,
        )

class MyRestaurantView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = RestaurantSerializer

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def get_object(self):

        try:
            return self.request.user.restaurant

        except Restaurant.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "detail": (
                        "You do not have a restaurant yet."
                    )
                }
            )

class RestaurantListView(
    generics.ListAPIView
):

    serializer_class = (
        RestaurantListSerializer
    )

    permission_classes = []

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "city",
        "state",
        "is_active",
    ]

    search_fields = [
        "name",
        "description",
        "city",
    ]

    ordering_fields = [
        "name",
        "created_at",
    ]

    ordering = [
        "name",
    ]

    def get_queryset(self):

        return Restaurant.objects.filter(
            is_active=True
        )

class RestaurantDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        RestaurantDetailSerializer
    )

    permission_classes = []

    queryset = Restaurant.objects.filter(
        is_active=True
    )