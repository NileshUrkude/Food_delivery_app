from django.contrib import admin

from .models import (
    FoodItem,
    MenuCategory,
)


@admin.register(MenuCategory)
class MenuCategoryAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "name",
        "restaurant",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
        "restaurant",
    )

    search_fields = (
        "name",
        "restaurant__name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(FoodItem)
class FoodItemAdmin(
    admin.ModelAdmin
):

    list_display = (
        "id",
        "name",
        "restaurant",
        "category",
        "price",
        "food_type",
        "is_available",
    )

    list_filter = (
        "food_type",
        "is_available",
        "restaurant",
        "category",
    )

    search_fields = (
        "name",
        "restaurant__name",
        "category__name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )