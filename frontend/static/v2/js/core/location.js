/** Location selection — state/city picker with localStorage persistence. */

const LOCATION_STORAGE_KEY = "selected_location";

let locationsCache = null;

function getSelectedLocation() {
    try {
        const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data?.state && data?.city) return data;
        return null;
    } catch {
        return null;
    }
}

function setSelectedLocation(state, city) {
    const location = { state, city };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    updateLocationDisplay();
    document.dispatchEvent(new CustomEvent("locationChanged", { detail: location }));
    return location;
}

function clearSelectedLocation() {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    updateLocationDisplay();
    document.dispatchEvent(new CustomEvent("locationChanged", { detail: null }));
}

function getLocationLabel(location = getSelectedLocation()) {
    if (!location) return "Select location";
    return `${location.city}, ${location.state}`;
}

function updateLocationDisplay() {
    const label = getLocationLabel();
    document.querySelectorAll("[data-location-label]").forEach((el) => {
        el.textContent = label;
    });
}

async function fetchLocations() {
    if (locationsCache) return locationsCache;
    const data = await apiRequest("/restaurants/locations/");
    locationsCache = data.locations || [];
    return locationsCache;
}

function populateStateSelect(selectEl, locations) {
    selectEl.innerHTML = '<option value="">Select state</option>';
    locations.forEach(({ state }) => {
        const opt = document.createElement("option");
        opt.value = state;
        opt.textContent = state;
        selectEl.appendChild(opt);
    });
}

function populateCitySelect(selectEl, locations, state) {
    selectEl.innerHTML = '<option value="">Select city</option>';
    if (!state) {
        selectEl.disabled = true;
        return;
    }

    const entry = locations.find((loc) => loc.state === state);
    const cities = entry?.cities || [];
    cities.forEach((city) => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        selectEl.appendChild(opt);
    });
    selectEl.disabled = cities.length === 0;
}

async function initLocationPicker(options = {}) {
    const {
        stateSelectId = "location-state",
        citySelectId = "location-city",
        applyButtonId = "location-apply-btn",
        autoOpenIfEmpty = false,
    } = options;

    const stateSelect = document.getElementById(stateSelectId);
    const citySelect = document.getElementById(citySelectId);
    const applyBtn = document.getElementById(applyButtonId);

    if (!stateSelect || !citySelect) return;

    updateLocationDisplay();

    const locations = await fetchLocations();
    populateStateSelect(stateSelect, locations);

    const saved = getSelectedLocation();
    if (saved) {
        stateSelect.value = saved.state;
        populateCitySelect(citySelect, locations, saved.state);
        citySelect.value = saved.city;
    } else {
        populateCitySelect(citySelect, locations, "");
    }

    stateSelect.addEventListener("change", () => {
        populateCitySelect(citySelect, locations, stateSelect.value);
    });

    applyBtn?.addEventListener("click", () => {
        const state = stateSelect.value;
        const city = citySelect.value;

        if (!state || !city) {
            showToast("Please select both state and city.", "warning");
            return;
        }

        setSelectedLocation(state, city);
        showToast(`Location set to ${city}, ${state}`, "success");

        const modalEl = document.getElementById("locationModal");
        if (modalEl) {
            bootstrap.Modal.getInstance(modalEl)?.hide();
        }

        if (window.location.pathname === "/" || window.location.pathname === "") {
            if (typeof loadRestaurants === "function") {
                loadRestaurants();
            }
        } else {
            window.location.href = `${APP_BASE}/#restaurants`;
        }
    });

    document.querySelectorAll("[data-location-trigger]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const modal = bootstrap.Modal.getOrCreateInstance(
                document.getElementById("locationModal")
            );
            modal.show();
        });
    });

    if (autoOpenIfEmpty && !saved && locations.length) {
        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById("locationModal")
        );
        modal.show();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const isHome = window.location.pathname === "/" || window.location.pathname === "";
    initLocationPicker({ autoOpenIfEmpty: isHome });
});
