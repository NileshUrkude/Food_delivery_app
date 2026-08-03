from django.urls import path

from .views import (
    FoodItemReviewListView,
    ReviewCreateView,
)


app_name = "reviews"


urlpatterns = [

    path(
        "",
        ReviewCreateView.as_view(),
        name="review-create",
    ),

    path(
        "food/<int:food_item_id>/",
        FoodItemReviewListView.as_view(),
        name="food-review-list",
    ),

]