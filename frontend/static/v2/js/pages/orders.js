/** Orders: list history and view order details with review support. */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("orders-list")) loadOrders();
    if (document.getElementById("order-detail-content")) loadOrderDetail();
    setupReviewForm();
});

async function loadOrders() {
    const container = document.getElementById("orders-list");
    if (!container) return;

    if (!localStorage.getItem("access_token")) {
        container.innerHTML = `
            <div class="alert alert-info">
                Please <a href="${APP_BASE}/login/" class="alert-link">login</a> to view your orders.
            </div>
        `;
        return;
    }

    container.innerHTML = loadingHtml("Loading orders...");

    try {
        const data = await apiRequest("/orders/history/");
        renderOrders(normalizeList(data));
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">${escapeHtml(getApiErrorMessage(error))}</div>`;
    }
}

function renderOrders(orders) {
    const container = document.getElementById("orders-list");

    if (!orders.length) {
        container.innerHTML = emptyStateHtml(
            "No orders yet",
            "Your placed orders will appear here.",
            `<a href="${APP_BASE}/" class="btn btn-primary">Start Ordering</a>`
        );
        return;
    }

    container.innerHTML = orders.map((order) => `
        <article class="card shadow-sm border-0 mb-3 order-card">
            <div class="card-body">
                <div class="row align-items-center g-3">
                    <div class="col-md-3">
                        <small class="text-muted d-block">Order ID</small>
                        <strong class="h5 mb-0">#${order.id}</strong>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted d-block">Status</small>
                        <span class="badge ${getStatusBadgeClass(order.status)}">${escapeHtml(formatStatus(order.status))}</span>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted d-block">Total</small>
                        <strong>${formatCurrency(order.total_amount ?? order.total ?? 0)}</strong>
                    </div>
                    <div class="col-md-3 text-md-end">
                        <a href="${APP_BASE}/orders/${order.id}/" class="btn btn-outline-primary btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        </article>
    `).join("");
}

async function loadOrderDetail() {
    const container = document.getElementById("order-detail-content");
    if (!container || typeof ORDER_ID === "undefined") return;

    if (!localStorage.getItem("access_token")) {
        container.innerHTML = `
            <div class="alert alert-info">
                Please <a href="${APP_BASE}/login/" class="alert-link">login</a> to view this order.
            </div>
        `;
        return;
    }

    container.innerHTML = loadingHtml("Loading order...");

    try {
        const order = await apiRequest(`/orders/${ORDER_ID}/`);
        renderOrderDetail(order);
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger">${escapeHtml(getApiErrorMessage(error))}</div>`;
    }
}

function renderOrderDetail(order) {
    const container = document.getElementById("order-detail-content");
    const items = order.items || [];
    const canCancel = ["pending", "confirmed"].includes(order.status?.toLowerCase());
    const isDelivered = order.status?.toLowerCase() === "delivered";

    container.innerHTML = `
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
                <h1 class="h3 mb-2">Order #${order.id}</h1>
                <span class="badge ${getStatusBadgeClass(order.status)}">${escapeHtml(formatStatus(order.status))}</span>
            </div>
            <div class="d-flex gap-2">
                ${canCancel ? `<button type="button" id="cancel-order-btn" class="btn btn-outline-danger btn-sm">Cancel Order</button>` : ""}
                <a href="${APP_BASE}/orders/" class="btn btn-outline-secondary btn-sm">Back to Orders</a>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <h2 class="h5 mb-3">Order Items</h2>
                        ${items.map((item) => `
                            <div class="d-flex justify-content-between align-items-center border-bottom py-3 order-item-row">
                                <div>
                                    <h3 class="h6 mb-1">${escapeHtml(item.food_name || item.food_item_name || "Item")}</h3>
                                    <small class="text-muted">Qty: ${item.quantity}</small>
                                </div>
                                <div class="text-end">
                                    <strong class="d-block mb-1">${formatCurrency(item.subtotal)}</strong>
                                    ${isDelivered ? `
                                        <button type="button" class="btn btn-outline-primary btn-sm review-btn" data-food-id="${item.food_item}">
                                            Write Review
                                        </button>
                                    ` : ""}
                                </div>
                            </div>
                        `).join("")}
                        <div class="d-flex justify-content-between mt-4 pt-2">
                            <strong>Total</strong>
                            <strong class="text-primary">${formatCurrency(order.total_amount ?? order.total ?? 0)}</strong>
                        </div>
                        ${order.discount_amount > 0 ? `
                            <div class="d-flex justify-content-between mt-2 text-success small">
                                <span>Discount applied</span>
                                <span>−${formatCurrency(order.discount_amount)}</span>
                            </div>
                        ` : ""}
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <h2 class="h5 mb-3">Order Info</h2>
                        <p class="text-muted small mb-1">Placed on</p>
                        <p class="mb-3">${order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</p>
                        ${order.coupon_code ? `<p class="mb-0"><span class="text-muted small">Coupon:</span> <strong>${escapeHtml(order.coupon_code)}</strong></p>` : ""}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("cancel-order-btn")?.addEventListener("click", () => cancelOrder(order.id));
    container.querySelectorAll(".review-btn").forEach((btn) => {
        btn.addEventListener("click", () => openReviewModal(btn.dataset.foodId));
    });
}

async function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
        await apiRequest(`/orders/${orderId}/cancel/`, { method: "POST" });
        showToast("Order cancelled.", "success");
        loadOrderDetail();
    } catch (error) {
        showToast(getApiErrorMessage(error), "danger");
    }
}

function openReviewModal(foodItemId) {
    document.getElementById("review-food-item").value = foodItemId;
    document.getElementById("review-rating").value = "";
    document.getElementById("review-comment").value = "";
    hideAlert(document.getElementById("review-message"));

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("reviewModal"));
    modal.show();
}

function setupReviewForm() {
    document.getElementById("review-form")?.addEventListener("submit", submitReview);
}

async function submitReview(event) {
    event.preventDefault();

    const foodItemId = document.getElementById("review-food-item").value;
    const rating = document.getElementById("review-rating").value;
    const comment = document.getElementById("review-comment").value.trim();
    const button = document.getElementById("submit-review-button");
    const message = document.getElementById("review-message");

    if (!foodItemId || !rating || !comment) {
        showAlert(message, "Please fill in all review fields.", "danger");
        return;
    }

    button.disabled = true;
    button.textContent = "Submitting...";

    try {
        await apiRequest("/reviews/", {
            method: "POST",
            body: JSON.stringify({
                food_item: Number(foodItemId),
                rating: Number(rating),
                comment,
            }),
        });

        showAlert(message, "Review submitted successfully!", "success");
        showToast("Review submitted!", "success");

        setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById("reviewModal"))?.hide();
            loadOrderDetail();
        }, 800);
    } catch (error) {
        showAlert(message, getApiErrorMessage(error), "danger");
    } finally {
        button.disabled = false;
        button.textContent = "Submit Review";
    }
}
