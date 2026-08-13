/** User profile: view and update account information. */

document.addEventListener("DOMContentLoaded", () => {
    if (!requireAuth()) return;
    initializeProfile();
});

async function initializeProfile() {
    await loadProfile();
    document.getElementById("profile-form")?.addEventListener("submit", updateProfile);
}

async function loadProfile() {
    try {
        const user = await apiRequest("/users/profile/");

        document.getElementById("username").value = user.username || "";
        document.getElementById("email").value = user.email || "";
        document.getElementById("first-name").value = user.first_name || "";
        document.getElementById("last-name").value = user.last_name || "";
        document.getElementById("phone-number").value = user.phone_number || "";
    } catch (error) {
        showProfileMessage(getApiErrorMessage(error), "danger");
    }
}

async function updateProfile(event) {
    event.preventDefault();

    const button = document.getElementById("update-profile-button");
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();

    button.disabled = true;
    button.textContent = "Updating...";

    try {
        await apiRequest("/users/profile/", {
            method: "PATCH",
            body: JSON.stringify({ first_name: firstName, last_name: lastName }),
        });

        showProfileMessage("Profile updated successfully.", "success");
        showToast("Profile updated!", "success");
    } catch (error) {
        showProfileMessage(getApiErrorMessage(error), "danger");
    } finally {
        button.disabled = false;
        button.textContent = "Update Profile";
    }
}

function showProfileMessage(message, type) {
    showAlert(document.getElementById("profile-message"), message, type);
}
