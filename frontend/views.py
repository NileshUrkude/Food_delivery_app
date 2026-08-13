from django.shortcuts import render


def home(request):
    return render(request, "v2/home.html")


def login_page(request):
    return render(request, "v2/auth/login.html")


def register_page(request):
    return render(request, "v2/auth/register.html")


def restaurant_detail(request, restaurant_id):
    return render(request, "v2/restaurants/detail.html", {"restaurant_id": restaurant_id})


def cart_detail(request):
    return render(request, "v2/cart/detail.html")


def checkout(request):
    return render(request, "v2/checkout/detail.html")


def order_list(request):
    return render(request, "v2/orders/list.html")


def order_detail(request, order_id):
    return render(request, "v2/orders/detail.html", {"order_id": order_id})


def profile(request):
    return render(request, "v2/account/profile.html")
