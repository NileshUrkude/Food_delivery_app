document.addEventListener(
    "DOMContentLoaded",
    initializeProfile
);


async function initializeProfile() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    if (!accessToken) {

        window.location.href =
            "/login/";

        return;

    }


    await loadProfile();


    const form =
        document.getElementById(
            "profile-form"
        );


    if (form) {

        form.addEventListener(
            "submit",
            updateProfile
        );

    }

}

async function loadProfile() {

    try {

        const user =
            await apiRequest(
                "/users/profile/"
            );


        document.getElementById(
            "username"
        ).value =
            user.username || "";


        document.getElementById(
            "email"
        ).value =
            user.email || "";


        document.getElementById(
            "first-name"
        ).value =
            user.first_name || "";


        document.getElementById(
            "last-name"
        ).value =
            user.last_name || "";


    } catch (error) {

        showProfileMessage(
            getApiErrorMessage(
                error
            ),
            "danger"
        );

        console.error(
            error
        );

    }

}

async function updateProfile(
    event
) {

    event.preventDefault();


    const button =
        document.getElementById(
            "update-profile-button"
        );


    const firstName =
        document.getElementById(
            "first-name"
        ).value.trim();


    const lastName =
        document.getElementById(
            "last-name"
        ).value.trim();


    button.disabled = true;

    button.textContent =
        "Updating...";


    try {

        await apiRequest(
            "/users/profile/",
            {
                method: "PATCH",

                body: JSON.stringify(
                    {
                        first_name:
                            firstName,

                        last_name:
                            lastName,
                    }
                ),
            }
        );


        showProfileMessage(
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        showProfileMessage(
            getApiErrorMessage(
                error
            ),
            "danger"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "Update Profile";

    }

}

function showProfileMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "profile-message"
        );


    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;

}
