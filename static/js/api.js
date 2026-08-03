
const API_BASE_URL = "/api";


async function apiRequest(
    endpoint,
    options = {}
) {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {}),

    };


    /*
     * Add JWT Access Token
     * if user is authenticated.
     */

    if (accessToken) {

        headers[
            "Authorization"
        ] =
            `Bearer ${accessToken}`;

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers: headers,
            }
        );


    /*
     * Safely read response.
     */

    const contentType =
        response.headers.get(
            "content-type"
        );


    let data = {};


    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    }


    /*
     * Handle API errors.
     */

    if (!response.ok) {

        const error =
            new Error(
                "API request failed."
            );


        error.status =
            response.status;


        error.data =
            data;


        throw error;

    }


    return data;

}


function getApiErrorMessage(
    error
) {

    const data =
        error?.data;


    if (!data) {

        return (
            "Something went wrong. "
            + "Please try again."
        );

    }


    if (
        typeof data ===
        "string"
    ) {

        return data;

    }


    if (data.detail) {

        return data.detail;

    }


    const messages = [];


    Object.entries(
        data
    ).forEach(
        ([field, value]) => {

            if (
                Array.isArray(
                    value
                )
            ) {

                messages.push(
                    `${field}: ${value.join(", ")}`
                );

            } else if (
                typeof value ===
                "object"
            ) {

                messages.push(
                    `${field}: ${JSON.stringify(value)}`
                );

            } else {

                messages.push(
                    `${field}: ${value}`
                );

            }

        }
    );


    if (
        messages.length
    ) {

        return messages.join(
            " "
        );

    }


    return (
        "Something went wrong. "
        + "Please try again."
    );

}

