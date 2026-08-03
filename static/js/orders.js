document.addEventListener(
    "DOMContentLoaded",
    initializeOrdersPage
);


function initializeOrdersPage() {

    const ordersList =
        document.getElementById(
            "orders-list"
        );


    const orderDetail =
        document.getElementById(
            "order-detail"
        );


    if (ordersList) {

        loadOrders();

    }


    if (orderDetail) {

        loadOrderDetail();

    }

}

async function loadOrders() {

    const container =
        document.getElementById(
            "orders-list"
        );


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
                your orders.

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

        const data =
            await apiRequest(
                "/orders/"
            );


        const orders =
            Array.isArray(data)
                ? data
                : data.results || [];


        renderOrders(
            orders
        );


    } catch (error) {

        container.innerHTML = `

            <div
                class="alert alert-danger"
            >

                Failed to load orders.

            </div>

        `;

        console.error(
            error
        );

    }

}

function renderOrders(
    orders
) {

    const container =
        document.getElementById(
            "orders-list"
        );


    if (
        orders.length === 0
    ) {

        container.innerHTML = `

            <div
                class="text-center
                       py-5"
            >

                <h3>
                    No orders yet.
                </h3>


                <p
                    class="text-muted"
                >
                    Your placed orders
                    will appear here.
                </p>


                <a
                    href="/"
                    class="btn btn-primary"
                >
                    Start Ordering
                </a>

            </div>

        `;

        return;

    }


    let html = "";


    orders.forEach(
        order => {

            html += `

                <div
                    class="card
                           shadow-sm
                           mb-3"
                >

                    <div
                        class="card-body"
                    >

                        <div
                            class="row
                                   align-items-center"
                        >


                            <div
                                class="col-md-3"
                            >

                                <small
                                    class="text-muted"
                                >
                                    Order ID
                                </small>

                                <h5>
                                    #${order.id}
                                </h5>

                            </div>


                            <div
                                class="col-md-3"
                            >

                                <small
                                    class="text-muted"
                                >
                                    Status
                                </small>

                                <p
                                    class="mb-0"
                                >

                                    <span
                                        class="
                                            badge
                                            ${getStatusClass(
                                                order.status
                                            )}
                                        "
                                    >
                                        ${
                                            order.status
                                        }
                                    </span>

                                </p>

                            </div>


                            <div
                                class="col-md-3"
                            >

                                <small
                                    class="text-muted"
                                >
                                    Total
                                </small>

                                <h5>
                                    ₹
                                    ${
                                        order.total
                                        || 0
                                    }
                                </h5>

                            </div>


                            <div
                                class="col-md-3
                                       text-md-end"
                            >

                                <a
                                    href="
                                        /orders/
                                        ${order.id}/
                                    "
                                    class="btn
                                           btn-outline-primary"
                                >
                                    View Details
                                </a>

                            </div>


                        </div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}

function getStatusClass(
    status
) {

    switch (
        status?.toLowerCase()
    ) {

        case "delivered":

            return "text-bg-success";


        case "cancelled":

            return "text-bg-danger";


        case "pending":

            return "text-bg-warning";


        case "confirmed":

            return "text-bg-primary";


        case "preparing":

            return "text-bg-info";


        default:

            return "text-bg-secondary";

    }

}

async function loadOrderDetail() {

    const container =
        document.getElementById(
            "order-detail"
        );


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
                this order.

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

        const order =
            await apiRequest(
                `/orders/${ORDER_ID}/`
            );


        renderOrderDetail(
            order
        );


    } catch (error) {

        container.innerHTML = `

            <div
                class="alert alert-danger"
            >

                Failed to load order.

            </div>

        `;

        console.error(
            error
        );

    }

}

function renderOrderDetail(
    order
) {

    const container =
        document.getElementById(
            "order-detail"
        );


    const items =
        order.items || [];


    let itemsHtml = "";


    items.forEach(
        item => {

            const reviewButton =
                order.status.toLowerCase()
                === "delivered"
                    ? `
                        <button
                            class="
                                btn
                                btn-outline-primary
                                btn-sm
                            "
                            onclick="
                                openReviewForm(
                                    ${item.food_item}
                                )
                            "
                        >
                            Write Review
                        </button>
                    `
                    : "";


            itemsHtml += `

                <div
                    class="
                        d-flex
                        justify-content-between
                        align-items-center
                        border-bottom
                        py-3
                    "
                >

                    <div>

                        <h6
                            class="mb-1"
                        >
                            ${
                                item.food_item_name
                            }
                        </h6>


                        <small
                            class="text-muted"
                        >

                            Quantity:
                            ${
                                item.quantity
                            }

                        </small>

                    </div>


                    <div
                        class="text-end"
                    >

                        <strong
                            class="d-block"
                        >

                            ₹
                            ${
                                item.subtotal
                                || 0
                            }

                        </strong>


                        ${reviewButton}

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML = `

        <div
            class="d-flex
                   justify-content-between
                   align-items-center
                   mb-4"
        >

            <div>

                <h1>
                    Order #${order.id}
                </h1>

                <span
                    class="
                        badge
                        ${getStatusClass(
                            order.status
                        )}
                    "
                >
                    ${
                        order.status
                    }
                </span>

            </div>


            <a
                href="/orders/"
                class="btn
                       btn-outline-secondary"
            >
                Back to Orders
            </a>

        </div>


        <div
            class="row g-4"
        >


            <!-- Order Items -->

            <div
                class="col-lg-8"
            >

                <div
                    class="card
                           shadow-sm"
                >

                    <div
                        class="card-body"
                    >

                        <h4
                            class="mb-3"
                        >
                            Order Items
                        </h4>


                        ${itemsHtml}


                        <div
                            class="
                                d-flex
                                justify-content-between
                                mt-4
                            "
                        >

                            <strong>
                                Total
                            </strong>


                            <strong>
                                ₹
                                ${
                                    order.total
                                    || 0
                                }
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            <!-- Delivery Details -->

            <div
                class="col-lg-4"
            >

                <div
                    class="card
                           shadow-sm"
                >

                    <div
                        class="card-body"
                    >

                        <h4
                            class="mb-3"
                        >
                            Delivery Details
                        </h4>


                        <p
                            class="mb-1"
                        >
                            ${
                                order.address
                                || "Address not available"
                            }
                        </p>


                        <p
                            class="mb-1"
                        >
                            ${
                                order.city
                                || ""
                            }
                        </p>


                        <p>
                            ${
                                order.postal_code
                                || ""
                            }
                        </p>

                    </div>

                </div>

            </div>


        </div>

    `;

}

function openReviewForm(
    foodItemId
) {

    document.getElementById(
        "review-food-item"
    ).value =
        foodItemId;


    document.getElementById(
        "review-rating"
    ).value =
        "";


    document.getElementById(
        "review-comment"
    ).value =
        "";


    const modalElement =
        document.getElementById(
            "reviewModal"
        );


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();

}