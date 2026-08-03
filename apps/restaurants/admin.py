from django.contrib import admin

from .models import Restaurant


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "owner",
        "city",
        "phone",
        "is_active",
    )

    list_filter = (
        "city",
        "state",
        "is_active",
    )

    search_fields = (
        "name",
        "city",
        "owner__email",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "name",
    )