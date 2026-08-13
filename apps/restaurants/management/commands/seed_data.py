from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.restaurants.models import Restaurant
from apps.menu.models import MenuCategory, FoodItem
from apps.coupons.models import Coupon
from apps.cart.models import Cart, CartItem
from apps.orders.models import Order, OrderItem
from apps.reviews.models import Review
from datetime import time, timedelta
from django.utils import timezone

class Command(
    BaseCommand
):

    help = (
        "Create sample data "
        "for development."
    )

    @transaction.atomic
    def handle(
        self,
        *args,
        **options
    ):

        self.stdout.write(
            self.style.WARNING(
                "Creating demo data..."
            )
        )

        User = get_user_model()

        self.create_users(User)

        self.create_restaurants()

        self.create_coupons()

        self.create_cart()

        self.create_orders()

        self.create_reviews()

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data created successfully."
            )
        )

    def create_users(
        self,
        User
    ):

        customers = [

            {
                "email": "customer1@example.com",
                "first_name": "Rahul",
                "last_name": "Patil",
                "phone": "9999999991",
            },

            {
                "email": "customer2@example.com",
                "first_name": "Sneha",
                "last_name": "Sharma",
                "phone": "9999999992",
            },

        ]


        owners = [

            {
                "email": "pizza@example.com",
                "first_name": "Pizza",
                "last_name": "Owner",
            },

            {
                "email": "burger@example.com",
                "first_name": "Burger",
                "last_name": "Owner",
            },

            {
                "email": "spice@example.com",
                "first_name": "Spice",
                "last_name": "Owner",
            },

            {
                "email": "biryani@example.com",
                "first_name": "Biryani",
                "last_name": "Owner",
            },

            {
                "email": "mumbai@example.com",
                "first_name": "Mumbai",
                "last_name": "Owner",
            },

            {
                "email": "nagpur@example.com",
                "first_name": "Nagpur",
                "last_name": "Owner",
            },

            {
                "email": "jaipur@example.com",
                "first_name": "Jaipur",
                "last_name": "Owner",
            },

            {
                "email": "udaipur@example.com",
                "first_name": "Udaipur",
                "last_name": "Owner",
            },

        ]


        self.customers = []

        self.owners = []


        for customer in customers:

            user, created = User.objects.get_or_create(

                email=customer["email"],

                defaults={

                    "first_name":
                        customer["first_name"],

                    "last_name":
                        customer["last_name"],

                    "phone_number":
                        customer["phone"],

                    "role":
                        User.Role.CUSTOMER,

                },

            )

            if created:

                user.set_password(
                    "Customer@123"
                )

                user.save()

            self.customers.append(user)


        for owner in owners:

            user, created = User.objects.get_or_create(

                email=owner["email"],

                defaults={

                    "first_name":
                        owner["first_name"],

                    "last_name":
                        owner["last_name"],

                    "phone_number":
                        "8888888888",

                    "role":
                        User.Role.RESTAURANT_OWNER,

                },

            )

            if created:

                user.set_password(
                    "Owner@123"
                )

                user.save()

            self.owners.append(user)


        self.customer1 = self.customers[0]

        self.customer2 = self.customers[1]


        self.stdout.write(
            self.style.SUCCESS(
                "Users created."
            )
        )
        
    def create_restaurants(
        self
    ):

        restaurants = [

            # Maharashtra — Pune
            {
                "name": "Pizza Palace",
                "description": "Fresh Italian pizza and pasta",
                "owner_email": "pizza@example.com",
                "city": "Pune",
                "state": "Maharashtra",
                "postal_code": "411001",
                "address": "FC Road, Pune",
            },
            {
                "name": "Burger House",
                "description": "Juicy burgers and crispy fries",
                "owner_email": "burger@example.com",
                "city": "Pune",
                "state": "Maharashtra",
                "postal_code": "411038",
                "address": "Koregaon Park, Pune",
            },

            # Maharashtra — Mumbai
            {
                "name": "Mumbai Masala",
                "description": "Street-style Mumbai flavours",
                "owner_email": "mumbai@example.com",
                "city": "Mumbai",
                "state": "Maharashtra",
                "postal_code": "400001",
                "address": "Colaba, Mumbai",
            },

            # Maharashtra — Nagpur
            {
                "name": "Nagpur Spice Kitchen",
                "description": "Authentic Vidarbha cuisine",
                "owner_email": "nagpur@example.com",
                "city": "Nagpur",
                "state": "Maharashtra",
                "postal_code": "440001",
                "address": "Sitabuldi, Nagpur",
            },

            # Rajasthan — Jaipur
            {
                "name": "Jaipur Royals",
                "description": "Royal Rajasthani thali and curries",
                "owner_email": "jaipur@example.com",
                "city": "Jaipur",
                "state": "Rajasthan",
                "postal_code": "302001",
                "address": "MI Road, Jaipur",
            },

            # Rajasthan — Udaipur
            {
                "name": "Lake View Cafe",
                "description": "Scenic lakeside dining in Udaipur",
                "owner_email": "udaipur@example.com",
                "city": "Udaipur",
                "state": "Rajasthan",
                "postal_code": "313001",
                "address": "Lake Pichola Road, Udaipur",
            },

            # Keep legacy Pune restaurants for existing demo orders
            {
                "name": "Spice Garden",
                "description": "North and South Indian food",
                "owner_email": "spice@example.com",
                "city": "Pune",
                "state": "Maharashtra",
                "postal_code": "411004",
                "address": "Camp Area, Pune",
            },
            {
                "name": "Biryani Hub",
                "description": "Hyderabadi and Mughlai biryani",
                "owner_email": "biryani@example.com",
                "city": "Pune",
                "state": "Maharashtra",
                "postal_code": "411006",
                "address": "SB Road, Pune",
            },

        ]

        owner_by_email = {
            owner.email: owner
            for owner in self.owners
        }

        self.restaurant_map = {}

        for restaurant_data in restaurants:

            owner = owner_by_email[
                restaurant_data["owner_email"]
            ]

            restaurant, created = Restaurant.objects.get_or_create(

                owner=owner,

                defaults={

                    "name":
                        restaurant_data["name"],

                    "description":
                        restaurant_data["description"],

                    "phone":
                        "9876543210",

                    "email":
                        owner.email,

                    "address":
                        restaurant_data["address"],

                    "city":
                        restaurant_data["city"],

                    "state":
                        restaurant_data["state"],

                    "postal_code":
                        restaurant_data["postal_code"],

                    "opening_time":
                        time(9, 0),

                    "closing_time":
                        time(23, 0),

                    "is_active":
                        True,

                },

            )

            if not created:
                Restaurant.objects.filter(pk=restaurant.pk).update(
                    city=restaurant_data["city"],
                    state=restaurant_data["state"],
                    address=restaurant_data["address"],
                    postal_code=restaurant_data["postal_code"],
                )

            self.restaurant_map[
                restaurant.name
            ] = restaurant

            self._create_menu_for_restaurant(restaurant)

        self.stdout.write(
            self.style.SUCCESS(
                "Restaurants, Categories & Food Items created."
            )
        )

    def _create_menu_for_restaurant(
        self,
        restaurant,
    ):

        veg_category, _ = MenuCategory.objects.get_or_create(
            restaurant=restaurant,
            name="Vegetarian",
            defaults={
                "description": "Pure vegetarian dishes",
            },
        )

        nonveg_category, _ = MenuCategory.objects.get_or_create(
            restaurant=restaurant,
            name="Non-Vegetarian",
            defaults={
                "description": "Non-vegetarian dishes",
            },
        )

        veg_items = [
            (
                "Paneer Butter Masala",
                "Creamy tomato curry with soft paneer",
                249,
            ),
            (
                "Veg Biryani",
                "Fragrant basmati rice with mixed vegetables",
                199,
            ),
            (
                "Dal Tadka",
                "Yellow lentils tempered with garlic and spices",
                149,
            ),
        ]

        nonveg_items = [
            (
                "Chicken Biryani",
                "Aromatic rice with tender chicken pieces",
                299,
            ),
            (
                "Butter Chicken",
                "Classic creamy tomato chicken curry",
                279,
            ),
            (
                "Egg Curry",
                "Boiled eggs in spicy onion-tomato gravy",
                199,
            ),
        ]

        for name, description, price in veg_items:
            FoodItem.objects.get_or_create(
                restaurant=restaurant,
                category=veg_category,
                name=name,
                defaults={
                    "description": description,
                    "price": price,
                    "food_type": FoodItem.FoodType.VEG,
                    "preparation_time": 20,
                    "is_available": True,
                },
            )

        for name, description, price in nonveg_items:
            FoodItem.objects.get_or_create(
                restaurant=restaurant,
                category=nonveg_category,
                name=name,
                defaults={
                    "description": description,
                    "price": price,
                    "food_type": FoodItem.FoodType.NON_VEG,
                    "preparation_time": 25,
                    "is_available": True,
                },
            )

    def create_coupons(
        self
    ):

        now = timezone.now()

        coupons = [

            {
                "code": "WELCOME10",

                "discount_type":
                    "percentage",

                "discount_value":
                    10,

                "minimum_order_amount":
                    300,

                "maximum_discount_amount":
                    100,

            },

            {
                "code": "SAVE20",

                "discount_type":
                    "percentage",

                "discount_value":
                    20,

                "minimum_order_amount":
                    500,

                "maximum_discount_amount":
                    200,

            },

            {
                "code": "FLAT100",

                "discount_type":
                    "fixed",

                "discount_value":
                    100,

                "minimum_order_amount":
                    500,

                "maximum_discount_amount":
                    None,

            },

        ]


        self.coupon_map = {}


        for coupon_data in coupons:

            coupon, _ = Coupon.objects.get_or_create(

                code=coupon_data["code"],

                defaults={

                    "discount_type":
                        coupon_data[
                            "discount_type"
                        ],

                    "discount_value":
                        coupon_data[
                            "discount_value"
                        ],

                    "minimum_order_amount":
                        coupon_data[
                            "minimum_order_amount"
                        ],

                    "maximum_discount_amount":
                        coupon_data[
                            "maximum_discount_amount"
                        ],

                    "usage_limit":
                        100,

                    "used_count":
                        0,

                    "valid_from":
                        now - timedelta(
                            days=1
                        ),

                    "valid_until":
                        now + timedelta(
                            days=30
                        ),

                    "is_active":
                        True,

                },

            )


            self.coupon_map[
                coupon.code
            ] = coupon


        self.stdout.write(
            self.style.SUCCESS(
                "Coupons created."
            )
        )
        
    def create_cart(
        self
    ):

        cart, _ = Cart.objects.get_or_create(

            user=self.customer1

        )


        pizza = FoodItem.objects.filter(

            restaurant__name="Pizza Palace",

            name="Special Item 1",

        ).first()


        burger = FoodItem.objects.filter(

            restaurant__name="Burger House",

            name="Special Item 1",

        ).first()


        if pizza:

            CartItem.objects.get_or_create(

                cart=cart,

                food_item=pizza,

                defaults={

                    "quantity":
                        2,

                },

            )


        if burger:

            CartItem.objects.get_or_create(

                cart=cart,

                food_item=burger,

                defaults={

                    "quantity":
                        1,

                },

            )


        self.stdout.write(
            self.style.SUCCESS(
                "Cart created."
            )
        )
        
    def create_orders(
        
        self
    ):

        pizza_restaurant = (
            self.restaurant_map[
                "Pizza Palace"
            ]
        )

        burger_restaurant = (
            self.restaurant_map[
                "Burger House"
            ]
        )


        pizza = FoodItem.objects.get(

            restaurant=pizza_restaurant,

            name="Special Item 1",

        )


        pizza_item_2 = FoodItem.objects.get(

            restaurant=pizza_restaurant,

            name="Special Item 2",

        )


        burger = FoodItem.objects.get(

            restaurant=burger_restaurant,

            name="Special Item 1",

        )


        burger_item_2 = FoodItem.objects.get(

            restaurant=burger_restaurant,

            name="Special Item 2",

        )


        welcome_coupon = (
            self.coupon_map[
                "WELCOME10"
            ]
        )


        # -------------------------------------------------
        # ORDER 1
        # Customer 1 - Pizza Palace
        # -------------------------------------------------

        quantity_1 = 2

        quantity_2 = 1


        subtotal_1 = (

            pizza.price
            * quantity_1

        ) + (

            pizza_item_2.price
            * quantity_2

        )


        discount_1 = (
            welcome_coupon.calculate_discount(
                subtotal_1
            )
        )


        total_1 = (
            subtotal_1
            - discount_1
        )


        order_1, _ = Order.objects.get_or_create(

            user=self.customer1,

            restaurant=pizza_restaurant,

            status="delivered",

            defaults={

                "subtotal":
                    subtotal_1,

                "discount_amount":
                    discount_1,

                "coupon":
                    welcome_coupon,

                "total_amount":
                    total_1,

            },

        )


        OrderItem.objects.get_or_create(

            order=order_1,

            food_item=pizza,

            defaults={

                "food_name":
                    pizza.name,

                "price":
                    pizza.price,

                "quantity":
                    quantity_1,

                "subtotal":
                    pizza.price
                    * quantity_1,

            },

        )


        OrderItem.objects.get_or_create(

            order=order_1,

            food_item=pizza_item_2,

            defaults={

                "food_name":
                    pizza_item_2.name,

                "price":
                    pizza_item_2.price,

                "quantity":
                    quantity_2,

                "subtotal":
                    pizza_item_2.price
                    * quantity_2,

            },

        )


        # -------------------------------------------------
        # ORDER 2
        # Customer 2 - Burger House
        # -------------------------------------------------

        quantity_3 = 1

        quantity_4 = 2


        subtotal_2 = (

            burger.price
            * quantity_3

        ) + (

            burger_item_2.price
            * quantity_4

        )


        discount_2 = 0


        total_2 = (
            subtotal_2
            - discount_2
        )


        order_2, _ = Order.objects.get_or_create(

            user=self.customer2,

            restaurant=burger_restaurant,

            status="preparing",

            defaults={

                "subtotal":
                    subtotal_2,

                "discount_amount":
                    discount_2,

                "coupon":
                    None,

                "total_amount":
                    total_2,

            },

        )


        OrderItem.objects.get_or_create(

            order=order_2,

            food_item=burger,

            defaults={

                "food_name":
                    burger.name,

                "price":
                    burger.price,

                "quantity":
                    quantity_3,

                "subtotal":
                    burger.price
                    * quantity_3,

            },

        )


        OrderItem.objects.get_or_create(

            order=order_2,

            food_item=burger_item_2,

            defaults={

                "food_name":
                    burger_item_2.name,

                "price":
                    burger_item_2.price,

                "quantity":
                    quantity_4,

                "subtotal":
                    burger_item_2.price
                    * quantity_4,

            },

        )


        self.stdout.write(

            self.style.SUCCESS(

                "Orders and order items created."

            )

        )

    def create_reviews(
        self
    ):

        pizza_restaurant = (
            self.restaurant_map[
                "Pizza Palace"
            ]
        )

        burger_restaurant = (
            self.restaurant_map[
                "Burger House"
            ]
        )

        spice_restaurant = (
            self.restaurant_map[
                "Spice Garden"
            ]
        )


        pizza = FoodItem.objects.get(

            restaurant=pizza_restaurant,

            name="Special Item 1",

        )


        burger = FoodItem.objects.get(

            restaurant=burger_restaurant,

            name="Special Item 1",

        )


        spice = FoodItem.objects.get(

            restaurant=spice_restaurant,

            name="Special Item 1",

        )


        reviews = [

            {
                "user":
                    self.customer1,

                "food_item":
                    pizza,

                "rating":
                    5,

                "comment":
                    "Very tasty and fresh. "
                    "Highly recommended.",

            },

            {
                "user":
                    self.customer2,

                "food_item":
                    burger,

                "rating":
                    4,

                "comment":
                    "Good burger and "
                    "nice taste.",

            },

            {
                "user":
                    self.customer1,

                "food_item":
                    spice,

                "rating":
                    5,

                "comment":
                    "Excellent food. "
                    "Loved the authentic taste.",

            },

        ]


        for review_data in reviews:

            Review.objects.get_or_create(

                user=review_data[
                    "user"
                ],

                food_item=review_data[
                    "food_item"
                ],

                defaults={

                    "rating":
                        review_data[
                            "rating"
                        ],

                    "comment":
                        review_data[
                            "comment"
                        ],

                },

            )


        self.stdout.write(

            self.style.SUCCESS(

                "Reviews created."

            )

        )
    