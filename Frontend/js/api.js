const CRM_API_BASE_URL = "http://localhost:8082/api";

function crmEscapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
        switch (char) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&#39;";
            default:
                return char;
        }
    });
}

function crmTodayValue() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}

function crmToDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

function crmToTimeInput(value) {
    if (!value) return "";
    return String(value).slice(0, 5);
}

function crmFormatDate(value) {
    if (!value) return "-";
    const [year, month, day] = String(value).slice(0, 10).split("-");
    if (!year || !month || !day) {
        return String(value);
    }
    return `${day}/${month}/${year}`;
}

function crmFormatTime(value) {
    if (!value) return "-";
    return String(value).slice(0, 5);
}

function crmExtractErrorMessage(payload, fallback) {
    if (!payload) {
        return fallback;
    }
    if (typeof payload === "string") {
        return payload;
    }
    if (payload.message) {
        return payload.message;
    }
    if (payload.error?.message) {
        return payload.error.message;
    }
    return fallback;
}

async function crmRequest(path, options = {}) {
    const response = await fetch(`${CRM_API_BASE_URL}${path}`, {
        method: options.method || "GET",
        headers: {
            Accept: "application/json",
            ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });

    if (response.status === 204) {
        if (!response.ok) {
            throw new Error(response.statusText || "Error inesperado");
        }
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(crmExtractErrorMessage(payload, response.statusText || "Error inesperado"));
    }

    return payload;
}

window.crmApi = {
    request: crmRequest,
    get: (path) => crmRequest(path),
    post: (path, body) => crmRequest(path, { method: "POST", body }),
    put: (path, body) => crmRequest(path, { method: "PUT", body }),
    patch: (path, body) => crmRequest(path, { method: "PATCH", body }),
    del: (path) => crmRequest(path, { method: "DELETE" }),
    baseUrl: CRM_API_BASE_URL
};

window.crmUtils = {
    escapeHtml: crmEscapeHtml,
    todayValue: crmTodayValue,
    toDateInput: crmToDateInput,
    toTimeInput: crmToTimeInput,
    formatDate: crmFormatDate,
    formatTime: crmFormatTime
};