/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO DE GESTIÓN DE RESERVAS (ESTADO DINÁMICO)
 * ==========================================================================
 */

// 1. RESPALDO ESTRUCTURAL (Copia idéntica por si el LocalStorage se borra)
const mesasEstructuralesDefecto = [
    { id: "M1", zona: "INTERIOR", paxMax: 2 }, { id: "M2", zona: "INTERIOR", paxMax: 2 },
    { id: "M3", zona: "INTERIOR", paxMax: 4 }, { id: "M4", zona: "INTERIOR", paxMax: 4 },
    { id: "M5", zona: "INTERIOR", paxMax: 6 }, { id: "M6", zona: "INTERIOR", paxMax: 6 },
    { id: "M7", zona: "INTERIOR", paxMax: 8 }, { id: "M8", zona: "INTERIOR", paxMax: 4 },
    { id: "T1", zona: "TERRAZA", paxMax: 2 }, { id: "T2", zona: "TERRAZA", paxMax: 2 },
    { id: "T3", zona: "TERRAZA", paxMax: 4 }, { id: "T4", zona: "TERRAZA", paxMax: 4 },
    { id: "T5", zona: "TERRAZA", paxMax: 4 }, { id: "T6", zona: "TERRAZA", paxMax: 6 },
    { id: "T7", zona: "TERRAZA", paxMax: 6 }, { id: "T8", zona: "TERRAZA", paxMax: 8 }
];

const reservasIniciales = [
    { id: "1", nombre: "Mesa Marta", telefono: "612345678", pax: 2, hora: "13:30", fecha: "2026-05-19", mesaId: "M3", notas: "Ninguna", estado: "CONFIRMADA", responsable: "Julio Admin" },
    { id: "2", nombre: "Familia López", telefono: "698765432", pax: 5, hora: "14:15", fecha: "2026-05-19", mesaId: "T6", notas: "⚠️ Trona, 1 Intolerante a lactosa", estado: "PENDIENTE", responsable: "Julio Admin" }
];

//Conectamos reservas directamente con la base de datos de Configuración
let mapaMesasVivas = JSON.parse(localStorage.getItem("crm_mesas_config")) || mesasEstructuralesDefecto;
let libroReservas = JSON.parse(localStorage.getItem("crm_reservas")) || reservasIniciales;

// Elementos DOM
const tableBody = document.getElementById("reservas-table-body");
const formReserva = document.getElementById("form-reserva");
const selectMesaForm = document.getElementById("res-mesa");
const inputFechaFiltro = document.getElementById("filter-date");
const inputStatusFiltro = document.getElementById("filter-status");
const inputBuscador = document.getElementById("search-booking");
const dynamicZonesContainer = document.getElementById("dynamic-zones-container");

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
    // Forzamos la obtención de la fecha local
    const d = new Date();
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    inputFechaFiltro.value = hoy;
    inputFecha.value = hoy;

    // Inicializar componentes dinámicos
    cargarDatosDelBackend();

    // Listeners (Se quedan exactamente igual)
    formReserva.addEventListener("submit", guardarReserva);
    inputFechaFiltro.addEventListener("change", initReservasModule);
    inputStatusFiltro.addEventListener("change", initReservasModule);
    inputBuscador.addEventListener("input", initReservasModule);
    btnCancelEdit.addEventListener("click", abortarEdicion);
});

/**
 * Carga datos iniciales del backend (mesas y reservas)
 */
