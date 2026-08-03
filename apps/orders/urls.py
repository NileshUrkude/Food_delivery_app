from django.urls import path

from .views import (
    OrderCreateView,
    OrderListView,
    OrderDetailView,
    OrderCancelView,
    RestaurantOrderListView,
    RestaurantOrderStatusUpdateView,
)

app_name = "orders"

urlpatterns = [

    # CUSTOMER ORDER APIs

    path(
        "",
        OrderCreateView.as_view(),
        name="order-create",
    ),

    path(
        "history/",
        OrderListView.as_view(),
        name="order-list",
    ),
    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    path(
        "<int:pk>/cancel/",
        OrderCancelView.as_view(),
        name="order-cancel",
    ),

    # RESTAURANT OWNER ORDER APIs
    path(
        "restaurant/",
        RestaurantOrderListView.as_view(),
        name="restaurant-order-list",
    ),

    path(
        "restaurant/<int:pk>/status/",
        RestaurantOrderStatusUpdateView.as_view(),
        name="restaurant-order-status",
    ),
]