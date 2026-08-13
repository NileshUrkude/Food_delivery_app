from decimal import Decimal

from django.utils import timezone

from rest_framework import generics
from rest_framework import status

from rest_framework.exceptions import (
    ValidationError,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import (
    Response,
)

from .models import Coupon
from .serializers import (
    CouponListSerializer,
)

class CouponValidateView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated,
    ]

    def post(
        self,
        request,
        *args,
        **kwargs,
    ):

        code = request.data.get(
            "code"
        )

        order_amount = request.data.get(
            "order_amount"
        )

        if not code:

            raise ValidationError(
                {
                    "code": (
                        "Coupon code is required."
                    )
                }
            )

        if order_amount is None:

            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount is required."
                    )
                }
            )

        try:

            order_amount = Decimal(
                str(order_amount)
            )

        except (
            TypeError,
            ValueError,
        ):

            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount must "
                        "be a valid number."
                    )
                }
            )

        if order_amount <= 0:

            raise ValidationError(
                {
                    "order_amount": (
                        "Order amount must "
                        "be greater than zero."
                    )
                }
            )

        try:

            coupon = (
                Coupon.objects
                .get(
                    code=code.strip().upper()
                )
            )

        except Coupon.DoesNotExist:

            raise ValidationError(
                {
                    "code": (
                        "Invalid coupon code."
                    )
                }
            )

        if not coupon.is_valid_for_order(
            order_amount
        ):

            raise ValidationError(
                {
                    "code": (
                        "Coupon is not valid "
                        "for this order."
                    )
                }
            )

        discount = (
            coupon.calculate_discount(
                order_amount
            )
        )

        final_amount = (
            order_amount
            - discount
        )

        return Response(
            {
                "coupon": coupon.code,
                "discount_type": (
                    coupon.discount_type
                ),
                "discount_value": str(
                    coupon.discount_value
                ),
                "discount": str(
                    discount
                ),
                "order_amount": str(
                    order_amount
                ),
                "final_amount": str(
                    final_amount
                ),
                "valid_until": (
                    coupon.valid_until
                ),
            },
            status=status.HTTP_200_OK,
        )
                

class CouponListView(
    generics.ListAPIView
):

    serializer_class = (
        CouponListSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(
        self,
    ):

        now = timezone.now()

        return (
            Coupon.objects
            .filter(
                is_active=True,
                valid_from__lte=now,
                valid_until__gte=now,
            )
            .order_by(
                "valid_until",
            )
        )

