let currentCart = null;

let appliedCoupon = null;


document.addEventListener(
    "DOMContentLoaded",
    initializeCheckout
);


async function initializeCheckout() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    if (!accessToken) {

        window.location.href =
            "/login/";

        return;

    }


    await loadCheckoutSummary();


    const form =
        document.getElementById(
            "checkout-form"
        );


    if (form) {

        form.addEventListener(
            "submit",
            handlePlaceOrder
        );

    }


    const couponButton =
        document.getElementById(
            "apply-coupon-button"
        );


    if (couponButton) {

        couponButton.addEventListener(
            "click",
            applyCoupon
        );

    }

    const removeCouponButton =
        document.getElementById(
            "remove-coupon-button"
        );


    if (removeCouponButton) {

        removeCouponButton.addEventListener(
            "click",
            removeCoupon
        );

}
}

async function loadCheckoutSummary() {

    const container =
        document.getElementById(
            "checkout-summary"
        );


    try {

        const cart =
            await apiRequest(
                "/cart/"
            );


        currentCart = cart;


        const items =
            cart.items || [];


        if (
            items.length === 0
        ) {

            container.innerHTML = `

                <div
                    class="alert alert-info"
                >

                    Your cart is empty.

                    <a
                        href="/"
                        class="alert-link"
                    >
                        Browse restaurants
                    </a>

                </div>

            `;


            const button =
                document.getElementById(
                    "place-order-button"
                );


            if (button) {

                button.disabled = true;

            }


            return;

        }


        renderCheckoutSummary();

    } catch (error) {

        container.innerHTML = `

            <div
                class="alert alert-danger"
            >

                Failed to load
                checkout summary.

            </div>

        `;

        console.error(
            error
        );

    }

}

async function handlePlaceOrder(
    event
) {

    event.preventDefault();


    const address =
        document.getElementById(
            "address"
        ).value.trim();


    const city =
        document.getElementById(
            "city"
        ).value.trim();


    const postalCode =
        document.getElementById(
            "postal-code"
        ).value.trim();


    const button =
        document.getElementById(
            "place-order-button"
        );


    if (
        !address ||
        !city ||
        !postalCode
    ) {

        showCheckoutMessage(
            "Please fill in all delivery details.",
            "danger"
        );

        return;

    }


    button.disabled = true;

    button.textContent =
        "Placing Order...";


    try {

        const order =
            await apiRequest(
                "/orders/",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            address:
                                address,

                            city:
                                city,

                            postal_code:
                                postalCode,

                            coupon:
                                appliedCoupon
                                    ? appliedCoupon.coupon_id
                                    : null,
                        }
                    ),
                }
            );


        showCheckoutMessage(
            "Order placed successfully.",
            "success"
        );


        setTimeout(
            () => {

                window.location.href =
                    `/orders/${order.id}/`;

            },
            800
        );


    } catch (error) {

        showCheckoutMessage(
            getApiErrorMessage(
                error
            ),
            "danger"
        );


        button.disabled = false;

        button.textContent =
            "Place Order";

    }

}

function showCheckoutMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "checkout-message"
        );


    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;

}

function renderCheckoutSummary() {

    const container =
        document.getElementById(
            "checkout-summary"
        );


    if (!currentCart) {

        return;

    }


    const items =
        currentCart.items || [];


    let itemsHtml = "";


    items.forEach(
        item => {

            itemsHtml += `

                <div
                    class="d-flex
                           justify-content-between
                           mb-3"
                >

                    <div>

                        <strong>
                            ${
                                item.food_item_name
                            }
                        </strong>

                        <div
                            class="text-muted"
                        >

                            Qty:
                            ${
                                item.quantity
                            }

                        </div>

                    </div>


                    <strong>

                        ₹
                        ${
                            item.subtotal
                        }

                    </strong>

                </div>

            `;

        }
    );


    const subtotal =
        Number(
            currentCart.subtotal || 0
        );


    const discount =
        Number(
            appliedCoupon?.discount || 0
        );


    const finalTotal =
        Math.max(
            subtotal - discount,
            0
        );


    container.innerHTML = `

        ${itemsHtml}

        <hr>


        <div
            class="d-flex
                   justify-content-between
                   mb-2"
        >

            <span>
                Subtotal
            </span>

            <strong>
                ₹${subtotal}
            </strong>

        </div>


        <div
            class="d-flex
                   justify-content-between
                   mb-2
                   ${
                       discount > 0
                           ? ""
                           : "d-none"
                   }"
        >

            <span>
                Discount
            </span>

            <strong
                class="text-success"
            >
                -₹${discount}
            </strong>

        </div>


        <hr>


        <div
            class="d-flex
                   justify-content-between"
        >

            <strong>
                Total
            </strong>

            <strong>
                ₹${finalTotal}
            </strong>

        </div>

    `;

}

async function applyCoupon() {

    const input =
        document.getElementById(
            "coupon-code"
        );


    const button =
        document.getElementById(
            "apply-coupon-button"
        );


    const code =
        input.value.trim();


    if (!code) {

        showCouponMessage(
            "Please enter a coupon code.",
            "danger"
        );

        return;

    }


    button.disabled = true;

    button.textContent =
        "Applying...";


    try {

        const response =
            await apiRequest(
                "/coupons/validate/",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            code:
                                code,

                            cart_total:
                                currentCart.subtotal,
                        }
                    ),
                }
            );


        appliedCoupon = {

            code:
                code,

            discount:
                Number(
                    response.discount
                    || 0
                ),

            coupon_id:
                response.coupon_id
                || response.id,

        };


        renderCheckoutSummary();


        showCouponMessage(
            "Coupon applied successfully.",
            "success"
        );


        input.disabled = true;
        
        document
            .getElementById(
                "remove-coupon-button"
            )
            .classList.remove(
                "d-none"
            );

        button.textContent =
            "Applied";


    } catch (error) {

        appliedCoupon = null;


        renderCheckoutSummary();


        showCouponMessage(
            getApiErrorMessage(
                error
            ),
            "danger"
        );


        button.disabled = false;

        button.textContent =
            "Apply";

    }

}

function showCouponMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "coupon-message"
        );


    if (!element) {

        return;

    }


    element.className =
        `text-${type === "success"
            ? "success"
            : "danger"
        }`;


    element.textContent =
        message;

}

function removeCoupon() {

    appliedCoupon = null;


    const input =
        document.getElementById(
            "coupon-code"
        );


    const applyButton =
        document.getElementById(
            "apply-coupon-button"
        );


    const removeButton =
        document.getElementById(
            "remove-coupon-button"
        );


    input.value = "";

    input.disabled = false;


    applyButton.disabled = false;

    applyButton.textContent =
        "Apply";


    removeButton.classList.add(
        "d-none"
    );


    renderCheckoutSummary();


    showCouponMessage(
        "Coupon removed.",
        "success"
    );

}

localStorage.removeItem(
    "cart"
);

await updateCartCount();

window.location.href =
    `/orders/${order.id}/`;