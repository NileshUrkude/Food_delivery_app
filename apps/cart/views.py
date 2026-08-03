from django.db.models import Prefetch

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import (
    Cart,
    CartItem,
)

from .serializers import (
    CartItemSerializer,
    CartSerializer,
)


class CartDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        CartSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_object(
        self,
    ):

        cart, created = (
            Cart.objects.get_or_create(
                user=self.request.user,
            )
        )

        return (
            Cart.objects
            .prefetch_related(
                Prefetch(
                    "items",
                    queryset=(
                        CartItem.objects
                        .select_related(
                            "food_item",
                            "food_item__category",
                            "food_item__restaurant",
                        )
                    ),
                )
            )
            .get(
                pk=cart.pk,
            )
        )

class CartItemCreateView(
    generics.CreateAPIView
):

    serializer_class = (
        CartItemSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):

        food_item_id = request.data.get(
            "food_item"
        )

        quantity = request.data.get(
            "quantity",
            1,
        )

        if not food_item_id:

            raise ValidationError(
                {
                    "food_item": (
                        "Food item is required."
                    )
                }
            )

        try:

            quantity = int(
                quantity
            )

        except (
            TypeError,
            ValueError,
        ):

            raise ValidationError(
                {
                    "quantity": (
                        "Quantity must be a valid integer."
                    )
                }
            )

        if quantity < 1:

            raise ValidationError(
                {
                    "quantity": (
                        "Quantity must be at least 1."
                    )
                }
            )

        if quantity > 20:

            raise ValidationError(
                {
                    "quantity": (
                        "Maximum quantity is 20."
                    )
                }
            )

        from apps.menu.models import (
            FoodItem,
        )

        try:

            food_item = (
                FoodItem.objects
                .select_related(
                    "restaurant",
                    "category",
                )
                .get(
                    id=food_item_id,
                )
            )

        except FoodItem.DoesNotExist:

            raise ValidationError(
                {
                    "food_item": (
                        "Food item does not exist."
                    )
                }
            )

        if not food_item.is_available:

            raise ValidationError(
                {
                    "food_item": (
                        "This food item is currently "
                        "unavailable."
                    )
                }
            )

        if not food_item.category.is_active:

            raise ValidationError(
                {
                    "food_item": (
                        "This food item's category "
                        "is inactive."
                    )
                }
            )

        if not food_item.restaurant.is_active:

            raise ValidationError(
                {
                    "food_item": (
                        "This restaurant is currently "
                        "inactive."
                    )
                }
            )

        cart, created = (
            Cart.objects.get_or_create(
                user=request.user,
            )
        )

        existing_item = (
            CartItem.objects
            .filter(
                cart=cart,
                food_item=food_item,
            )
            .first()
        )

        if existing_item:

            new_quantity = (
                existing_item.quantity
                + quantity
            )

            if new_quantity > 20:

                raise ValidationError(
                    {
                        "quantity": (
                            "Maximum quantity for "
                            "one food item is 20."
                        )
                    }
                )

            existing_item.quantity = (
                new_quantity
            )

            existing_item.save()

            serializer = (
                self.get_serializer(
                    existing_item
                )
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        cart_restaurant = (
            CartItem.objects
            .filter(
                cart=cart,
            )
            .select_related(
                "food_item__restaurant",
            )
            .first()
        )

        if (
            cart_restaurant
            and cart_restaurant.food_item.restaurant_id
            != food_item.restaurant_id
        ):

            raise ValidationError(
                {
                    "food_item": (
                        "You can only add food items "
                        "from one restaurant at a time."
                    )
                }
            )

        cart_item = CartItem.objects.create(
            cart=cart,
            food_item=food_item,
            quantity=quantity,
        )

        serializer = (
            self.get_serializer(
                cart_item
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

class CartItemUpdateView(
    generics.UpdateAPIView
):

    serializer_class = (
        CartItemSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    http_method_names = [
        "patch",
        "put",
    ]

    def get_queryset(
        self,
    ):

        return (
            CartItem.objects
            .filter(
                cart__user=self.request.user,
            )
            .select_related(
                "food_item",
            )
        )

class CartItemDeleteView(
    generics.DestroyAPIView
):

    serializer_class = (
        CartItemSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(
        self,
    ):

        return CartItem.objects.filter(
            cart__user=self.request.user,
        )

class CartClearView(
    generics.DestroyAPIView
):

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(
        self,
    ):

        return Cart.objects.filter(
            user=self.request.user,
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):

        cart, created = (
            Cart.objects.get_or_create(
                user=request.user,
            )
        )

        cart.items.all().delete()

        return Response(
            {
                "message": (
                    "Cart cleared successfully."
                )
            },
            status=status.HTTP_200_OK,
        )

class CartValidationView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated,
    ]

    def get(
        self,
        request,
        *args,
        **kwargs,
    ):

        cart, created = (
            Cart.objects.get_or_create(
                user=request.user,
            )
        )

        cart_items = (
            CartItem.objects
            .filter(
                cart=cart,
            )
            .select_related(
                "food_item",
                "food_item__category",
                "food_item__restaurant",
            )
        )

        if not cart_items.exists():

            return Response(
                {
                    "is_valid": False,
                    "message": (
                        "Your cart is empty."
                    ),
                    "total_items": 0,
                    "total_amount": "0.00",
                },
                status=status.HTTP_200_OK,
            )

        first_item = (
            cart_items.first()
        )

        restaurant = (
            first_item
            .food_item
            .restaurant
        )

        total_items = 0

        total_amount = 0

        for item in cart_items:

            food_item = (
                item.food_item
            )

            if not food_item.is_available:

                return Response(
                    {
                        "is_valid": False,
                        "message": (
                            f"{food_item.name} "
                            "is currently unavailable."
                        ),
                        "total_items": 0,
                        "total_amount": "0.00",
                    },
                    status=status.HTTP_200_OK,
                )

            if not food_item.category.is_active:

                return Response(
                    {
                        "is_valid": False,
                        "message": (
                            f"Category for "
                            f"{food_item.name} "
                            "is inactive."
                        ),
                        "total_items": 0,
                        "total_amount": "0.00",
                    },
                    status=status.HTTP_200_OK,
                )

            if not food_item.restaurant.is_active:

                return Response(
                    {
                        "is_valid": False,
                        "message": (
                            f"{restaurant.name} "
                            "is currently inactive."
                        ),
                        "total_items": 0,
                        "total_amount": "0.00",
                    },
                    status=status.HTTP_200_OK,
                )

            if (
                food_item.restaurant_id
                != restaurant.id
            ):

                return Response(
                    {
                        "is_valid": False,
                        "message": (
                            "Cart contains food "
                            "from multiple restaurants."
                        ),
                        "total_items": 0,
                        "total_amount": "0.00",
                    },
                    status=status.HTTP_200_OK,
                )

            if item.quantity < 1:

                return Response(
                    {
                        "is_valid": False,
                        "message": (
                            f"Invalid quantity "
                            f"for {food_item.name}."
                        ),
                        "total_items": 0,
                        "total_amount": "0.00",
                    },
                    status=status.HTTP_200_OK,
                )

            if item.quantity > 20:

                return Response(
                    {
                        "is_valid": False,
                        "message": (
                            f"Maximum quantity "
                            f"exceeded for "
                            f"{food_item.name}."
                        ),
                        "total_items": 0,
                        "total_amount": "0.00",
                    },
                    status=status.HTTP_200_OK,
                )

            total_items += (
                item.quantity
            )

            total_amount += (
                food_item.price
                * item.quantity
            )

        return Response(
            {
                "is_valid": True,
                "message": (
                    "Cart is ready for checkout."
                ),
                "total_items": total_items,
                "total_amount": (
                    str(total_amount)
                ),
            },
            status=status.HTTP_200_OK,
        )

    
