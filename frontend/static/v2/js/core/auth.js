/** Authentication: login, register, logout, and navbar state. */

document.addEventListener("DOMContentLoaded", () => {
    initializeAuthForms();
    initializeNavbar();
});

function initializeAuthForms() {
    document.getElementById("login-form")?.addEventListener("submit", handleLogin);
    document.getElementById("register-form")?.addEventListener("submit", handleRegister);
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const button = document.getElementById("login-button");
    const message = document.getElementById("login-message");

    if (!email || !password) {
        showAlert(message, "Please enter email and password.", "danger");
        return;
    }

    button.disabled = true;
    button.textContent = "Logging in...";

    // Clear stale tokens so an invalid JWT is not sent with the login request.
    clearAuthTokens();

    try {
        const data = await apiRequest("/users/login/", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (data.access) localStorage.setItem("access_token", data.access);
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

        showAlert(message, "Login successful. Redirecting...", "success");
        setTimeout(() => { window.location.href = `${APP_BASE}/`; }, 600);
    } catch (error) {
        showAlert(message, getApiErrorMessage(error), "danger");
    } finally {
        button.disabled = false;
        button.textContent = "Login";
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const email = document.getElementById("register-email").value.trim();
    const firstName = document.getElementById("register-first-name").value.trim();
    const lastName = document.getElementById("register-last-name").value.trim();
    const phoneNumber = document.getElementById("register-phone-number").value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const role = document.getElementById("register-role").value;
    const button = document.getElementById("register-button");
    const message = document.getElementById("register-message");

    if (password !== confirmPassword) {
        showAlert(message, "Passwords do not match.", "danger");
        return;
    }
    if (password.length < 8) {
        showAlert(message, "Password must be at least 8 characters.", "danger");
        return;
    }

    button.disabled = true;
    button.textContent = "Creating account...";

    // Clear stale tokens so an invalid JWT is not sent with register/login.
    clearAuthTokens();

    try {
        await apiRequest("/users/register/", {
            method: "POST",
            body: JSON.stringify({
                email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                password,
                password_confirm: confirmPassword,
                role,
            }),
        });

        button.textContent = "Logging in...";
        const loginData = await apiRequest("/users/login/", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (loginData.access) localStorage.setItem("access_token", loginData.access);
        if (loginData.refresh) localStorage.setItem("refresh_token", loginData.refresh);

        showAlert(message, "Registration successful. Redirecting...", "success");
        setTimeout(() => { window.location.href = `${APP_BASE}/`; }, 600);
    } catch (error) {
        showAlert(message, getApiErrorMessage(error), "danger");
    } finally {
        button.disabled = false;
        button.textContent = "Register";
    }
}

function initializeNavbar() {
    const isLoggedIn = Boolean(localStorage.getItem("access_token"));

    document.querySelectorAll(".auth-only").forEach((el) => {
        el.classList.toggle("d-none", !isLoggedIn);
    });
    document.querySelectorAll(".guest-only").forEach((el) => {
        el.classList.toggle("d-none", isLoggedIn);
    });

    document.getElementById("logout-button")?.addEventListener("click", logoutUser);

    if (isLoggedIn) {
        updateCartCount();
    }
}

function clearAuthTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = `${APP_BASE}/login/`;
}

async function updateCartCount() {
    const badge = document.getElementById("cart-count");
    if (!badge || !localStorage.getItem("access_token")) return;

    try {
        const cart = await apiRequest("/cart/");
        const count = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        badge.textContent = count;
        badge.classList.toggle("d-none", count <= 0);
    } catch (error) {
        if (error.status === 401) {
            clearAuthTokens();
            document.querySelectorAll(".auth-only").forEach((el) => el.classList.add("d-none"));
            document.querySelectorAll(".guest-only").forEach((el) => el.classList.remove("d-none"));
        }
        badge.classList.add("d-none");
    }
}
