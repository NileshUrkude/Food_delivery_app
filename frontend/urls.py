from django.urls import path

from . import views

app_name = "frontend"

urlpatterns = [
    path("", views.home, name="home"),

    # Auth
    path("login/", views.login_page, name="login"),
    path("register/", views.register_page, name="register"),

    # other pages
    path("restaurants/<int:restaurant_id>/", views.restaurant_detail, name="restaurant-detail"),
    path("cart/", views.cart_detail, name="cart-detail"),
    path("checkout/", views.checkout, name="checkout"),
    path("orders/", views.order_list, name="order-list"),
    path("orders/<int:order_id>/", views.order_detail, name="order-detail"),
    path("profile/", views.profile, name="profile"),
    

]