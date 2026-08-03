from django.conf import settings
from django.db import models


class Restaurant(models.Model):

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="restaurant",
    )

    name = models.CharField(
        max_length=255,
    )

    description = models.TextField()

    phone = models.CharField(
        max_length=15,
    )

    email = models.EmailField()

    address = models.TextField()

    city = models.CharField(
        max_length=100,
    )

    state = models.CharField(
        max_length=100,
    )

    postal_code = models.CharField(
        max_length=10,
    )

    opening_time = models.TimeField()

    closing_time = models.TimeField()

    image = models.ImageField(
        upload_to="restaurants/",
        blank=True,
        null=True,
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

    def __str__(self):

        return self.name