async function cargarDatosDelBackend() {
    try {
        showToast("Cargando datos del servidor...");
        // Cargar mesas del backend
        const mesas = await obtenerMesas();
        
        // Transformar mesas del backend al formato frontend (con id como string)
        mapaMesasVivas = mesas.map(mesa => ({
            id: mesa.numeroMesa.toString(),
            zona: mesa.numeroMesa <= 8 ? "INTERIOR" : "TERRAZA",  // Heurística: 1-8 interior, >8 terraza
            paxMax: mesa.capacidad,
            backendId: mesa.id  // Guardar ID real para cuando enviemos datos
        })) || mesasEstructuralesDefecto;
        
        // Cargar reservas del backend
        const hoy = inputFechaFiltro.value;
        const reservasDelServidor = await obtenerReservas(hoy) || [];
        
        // Transformar reservas del backend al formato frontend
        libroReservas = reservasDelServidor.map(res => {
            // Extraer la hora en formato HH:mm
            const horaStr = res.horaInicio ? res.horaInicio.slice(0, 5) : "12:00";
            const fechaStr = res.fechaReserva || new Date().toISOString().split('T')[0];
            
            return {
                id: res.id.toString(),
                nombre: res.nombreCliente,
                telefono: res.telefonoCliente || "",
                pax: res.numeroPersonas,
                hora: horaStr,
                fecha: fechaStr,
                mesaId: res.mesa?.numeroMesa?.toString() || "",
                mesaBackendId: res.mesa?.id,  // ID real de BD
                notas: res.observaciones || "Ninguna",
                estado: res.estado || "CONFIRMADA",
                responsable: "Sistema",
                backendId: res.id  // Guardar ID real de BD
            };
        });
        
        localStorage.setItem("crm_mesas_config", JSON.stringify(mapaMesasVivas));
        localStorage.setItem("crm_reservas", JSON.stringify(libroReservas));
        
        poblarDesplegableMesas();
        initReservasModule();
        showToast("Datos cargados correctamente.");
    } catch (error) {
        console.error("Error cargando datos del backend:", error);
        // Fallback: usar datos locales
        showToast("⚠️ Usando datos locales (backend no disponible)");
        mapaMesasVivas = JSON.parse(localStorage.getItem("crm_mesas_config")) || mesasEstructuralesDefecto;
        libroReservas = JSON.parse(localStorage.getItem("crm_reservas")) || reservasIniciales;
        poblarDesplegableMesas();
        initReservasModule();
    }
}

function initReservasModule() {
    // Re-leer la configuración viva de mesas por si el usuario acaba de volver de esa pantalla
    mapaMesasVivas = JSON.parse(localStorage.getItem("crm_mesas_config")) || mesasEstructuralesDefecto;
    localStorage.setItem("crm_reservas", JSON.stringify(libroReservas));

    const filtradas = filtrarLibroReservas();
    poblarDesplegableMesas(); // Mantiene actualizado el selector del formulario
    renderizarTablaReservas(filtradas);
    dibujarMapaMesasInteractivas(filtradas);
    calcularMetricasKpi();
}

