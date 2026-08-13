/** Checkout: order summary, coupon validation, and order placement. */

let currentCart = null;
let appliedCoupon = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!requireAuth()) return;
    initializeCheckout();
});

async function initializeCheckout() {
    await loadCheckoutSummary();

    document.getElementById("checkout-form")?.addEventListener("submit", handlePlaceOrder);
    document.getElementById("apply-coupon-button")?.addEventListener("click", applyCoupon);
    document.getElementById("remove-coupon-button")?.addEventListener("click", removeCoupon);
}

async function loadCheckoutSummary() {
    const container = document.getElementById("checkout-summary");
    container.innerHTML = loadingHtml("Loading cart...");

    try {
        currentCart = await apiRequest("/cart/");
        const items = currentCart.items || [];

        if (!items.length) {
            container.innerHTML = `
                <div class="alert alert-info mb-0">
                    Your cart is empty.
                    <a href="${APP_BASE}/" class="alert-link">Browse restaurants</a>
                </div>
            `;
            document.getElementById("place-order-button")?.setAttribute("disabled", "true");
            return;
        }

        renderCheckoutSummary();
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">${escapeHtml(getApiErrorMessage(error))}</div>`;
    }
}

function getCartSubtotal() {
    if (!currentCart?.items) return 0;
    return currentCart.items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
}

function renderCheckoutSummary() {
    const container = document.getElementById("checkout-summary");
    if (!currentCart) return;

    const items = currentCart.items || [];
    const subtotal = getCartSubtotal();
    const discount = Number(appliedCoupon?.discount || 0);
    const finalTotal = Math.max(subtotal - discount, 0);

    container.innerHTML = `
        ${items.map((item) => `
            <div class="d-flex justify-content-between mb-3">
                <div>
                    <strong>${escapeHtml(item.food_name || item.food_item_name || "Item")}</strong>
                    <div class="text-muted small">Qty: ${item.quantity}</div>
                </div>
                <strong>${formatCurrency(item.subtotal)}</strong>
            </div>
        `).join("")}
        <hr>
        <div class="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <strong>${formatCurrency(subtotal)}</strong>
        </div>
        <div class="d-flex justify-content-between mb-2 ${discount > 0 ? "" : "d-none"}" id="discount-row">
            <span>Discount</span>
            <strong class="text-success">−${formatCurrency(discount)}</strong>
        </div>
        <hr>
        <div class="d-flex justify-content-between">
            <strong>Total</strong>
            <strong class="text-primary fs-5">${formatCurrency(finalTotal)}</strong>
        </div>
    `;
}

async function handlePlaceOrder(event) {
    event.preventDefault();

    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const postalCode = document.getElementById("postal-code").value.trim();
    const button = document.getElementById("place-order-button");

    if (!address || !city || !postalCode) {
        showCheckoutMessage("Please fill in all delivery details.", "danger");
        return;
    }

    button.disabled = true;
    button.textContent = "Placing Order...";

    try {
        const payload = appliedCoupon?.code
            ? { coupon_code: appliedCoupon.code }
            : {};

        const order = await apiRequest("/orders/", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        showCheckoutMessage("Order placed successfully!", "success");
        showToast("Order placed successfully!", "success");

        setTimeout(() => {
            window.location.href = `${APP_BASE}/orders/${order.id}/`;
        }, 800);
    } catch (error) {
        showCheckoutMessage(getApiErrorMessage(error), "danger");
        button.disabled = false;
        button.textContent = "Place Order";
    }
}

async function applyCoupon() {
    const input = document.getElementById("coupon-code");
    const button = document.getElementById("apply-coupon-button");
    const code = input.value.trim();

    if (!code) {
        showCouponMessage("Please enter a coupon code.", "danger");
        return;
    }

    button.disabled = true;
    button.textContent = "Applying...";

    try {
        const subtotal = getCartSubtotal();
        const response = await apiRequest("/coupons/validate/", {
            method: "POST",
            body: JSON.stringify({ code, order_amount: subtotal }),
        });

        appliedCoupon = {
            code: response.coupon || code,
            discount: Number(response.discount || 0),
        };

        renderCheckoutSummary();
        showCouponMessage("Coupon applied successfully.", "success");
        input.disabled = true;
        document.getElementById("remove-coupon-button")?.classList.remove("d-none");
        button.textContent = "Applied";
    } catch (error) {
        appliedCoupon = null;
        renderCheckoutSummary();
        showCouponMessage(getApiErrorMessage(error), "danger");
        button.disabled = false;
        button.textContent = "Apply";
    }
}

function removeCoupon() {
    appliedCoupon = null;

    const input = document.getElementById("coupon-code");
    const applyButton = document.getElementById("apply-coupon-button");
    const removeButton = document.getElementById("remove-coupon-button");

    input.value = "";
    input.disabled = false;
    applyButton.disabled = false;
    applyButton.textContent = "Apply";
    removeButton?.classList.add("d-none");

    renderCheckoutSummary();
    showCouponMessage("Coupon removed.", "success");
}

function showCheckoutMessage(message, type) {
    showAlert(document.getElementById("checkout-message"), message, type);
}

function showCouponMessage(message, type) {
    const el = document.getElementById("coupon-message");
    if (!el) return;
    el.className = `small mt-2 text-${type === "success" ? "success" : "danger"}`;
    el.textContent = message;
}
