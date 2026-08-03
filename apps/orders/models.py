from django.conf import settings
from django.db import models
from apps.coupons.models import Coupon
from apps.menu.models import FoodItem


class Order(models.Model):

    STATUS_CHOICES = [
        (
            "pending",
            "Pending",
        ),
        (
            "confirmed",
            "Confirmed",
        ),
        (
            "preparing",
            "Preparing",
        ),
        (
            "out_for_delivery",
            "Out for Delivery",
        ),
        (
            "delivered",
            "Delivered",
        ),
        (
            "cancelled",
            "Cancelled",
        ),
    ]

    user = models.ForeignKey(
        "users.User",
        on_delete=models.PROTECT,
        related_name="orders",
    )

    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        on_delete=models.PROTECT,
        related_name="orders",
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):

        return (
            f"Order #{self.id}"
        )
    
class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    food_item = models.ForeignKey(
        FoodItem,
        on_delete=models.PROTECT,
        related_name="order_items",
    )

    food_name = models.CharField(
        max_length=255,
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    quantity = models.PositiveIntegerField()

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):

        return (
            f"{self.food_name} "
            f"x {self.quantity}"
        )