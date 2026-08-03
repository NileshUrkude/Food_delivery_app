from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):

    message = (
        "Only customers can perform this action."
    )

    def has_permission(
        self,
        request,
        view,
    ):

        return (
            request.user.is_authenticated
            and request.user.is_customer
        )


class IsRestaurantOwner(BasePermission):

    message = (
        "Only restaurant owners can perform "
        "this action."
    )

    def has_permission(
        self,
        request,
        view,
    ):

        return (
            request.user.is_authenticated
            and request.user.is_restaurant_owner
        )


class IsAdminUser(BasePermission):

    message = (
        "Only administrators can perform "
        "this action."
    )

    def has_permission(
        self,
        request,
        view,
    ):

        return (
            request.user.is_authenticated
            and request.user.is_admin
        )