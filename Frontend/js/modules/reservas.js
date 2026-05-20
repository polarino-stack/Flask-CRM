/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO DE GESTIÓN DE RESERVAS (ESTADO CENTRALIZADO)
 * ==========================================================================
 */

// 1. MAQUETA CONFIGURATIVA DE MESAS DEL RESTAURANTE
const mapaMesasConfig = [
    { id: "M1", zona: "INTERIOR", paxMax: 2 },
    { id: "M2", zona: "INTERIOR", paxMax: 2 },
    { id: "M3", zona: "INTERIOR", paxMax: 4 },
    { id: "M4", zona: "INTERIOR", paxMax: 4 },
    { id: "M5", zona: "INTERIOR", paxMax: 6 },
    { id: "M6", zona: "INTERIOR", paxMax: 6 },
    { id: "M7", zona: "INTERIOR", paxMax: 8 },
    { id: "M8", zona: "INTERIOR", paxMax: 4 },
    { id: "T1", zona: "TERRAZA", paxMax: 2 },
    { id: "T2", zona: "TERRAZA", paxMax: 2 },
    { id: "T3", zona: "TERRAZA", paxMax: 4 },
    { id: "T4", zona: "TERRAZA", paxMax: 4 },
    { id: "T5", zona: "TERRAZA", paxMax: 4 },
    { id: "T6", zona: "TERRAZA", paxMax: 6 },
    { id: "T7", zona: "TERRAZA", paxMax: 6 },
    { id: "T8", zona: "TERRAZA", paxMax: 8 }
];

// 2. ESTADO INICIAL DE RESERVAS DE PRUEBA
const reservasIniciales = [
    { id: "1", nombre: "Mesa Marta", telefono: "612345678", pax: 2, hora: "13:30", fecha: "2026-05-19", mesaId: "M3", notas: "Ninguna", estado: "CONFIRMADA", responsable: "Julio Admin" },
    { id: "2", nombre: "Familia López", telefono: "698765432", pax: 5, hora: "14:15", fecha: "2026-05-19", mesaId: "T6", notas: "⚠️ Trona, 1 Intolerante a lactosa", estado: "PENDIENTE", responsable: "Julio Admin" }
];

let libroReservas = JSON.parse(localStorage.getItem("crm_reservas")) || reservasIniciales;

// Elementos DOM
const tableBody = document.getElementById("reservas-table-body");
const formReserva = document.getElementById("form-reserva");
const selectMesaForm = document.getElementById("res-mesa");
const inputFechaFiltro = document.getElementById("filter-date");
const inputStatusFiltro = document.getElementById("filter-status");
const inputBuscador = document.getElementById("search-booking");

// Elementos del control de formulario
const inputId = document.getElementById("res-id");
const inputNombre = document.getElementById("res-nombre");
const inputTelefono = document.getElementById("res-telefono");
const inputPax = document.getElementById("res-pax");
const inputHora = document.getElementById("res-hora");
const inputFecha = document.getElementById("res-date");
const inputNotas = document.getElementById("res-notas");
const btnCancelEdit = document.getElementById("btn-cancel-edit");

document.addEventListener("DOMContentLoaded", () => {
    // Fijar la fecha de hoy por defecto en el filtro e input
    const hoy = new Date().toISOString().split('T')[0];
    inputFechaFiltro.value = hoy;
    inputFecha.value = hoy;

    // Inicializar componentes
    poblarDesplegableMesas();
    initReservasModule();

    // Listeners
    formReserva.addEventListener("submit", guardarReserva);
    inputFechaFiltro.addEventListener("change", initReservasModule);
    inputStatusFiltro.addEventListener("change", initReservasModule);
    inputBuscador.addEventListener("input", initReservasModule);
    btnCancelEdit.addEventListener("click", abortarEdicion);
});

function initReservasModule() {
    localStorage.setItem("crm_reservas", JSON.stringify(libroReservas));

    const filtradas = filtrarLibroReservas();
    renderizarTablaReservas(filtradas);
    dibujarMapaMesasInteractivas(filtradas);
    calcularMetricasKpi();
}

