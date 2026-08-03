from rest_framework import serializers
from .models import Review

class ReviewSerializer(
    serializers.ModelSerializer
):

    user_name = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:

        model = Review

        fields = (
            "id",
            "user_name",
            "food_item",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user_name",
            "created_at",
            "updated_at",
        )

    def validate_rating(
        self,
        value,
    ):

        if value < 1 or value > 5:

            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return value

