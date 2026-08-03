from django.db import models


class Review(models.Model):

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    food_item = models.ForeignKey(
        "menu.FoodItem",
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveSmallIntegerField()

    comment = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        ordering = [
            "-created_at",
        ]

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "user",
                    "food_item",
                ],
                name=(
                    "unique_user_food_review"
                ),
            ),

        ]

    def __str__(self):

        return (
            f"{self.food_item} - "
            f"{self.rating}/5"
        )

