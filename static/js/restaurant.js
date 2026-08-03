document.addEventListener(
    "DOMContentLoaded",
    loadRestaurantPage
);


async function loadRestaurantPage() {

    try {

        const restaurant =
            await loadRestaurant();


        if (!restaurant) {

            return;

        }


        loadFoodItems(
            restaurant
        );


    } catch (error) {

        console.error(
            "Restaurant Page Error:",
            error
        );

    }

}


async function loadRestaurant() {

    const container =
        document.getElementById(
            "restaurant-info"
        );


    try {

        const restaurant =
            await apiRequest(
                `/restaurants/${RESTAURANT_ID}/`
            );


        container.innerHTML = `

            <div
                class="card shadow-sm"
            >

                <div
                    class="card-body p-4"
                >

                    <h1
                        class="fw-bold"
                    >
                        ${escapeHtml(
                            restaurant.name
                        )}
                    </h1>


                    <p
                        class="text-muted mb-2"
                    >
                        ${
                            escapeHtml(
                                restaurant.description
                                || "No description available."
                            )
                        }
                    </p>


                    <div>

                        <span
                            class="
                                badge
                                text-bg-warning
                            "
                        >

                            ★

                            ${
                                restaurant.average_rating
                                || "No rating"
                            }

                        </span>


                        <span
                            class="
                                text-muted
                                ms-2
                            "
                        >

                            ${
                                restaurant.review_count
                                || 0
                            }

                            reviews

                        </span>

                    </div>

                </div>

            </div>

        `;


        return restaurant;


    } catch (error) {

        container.innerHTML = `

            <div
                class="alert alert-danger"
            >

                Failed to load restaurant.

            </div>

        `;


        console.error(
            "Restaurant API Error:",
            error
        );


        return null;

    }

}


function loadFoodItems(
    restaurant
) {

    const container =
        document.getElementById(
            "food-list"
        );


    if (!container) {

        return;

    }


    /*
     * Food items are expected
     * to come from the existing
     * restaurant detail API.
     */


    const foodItems =
        Array.isArray(
            restaurant.food_items
        )
            ? restaurant.food_items
            : [];


    container.innerHTML = "";


    if (
        foodItems.length === 0
    ) {

        container.innerHTML = `

            <div
                class="col-12"
            >

                <div
                    class="alert alert-info"
                >

                    No food items available.

                </div>

            </div>

        `;

        return;

    }


    foodItems.forEach(
        foodItem => {

            container.innerHTML += `

                <div
                    class="
                        col-md-6
                        col-lg-4
                        mb-4
                    "
                >

                    <div
                        class="
                            card
                            h-100
                            shadow-sm
                        "
                    >

                        <div
                            class="
                                card-body
                                d-flex
                                flex-column
                        >

                            <h5
                                class="card-title"
                            >

                                ${escapeHtml(
                                    foodItem.name
                                )}

                            </h5>


                            <p
                                class="text-muted"
                            >

                                ${
                                    escapeHtml(
                                        foodItem.description
                                        || ""
                                    )
                                }

                            </p>


                            <h5
                                class="mt-auto"
                            >

                                ₹
                                ${foodItem.price}

                            </h5>


                            <button
                                class="
                                    btn
                                    btn-primary
                                    mt-3
                                "
                                onclick="
                                    addToCart(
                                        ${foodItem.id}
                                    )
                                "
                            >

                                Add to Cart

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }
    );

}


async function addToCart(
    foodItemId
) {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    if (!accessToken) {

        window.location.href =
            "/login/";

        return;

    }


    try {

        await apiRequest(
            "/cart/items/",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        food_item:
                            foodItemId,

                        quantity:
                            1,
                    }
                ),
            }
        );


        await updateCartCount();


        alert(
            "Food item added to cart."
        );


    } catch (error) {

        console.error(
            "Add To Cart Error:",
            error
        );


        alert(
            getApiErrorMessage(
                error
            )
        );

    }

}


function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}