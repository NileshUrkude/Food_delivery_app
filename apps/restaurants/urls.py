from django.urls import path

from .views import (
    MyRestaurantView,
    RestaurantCreateView,
    RestaurantDetailView,
    RestaurantListView,
    RestaurantLocationsView,
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
        "locations/",
        RestaurantLocationsView.as_view(),
        name="restaurant-locations",
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