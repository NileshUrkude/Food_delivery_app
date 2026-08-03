document.addEventListener(
    "DOMContentLoaded",
    loadRestaurants
);


async function loadRestaurants() {

    const container =
        document.getElementById(
            "restaurant-list"
        );


    if (!container) {

        console.error(
            "Restaurant container not found."
        );

        return;

    }


    try {

        // Show loading state

        container.innerHTML = `
            <div class="col-12 text-center py-5">

                <div
                    class="spinner-border text-primary"
                    role="status"
                ></div>

                <p class="mt-3">
                    Loading restaurants...
                </p>

            </div>
        `;


        const data =
            await apiRequest(
                "/restaurants/"
            );


        /*
         * DRF pagination:
         *
         * {
         *     count: 4,
         *     next: null,
         *     previous: null,
         *     results: [...]
         * }
         *
         * Non-paginated API:
         *
         * [...]
         */


        const restaurants =
            Array.isArray(data)
                ? data
                : data.results || [];


        renderRestaurants(
            restaurants
        );


    } catch (error) {

        console.error(
            "Restaurant API Error:",
            error
        );


        console.error(
            "Status:",
            error.status
        );


        console.error(
            "Data:",
            error.data
        );


        container.innerHTML = `
            <div class="col-12">

                <div
                    class="alert alert-danger"
                    role="alert"
                >

                    ${getApiErrorMessage(error)}

                </div>

            </div>
        `;

    }

}


function renderRestaurants(
    restaurants
) {

    const container =
        document.getElementById(
            "restaurant-list"
        );


    if (!container) {

        return;

    }


    if (
        !restaurants.length
    ) {

        container.innerHTML = `
            <div class="col-12">

                <div
                    class="
                        text-center
                        py-5
                    "
                >

                    <h5>
                        No restaurants found.
                    </h5>

                    <p
                        class="text-muted"
                    >
                        Please check again later.
                    </p>

                </div>

            </div>
        `;

        return;

    }


    container.innerHTML =
        restaurants
            .map(
                restaurant =>
                    createRestaurantCard(
                        restaurant
                    )
            )
            .join("");

}


function createRestaurantCard(
    restaurant
) {

    return `
        <div
            class="
                col-12
                col-sm-6
                col-lg-4
                col-xl-3
                mb-4
            "
        >

            <div
                class="
                    card
                    h-100
                    restaurant-card
                "
            >

                <div
                    class="
                        card-body
                        d-flex
                        flex-column
                    "
                >

                    <h5
                        class="card-title"
                    >
                        ${escapeHtml(
                            restaurant.name
                            || "Restaurant"
                        )}
                    </h5>


                    <p
                        class="
                            card-text
                            text-muted
                        "
                    >

                        ${escapeHtml(
                            restaurant.description
                            || "Delicious food awaits you."
                        )}

                    </p>


                    <a
                        href="/restaurants/${restaurant.id}/"
                        class="
                            btn
                            btn-primary
                            mt-auto
                        "
                    >
                        View Restaurant
                    </a>

                </div>

            </div>

        </div>
    `;

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