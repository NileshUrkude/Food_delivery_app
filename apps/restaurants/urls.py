from django.urls import path

from .views import (
    MyRestaurantView,
    RestaurantCreateView,
    RestaurantListView,
    RestaurantDetailView,
)

app_name = "restaurants"

urlpatterns = [

    # Public APIs

    path(
        "",
        RestaurantListView.as_view(),
        name="restaurant-list",
    ),

    path(
        "<int:pk>/",
        RestaurantDetailView.as_view(),
        name="restaurant-detail",
    ),

    # Restaurant Owner APIs

    path(
        "create/",
        RestaurantCreateView.as_view(),
        name="create",
    ),

    path(
        "me/",
        MyRestaurantView.as_view(),
        name="my-restaurant",
    ),
]