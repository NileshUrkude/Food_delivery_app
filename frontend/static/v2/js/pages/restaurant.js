/** Restaurant detail: menu with veg/non-veg sections, add-to-cart, and reviews. */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof RESTAURANT_ID === "undefined") return;
    loadRestaurantPage();
    setupCartDelegation();
});

async function loadRestaurantPage() {
    const infoContainer = document.getElementById("restaurant-info");
    const menuContainer = document.getElementById("food-list");

    infoContainer.innerHTML = loadingHtml("Loading restaurant...");
    menuContainer.innerHTML = loadingHtml("Loading menu...");

    try {
        const [restaurant, foodData] = await Promise.all([
            apiRequest(`/restaurants/${RESTAURANT_ID}/`),
            apiRequest(`/menu/restaurants/${RESTAURANT_ID}/food-items/`),
        ]);

        renderRestaurantInfo(restaurant);
        const foodItems = normalizeList(foodData);
        renderFoodItems(foodItems);
        loadRestaurantReviews(foodItems);
    } catch (error) {
        infoContainer.innerHTML = `<div class="alert alert-danger">${escapeHtml(getApiErrorMessage(error))}</div>`;
        menuContainer.innerHTML = "";
    }
}

function renderRestaurantInfo(restaurant) {
    const container = document.getElementById("restaurant-info");
    const location = [restaurant.address, restaurant.city, restaurant.state].filter(Boolean).join(", ");

    container.innerHTML = `
        <div class="card shadow-sm border-0 restaurant-hero">
            <div class="card-body p-4 p-md-5">
                <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div>
                        <h1 class="display-6 fw-bold mb-2">${escapeHtml(restaurant.name)}</h1>
                        <p class="text-muted mb-2">${escapeHtml(restaurant.description || "No description available.")}</p>
                        ${location ? `<p class="text-muted small mb-0">${escapeHtml(location)}</p>` : ""}
                    </div>
                    ${restaurant.opening_time ? `
                        <span class="badge text-bg-light border">
                            ${escapeHtml(restaurant.opening_time)} – ${escapeHtml(restaurant.closing_time || "")}
                        </span>
                    ` : ""}
                </div>
            </div>
        </div>
    `;
}

function renderFoodItems(foodItems) {
    const container = document.getElementById("food-list");
    if (!container) return;

    const available = foodItems.filter((item) => item.is_available !== false);

    if (!available.length) {
        container.innerHTML = `<div class="alert alert-info mb-0">No food items available right now.</div>`;
        return;
    }

    const vegItems = available.filter((item) => item.food_type === "veg");
    const nonVegItems = available.filter(
        (item) => item.food_type === "non_veg" || item.food_type === "non-veg"
    );

    let html = "";

    if (vegItems.length) {
        html += renderMenuSection("veg", "Vegetarian", vegItems);
    }

    if (nonVegItems.length) {
        html += renderMenuSection("non-veg", "Non-Vegetarian", nonVegItems);
    }

    if (!html) {
        html = `<div class="row g-4">${available.map((item) => `
            <div class="col-md-6 col-lg-4">${createFoodCard(item)}</div>
        `).join("")}</div>`;
    }

    container.innerHTML = html;
}

function renderMenuSection(type, title, items) {
    const sectionClass = type === "veg" ? "menu-section-veg" : "menu-section-nonveg";
    const icon = type === "veg" ? "🟢" : "🔴";

    return `
        <section class="menu-section ${sectionClass} mb-5">
            <div class="menu-section-header d-flex align-items-center gap-2 mb-4">
                <span class="menu-type-icon" aria-hidden="true">${icon}</span>
                <h3 class="h5 mb-0">${escapeHtml(title)}</h3>
                <span class="badge rounded-pill ${type === "veg" ? "veg-badge" : "non-veg-badge"}">${items.length} items</span>
            </div>
            <div class="row g-4">
                ${items.map((item) => `
                    <div class="col-md-6 col-lg-4">${createFoodCard(item)}</div>
                `).join("")}
            </div>
        </section>
    `;
}

function createFoodCard(item) {
    const isVeg = item.food_type === "veg";
    const typeBadge = isVeg
        ? `<span class="badge veg-badge"><span class="veg-dot"></span> Veg</span>`
        : `<span class="badge non-veg-badge"><span class="nonveg-dot"></span> Non-Veg</span>`;

    return `
        <article class="card h-100 food-card shadow-sm border-0 ${isVeg ? "food-card-veg" : "food-card-nonveg"}">
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <h4 class="card-title h6 mb-0">${escapeHtml(item.name)}</h4>
                    ${typeBadge}
                </div>
                ${item.category_name ? `<p class="text-muted small mb-1">${escapeHtml(item.category_name)}</p>` : ""}
                <p class="text-muted small flex-grow-1">${escapeHtml(item.description || "")}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <strong class="text-primary">${formatCurrency(item.price)}</strong>
                    <button type="button" class="btn btn-primary btn-sm add-to-cart-btn" data-food-id="${item.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </article>
    `;
}

function setupCartDelegation() {
    document.getElementById("food-list")?.addEventListener("click", async (event) => {
        const btn = event.target.closest(".add-to-cart-btn");
        if (!btn) return;

        if (!localStorage.getItem("access_token")) {
            window.location.href = `${APP_BASE}/login/`;
            return;
        }

        const foodId = btn.dataset.foodId;
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = "Adding...";

        try {
            await apiRequest("/cart/items/", {
                method: "POST",
                body: JSON.stringify({ food_item: Number(foodId), quantity: 1 }),
            });
            await updateCartCount();
            showToast("Added to cart!", "success");
        } catch (error) {
            showToast(getApiErrorMessage(error), "danger");
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

async function loadRestaurantReviews(foodItems) {
    const container = document.getElementById("review-list");
    if (!container) return;

    container.innerHTML = loadingHtml("Loading reviews...");

    if (!foodItems.length) {
        container.innerHTML = `<div class="alert alert-info mb-0">No reviews yet.</div>`;
        return;
    }

    try {
        const reviewGroups = await Promise.all(
            foodItems.map(async (item) => {
                const data = await apiRequest(`/reviews/food/${item.id}/`);
                return { item, reviews: normalizeList(data) };
            })
        );

        const cards = reviewGroups.flatMap(({ item, reviews }) =>
            reviews.map((review) => createReviewCard(item, review))
        );

        container.innerHTML = cards.length
            ? cards.join("")
            : `<div class="alert alert-info mb-0">No reviews yet. Be the first to review!</div>`;
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">${escapeHtml(getApiErrorMessage(error))}</div>`;
    }
}

function createReviewCard(foodItem, review) {
    const rating = Number(review.rating) || 0;
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    return `
        <article class="review-card card shadow-sm border-0 mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h4 class="h6 mb-0">${escapeHtml(foodItem.name)}</h4>
                    <span class="text-warning" aria-label="${rating} out of 5 stars">${stars}</span>
                </div>
                <p class="mb-2">${escapeHtml(review.comment || "No comment.")}</p>
                <small class="text-muted">By ${escapeHtml(review.user_name || "Customer")}</small>
            </div>
        </article>
    `;
}
