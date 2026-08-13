/** Shopping cart: view, update quantities, and proceed to checkout. */

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    setupCartActions();
});

async function loadCart() {
    const container = document.getElementById("cart-container");
    if (!container) return;

    if (!localStorage.getItem("access_token")) {
        container.innerHTML = `
            <div class="alert alert-info">
                Please <a href="${APP_BASE}/login/" class="alert-link">login</a> to view your cart.
            </div>
        `;
        return;
    }

    container.innerHTML = loadingHtml("Loading cart...");

    try {
        const cart = await apiRequest("/cart/");
        renderCart(cart);
        await updateCartCount();
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">${escapeHtml(getApiErrorMessage(error))}</div>`;
    }
}

function renderCart(cart) {
    const container = document.getElementById("cart-container");
    const items = cart.items || [];

    if (!items.length) {
        container.innerHTML = emptyStateHtml(
            "Your cart is empty",
            "Add some delicious food to continue.",
            `<a href="${APP_BASE}/" class="btn btn-primary">Browse Restaurants</a>`
        );
        return;
    }

    const totalAmount = cart.total_amount ?? 0;

    container.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-8">
                <div id="cart-items-list">
                    ${items.map((item) => createCartItemRow(item)).join("")}
                </div>
            </div>
            <div class="col-lg-4">
                <aside class="card shadow-sm border-0 sticky-top cart-summary-card">
                    <div class="card-body">
                        <h2 class="h5 mb-3">Cart Summary</h2>
                        <hr>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Items</span>
                            <span>${cart.total_items ?? items.length}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <strong>Total</strong>
                            <strong class="text-primary">${formatCurrency(totalAmount)}</strong>
                        </div>
                        <a href="${APP_BASE}/checkout/" class="btn btn-primary w-100">Proceed to Checkout</a>
                    </div>
                </aside>
            </div>
        </div>
    `;
}

function createCartItemRow(item) {
    const name = item.food_name || item.food_item_name || "Food Item";
    const qty = Number(item.quantity) || 1;

    return `
        <article class="card shadow-sm border-0 mb-3 cart-item-card" data-item-id="${item.id}">
            <div class="card-body">
                <div class="row align-items-center g-3">
                    <div class="col-md-5">
                        <h3 class="h6 mb-1">${escapeHtml(name)}</h3>
                        <p class="text-muted small mb-0">${formatCurrency(item.price)} each</p>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group input-group-sm qty-control">
                            <button type="button" class="btn btn-outline-secondary qty-decrease" aria-label="Decrease quantity" ${qty <= 1 ? "disabled" : ""}>−</button>
                            <span class="form-control text-center qty-display">${qty}</span>
                            <button type="button" class="btn btn-outline-secondary qty-increase" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                    <div class="col-md-2 text-md-end">
                        <strong>${formatCurrency(item.subtotal)}</strong>
                    </div>
                    <div class="col-md-2 text-md-end">
                        <button type="button" class="btn btn-outline-danger btn-sm remove-item-btn">Remove</button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function setupCartActions() {
    document.getElementById("cart-container")?.addEventListener("click", async (event) => {
        const card = event.target.closest(".cart-item-card");
        if (!card) return;

        const itemId = card.dataset.itemId;
        const qtyDisplay = card.querySelector(".qty-display");
        let qty = Number(qtyDisplay.textContent);

        if (event.target.closest(".qty-decrease")) {
            if (qty <= 1) return;
            await updateCartItem(itemId, qty - 1);
        } else if (event.target.closest(".qty-increase")) {
            await updateCartItem(itemId, qty + 1);
        } else if (event.target.closest(".remove-item-btn")) {
            await removeCartItem(itemId);
        }
    });
}

async function updateCartItem(cartItemId, quantity) {
    if (quantity < 1) return;

    try {
        await apiRequest(`/cart/items/${cartItemId}/`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
        });
        await loadCart();
    } catch (error) {
        showCartMessage(getApiErrorMessage(error), "danger");
    }
}

async function removeCartItem(cartItemId) {
    try {
        await apiRequest(`/cart/items/${cartItemId}/delete/`, { method: "DELETE" });
        showToast("Item removed from cart.", "info");
        await loadCart();
    } catch (error) {
        showCartMessage(getApiErrorMessage(error), "danger");
    }
}

function showCartMessage(message, type) {
    showAlert(document.getElementById("cart-message"), message, type);
}