function poblarDesplegableMesas() {
    selectMesaForm.innerHTML = '<option value="">Selecciona mesa...</option>';
    mapaMesasVivas.forEach(m => {
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

//FUNCIÓN DE MAQUEADO DE SALA DE CONTROL ELECTRÓNICO TOTALMENTE DINÁMICO
function dibujarMapaMesasInteractivas(reservasDelDia) {
    if (!dynamicZonesContainer) return;
    dynamicZonesContainer.innerHTML = ""; // Limpieza total de mapas previos

    // 1. Extraer qué zonas existen de verdad en el array de Configuración
    const mapaZonasDetectadas = {};
    mapaMesasVivas.forEach(m => {
        const zonaNorm = m.zona.toUpperCase().trim();
        if (!mapaZonasDetectadas[zonaNorm]) {
            mapaZonasDetectadas[zonaNorm] = [];
        }
        mapaZonasDetectadas[zonaNorm].push(m);
    });

    const llavesZonas = Object.keys(mapaZonasDetectadas);

    if (llavesZonas.length === 0) {
        dynamicZonesContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:16px;">No hay infraestructura de mesas creada. Ve al módulo de Configuración.</p>`;
        return;
    }

    // 2. Iterar por cada zona creada en configuración y levantar su layout en el DOM solo
    llavesZonas.forEach(zonaKey => {
        // Fabricamos el título estilizado de la Zona
        const h4 = document.createElement("h4");
        h4.className = "zone-title";
        h4.style.marginTop = "20px";
        h4.innerText = `Zona ${zonaKey.charAt(0) + zonaKey.slice(1).toLowerCase()}`;
        dynamicZonesContainer.appendChild(h4);

        // Fabricamos la rejilla CSS de nodos de mesas
        const gridDiv = document.createElement("div");
        gridDiv.className = "grid-tables-map";

        // Poblamos las mesas pertenecientes a esta iteración de zona
        mapaZonasDetectadas[zonaKey].forEach(m => {
            const reservaAsociada = reservasDelDia.find(r => r.mesaId === m.id && r.estado !== "CANCELADA" && r.estado !== "FINALIZADA");

            let claseEstado = "state-free";
            if (reservaAsociada) {
                claseEstado = reservaAsociada.estado === "SENTADO" ? "state-seated" : "state-reserved";
            }

            const tableNode = document.createElement("div");
            tableNode.className = `table-node ${claseEstado}`;
            tableNode.innerHTML = `
                <span class="table-id">${m.id}</span>
                <span class="table-cap">${m.paxMax} Pax</span>
            `;

            tableNode.onclick = () => {
                if (claseEstado === "state-free") {
                    selectMesaForm.value = m.id;
                    showToast(`Mesa ${m.id} seleccionada en el formulario.`);
                } else {
                    showToast(`Mesa ${m.id} ocupada por reserva de "${reservaAsociada.nombre}".`);
                }
            };

            gridDiv.appendChild(tableNode);
        });

        dynamicZonesContainer.appendChild(gridDiv);
    });
}

function calcularMetricasKpi() {
    const hoy = inputFechaFiltro.value;
    const delDia = libroReservas.filter(r => r.fecha === hoy);

    const total = delDia.length;
    const pendientes = delDia.filter(r => r.estado === "PENDIENTE").length;
    const confirmadas = delDia.filter(r => r.estado === "CONFIRMADA").length;

    const ocupadasHoy = delDia.filter(r => r.estado === "CONFIRMADA" || r.estado === "SENTADO").length;

    //El totalizador ahora calcula la resta sobre la longitud del array estructural real, no sobre 16 fijo
    const totalMesasRestaurante = mapaMesasVivas.length;
    const libresCount = Math.max(0, totalMesasRestaurante - ocupadasHoy);

    document.getElementById("stat-total-res").innerText = total;
    document.getElementById("stat-pending-res").innerText = pendientes;
    document.getElementById("stat-confirmed-res").innerText = confirmadas;
    document.getElementById("stat-tables-free").innerText = `${libresCount} / ${totalMesasRestaurante}`;

    localStorage.setItem("crm_kpi_num_reservas", total);
    localStorage.setItem("crm_kpi_reservas_pendientes", pendientes);
}

async function guardarReserva(e) {
    e.preventDefault();
    const id = inputId.value;

    // Obtener mesa ID del backend
    const mesaSeleccionada = mapaMesasVivas.find(m => m.id === selectMesaForm.value);
    const mesaBackendId = mesaSeleccionada?.backendId || parseInt(selectMesaForm.value);

    // Construir datos para enviar al backend
    const datosBackend = {
        nombreCliente: inputNombre.value.trim(),
        telefonoCliente: inputTelefono.value.trim(),
        numeroPersonas: parseInt(inputPax.value),
        horaInicio: inputHora.value + ":00",  // Agregar segundos
        fechaReserva: inputFecha.value,
        mesaId: mesaBackendId,
        observaciones: inputNotas.value.trim() || "Ninguna"
    };

    try {
        if (id) {
            // Actualizar reserva (actualmente solo soporta cambio de estado en backend)
            const index = libroReservas.findIndex(r => r.id === id);
            const datosLocales = {
                id: id,
                nombre: inputNombre.value.trim(),
                telefono: inputTelefono.value.trim(),
                pax: parseInt(inputPax.value),
                hora: inputHora.value,
                fecha: inputFecha.value,
                mesaId: selectMesaForm.value,
                notas: inputNotas.value.trim() || "Ninguna",
                estado: libroReservas[index].estado,
                responsable: "Sistema",
                backendId: libroReservas[index].backendId
            };
            libroReservas[index] = datosLocales;
            showToast("✓ Ficha de reserva actualizada.");
            abortarEdicion();
        } else {
            // Crear nueva reserva en backend
            const reservaCreada = await crearReserva(datosBackend);
            const datosLocales = {
                id: reservaCreada.id.toString(),
                nombre: datosBackend.nombreCliente,
                telefono: datosBackend.telefonoCliente,
                pax: datosBackend.numeroPersonas,
                hora: datosBackend.horaInicio.slice(0, 5),
                fecha: datosBackend.fechaReserva,
                mesaId: selectMesaForm.value,
                notas: datosBackend.observaciones,
                estado: "CONFIRMADA",
                responsable: "Sistema",
                backendId: reservaCreada.id,
                mesaBackendId: mesaBackendId
            };
            libroReservas.push(datosLocales);
            showToast(`✓ Reserva para ${datosBackend.nombreCliente} creada en el servidor.`);
        }
    } catch (error) {
        console.error("Error guardando reserva:", error);
        showToast("⚠️ Error al guardar. Guardando localmente...");
        // Fallback a guardado local
        if (!id) {
            const datosLocales = {
                id: Date.now().toString(),
                nombre: inputNombre.value.trim(),
                telefono: inputTelefono.value.trim(),
                pax: parseInt(inputPax.value),
                hora: inputHora.value,
                fecha: inputFecha.value,
                mesaId: selectMesaForm.value,
                notas: inputNotas.value.trim() || "Ninguna",
                estado: "PENDIENTE",
                responsable: "Sistema"
            };
            libroReservas.push(datosLocales);
        }
    }

    formReserva.reset();
    inputFecha.value = inputFechaFiltro.value;
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
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msj;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}