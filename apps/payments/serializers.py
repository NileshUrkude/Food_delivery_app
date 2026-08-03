from rest_framework import serializers

from .models import Payment

class PaymentSerializer(
    serializers.ModelSerializer
):

    order_id = serializers.IntegerField(
        source="order.id",
        read_only=True,
    )

    class Meta:

        model = Payment

        fields = (
            "id",
            "order_id",
            "payment_method",
            "status",
            "amount",
            "transaction_id",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "order_id",
            "status",
            "amount",
            "transaction_id",
            "created_at",
            "updated_at",
        )

class PaymentDetailSerializer(
    serializers.ModelSerializer
):

    order_id = serializers.IntegerField(
        source="order.id",
        read_only=True,
    )

    order_status = serializers.CharField(
        source="order.status",
        read_only=True,
    )

    restaurant_id = serializers.IntegerField(
        source="order.restaurant.id",
        read_only=True,
    )

    class Meta:

        model = Payment

        fields = (
            "id",
            "order_id",
            "order_status",
            "restaurant_id",
            "payment_method",
            "status",
            "amount",
            "transaction_id",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields


