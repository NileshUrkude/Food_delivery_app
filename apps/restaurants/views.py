from collections import defaultdict

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsRestaurantOwner

from .models import Restaurant
from .serializers import (
    RestaurantDetailSerializer,
    RestaurantListSerializer,
    RestaurantSerializer,
)


class RestaurantCreateView(generics.CreateAPIView):

    serializer_class = RestaurantSerializer

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def perform_create(self, serializer):

        if hasattr(self.request.user, "restaurant"):
            raise serializers.ValidationError(
                "Restaurant already exists."
            )

        serializer.save(owner=self.request.user)


class MyRestaurantView(generics.RetrieveUpdateAPIView):

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


class RestaurantListView(generics.ListAPIView):

    serializer_class = RestaurantListSerializer

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


class RestaurantLocationsView(APIView):

    permission_classes = []

    def get(self, request):

        rows = (
            Restaurant.objects
            .filter(is_active=True)
            .values("state", "city")
            .distinct()
            .order_by("state", "city")
        )

        state_map = defaultdict(set)

        for row in rows:
            state = row["state"]
            city = row["city"]
            if state and city:
                state_map[state].add(city)

        locations = [
            {
                "state": state,
                "cities": sorted(cities),
            }
            for state, cities in sorted(state_map.items())
        ]

        return Response({"locations": locations})


class RestaurantDetailView(generics.RetrieveAPIView):

    serializer_class = RestaurantDetailSerializer

    permission_classes = []

    queryset = Restaurant.objects.filter(
        is_active=True
    )
