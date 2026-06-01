const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:8082/api" 
    : `http://${window.location.hostname}:8082/api`;

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error HTTP ${response.status}`);
    }

    return response.json();
}

const Api = {
    mesas: {
        listar: () => apiRequest("/mesas"),
        crear: (mesa) => apiRequest("/mesas", {
            method: "POST",
            body: JSON.stringify(mesa)
        })
    },

    reservas: {
        listar: (fecha) => {
            const query = fecha ? `?fecha=${fecha}` : "";
            return apiRequest(`/reservas${query}`);
        },
        crear: (reserva) => apiRequest("/reservas", {
            method: "POST",
            body: JSON.stringify(reserva)
        }),
        cambiarEstado: (id, estado) => apiRequest(`/reservas/${id}/estado`, {
            method: "PATCH",
            body: JSON.stringify({ estado })
        })
    },

    empleados: {
        listar: () => apiRequest("/empleados"),
        crear: (empleado) => apiRequest("/empleados", {
            method: "POST",
            body: JSON.stringify(empleado)
        })
    },

    stock: {
        listar: () => apiRequest("/stock"),
        listarPorCategorias: () => apiRequest("/stock/categorias"),
        crear: (producto) => apiRequest("/stock", {
            method: "POST",
            body: JSON.stringify(producto)
        })
    },

    turnos: {
        listar: () => apiRequest("/turnos")
    }
};