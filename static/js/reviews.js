document.addEventListener(
    "DOMContentLoaded",
    loadRestaurantReviews
);


async function loadRestaurantReviews() {

    const container =
        document.getElementById(
            "review-list"
        );


    if (!container) {

        return;

    }


    try {

        /*
         * Get restaurant details.
         *
         * We use the existing restaurant
         * detail API instead of calling
         * the non-existing:
         *
         * /restaurants/<id>/food-items/
         */

        const restaurant =
            await apiRequest(
                `/restaurants/${RESTAURANT_ID}/`
            );


        const foodItems =
            Array.isArray(
                restaurant.food_items
            )
                ? restaurant.food_items
                : [];


        container.innerHTML = "";


        let hasReviews = false;


        for (
            const foodItem
            of foodItems
        ) {

            const reviews =
                await loadFoodItemReviews(
                    foodItem.id
                );


            if (
                reviews.length === 0
            ) {

                continue;

            }


            hasReviews = true;


            reviews.forEach(
                review => {

                    container.innerHTML +=
                        createReviewCard(
                            foodItem,
                            review
                        );

                }
            );

        }


        if (!hasReviews) {

            container.innerHTML = `

                <div
                    class="
                        alert
                        alert-info
                    "
                >

                    No reviews yet.

                </div>

            `;

        }


    } catch (error) {

        console.error(
            "Restaurant Reviews Error:",
            error
        );


        container.innerHTML = `

            <div
                class="
                    alert
                    alert-danger
                "
            >

                Failed to load reviews.

            </div>

        `;

    }

}


async function loadFoodItemReviews(
    foodItemId
) {

    try {

        const data =
            await apiRequest(
                `/reviews/food/${foodItemId}/`
            );


        return Array.isArray(data)
            ? data
            : data.results || [];


    } catch (error) {

        console.error(
            `Failed to load reviews for food item ${foodItemId}`,
            error
        );


        return [];

    }

}


function createReviewCard(
    foodItem,
    review
) {

    const rating =
        "★".repeat(
            Number(
                review.rating
            )
        )
        +
        "☆".repeat(
            5 -
            Number(
                review.rating
            )
        );


    return `

        <div
            class="
                card
                shadow-sm
                mb-3
            "
        >

            <div
                class="card-body"
            >

                <div
                    class="
                        d-flex
                        justify-content-between
                    "
                >

                    <h5
                        class="mb-1"
                    >

                        ${escapeHtml(
                            foodItem.name
                        )}

                    </h5>


                    <span
                        class="
                            text-warning
                        "
                    >

                        ${rating}

                    </span>

                </div>


                <p
                    class="mb-1"
                >

                    ${
                        escapeHtml(
                            review.comment
                            || "No comment."
                        )
                    }

                </p>


                <small
                    class="text-muted"
                >

                    By ${
                        escapeHtml(
                            review.user_name
                            || "Customer"
                        )
                    }

                </small>

            </div>

        </div>

    `;

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const reviewForm =
            document.getElementById(
                "review-form"
            );


        if (reviewForm) {

            reviewForm.addEventListener(
                "submit",
                submitReview
            );

        }

    }
);


async function submitReview(
    event
) {

    event.preventDefault();


    const foodItemElement =
        document.getElementById(
            "review-food-item"
        );


    const ratingElement =
        document.getElementById(
            "review-rating"
        );


    const commentElement =
        document.getElementById(
            "review-comment"
        );


    const button =
        document.getElementById(
            "submit-review-button"
        );


    if (
        !foodItemElement ||
        !ratingElement ||
        !commentElement
    ) {

        return;

    }


    const foodItemId =
        foodItemElement.value;


    const rating =
        ratingElement.value;


    const comment =
        commentElement.value.trim();


    if (
        !foodItemId ||
        !rating ||
        !comment
    ) {

        showReviewMessage(
            "Please fill in all review fields.",
            "danger"
        );

        return;

    }


    button.disabled = true;

    button.textContent =
        "Submitting...";


    try {

        await apiRequest(
            "/reviews/",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        food_item:
                            Number(
                                foodItemId
                            ),

                        rating:
                            Number(
                                rating
                            ),

                        comment:
                            comment,
                    }
                ),
            }
        );


        showReviewMessage(
            "Review submitted successfully.",
            "success"
        );


        setTimeout(
            () => {

                window.location.reload();

            },
            800
        );


    } catch (error) {

        console.error(
            "Submit Review Error:",
            error
        );


        showReviewMessage(
            getApiErrorMessage(
                error
            ),
            "danger"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "Submit Review";

    }

}


function showReviewMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "review-message"
        );


    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;

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