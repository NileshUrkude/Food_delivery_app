/**
 * API client with JWT auth, automatic token refresh, and unified error handling.
 */

let refreshPromise = null;

/** Endpoints that must never send a stored JWT (public auth routes). */
const AUTH_PUBLIC_ENDPOINTS = [
    "/users/register/",
    "/users/login/",
    "/users/token/refresh/",
];

/** Public read-only API routes (AllowAny on backend). */
const PUBLIC_GET_PATTERNS = [
    /^\/restaurants\/?$/,
    /^\/restaurants\/locations\/?$/,
    /^\/restaurants\/\d+\/?$/,
    /^\/menu\/restaurants\/\d+\/food-items\/?$/,
    /^\/reviews\/food\/\d+\/?$/,
];

function isAuthPublicEndpoint(endpoint) {
    const path = endpoint.split("?")[0];
    return AUTH_PUBLIC_ENDPOINTS.some((prefix) => path.startsWith(prefix));
}

function isPublicReadEndpoint(endpoint, method) {
    const path = endpoint.split("?")[0];
    const verb = (method || "GET").toUpperCase();
    if (verb !== "GET") return false;
    return PUBLIC_GET_PATTERNS.some((pattern) => pattern.test(path));
}

function shouldSkipAuth(endpoint, options) {
    if (options.skipAuth) return true;
    if (isAuthPublicEndpoint(endpoint)) return true;
    if (isPublicReadEndpoint(endpoint, options.method)) return true;
    return false;
}

function clearAuthTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    const response = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
        clearAuthTokens();
        return null;
    }

    const data = await response.json();
    if (data.access) {
        localStorage.setItem("access_token", data.access);
    }
    return data.access;
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json();
    }
    return {};
}

async function apiRequest(endpoint, options = {}, retry = true) {
    const skipAuth = shouldSkipAuth(endpoint, options);
    const accessToken = skipAuth ? null : localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (
        response.status === 401 &&
        retry &&
        !skipAuth &&
        localStorage.getItem("refresh_token")
    ) {
        if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
                refreshPromise = null;
            });
        }
        const newToken = await refreshPromise;
        if (newToken) {
            return apiRequest(endpoint, options, false);
        }
        clearAuthTokens();
    }

    const data = await parseResponse(response);

    if (!response.ok) {
        if (response.status === 401 && !skipAuth) {
            clearAuthTokens();
        }
        const error = new Error("API request failed.");
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

function getApiErrorMessage(error) {
    const data = error?.data;
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    const messages = [];
    Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
            messages.push(`${field}: ${value.join(", ")}`);
        } else if (typeof value === "object") {
            messages.push(`${field}: ${JSON.stringify(value)}`);
        } else {
            messages.push(`${field}: ${value}`);
        }
    });

    return messages.length ? messages.join(" ") : "Something went wrong. Please try again.";
}
