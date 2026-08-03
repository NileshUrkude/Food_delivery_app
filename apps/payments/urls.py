from django.urls import path

from .views import (
    PaymentCreateView,
    PaymentDetailView,
    PaymentListView,
)

app_name = "payments"

urlpatterns = [

    # CREATE PAYMENT

    path(
        "",
        PaymentCreateView.as_view(),
        name="payment-create",
    ),

    # PAYMENT HISTORY
    path(
        "history/",
        PaymentListView.as_view(),
        name="payment-history",
    ),

    # PAYMENT DETAILS
    path(
        "<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),
]