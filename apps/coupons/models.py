from decimal import Decimal

from django.db import models
from django.utils import timezone

class Coupon(models.Model):

    DISCOUNT_TYPE_CHOICES = [
        (
            "percentage",
            "Percentage",
        ),
        (
            "fixed",
            "Fixed Amount",
        ),
    ]

    code = models.CharField(
        max_length=50,
        unique=True,
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    maximum_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    used_count = models.PositiveIntegerField(
        default=0,
    )

    valid_from = models.DateTimeField()

    valid_until = models.DateTimeField()

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
            "-created_at",
        ]

    def __str__(self):

        return self.code

    def is_valid_for_order(
        self,
        order_amount,
    ):

        now = timezone.now()

        if not self.is_active:

            return False

        if now < self.valid_from:

            return False

        if now > self.valid_until:

            return False

        if (
            self.usage_limit is not None
            and self.used_count
            >= self.usage_limit
        ):

            return False

        if (
            order_amount
            < self.minimum_order_amount
        ):

            return False

        return True

    def calculate_discount(
        self,
        order_amount,
    ):

        order_amount = Decimal(str(order_amount))

        if not self.is_valid_for_order(
            order_amount
        ):

            return 0

        if (
            self.discount_type
            == "percentage"
        ):

            discount = (
                order_amount
                * self.discount_value
                / 100
            )

        else:

            discount = (
                self.discount_value
            )

        if (
            self.maximum_discount_amount
            and discount
            > self.maximum_discount_amount
        ):

            discount = (
                self.maximum_discount_amount
            )

        if discount > order_amount:

            discount = order_amount

        return discount

 