export default class HttpClientBase {
    #baseUrl;
    #defaultHeaders;

    constructor(baseUrl = "http://localhost/trainify/api") {
        this.#baseUrl = baseUrl;
        this.#defaultHeaders = {
            "Content-Type": "application/json"
        };
    }

    setAuthToken(token) {
        this.#defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    clearAuthToken() {
        delete this.#defaultHeaders["Authorization"];
    }

    toFormData(data = {}) {
        if (data instanceof FormData) {
            return data;
        }

        if (typeof HTMLFormElement !== "undefined" && data instanceof HTMLFormElement) {
            return new FormData(data);
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
        return formData;
    }

    toUrlSearchParams(data = {}) {
        if (data instanceof URLSearchParams) {
            return data;
        }

        if (typeof HTMLFormElement !== "undefined" && data instanceof HTMLFormElement) {
            return new URLSearchParams(new FormData(data));
        }

        if (data instanceof FormData) {
            return new URLSearchParams(data);
        }

        return new URLSearchParams(Object.entries(data));
    }

    #buildUrl(endpoint, params = {}) {
        let url = `${this.#baseUrl}${endpoint}`;

        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (url.includes(`/:${key}`)) {
                url = url.replace(`:${key}`, value);
            } else {
                queryParams.append(key, value);
            }
        }

        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return url;
    }

    async #fetchWithConfig(endpoint, config = {}, params = {}) {
        const { _isFormData, ...fetchConfig } = config;

        try {
            const url = this.#buildUrl(endpoint, params);

            const headers = {
                ...this.#defaultHeaders,
                ...fetchConfig.headers
            };

            if (_isFormData) {
                delete headers["Content-Type"];
            }

            const response = await fetch(url, {
                ...fetchConfig,
                headers
            });

            const contentType = response.headers.get("content-type");
            let data = null;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (typeof data === "object" && data?.message)
                    ? data.message
                    : `Erro HTTP: ${response.status}`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`Erro na requisição para ${endpoint}:`, error);
            throw error;
        }
    }

    async get(endpoint, params = {}, headers = {}) {
        return this.#fetchWithConfig(endpoint, { method: "GET", headers }, params);
    }

    async post(endpoint, body = {}, params = {}, headers = {}) {
        const isFormData = body instanceof FormData;
        const config = {
            method: "POST",
            headers,
            body: isFormData ? body : JSON.stringify(body),
            _isFormData: isFormData
        };
        return this.#fetchWithConfig(endpoint, config, params);
    }

    async put(endpoint, body = {}, params = {}, headers = {}) {
        const isFormData = body instanceof FormData;
        const config = {
            method: "PUT",
            headers,
            body: isFormData ? body : JSON.stringify(body),
            _isFormData: isFormData
        };
        return this.#fetchWithConfig(endpoint, config, params);
    }

    async delete(endpoint, params = {}, headers = {}) {
        return this.#fetchWithConfig(endpoint, { method: "DELETE", headers }, params);
    }
    async postForm(endpoint, body = {}, params = {}, headers = {}) {
    const formData = this.toFormData(body);
    return this.post(endpoint, formData, params, headers);
}

    async putForm(endpoint, body = {}, params = {}, headers = {}) {
    const formData = this.toFormData(body);
    return this.put(endpoint, formData, params, headers);
}
}