function poblarDesplegableMesas() {
    selectMesaForm.innerHTML = '<option value="">Selecciona mesa...</option>';
    mapaMesasConfig.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.innerText = `${m.id} (${m.zona.toLowerCase()} - Máx ${m.paxMax} pax)`;
        selectMesaForm.appendChild(opt);
    });
}

function filtrarLibroReservas() {
    const fechaSeleccionada = inputFechaFiltro.value;
    const estadoSeleccionado = inputStatusFiltro.value;
    const textoBusqueda = inputBuscador.value.toLowerCase().trim();

    return libroReservas.filter(res => {
        const coincideFecha = res.fecha === fechaSeleccionada;
        const coincideEstado = estadoSeleccionado === "TODOS" || res.estado === estadoSeleccionado;
        const coincideTexto = res.nombre.toLowerCase().includes(textoBusqueda) ||
            res.telefono.includes(textoBusqueda) ||
            res.mesaId.toLowerCase().includes(textoBusqueda);

        return coincideFecha && coincideEstado && coincideTexto;
    });
}

function renderizarTablaReservas(lista) {
    tableBody.innerHTML = "";
    if (lista.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:24px;">No hay registros de reservas en esta fecha.</td></tr>`;
        return;
    }

    lista.forEach(res => {
        let badgeText = res.estado;
        if (res.estado === "SENTADO") badgeText = "Sentado";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${res.hora}</strong></td>
            <td style="font-weight:600; color:var(--text-dark);">${res.fecha}</td>
            <td style="font-weight:600;">${res.nombre}</td>
            <td><span style="font-weight:700;">${res.pax}</span></td>
            <td><strong>${res.mesaId}</strong></td>
            <td style="color:var(--text-muted); font-size:13px;">${res.notas}</td>
            <td><span class="badge status-${res.estado.toLowerCase()}">${badgeText}</span></td>
            <td>
                <div class="row-actions">
                    <button class="action-btn-pill btn-attendance" onclick="cambiarEstadoReserva('${res.id}', 'SENTADO')" title="Marcar Comensales como Sentados">Sentar</button>
                    <button class="action-btn-pill btn-edit" onclick="cargarReservaParaEditar('${res.id}')">Editar</button>
                    <button class="action-btn-pill" style="background-color:#e2e8f0;" onclick="cambiarEstadoReserva('${res.id}', 'FINALIZADA')">Finalizar</button>
                    <button class="action-btn-pill btn-delete" onclick="cancelarReserva('${res.id}')">X</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function dibujarMapaMesasInteractivas(reservasDelDia) {
    const contenedorInterior = document.getElementById("map-interior");
    const contenedorTerraza = document.getElementById("map-terraza");

    contenedorInterior.innerHTML = "";
    contenedorTerraza.innerHTML = "";

    mapaMesasConfig.forEach(m => {
        // Encontrar si la mesa tiene reserva vinculada HOY
        const reservaAsociada = reservasDelDia.find(r => r.mesaId === m.id && r.estado !== "CANCELADA" && r.estado !== "FINALIZADA");

        let claseEstado = "state-free";
        if (reservaAsociada) {
            claseEstado = reservaAsociada.estado === "SENTADO" ? "state-seated" : "state-reserved";
        }

        const div = document.createElement("div");
        div.className = `table-node ${claseEstado}`;
        div.innerHTML = `
            <span class="table-id">${m.id}</span>
            <span class="table-cap">${m.paxMax} Pax</span>
        `;

        // Clicar en la mesa mapea datos de ayuda al formulario rápido
        div.onclick = () => {
            if (claseEstado === "state-free") {
                selectMesaForm.value = m.id;
                showToast(`Mesa ${m.id} seleccionada en el formulario.`);
            } else {
                showToast(`Mesa ${m.id} ocupada por reserva de "${reservaAsociada.nombre}".`);
            }
        };

        if (m.zona === "INTERIOR") contenedorInterior.appendChild(div);
        else contenedorTerraza.appendChild(div);
    });
}

function calcularMetricasKpi() {
    const hoy = inputFechaFiltro.value;
    const delDia = libroReservas.filter(r => r.fecha === hoy);

    const total = delDia.length;
    const pendientes = delDia.filter(r => r.status === "PENDIENTE" || r.estado === "PENDIENTE").length;
    const confirmadas = delDia.filter(r => r.estado === "CONFIRMADA").length;

    // Mesas libres reales hoy
    const ocupadasHoy = delDia.filter(r => r.estado === "CONFIRMADA" || r.estado === "SENTADO").length;
    const libresCount = Math.max(0, 16 - ocupadasHoy);

    document.getElementById("stat-total-res").innerText = total;
    document.getElementById("stat-pending-res").innerText = pendientes;
    document.getElementById("stat-confirmed-res").innerText = confirmadas;
    document.getElementById("stat-tables-free").innerText = `${libresCount} / 16`;

    // Sincronización directa con los KPI globales del dashboard principal
    localStorage.setItem("crm_kpi_num_reservas", total);
    localStorage.setItem("crm_kpi_reservas_pendientes", pendientes);
}

function guardarReserva(e) {
    e.preventDefault();
    const id = inputId.value;

    const datos = {
        nombre: inputNombre.value.trim(),
        telefono: inputTelefono.value.trim(),
        pax: parseInt(inputPax.value),
        hora: inputHora.value,
        fecha: inputFecha.value,
        mesaId: selectMesaForm.value,
        notas: inputNotas.value.trim() || "Ninguna",
        responsable: "Julio Admin"
    };

    if (id) {
        // Actualización / Edición
        const index = libroReservas.findIndex(r => r.id === id);
        datos.id = id;
        datos.estado = libroReservas[index].estado; // Mantiene el estado previo
        libroReservas[index] = datos;
        showToast("Ficha de reserva modificada.");
        abortarEdicion();
    } else {
        // Nueva Inserción
        datos.id = Date.now().toString();
        datos.estado = "PENDIENTE"; // Entran por defecto como pendientes de confirmación
        libroReservas.push(datos);
        showToast(`Reserva para ${datos.nombre} registrada.`);
    }

    formReserva.reset();
    inputFecha.value = inputFechaFiltro.value; // Bloquea la fecha sincronizada
    initReservasModule();
}

window.cargarReservaParaEditar = function (id) {
    const r = libroReservas.find(res => res.id === id);
    if (!r) return;

    document.getElementById("form-action-title").innerText = "✏️ Editar Reserva Seleccionada";
    document.getElementById("btn-submit-text").innerText = "Actualizar Registro";
    btnCancelEdit.style.display = "block";

    inputId.value = r.id;
    inputNombre.value = r.nombre;
    inputTelefono.value = r.telefono;
    inputPax.value = r.pax;
    inputHora.value = r.hora;
    inputFecha.value = r.fecha;
    selectMesaForm.value = r.mesaId;
    inputNotas.value = r.notas === "Ninguna" ? "" : r.notas;
};

function abortarEdicion() {
    document.getElementById("form-action-title").innerText = "☎️ Tomar Nueva Reserva";
    document.getElementById("btn-submit-text").innerText = "Guardar Reserva";
    btnCancelEdit.style.display = "none";
    inputId.value = "";
    formReserva.reset();
    inputFecha.value = inputFechaFiltro.value;
}

window.cambiarEstadoReserva = function (id, nuevoEstado) {
    const res = libroReservas.find(r => r.id === id);
    if (res) {
        res.estado = nuevoEstado;
        showToast(`Estado de la reserva cambiado a ${nuevoEstado.toLowerCase()}.`);
        initReservasModule();
    }
};

window.cancelarReserva = function (id) {
    if (confirm("¿Estás seguro de que deseas cancelar de forma permanente esta reserva?")) {
        const res = libroReservas.find(r => r.id === id);
        if (res) {
            res.estado = "CANCELADA";
            showToast("Reserva cancelada.");
            initReservasModule();
        }
    }
};

function showToast(msj) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msj;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}