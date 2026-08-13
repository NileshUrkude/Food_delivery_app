/** Escape HTML to prevent XSS when rendering user/API content. */
function escapeHtml(value) {
    if (value == null) return "";
    const div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
}

/** Format a number as Indian Rupee currency. */
function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return `₹${num.toFixed(2)}`;
}

/** Normalize DRF paginated or plain array responses. */
function normalizeList(data) {
    if (Array.isArray(data)) return data;
    return data?.results ?? [];
}

/** Show or hide an alert element with Bootstrap classes. */
function showAlert(element, message, type = "info") {
    if (!element) return;
    element.className = `alert alert-${type}`;
    element.textContent = message;
    element.classList.remove("d-none");
}

/** Hide an alert element. */
function hideAlert(element) {
    if (!element) return;
    element.classList.add("d-none");
}

/** Build a loading spinner markup string. */
function loadingHtml(message = "Loading...") {
    return `
        <div class="loading-container d-flex flex-column align-items-center justify-content-center py-5">
            <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
            <p class="mt-3 text-muted mb-0">${escapeHtml(message)}</p>
        </div>
    `;
}

/** Build an empty-state markup string. */
function emptyStateHtml(title, description, actionHtml = "") {
    return `
        <div class="empty-state">
            <h3 class="h5 mb-2">${escapeHtml(title)}</h3>
            <p class="text-muted mb-4">${escapeHtml(description)}</p>
            ${actionHtml}
        </div>
    `;
}

/** Require authentication; redirect to login if missing. */
function requireAuth() {
    const token = localStorage.getItem("access_token");
    if (!token) {
        window.location.href = `${APP_BASE}/login/`;
        return false;
    }
    return true;
}

/** Debounce a function call. */
function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/** Map order status to Bootstrap badge class. */
function getStatusBadgeClass(status) {
    const map = {
        delivered: "text-bg-success",
        cancelled: "text-bg-danger",
        pending: "text-bg-warning",
        confirmed: "text-bg-primary",
        preparing: "text-bg-info",
        out_for_delivery: "text-bg-info",
    };
    return map[status?.toLowerCase()] ?? "text-bg-secondary";
}

/** Human-readable order status label. */
function formatStatus(status) {
    if (!status) return "Unknown";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
