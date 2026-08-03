from django.urls import path

from .views import (
    CartClearView,
    CartDetailView,
    CartItemCreateView,
    CartItemDeleteView,
    CartItemUpdateView,
    CartValidationView,
)


app_name = "cart"


urlpatterns = [

    # CART

    path(
        "",
        CartDetailView.as_view(),
        name="cart-detail",
    ),

    path(
        "clear/",
        CartClearView.as_view(),
        name="cart-clear",
    ),

    path(
        "validate/",
        CartValidationView.as_view(),
        name="cart-validate",
    ),

    # CART ITEMS

    path(
        "items/",
        CartItemCreateView.as_view(),
        name="cart-item-create",
    ),

    path(
        "items/<int:pk>/",
        CartItemUpdateView.as_view(),
        name="cart-item-update",
    ),

    path(
        "items/<int:pk>/delete/",
        CartItemDeleteView.as_view(),
        name="cart-item-delete",
    ),

]