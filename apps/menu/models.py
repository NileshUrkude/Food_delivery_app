from django.conf import settings
from django.db import models


class MenuCategory(models.Model):

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="menu_categories",
    )

    name = models.CharField(
        max_length=100,
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        ordering = [
            "name",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "restaurant",
                    "name",
                ],
                name=(
                    "unique_category_per_restaurant"
                ),
            ),
        ]

    def __str__(self):

        return (
            f"{self.restaurant.name} - "
            f"{self.name}"
        )


class FoodItem(models.Model):

    class FoodType(models.TextChoices):

        VEG = "veg", "Vegetarian"

        NON_VEG = (
            "non_veg",
            "Non-Vegetarian",
        )

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.CASCADE,
        related_name="food_items",
    )

    category = models.ForeignKey(
        MenuCategory,
        on_delete=models.PROTECT,
        related_name="food_items",
    )

    name = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    image = models.ImageField(
        upload_to="food_items/",
        blank=True,
        null=True,
    )

    food_type = models.CharField(
        max_length=10,
        choices=FoodType.choices,
        default=FoodType.VEG,
    )

    is_available = models.BooleanField(
        default=True,
    )

    preparation_time = models.PositiveIntegerField(
        help_text=(
            "Preparation time in minutes."
        ),
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        ordering = [
            "name",
        ]

        indexes = [
            models.Index(
                fields=[
                    "restaurant",
                    "is_available",
                ],
            ),

            models.Index(
                fields=[
                    "category",
                    "is_available",
                ],
            ),
        ]

    def __str__(self):

        return (
            f"{self.name} - "
            f"{self.restaurant.name}"
        )