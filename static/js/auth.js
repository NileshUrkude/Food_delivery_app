document.addEventListener(
    "DOMContentLoaded",
    initializeAuthForms
);


function initializeAuthForms() {

    const loginForm =
        document.getElementById(
            "login-form"
        );


    const registerForm =
        document.getElementById(
            "register-form"
        );


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }

}

async function handleLogin(
    event
) {

    event.preventDefault();


    const email =
        document.getElementById(
            "login-email"
        ).value.trim();


    const password =
        document.getElementById(
            "login-password"
        ).value;


    const button =
        document.getElementById(
            "login-button"
        );


    const message =
        document.getElementById(
            "login-message"
        );


    if (!email || !password) {

        showMessage(
            message,
            "Please enter email and password.",
            "danger"
        );

        return;

    }


    button.disabled = true;

    button.textContent =
        "Logging in...";


    try {

        const data =
            await apiRequest(
                "/users/login/",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            email: email,
                            password: password,
                        }
                    ),
                }
            );


        /*
         * Store authentication data
         * returned by the existing
         * Users API.
         */

        if (data.access) {

            localStorage.setItem(
                "access_token",
                data.access
            );

        }


        if (data.refresh) {

            localStorage.setItem(
                "refresh_token",
                data.refresh
            );

        }


        showMessage(
            message,
            "Login successful.",
            "success"
        );


        setTimeout(
            () => {

                window.location.href = "/";

            },
            700
        );


    } catch (error) {

        showMessage(
            message,
            getApiErrorMessage(
                error
            ),
            "danger"
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Login";

    }

}


async function handleRegister(
    event
) {

    event.preventDefault();


    const email =
        document.getElementById(
            "register-email"
        ).value.trim();


    const firstName =
        document.getElementById(
            "register-first-name"
        ).value.trim();


    const lastName =
        document.getElementById(
            "register-last-name"
        ).value.trim();


    const phoneNumber =
        document.getElementById(
            "register-phone-number"
        ).value.trim();


    const password =
        document.getElementById(
            "register-password"
        ).value;


    const confirmPassword =
        document.getElementById(
            "register-confirm-password"
        ).value;


    const role =
        document.getElementById(
            "register-role"
        ).value;


    const button =
        document.getElementById(
            "register-button"
        );


    const message =
        document.getElementById(
            "register-message"
        );


    /*
     * Check password confirmation
     */

    if (
        password !==
        confirmPassword
    ) {

        showMessage(
            message,
            "Passwords do not match.",
            "danger"
        );

        return;

    }


    /*
     * Check password length
     */

    if (
        password.length < 8
    ) {

        showMessage(
            message,
            "Password must be at least 8 characters long.",
            "danger"
        );

        return;

    }


    /*
     * Disable button
     */

    button.disabled = true;

    button.textContent =
        "Creating account...";


    try {

        /*
         * STEP 1
         * Register User
         */

        await apiRequest(
            "/users/register/",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        email:
                            email,

                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        phone_number:
                            phoneNumber,

                        password:
                            password,

                        password_confirm:
                            confirmPassword,

                        role:
                            role,
                    }
                ),
            }
        );


        /*
         * STEP 2
         * Automatically Login
         */

        button.textContent =
            "Logging in...";


        const loginData =
            await apiRequest(
                "/users/login/",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            email:
                                email,

                            password:
                                password,
                        }
                    ),
                }
            );


        /*
         * STEP 3
         * Save Access Token
         */

        if (
            loginData.access
        ) {

            localStorage.setItem(
                "access_token",
                loginData.access
            );

        }


        /*
         * STEP 4
         * Save Refresh Token
         */

        if (
            loginData.refresh
        ) {

            localStorage.setItem(
                "refresh_token",
                loginData.refresh
            );

        }


        /*
         * STEP 5
         * Show Success
         */

        showMessage(
            message,
            "Registration successful. Redirecting...",
            "success"
        );


        /*
         * STEP 6
         * Go To Home
         */

        setTimeout(
            () => {

                window.location.href =
                    "/";

            },
            700
        );


    } catch (error) {

        console.error(
            "Registration/Login error:",
            error
        );


        showMessage(
            message,
            getApiErrorMessage(
                error
            ),
            "danger"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "Register";

    }

}

function showMessage(
    element,
    message,
    type
) {

    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;

}

function updateNavbar() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const guestNav =
        document.getElementById(
            "guest-nav"
        );


    const guestRegisterNav =
        document.getElementById(
            "guest-register-nav"
        );


    const userNav =
        document.getElementById(
            "user-nav"
        );


    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (!guestNav || !userNav) {

        return;

    }


    if (accessToken) {

        guestNav.classList.add(
            "d-none"
        );

        if (guestRegisterNav) {

            guestRegisterNav.classList.add(
                "d-none"
            );

        }

        userNav.classList.remove(
            "d-none"
        );


    } else {

        guestNav.classList.remove(
            "d-none"
        );

        if (guestRegisterNav) {

            guestRegisterNav.classList.remove(
                "d-none"
            );

        }

        userNav.classList.add(
            "d-none"
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            handleLogout
        );

    }

}

async function handleLogout() {

    const refreshToken =
        localStorage.getItem(
            "refresh_token"
        );


    try {

        if (refreshToken) {

            await apiRequest(
                "/users/logout/",
                {
                    method: "POST",

                    body: JSON.stringify(
                        {
                            refresh:
                                refreshToken,
                        }
                    ),
                }
            );

        }

    } catch (error) {

        console.error(
            "Logout API error:",
            error
        );

    } finally {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );


        window.location.href =
            "/";

    }

}

document.addEventListener(
    "DOMContentLoaded",
    updateNavbar
);

document.addEventListener(
    "DOMContentLoaded",
    initializeNavbarAuth
);

function initializeNavbarAuth() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const authElements =
        document.querySelectorAll(
            ".auth-only"
        );


    const guestElements =
        document.querySelectorAll(
            ".guest-only"
        );


    if (accessToken) {

        authElements.forEach(
            element => {

                element.classList.remove(
                    "d-none"
                );

            }
        );


        guestElements.forEach(
            element => {

                element.classList.add(
                    "d-none"
                );

            }
        );


        setupLogout();

        updateCartCount();

    }

}

function setupLogout() {

    const button =
        document.getElementById(
            "logout-button"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        logoutUser
    );

}

function logoutUser() {

    localStorage.removeItem(
        "access_token"
    );


    localStorage.removeItem(
        "refresh_token"
    );


    window.location.href =
        "/login/";

}

async function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (!cartCount) {

        return;

    }


    try {

        const cart =
            await apiRequest(
                "/cart/"
            );


        const items =
            cart.items || [];


        const count =
            items.reduce(
                (
                    total,
                    item
                ) => {

                    return total +
                        Number(
                            item.quantity
                            || 0
                        );

                },
                0
            );


        if (count > 0) {

            cartCount.textContent =
                count;

            cartCount.classList.remove(
                "d-none"
            );

        } else {

            cartCount.classList.add(
                "d-none"
            );

        }


    } catch (error) {

        console.error(
            "Cart count error:",
            error
        );

    }

}
