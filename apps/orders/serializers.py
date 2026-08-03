from rest_framework import serializers

from .models import (
    Order,
    OrderItem,
)


class OrderItemSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = OrderItem

        fields = (
            "id",
            "food_item",
            "food_name",
            "price",
            "quantity",
            "subtotal",
        )

        read_only_fields = fields


class OrderSerializer(
    serializers.ModelSerializer
):

    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    coupon_code = serializers.CharField(
        source="coupon.code",
        read_only=True,
        allow_null=True,
    )
    
    class Meta:

        model = Order

        fields = (
            "id",
            "restaurant",
            "status",
            "total_amount",
            "items",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields

