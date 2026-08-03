document.addEventListener(
    "DOMContentLoaded",
    loadCart
);


async function loadCart() {

    const container =
        document.getElementById(
            "cart-container"
        );


    if (!container) {

        return;

    }


    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    if (!accessToken) {

        container.innerHTML = `

            <div
                class="alert alert-info"
            >

                Please login to view
                your cart.

                <a
                    href="/login/"
                    class="alert-link"
                >
                    Login
                </a>

            </div>

        `;

        return;

    }


    try {

        const cart =
            await apiRequest(
                "/cart/"
            );


        renderCart(
            cart
        );


        await updateCartCount();


    } catch (error) {

        console.error(
            "Cart API Error:",
            error
        );


        container.innerHTML = `

            <div
                class="alert alert-danger"
            >

                Failed to load cart.

            </div>

        `;

    }

}


function renderCart(
    cart
) {

    const container =
        document.getElementById(
            "cart-container"
        );


    if (!container) {

        return;

    }


    const items =
        cart.items || [];


    if (
        items.length === 0
    ) {

        container.innerHTML = `

            <div
                class="
                    text-center
                    py-5
                "
            >

                <h3>
                    Your cart is empty.
                </h3>


                <p
                    class="text-muted"
                >

                    Add some delicious
                    food to continue.

                </p>


                <a
                    href="/"
                    class="
                        btn
                        btn-primary
                    "
                >

                    Browse Restaurants

                </a>

            </div>

        `;

        return;

    }


    let itemsHtml = "";


    items.forEach(
        item => {

            itemsHtml += `

                <div
                    class="
                        card
                        mb-3
                        shadow-sm
                    "
                >

                    <div
                        class="card-body"
                    >

                        <div
                            class="
                                row
                                align-items-center
                            "
                        >

                            <div
                                class="
                                    col-md-5
                                "
                            >

                                <h5
                                    class="mb-1"
                                >

                                    ${
                                        item.food_item_name
                                        || "Food Item"
                                    }

                                </h5>


                                <p
                                    class="
                                        text-muted
                                        mb-0
                                    "
                                >

                                    ₹
                                    ${
                                        item.price
                                        || 0
                                    }
                                    each

                                </p>

                            </div>


                            <div
                                class="
                                    col-md-3
                                "
                            >

                                <div
                                    class="
                                        input-group
                                    "
                                >

                                    <button
                                        class="
                                            btn
                                            btn-outline-secondary
                                        "
                                        onclick="
                                            updateCartItem(
                                                ${item.id},
                                                ${item.quantity - 1}
                                            )
                                        "
                                        ${
                                            item.quantity <= 1
                                                ? "disabled"
                                                : ""
                                        }
                                    >

                                        -

                                    </button>


                                    <span
                                        class="
                                            form-control
                                            text-center
                                        "
                                    >

                                        ${
                                            item.quantity
                                        }

                                    </span>


                                    <button
                                        class="
                                            btn
                                            btn-outline-secondary
                                        "
                                        onclick="
                                            updateCartItem(
                                                ${item.id},
                                                ${item.quantity + 1}
                                            )
                                        "
                                    >

                                        +

                                    </button>

                                </div>

                            </div>


                            <div
                                class="
                                    col-md-2
                                    text-end
                                "
                            >

                                <strong>

                                    ₹
                                    ${
                                        item.subtotal
                                        || 0
                                    }

                                </strong>

                            </div>


                            <div
                                class="
                                    col-md-2
                                    text-end
                                "
                            >

                                <button
                                    class="
                                        btn
                                        btn-outline-danger
                                        btn-sm
                                    "
                                    onclick="
                                        removeCartItem(
                                            ${item.id}
                                        )
                                    "
                                >

                                    Remove

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML = `

        <div
            class="row"
        >

            <div
                class="
                    col-lg-8
                "
            >

                ${itemsHtml}

            </div>


            <div
                class="
                    col-lg-4
                "
            >

                <div
                    class="
                        card
                        shadow-sm
                    "
                >

                    <div
                        class="card-body"
                    >

                        <h4>
                            Cart Summary
                        </h4>


                        <hr>


                        <div
                            class="
                                d-flex
                                justify-content-between
                            "
                        >

                            <span>
                                Subtotal
                            </span>


                            <strong>

                                ₹
                                ${
                                    cart.subtotal
                                    || 0
                                }

                            </strong>

                        </div>


                        <hr>


                        <div
                            class="
                                d-flex
                                justify-content-between
                                mb-3
                            "
                        >

                            <strong>
                                Total
                            </strong>


                            <strong>

                                ₹
                                ${
                                    cart.total
                                    || 0
                                }

                            </strong>

                        </div>


                        <button
                            class="
                                btn
                                btn-primary
                                w-100
                            "
                            onclick="
                                goToCheckout()
                            "
                        >

                            Proceed to Checkout

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;

}


async function updateCartItem(
    cartItemId,
    quantity
) {

    if (
        quantity < 1
    ) {

        return;

    }


    try {

        await apiRequest(
            `/cart/items/${cartItemId}/`,
            {
                method: "PATCH",

                body: JSON.stringify(
                    {
                        quantity:
                            quantity,
                    }
                ),
            }
        );


        await loadCart();


    } catch (error) {

        console.error(
            "Update Cart Item Error:",
            error
        );


        showCartMessage(
            getApiErrorMessage(
                error
            ),
            "danger"
        );

    }

}


async function removeCartItem(
    cartItemId
) {

    try {

        await apiRequest(
            `/cart/items/${cartItemId}/`,
            {
                method: "DELETE",
            }
        );


        await loadCart();


    } catch (error) {

        console.error(
            "Remove Cart Item Error:",
            error
        );


        showCartMessage(
            getApiErrorMessage(
                error
            ),
            "danger"
        );

    }

}


function showCartMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "cart-message"
        );


    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;

}


function goToCheckout() {

    window.location.href =
        "/checkout/";

}