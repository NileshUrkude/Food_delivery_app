from django.db import transaction

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError

from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsRestaurantOwner
from rest_framework.response import Response
from apps.coupons.models import Coupon

from apps.cart.models import (
    Cart,
    CartItem,
)

from .models import (
    Order,
    OrderItem,
)

from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
)


class OrderCreateView(
    generics.CreateAPIView
):

    serializer_class = (
        OrderSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    @transaction.atomic
    def create(
        self,
        request,
        *args,
        **kwargs,
    ):

        user = request.user

        create_serializer = OrderCreateSerializer(
            data=request.data
        )
        create_serializer.is_valid(
            raise_exception=True
        )

        validated_coupon_code = (
            create_serializer.validated_data.get(
                "coupon_code"
            )
        )

        # ==========================================
        # GET CART
        # ==========================================

        try:

            cart = (
                Cart.objects
                .select_for_update()
                .prefetch_related(
                    "items__food_item",
                )
                .get(
                    user=user,
                )
            )

        except Cart.DoesNotExist:

            raise ValidationError(
                {
                    "cart": (
                        "Cart not found."
                    )
                }
            )

        cart_items = cart.items.all()

        if not cart_items.exists():

            raise ValidationError(
                {
                    "cart": (
                        "Cannot create order "
                        "with an empty cart."
                    )
                }
            )

        # ==========================================
        # VALIDATE RESTAURANT
        # ==========================================

        restaurants = set()

        for cart_item in cart_items:

            restaurants.add(
                cart_item.food_item.restaurant_id
            )

        if len(restaurants) > 1:

            raise ValidationError(
                {
                    "cart": (
                        "All cart items must "
                        "belong to the same restaurant."
                    )
                }
            )

        restaurant_id = restaurants.pop()

        # ==========================================
        # CALCULATE SUBTOTAL
        # ==========================================

        subtotal = 0

        for cart_item in cart_items:

            food_item = (
                cart_item.food_item
            )

            if not food_item.is_available:

                raise ValidationError(
                    {
                        "cart": (
                            f"{food_item.name} "
                            "is currently unavailable."
                        )
                    }
                )

            subtotal += (
                food_item.price
                * cart_item.quantity
            )

        # ==========================================
        # COUPON
        # ==========================================

        coupon = None

        discount_amount = 0

        coupon_code = validated_coupon_code

        if coupon_code:

            try:

                coupon = (
                    Coupon.objects
                    .select_for_update()
                    .get(
                        code=(
                            coupon_code
                            .strip()
                            .upper()
                        )
                    )
                )

            except Coupon.DoesNotExist:

                raise ValidationError(
                    {
                        "coupon_code": (
                            "Invalid coupon code."
                        )
                    }
                )

            if not coupon.is_valid_for_order(
                subtotal
            ):

                raise ValidationError(
                    {
                        "coupon_code": (
                            "Coupon is not valid "
                            "for this order."
                        )
                    }
                )

            discount_amount = (
                coupon.calculate_discount(
                    subtotal
                )
            )

        # ==========================================
        # FINAL TOTAL
        # ==========================================

        total_amount = (
            subtotal
            - discount_amount
        )

        # ==========================================
        # CREATE ORDER
        # ==========================================

        order = Order.objects.create(

            user=user,

            restaurant_id=restaurant_id,

            subtotal=subtotal,

            discount_amount=(
                discount_amount
            ),

            coupon=coupon,

            total_amount=total_amount,

            status="pending",
        )

        # ==========================================
        # CREATE ORDER ITEMS
        # ==========================================

        for cart_item in cart_items:

            food_item = (
                cart_item.food_item
            )

            OrderItem.objects.create(

                order=order,

                food_item=food_item,

                food_name=(
                    food_item.name
                ),

                price=(
                    food_item.price
                ),

                quantity=(
                    cart_item.quantity
                ),

                subtotal=(
                    food_item.price
                    * cart_item.quantity
                ),
            )

        # ==========================================
        # UPDATE COUPON USAGE
        # ==========================================

        if coupon:

            coupon.used_count += 1

            coupon.save(
                update_fields=[
                    "used_count",
                    "updated_at",
                ]
            )

        # ==========================================
        # CLEAR CART
        # ==========================================

        cart_items.delete()

        # ==========================================
        # RESPONSE
        # ==========================================

        serializer = (
            self.get_serializer(
                order
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

class OrderListView(
    generics.ListAPIView
):

    serializer_class = (
        OrderSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(
        self,
    ):

        return (
            Order.objects
            .filter(
                user=self.request.user,
            )
            .select_related(
                "restaurant",
            )
            .prefetch_related(
                "items",
            )
        )

class OrderDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        OrderSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(
        self,
    ):

        return (
            Order.objects
            .filter(
                user=self.request.user,
            )
            .select_related(
                "restaurant",
            )
            .prefetch_related(
                "items",
            )
        )

class RestaurantOrderListView(
    generics.ListAPIView
):

    serializer_class = (
        OrderSerializer
    )

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    def get_queryset(
        self,
    ):

        return (
            Order.objects
            .filter(
                restaurant=(
                    self.request.user.restaurant
                ),
            )
            .select_related(
                "user",
                "restaurant",
            )
            .prefetch_related(
                "items",
            )
        )

class RestaurantOrderStatusUpdateView(
    generics.UpdateAPIView
):

    serializer_class = (
        OrderSerializer
    )

    permission_classes = [
        IsAuthenticated,
        IsRestaurantOwner,
    ]

    http_method_names = [
        "patch",
    ]

    def get_queryset(
        self,
    ):

        return Order.objects.filter(
            restaurant=(
                self.request.user.restaurant
            ),
        )

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):

        order = self.get_object()

        new_status = request.data.get(
            "status"
        )

        if not new_status:

            raise ValidationError(
                {
                    "status": (
                        "Status is required."
                    )
                }
            )

        valid_statuses = {
            "confirmed",
            "preparing",
            "out_for_delivery",
            "delivered",
            "cancelled",
        }

        if new_status not in valid_statuses:

            raise ValidationError(
                {
                    "status": (
                        "Invalid order status."
                    )
                }
            )

        current_status = (
            order.status
        )

        allowed_transitions = {

            "pending": {
                "confirmed",
                "cancelled",
            },

            "confirmed": {
                "preparing",
                "cancelled",
            },

            "preparing": {
                "out_for_delivery",
                "cancelled",
            },

            "out_for_delivery": {
                "delivered",
            },

            "delivered": set(),

            "cancelled": set(),

        }

        if (
            new_status
            not in allowed_transitions[
                current_status
            ]
        ):

            raise ValidationError(
                {
                    "status": (
                        f"Cannot change order "
                        f"from '{current_status}' "
                        f"to '{new_status}'."
                    )
                }
            )

        order.status = new_status

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        serializer = (
            self.get_serializer(
                order
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class OrderCancelView(
    generics.UpdateAPIView
):

    serializer_class = (
        OrderSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    http_method_names = [
        "post",
    ]

    def get_queryset(
        self,
    ):

        return (
            Order.objects
            .filter(
                user=self.request.user,
            )
            .select_related(
                "restaurant",
            )
            .prefetch_related(
                "items",
            )
        )

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):

        order = self.get_object()

        if order.status == "cancelled":

            raise ValidationError(
                {
                    "order": (
                        "This order is already cancelled."
                    )
                }
            )

        if order.status == "delivered":

            raise ValidationError(
                {
                    "order": (
                        "A delivered order cannot "
                        "be cancelled."
                    )
                }
            )

        if order.status == "out_for_delivery":

            raise ValidationError(
                {
                    "order": (
                        "An order that is out for delivery "
                        "cannot be cancelled."
                    )
                }
            )

        if order.status == "preparing":

            raise ValidationError(
                {
                    "order": (
                        "An order that is being prepared "
                        "cannot be cancelled."
                    )
                }
            )

        if order.status not in [
            "pending",
            "confirmed",
        ]:

            raise ValidationError(
                {
                    "order": (
                        "This order cannot be cancelled."
                    )
                }
            )

        order.status = "cancelled"

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        serializer = (
            self.get_serializer(
                order
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


