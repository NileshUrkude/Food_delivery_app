from django.urls import path

from .views import (
    CouponListView,
    CouponValidateView,
)


app_name = "coupons"


urlpatterns = [

    # AVAILABLE COUPONS

    path(
        "",
        CouponListView.as_view(),
        name="coupon-list",
    ),

    # VALIDATE COUPON

    path(
        "validate/",
        CouponValidateView.as_view(),
        name="coupon-validate",
    ),
]