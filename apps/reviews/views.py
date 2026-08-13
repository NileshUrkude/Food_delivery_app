from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from apps.orders.models import OrderItem
from .models import Review
from .serializers import ReviewSerializer

class ReviewCreateView(
    generics.CreateAPIView
):

    serializer_class = (
        ReviewSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def perform_create(
        self,
        serializer,
    ):

        food_item = (
            serializer.validated_data[
                "food_item"
            ]
        )

        has_purchased = (
            OrderItem.objects
            .filter(
                order__user=(
                    self.request.user
                ),
                order__status=(
                    "delivered"
                ),
                food_item=food_item,
            )
            .exists()
        )

        if not has_purchased:

            raise ValidationError(
                {
                    "food_item": (
                        "You can review "
                        "only food items "
                        "from your delivered orders."
                    )
                }
            )

        serializer.save(
            user=self.request.user
        )


class FoodItemReviewListView(
    generics.ListAPIView
):

    serializer_class = (
        ReviewSerializer
    )

    permission_classes = [
        AllowAny,
    ]

    def get_queryset(
        self,
    ):

        food_item_id = (
            self.kwargs[
                "food_item_id"
            ]
        )

        return (
            Review.objects
            .filter(
                food_item_id=food_item_id,
            )
            .select_related(
                "user",
                "food_item",
            )
        )


