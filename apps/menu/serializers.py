from rest_framework import serializers

from .models import (
    FoodItem,
    MenuCategory,
)


class MenuCategorySerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = MenuCategory

        fields = (
            "id",
            "restaurant",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "restaurant",
            "created_at",
            "updated_at",
        )

    def validate_name(
        self,
        value,
    ):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Category name cannot be empty."
            )

        restaurant = (
            self.context.get("restaurant")
        )

        if restaurant:

            queryset = MenuCategory.objects.filter(
                restaurant=restaurant,
                name__iexact=value,
            )

            if self.instance:

                queryset = queryset.exclude(
                    pk=self.instance.pk
                )

            if queryset.exists():

                raise serializers.ValidationError(
                    "A category with this name "
                    "already exists."
                )

        return value

class FoodItemSerializer(
    serializers.ModelSerializer
):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:

        model = FoodItem

        fields = (
            "id",
            "restaurant",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "image",
            "food_type",
            "is_available",
            "preparation_time",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "restaurant",
            "created_at",
            "updated_at",
        )

    def validate_name(
        self,
        value,
    ):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Food item name cannot be empty."
            )

        return value


    def validate_price(
        self,
        value,
    ):

        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )

        return value

    def validate_preparation_time(
        self,
        value,
    ):

        if value <= 0:
            raise serializers.ValidationError(
                "Preparation time must be greater than zero."
            )
        return value

    def validate(
        self,
        attrs,
    ):

        category = attrs.get(
            "category"
        )

        restaurant = (
            self.context.get(
                "restaurant"
            )
        )

        if (
            category
            and restaurant
            and category.restaurant
            != restaurant
        ):

            raise serializers.ValidationError(
                {
                    "category": (
                        "This category does not "
                        "belong to your restaurant."
                    )
                }
            )

        if (
            category
            and not category.is_active
        ):

            raise serializers.ValidationError(
                {
                    "category": (
                        "This category is inactive."
                    )
                }
            )

        return attrs

class PublicFoodItemSerializer(
    serializers.ModelSerializer
):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:

        model = FoodItem

        fields = (
            "id",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "image",
            "food_type",
            "is_available",
            "preparation_time",
        )

        read_only_fields = fields






