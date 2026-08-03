from django.shortcuts import render 

def home(request):
    return render(request, "home.html")

def login_page(request):
    return render(request, "auth/login.html")

def register_page(request):
    return render(request, "auth/register.html")

def restaurant_detail(request, restaurant_id):
    return render(request, "restaurants/detail.html", {"restaurant_id": restaurant_id})

def cart_detail(request):
    return render(request, "cart/detail.html")

def checkout(request):
    return render(request, "checkout/checkout.html")

def order_list(request):
    return render(request, "orders/list.html")

def order_detail(request, order_id):
    return render(request, "orders/detail.html", {"order_id": order_id})

def profile(request):
    return render(request, "account/profile.html")