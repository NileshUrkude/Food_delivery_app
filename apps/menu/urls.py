from django.urls import path

from .views import (
    FoodItemCreateView,
    FoodItemListView,
    FoodItemManageView,
    MenuCategoryCreateView,
    MenuCategoryListView,
    MenuCategoryManageView,
    PublicFoodItemListView,
    PublicFoodItemDetailView,
)


app_name = "menu"


urlpatterns = [

    # Category APIs

    path(
        "categories/create/",
        MenuCategoryCreateView.as_view(),
        name="category-create",
    ),

    path(
        "categories/<int:pk>/",
        MenuCategoryManageView.as_view(),
        name="category-manage",
    ),

    path(
        "restaurants/<int:restaurant_id>/categories/",
        MenuCategoryListView.as_view(),
        name="category-list",
    ),

    # Food APIs

    path(
        "food-items/create/",
        FoodItemCreateView.as_view(),
        name="food-item-create",
    ),

    path(
        "food-items/<int:pk>/",
        FoodItemManageView.as_view(),
        name="food-item-manage",
    ),

    path(
        "restaurants/<int:restaurant_id>/food-items/",
        FoodItemListView.as_view(),
        name="food-item-list",
    ),

    # Public Food APIs

    path(
        "restaurants/<int:restaurant_id>/food-items/",
        PublicFoodItemListView.as_view(),
        name="public-food-item-list",
    ),

    path(
        "restaurants/<int:restaurant_id>/food-items/<int:food_id>/",
        PublicFoodItemDetailView.as_view(),
        name="public-food-item-detail",
    ),
]