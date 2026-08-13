/** Lightweight toast notification system (replaces alert dialogs). */

function ensureToastContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container position-fixed top-0 end-0 p-3";
        container.style.zIndex = "1090";
        document.body.appendChild(container);
    }
    return container;
}

function showToast(message, type = "info", duration = 3500) {
    const container = ensureToastContainer();
    const id = `toast-${Date.now()}`;

    const bgClass = {
        success: "text-bg-success",
        danger: "text-bg-danger",
        warning: "text-bg-warning",
        info: "text-bg-primary",
    }[type] ?? "text-bg-secondary";

    container.insertAdjacentHTML(
        "beforeend",
        `
        <div id="${id}" class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(message)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
        `
    );

    const toastEl = document.getElementById(id);
    const toast = new bootstrap.Toast(toastEl, { delay: duration });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}
