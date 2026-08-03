import uuid

from django.db import transaction

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

from apps.orders.models import (
    Order,
)

from .models import (
    Payment,
)

from .serializers import (
    PaymentDetailSerializer,
    PaymentSerializer,
)


class PaymentCreateView(
    generics.CreateAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    @transaction.atomic
    def create(
        self,
        request,
        *args,
        **kwargs,
    ):

        order_id = request.data.get(
            "order_id"
        )

        if not order_id:

            raise ValidationError(
                {
                    "order_id": (
                        "Order ID is required."
                    )
                }
            )

        try:

            order = (
                Order.objects
                .select_for_update()
                .select_related(
                    "restaurant",
                )
                .get(
                    id=order_id,
                    user=request.user,
                )
            )

        except Order.DoesNotExist:

            raise ValidationError(
                {
                    "order_id": (
                        "Order not found."
                    )
                }
            )

        # ==========================================
        # ORDER STATUS VALIDATION
        # ==========================================

        if order.status == "cancelled":

            raise ValidationError(
                {
                    "order": (
                        "Payment cannot be made "
                        "for a cancelled order."
                    )
                }
            )

        if order.status != "pending":

            raise ValidationError(
                {
                    "order": (
                        "Payment can only be made "
                        "for a pending order."
                    )
                }
            )

        # ==========================================
        # GET OR CREATE PAYMENT
        # ==========================================

        payment, created = (
            Payment.objects.get_or_create(
                order=order,
                defaults={
                    "payment_method": "mock",
                    "status": "pending",
                    "amount": (
                        order.total_amount
                    ),
                },
            )
        )

        # ==========================================
        # PROTECT PAYMENT AMOUNT
        # ==========================================

        if payment.amount != (
            order.total_amount
        ):

            payment.amount = (
                order.total_amount
            )

            payment.save(
                update_fields=[
                    "amount",
                    "updated_at",
                ]
            )

        # ==========================================
        # ALREADY SUCCESSFUL
        # ==========================================

        if payment.status == "success":

            raise ValidationError(
                {
                    "payment": (
                        "This order has "
                        "already been paid."
                    )
                }
            )

        # ==========================================
        # PAYMENT PROCESSING
        # ==========================================

        payment.status = "success"

        payment.transaction_id = (
            f"TXN-{uuid.uuid4().hex[:20].upper()}"
        )

        payment.save(
            update_fields=[
                "status",
                "transaction_id",
                "updated_at",
            ]
        )

        # ==========================================
        # CONFIRM ORDER
        # ==========================================

        order.status = "confirmed"

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        serializer = (
            self.get_serializer(
                payment
            )
        )

        if created:

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class PaymentListView(
    generics.ListAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(
        self,
    ):

        return (
            Payment.objects
            .filter(
                order__user=self.request.user,
            )
            .select_related(
                "order",
                "order__restaurant",
            )
            .order_by(
                "-created_at",
            )
        )

class PaymentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        PaymentDetailSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(
        self,
    ):

        return (
            Payment.objects
            .filter(
                order__user=self.request.user,
            )
            .select_related(
                "order",
                "order__restaurant",
            )
        )