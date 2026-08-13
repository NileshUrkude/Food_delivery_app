/** Home page: restaurant discovery with location, search, and filters. */

document.addEventListener("DOMContentLoaded", () => {
    loadRestaurants();

    document.getElementById("restaurant-search")?.addEventListener(
        "input",
        debounce(() => loadRestaurants(), 350)
    );

    document.addEventListener("locationChanged", () => {
        updateRestaurantsHeading();
        loadRestaurants();
    });

    updateRestaurantsHeading();
});

function updateRestaurantsHeading() {
    const heading = document.getElementById("restaurants-heading");
    const subheading = document.getElementById("restaurants-subheading");
    const location = getSelectedLocation();

    if (!heading) return;

    if (location) {
        heading.textContent = `Restaurants in ${location.city}`;
        if (subheading) {
            subheading.textContent = `Showing delivery options in ${location.city}, ${location.state}`;
        }
    } else {
        heading.textContent = "Restaurants";
        if (subheading) {
            subheading.textContent = "Select your location to see nearby restaurants";
        }
    }
}

async function loadRestaurants() {
    const container = document.getElementById("restaurant-list");
    if (!container) return;

    const location = getSelectedLocation();

    if (!location) {
        container.innerHTML = `
            <div class="col-12">
                ${emptyStateHtml(
                    "Select your delivery location",
                    "Choose your state and city to see restaurants available in your area.",
                    `<button type="button" class="btn btn-primary" data-location-trigger>Select Location</button>`
                )}
            </div>
        `;
        document.querySelectorAll("[data-location-trigger]").forEach((btn) => {
            btn.addEventListener("click", () => {
                bootstrap.Modal.getOrCreateInstance(
                    document.getElementById("locationModal")
                ).show();
            });
        });
        return;
    }

    container.innerHTML = `<div class="col-12">${loadingHtml("Loading restaurants...")}</div>`;

    const search = document.getElementById("restaurant-search")?.value.trim() ?? "";
    const params = new URLSearchParams();
    params.set("city", location.city);
    params.set("state", location.state);
    if (search) params.set("search", search);

    try {
        const data = await apiRequest(`/restaurants/?${params.toString()}`);
        const restaurants = normalizeList(data);
        renderRestaurants(restaurants, location);
    } catch (error) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">${escapeHtml(getApiErrorMessage(error))}</div>
            </div>
        `;
    }
}

function renderRestaurants(restaurants, location) {
    const container = document.getElementById("restaurant-list");
    if (!container) return;

    if (!restaurants.length) {
        container.innerHTML = `
            <div class="col-12">
                ${emptyStateHtml(
                    `No restaurants in ${location.city}`,
                    "Try selecting a different city or check back later.",
                    `<button type="button" class="btn btn-outline-primary" data-location-trigger>Change Location</button>`
                )}
            </div>
        `;
        document.querySelectorAll("[data-location-trigger]").forEach((btn) => {
            btn.addEventListener("click", () => {
                bootstrap.Modal.getOrCreateInstance(
                    document.getElementById("locationModal")
                ).show();
            });
        });
        return;
    }

    const fragment = document.createDocumentFragment();

    restaurants.forEach((restaurant) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-lg-4 col-xl-3";
        col.innerHTML = createRestaurantCard(restaurant);
        fragment.appendChild(col);
    });

    container.innerHTML = "";
    container.appendChild(fragment);
}

function createRestaurantCard(restaurant) {
    const location = [restaurant.city, restaurant.state].filter(Boolean).join(", ");
    const imageHtml = restaurant.image
        ? `<img src="${escapeHtml(restaurant.image)}" class="card-img-top restaurant-card-img" alt="${escapeHtml(restaurant.name)}" loading="lazy">`
        : `<div class="restaurant-card-img restaurant-card-placeholder d-flex align-items-center justify-content-center">
               <span class="text-muted">🍽️</span>
           </div>`;

    return `
        <article class="card h-100 restaurant-card shadow-sm border-0">
            ${imageHtml}
            <div class="card-body d-flex flex-column">
                <h3 class="card-title h5 mb-2">${escapeHtml(restaurant.name || "Restaurant")}</h3>
                <p class="card-text text-muted small flex-grow-1">${escapeHtml(restaurant.description || "Delicious food awaits you.")}</p>
                ${location ? `<p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> ${escapeHtml(location)}</p>` : ""}
                <a href="${APP_BASE}/restaurants/${restaurant.id}/" class="btn btn-primary mt-auto">View Menu</a>
            </div>
        </article>
    `;
}
