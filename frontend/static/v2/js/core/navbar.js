/** Navbar: active link highlight and mobile menu toggle fix. */

document.addEventListener("DOMContentLoaded", () => {
    highlightActiveNav();
    initMobileNav();
});

function highlightActiveNav() {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const links = document.querySelectorAll(".nav-menu-link");

    links.forEach((link) => {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
        const nav = link.dataset.nav;
        if (!nav) return;

        if (matchNavItem(nav, path)) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function matchNavItem(nav, path) {
    if (nav === "home") return path === "" || path === "/";
    if (nav === "restaurants") {
        return path.startsWith("/restaurants") ||
            ((path === "" || path === "/") && window.location.hash === "#restaurants");
    }
    if (nav === "cart") return path === "/cart" || path === "/checkout";
    if (nav === "orders") return path === "/orders" || path.startsWith("/orders/");
    if (nav === "profile") return path === "/profile";
    if (nav === "login") return path === "/login";
    if (nav === "register") return path === "/register";
    return false;
}

function initMobileNav() {
    const toggler = document.querySelector(".navbar-toggler");
    const collapse = document.getElementById("mainNavbar");
    if (!toggler || !collapse) return;

    // Close mobile menu after clicking a link
    collapse.querySelectorAll("a.nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth < 992 && collapse.classList.contains("show")) {
                bootstrap.Collapse.getOrCreateInstance(collapse).hide();
            }
        });
    });

    // Ensure menu is visible on desktop resize
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 992) {
            collapse.classList.add("show");
        }
    });
}
