/**
 * ==========================================================================
 * CRM RESTAURANTE: CLIENTE API REST
 * ==========================================================================
 * Módulo de comunicación con el backend Spring Boot en puerto 8082
 */

const API_BASE = 'http://localhost:8082/api';

/**
 * Realiza una solicitud GET a la API
 * @param {string} endpoint - Ruta del endpoint (sin la base URL)
 * @returns {Promise<any>}
 */
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en GET ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Realiza una solicitud POST a la API
 * @param {string} endpoint - Ruta del endpoint (sin la base URL)
 * @param {object} data - Datos a enviar
 * @returns {Promise<any>}
 */
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en POST ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Realiza una solicitud PATCH a la API
 * @param {string} endpoint - Ruta del endpoint (sin la base URL)
 * @param {object} data - Datos a enviar
 * @returns {Promise<any>}
 */
async function apiPatch(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en PATCH ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Obtiene la lista de mesas del backend
 * @returns {Promise<Array>}
 */
async function obtenerMesas() {
    return apiGet('/mesas');
}

/**
 * Obtiene la lista de reservas con filtros opcionales
 * @param {string} fecha - (opcional) Filtrar por fecha (YYYY-MM-DD)
 * @param {number} turnoId - (opcional) Filtrar por turno
 * @returns {Promise<Array>}
 */
async function obtenerReservas(fecha = null, turnoId = null) {
    let endpoint = '/reservas';
    const params = [];
    if (fecha) params.push(`fecha=${fecha}`);
    if (turnoId) params.push(`turnoId=${turnoId}`);
    if (params.length > 0) {
        endpoint += '?' + params.join('&');
    }
    return apiGet(endpoint);
}

/**
 * Crea una nueva reserva en el backend
 * @param {object} datosReserva - Datos de la reserva
 * @returns {Promise<object>}
 */
async function crearReserva(datosReserva) {
    return apiPost('/reservas', datosReserva);
}

/**
 * Cambia el estado de una reserva
 * @param {number} reservaId - ID de la reserva
 * @param {string} nuevoEstado - Nuevo estado (PENDIENTE, CONFIRMADA, SENTADO, FINALIZADA, CANCELADA)
 * @returns {Promise<object>}
 */
async function actualizarEstadoReservaApi(reservaId, nuevoEstado) {
    return apiPatch(`/reservas/${reservaId}/estado`, { estado: nuevoEstado });
}

/**
 * Obtiene la lista de turnos
 * @returns {Promise<Array>}
 */
async function obtenerTurnos() {
    return apiGet('/turnos');
}

/**
 * Obtiene la lista de empleados
 * @returns {Promise<Array>}
 */
async function obtenerEmpleados() {
    return apiGet('/empleados');
}

/**
 * Obtiene el inventario de stock
 * @returns {Promise<Array>}
 */
async function obtenerStock() {
    return apiGet('/stock');
}

/**
 * Obtiene el stock agrupado por categorías
 * @returns {Promise<object>}
 */
async function obtenerStockPorCategorias() {
    return apiGet('/stock/categorias');
}