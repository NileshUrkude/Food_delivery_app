from rest_framework import serializers
from django.db.models import Avg
from apps.reviews.models import Review
from .models import Restaurant



class RestaurantSerializer(serializers.ModelSerializer):

    owner_email = serializers.EmailField(
        source="owner.email",
        read_only=True,
    )

    class Meta:

        model = Restaurant

        fields = (
            "id",
            "owner",
            "owner_email",
            "name",
            "description",
            "phone",
            "email",
            "address",
            "city",
            "state",
            "postal_code",
            "opening_time",
            "closing_time",
            "image",
            "is_active",
            "created_at",
            "updated_at",
            "average_rating",
            "review_count",
        )

        read_only_fields = (
            "id",
            "owner",
            "created_at",
            "updated_at",
        )

    average_rating = serializers.SerializerMethodField()

    review_count = serializers.SerializerMethodField()

    def get_average_rating(
        self,
        obj,
    ):

        result = (
            obj.food_items
            .aggregate(
                average=Avg(
                    "reviews__rating"
                )
            )
        )

        return result["average"]


    def get_review_count(
        self,
        obj,
    ):

        return (
            Review.objects
            .filter(
                food_item__restaurant=obj
            )
            .count()
        )
    
    def validate(self, attrs):

        opening = attrs.get(
            "opening_time"
        )

        closing = attrs.get(
            "closing_time"
        )

        if (
            opening
            and closing
            and opening >= closing
        ):
            raise serializers.ValidationError(
                "Opening time must be before closing time."
            )

        return attrs

class RestaurantListSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Restaurant

        fields = (
            "id",
            "name",
            "description",
            "city",
            "state",
            "image",
            "is_active",
            "opening_time",
            "closing_time",
        )

        read_only_fields = fields


class RestaurantDetailSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Restaurant

        fields = (
            "id",
            "name",
            "description",
            "phone",
            "email",
            "address",
            "city",
            "state",
            "postal_code",
            "opening_time",
            "closing_time",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields