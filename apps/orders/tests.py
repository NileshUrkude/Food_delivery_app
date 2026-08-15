from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.menu.models import FoodItem, MenuCategory
from apps.orders.models import Order, OrderItem
from apps.restaurants.models import Restaurant
from apps.users.models import User


class OrderCancelAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="secret123",
            role=User.Role.CUSTOMER,
        )

        self.owner = User.objects.create_user(
            email="owner@example.com",
            password="secret123",
            role=User.Role.RESTAURANT_OWNER,
        )

        self.restaurant = Restaurant.objects.create(
            owner=self.owner,
            name="Test Restaurant",
            description="A restaurant for tests.",
            phone="1234567890",
            email="restaurant@example.com",
            address="123 Test St",
            city="Test City",
            state="TS",
            postal_code="12345",
            opening_time="09:00:00",
            closing_time="21:00:00",
        )

        self.category = MenuCategory.objects.create(
            restaurant=self.restaurant,
            name="Main Course",
            description="Test category",
        )

        self.food_item = FoodItem.objects.create(
            restaurant=self.restaurant,
            category=self.category,
            name="Burger",
            description="Test burger",
            price=Decimal("10.00"),
            preparation_time=15,
            is_available=True,
        )

        self.order = Order.objects.create(
            user=self.user,
            restaurant=self.restaurant,
            subtotal=Decimal("10.00"),
            discount_amount=Decimal("0.00"),
            total_amount=Decimal("10.00"),
            status="pending",
        )

        OrderItem.objects.create(
            order=self.order,
            food_item=self.food_item,
            food_name=self.food_item.name,
            price=self.food_item.price,
            quantity=1,
            subtotal=self.food_item.price,
        )

    def test_cancel_order_post_is_allowed(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("orders:order-cancel", kwargs={"pk": self.order.pk})
        )

        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "cancelled")
