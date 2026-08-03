from rest_framework import serializers

from .models import (
    Cart,
    CartItem,
)


class CartItemSerializer(
    serializers.ModelSerializer
):

    food_name = serializers.CharField(
        source="food_item.name",
        read_only=True,
    )

    price = serializers.DecimalField(
        source="food_item.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:

        model = CartItem

        fields = (
            "id",
            "food_item",
            "food_name",
            "price",
            "quantity",
            "subtotal",
        )

        read_only_fields = (
            "id",
            "food_name",
            "price",
            "subtotal",
        )

    def validate_quantity(
        self,
        value,
    ):

        if value < 1:

            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )

        if value > 20:

            raise serializers.ValidationError(
                "Maximum quantity is 20."
            )

        return value

    def get_subtotal(
        self,
        obj,
    ):

        return (
            obj.food_item.price
            * obj.quantity
        )

class CartSerializer(
    serializers.ModelSerializer
):

    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    total_items = serializers.SerializerMethodField()

    total_amount = serializers.SerializerMethodField()

    class Meta:

        model = Cart

        fields = (
            "id",
            "items",
            "total_items",
            "total_amount",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields

    def get_total_items(
        self,
        obj,
    ):

        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_total_amount(
        self,
        obj,
    ):

        return sum(
            (
                item.food_item.price
                * item.quantity
            )
            for item in obj.items.all()
        )

class CartValidationSerializer(
    serializers.Serializer
):

    is_valid = serializers.BooleanField(
        read_only=True,
    )

    message = serializers.CharField(
        read_only=True,
    )

    total_items = serializers.IntegerField(
        read_only=True,
    )

    total_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )


