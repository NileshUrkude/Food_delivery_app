from rest_framework import generics, filters
from django.db.models import Q
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsRestaurantOwner

from .models import (
    FoodItem,
    MenuCategory,
)

from .serializers import (
    FoodItemSerializer,
    MenuCategorySerializer,
    PublicFoodItemSerializer,
)

from apps.restaurants.models import (
    Restaurant,
)
# ==================================================
# CATEGORY APIs
# ==================================================

class MenuCategoryCreateView(
    generics.CreateAPIView
):

    serializer_class = (
        MenuCategorySerializer
    )

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def get_serializer_context(
        self,
    ):

        context = (
            super().get_serializer_context()
        )

        context["restaurant"] = (
            self.request.user.restaurant
        )

        return context


    def perform_create(
        self,
        serializer,
    ):

        restaurant = (
            self.request.user.restaurant
        )

        serializer.save(
            restaurant=restaurant
        )

class MenuCategoryListView(
    generics.ListAPIView
):

    serializer_class = (
        MenuCategorySerializer
    )

    permission_classes = []

    def get_queryset(
        self,
    ):

        restaurant_id = (
            self.kwargs["restaurant_id"]
        )

        if not Restaurant.objects.filter(
            id=restaurant_id,
            is_active=True,
        ).exists():

            raise Http404(
                "Restaurant not found."
            )

        return (
            MenuCategory.objects
            .filter(
                restaurant_id=restaurant_id,
                is_active=True,
            )
        )

class MenuCategoryManageView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = (
        MenuCategorySerializer
    )

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def get_queryset(
        self,
    ):

        return MenuCategory.objects.filter(
            restaurant=(
                self.request.user.restaurant
            )
        )

    def get_serializer_context(
        self,
    ):

        context = (
            super().get_serializer_context()
        )

        context["restaurant"] = (
            self.request.user.restaurant
        )

        return context


    def perform_destroy(
        self,
        instance,
    ):

        instance.is_active = False

        instance.save(
            update_fields=[
                "is_active",
                "updated_at",
            ]
        )

# ==================================================
# FOOD ITEM OWNER APIs
# ==================================================

class FoodItemCreateView(
    generics.CreateAPIView
):

    serializer_class = (
        FoodItemSerializer
    )

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def get_serializer_context(
        self,
    ):

        context = super().get_serializer_context()

        context["restaurant"] = (
            self.request.user.restaurant
        )

        return context

    def perform_create(
        self,
        serializer,
    ):

        restaurant = (
            self.request.user.restaurant
        )

        serializer.save(
            restaurant=restaurant
        )

class FoodItemListView(
    generics.ListAPIView
):

    serializer_class = (
        FoodItemSerializer
    )

    permission_classes = []

    def get_queryset(
        self,
    ):

        restaurant_id = (
            self.kwargs["restaurant_id"]
        )

        return FoodItem.objects.filter(
            restaurant_id=restaurant_id,
            is_available=True,
        )

    def get_serializer_context(
        self,
    ):

        context = super().get_serializer_context()

        context["restaurant"] = (
            self.get_restaurant()
        )

        return context

    def get_restaurant(
        self,
    ):

        return (
            Restaurant.objects.get(
                id=self.kwargs[
                    "restaurant_id"
                ]
            )
        )

class FoodItemManageView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = (
        FoodItemSerializer
    )

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def get_queryset(
        self,
    ):

        return FoodItem.objects.filter(
            restaurant=(
                self.request.user.restaurant
            )
        )

    def get_serializer_context(
        self,
    ):

        context = (
            super().get_serializer_context()
        )

        context["restaurant"] = (
            self.request.user.restaurant
        )

        return context

    def perform_destroy(
        self,
        instance,
    ):

        instance.is_available = False

        instance.save(
            update_fields=[
                "is_available",
                "updated_at",
            ]
        )

# ==================================================
# PUBLIC FOOD APIs
# ==================================================

class PublicFoodItemListView(
    generics.ListAPIView
):

    serializer_class = (
        PublicFoodItemSerializer
    )

    permission_classes = []

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "category",
        "food_type",
        "is_available",
    ]

    search_fields = [
        "name",
        "description",
        "category__name",
    ]

    ordering_fields = [
        "name",
        "price",
        "preparation_time",
        "created_at",
    ]

    ordering = [
        "name",
    ]

    def get_queryset(
        self,
    ):

        restaurant_id = (
            self.kwargs["restaurant_id"]
        )

        if not Restaurant.objects.filter(
            id=restaurant_id,
            is_active=True,
        ).exists():

            raise Http404(
                "Restaurant not found."
            )

        return (
            FoodItem.objects
            .filter(
                restaurant_id=restaurant_id,
                is_available=True,
                category__is_active=True,
            )
            .select_related(
                "category",
            )
        )
 
class PublicFoodItemDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        PublicFoodItemSerializer
    )

    permission_classes = []

    lookup_url_kwarg = (
        "food_id"
    )

    def get_queryset(
        self,
    ):

        restaurant_id = (
            self.kwargs["restaurant_id"]
        )

        return (
            FoodItem.objects
            .filter(
                restaurant_id=restaurant_id,
                is_available=True,
                category__is_active=True,
            )
            .select_related(
                "category",
            )
        )

