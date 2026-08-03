from rest_framework import serializers

from .models import Coupon


class CouponSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Coupon

        fields = (
            "id",
            "code",
            "discount_type",
            "discount_value",
            "minimum_order_amount",
            "maximum_discount_amount",
            "usage_limit",
            "used_count",
            "valid_from",
            "valid_until",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "used_count",
            "created_at",
            "updated_at",
        )

    def validate_code(
        self,
        value,
    ):

        return value.strip().upper()

    def validate(
        self,
        attrs,
    ):

        discount_type = attrs.get(
            "discount_type"
        )

        discount_value = attrs.get(
            "discount_value"
        )

        minimum_order_amount = attrs.get(
            "minimum_order_amount"
        )

        maximum_discount_amount = attrs.get(
            "maximum_discount_amount"
        )

        valid_from = attrs.get(
            "valid_from"
        )

        valid_until = attrs.get(
            "valid_until"
        )

        if discount_value <= 0:

            raise serializers.ValidationError(
                {
                    "discount_value": (
                        "Discount value must "
                        "be greater than zero."
                    )
                }
            )

        if (
            minimum_order_amount
            and minimum_order_amount < 0
        ):

            raise serializers.ValidationError(
                {
                    "minimum_order_amount": (
                        "Minimum order amount "
                        "cannot be negative."
                    )
                }
            )

        if (
            discount_type == "percentage"
            and discount_value > 100
        ):

            raise serializers.ValidationError(
                {
                    "discount_value": (
                        "Percentage discount "
                        "cannot exceed 100%."
                    )
                }
            )

        if (
            maximum_discount_amount
            and maximum_discount_amount <= 0
        ):

            raise serializers.ValidationError(
                {
                    "maximum_discount_amount": (
                        "Maximum discount must "
                        "be greater than zero."
                    )
                }
            )

        if (
            valid_from
            and valid_until
            and valid_from >= valid_until
        ):

            raise serializers.ValidationError(
                {
                    "valid_until": (
                        "Valid until must be "
                        "after valid from."
                    )
                }
            )

        return attrs

class CouponListSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Coupon

        fields = (
            "id",
            "code",
            "discount_type",
            "discount_value",
            "minimum_order_amount",
            "maximum_discount_amount",
            "valid_from",
            "valid_until",
        )

        read_only_fields = fields

