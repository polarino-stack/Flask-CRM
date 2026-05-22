/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO DE CONFIGURACIÓN E INFRAESTRUCTURA GLOBAL
 * ==========================================================================
 */

// 1. MIS VALORES POR DEFECTO PARA EL CONTROL RESTAURANTE
const restauranteDefecto = {
    nombre: "La Trattoria Premium",
    direccion: "Carrer de Pujades, 102, Poblenou",
    telefono: "933001122",
    email: "contacto@latrattoria.com",
    horario: "Mar - Dom: 13:00 - 16:30, 20:00 - 00:00"
};

// 2. RESPALDO DEL MAPA DE MESAS (ENLAZADO DIRECTAMENTE CON RESERVAS.JS)
const mesasEstructuralesDefecto = [
    // ZONA INTERIOR
    { id: "M1", zona: "INTERIOR", paxMax: 2 },
    { id: "M2", zona: "INTERIOR", paxMax: 2 },
    { id: "M3", zona: "INTERIOR", paxMax: 4 },
    { id: "M4", zona: "INTERIOR", paxMax: 4 },
    { id: "M5", zona: "INTERIOR", paxMax: 6 },
    { id: "M6", zona: "INTERIOR", paxMax: 6 },
    { id: "M7", zona: "INTERIOR", paxMax: 8 },
    { id: "M8", zona: "INTERIOR", paxMax: 4 },
    // ZONA TERRAZA
    { id: "T1", zona: "TERRAZA", paxMax: 2 },
    { id: "T2", zona: "TERRAZA", paxMax: 2 },
    { id: "T3", zona: "TERRAZA", paxMax: 4 },
    { id: "T4", zona: "TERRAZA", paxMax: 4 },
    { id: "T5", zona: "TERRAZA", paxMax: 4 },
    { id: "T6", zona: "TERRAZA", paxMax: 6 },
    { id: "T7", zona: "TERRAZA", paxMax: 6 },
    { id: "T8", zona: "TERRAZA", paxMax: 8 }
];

const historialSeguridadDefecto = [
    { usuario: "Julio Admin", acceso: "Hoy 09:32", estado: "Activo" },
    { usuario: "Soporte Técnico", acceso: "Ayer 15:40", estado: "Cerrado" }
];

// 3. CARGA EXTRACTORA DE DATOS (LOCALSTORAGE)
let infoRestaurante = JSON.parse(localStorage.getItem("crm_restaurant_info")) || restauranteDefecto;
let listaMesas = JSON.parse(localStorage.getItem("crm_mesas_config")) || mesasEstructuralesDefecto;
let listaEmpleadosSeguridad = JSON.parse(localStorage.getItem("crm_employees")) || [];

// Selectores del DOM
const formRest = document.getElementById("form-restaurante");
const formSec = document.getElementById("form-seguridad");
const tablesTbody = document.getElementById("tables-config-tbody");
const securityTbody = document.getElementById("security-tbody");

const searchInput = document.getElementById("table-search");
const zoneFilter = document.getElementById("table-zone-filter");
const modalTable = document.getElementById("table-modal");
const formModalTable = document.getElementById("form-modal-table");

// Elementos de ventana de confirmación
const confirmModal = document.getElementById("confirm-modal");
const confirmText = document.getElementById("confirm-modal-text");
let callbackConfirmacion = null;

document.addEventListener("DOMContentLoaded", () => {
    // Inyectar hilos iniciales en formularios
    poblarFormularioRestaurante();
    poblarDesplegablesZonas();
    renderizarTablasConfiguracion();

    // Listeners del módulo
    formRest.addEventListener("submit", guardarInformacionRestaurante);
    formSec.addEventListener("submit", guardarSeguridadParametros);
    formModalTable.addEventListener("submit", guardarMesaEstructura);

    searchInput.addEventListener("input", renderizarTablasConfiguracion);
    zoneFilter.addEventListener("change", renderizarTablasConfiguracion);

    document.getElementById("btn-add-table-modal").addEventListener("click", () => abrirMesaModal());
    document.getElementById("btn-close-modal-table").addEventListener("click", cerrarMesaModal);
    document.getElementById("btn-toggle-pass").addEventListener("click", alternarVisibilidadPassword);
    document.getElementById("btn-kill-sessions").addEventListener("click", dispararCierreSesionesAlert);

    document.getElementById("btn-confirm-cancel").addEventListener("click", () => confirmModal.classList.remove("open"));
    document.getElementById("btn-confirm-accept").addEventListener("click", ejecutarAccionConfirmada);
});

/**
 * ==========================================================================
 * MI PARTE 1: GESTIÓN DE INFORMACIÓN DEL LOCAL
 * ==========================================================================
 */
function poblarFormularioRestaurante() {
    document.getElementById("cfg-rest-name").value = infoRestaurante.nombre;
    document.getElementById("cfg-rest-dir").value = infoRestaurante.direccion;
    document.getElementById("cfg-rest-tel").value = infoRestaurante.telefono;
    document.getElementById("cfg-rest-email").value = infoRestaurante.email;
    document.getElementById("cfg-rest-schedule").value = infoRestaurante.horario;
}

function guardarInformacionRestaurante(e) {
    e.preventDefault();
    infoRestaurante = {
        nombre: document.getElementById("cfg-rest-name").value.trim(),
        direccion: document.getElementById("cfg-rest-dir").value.trim(),
        telefono: document.getElementById("cfg-rest-tel").value.trim(),
        email: document.getElementById("cfg-rest-email").value.trim(),
        horario: document.getElementById("cfg-rest-schedule").value.trim()
    };
    localStorage.setItem("crm_restaurant_info", JSON.stringify(infoRestaurante));

    //si hay un titulo de cabecera en esta pagina, lo actualiza en vivo
    const headerTitle = document.getElementById("restuaraunt-name");
    if (headerTitle) headerTitle.innerText = infoRestaurante.nombre;
    showToastNotification("🏬 Parámetros del restaurante guardados. Nombre actualizado en cabeceras.");
}

/**
 * ==========================================================================
 * MI PARTE 2: CONFIGURACIÓN DINÁMICA DE MESAS Y ZONAS
 * ==========================================================================
 */
function poblarDesplegablesZonas() {
    const zonasUnicas = ["INTERIOR", "TERRAZA", "VIP", "LOUNGE"];
    listaMesas.forEach(m => {
        if (!zonasUnicas.includes(m.zona.toUpperCase())) zonasUnicas.push(m.zona.toUpperCase());
    });

    // Filtro de la tabla principal
    zoneFilter.innerHTML = '<option value="TODOS">Todas las Zonas</option>';
    // Desplegable del Modal
    const modalSelect = document.getElementById("modal-table-zone-select");
    modalSelect.innerHTML = "";

    zonasUnicas.forEach(z => {
        const opt1 = document.createElement("option");
        opt1.value = z; opt1.innerText = z;
        zoneFilter.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = z; opt2.innerText = `Zona ${z.charAt(0) + z.slice(1).toLowerCase()}`;
        modalSelect.appendChild(opt2);
    });
}

function renderizarTablasConfiguracion() {
    tablesTbody.innerHTML = "";
    const texto = searchInput.value.toLowerCase().trim();
    const zona = zoneFilter.value;

    const filtradas = listaMesas.filter(m => {
        const coincideText = m.id.toLowerCase().includes(texto) || m.zona.toLowerCase().includes(texto);
        const coincideZona = zona === "TODOS" || m.zona === zona;
        return coincideText && coincideZona;
    });

    if (filtradas.length === 0) {
        tablesTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:16px;">Ninguna mesa configurada bajo este filtro.</td></tr>`;
    } else {
        filtradas.forEach((m, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>Mesa ${m.id}</strong></td>
                <td>${m.paxMax} personas max</td>
                <td><span class="badge-zone">${m.zona}</span></td>
                <td>
                    <div class="row-actions">
                        <button class="action-btn-pill btn-edit" onclick="abrirMesaModal('${m.id}')">Editar</button>
                        <button class="action-btn-pill btn-delete" onclick="eliminarMesaEstructura('${m.id}')">Eliminar</button>
                    </div>
                </td>
            `;
            tablesTbody.appendChild(tr);
        });
    }

    // Renderizado del sub-log de accesos de seguridad para el personal ingresado
    securityTbody.innerHTML = "";

    if (listaEmpleadosSeguridad.length === 0) {
        securityTbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#64748b; padding:12px;">No hay usuarios de terminal registrados.</td></tr>`;
    } else {
        listaEmpleadosSeguridad.forEach(emp => {
            // El estado de sesión depende de si está fichado o no en el restaurante
            const estadoSesion = emp.status === "TRABAJANDO" ? "Activo" : "Cerrado";
            const ultimoAcceso = emp.lastAccess || "Nunca";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                    <td><strong>${emp.username || emp.name.split(' ')[0].toLowerCase()} (Ficha: ${emp.name})</strong></td>
                    <td>${ultimoAcceso}</td>
                    <td><span class="badge ${estadoSesion === 'Activo' ? 'status-activo' : 'status-baja'}">${estadoSesion}</span></td>
                `;
            securityTbody.appendChild(tr);
        });
    }
}

function abrirMesaModal(id = null) {
    modalTable.classList.add("open");
    formModalTable.reset();

    const modalTitleTable = document.getElementById("modal-title-table");

    if (id) {
        if (modalTitleTable) modalTitleTable.innerText = "✏️ Modificar Parámetros de Mesa";
        const mesa = listaMesas.find(m => m.id === id);
        document.getElementById("modal-table-index").value = id;
        document.getElementById("modal-table-id").value = mesa.id;
        document.getElementById("modal-table-id").disabled = true; // Bloqueado ID en edición
        document.getElementById("modal-table-pax").value = mesa.paxMax;
        document.getElementById("modal-table-zone-select").value = mesa.zona;
    } else {
        if (modalTitleTable) modalTitleTable.innerText = "➕ Configurar Nueva Mesa en Sala";
        document.getElementById("modal-table-index").value = "";
        document.getElementById("modal-table-id").disabled = false;
    }
}

function cerrarMesaModal() {
    modalTable.classList.remove("open");
}

function guardarMesaEstructura(e) {
    e.preventDefault();
    const indexId = document.getElementById("modal-table-index").value;
    const tableId = document.getElementById("modal-table-id").value.trim().toUpperCase();
    const pax = parseInt(document.getElementById("modal-table-pax").value);
    let zona = document.getElementById("modal-table-zone-select").value;
    const nuevaZona = document.getElementById("modal-table-new-zone").value.trim().toUpperCase();

    if (nuevaZona) zona = nuevaZona; // Prevalece la nueva zona creada dinámicamente

    if (indexId) {
        // OPERACIÓN: EDICIÓN
        const idx = listaMesas.findIndex(m => m.id === indexId);
        listaMesas[idx].paxMax = pax;
        listaMesas[idx].zona = zona;
        showToastNotification(`Mesa ${indexId} actualizada en la infraestructura.`);
    } else {
        // OPERACIÓN: INSERCIÓN CREATIVA
        if (listaMesas.some(m => m.id === tableId)) {
            showToastNotification("⚠️ El identificador de esa mesa ya existe en el CRM.", "danger");
            return;
        }
        listaMesas.push({ id: tableId, zona, paxMax: pax });
        showToastNotification(`Mesa ${tableId} creada. Lista para recibir comandas.`);
    }

    localStorage.setItem("crm_mesas_config", JSON.stringify(listaMesas));
    // Sincronización secundaria con el array de reservas.html para poblar sus selectores
    localStorage.setItem("crm_reservas_mapa_mesas", JSON.stringify(listaMesas));

    cerrarMesaModal();
    poblarDesplegablesZonas();
    renderizarTablasConfiguracion();
}

window.eliminarMesaEstructura = function (id) {
    abrirVentanaConfirmacion(`¿Estás completamente seguro de eliminar de forma permanente la Mesa ${id}? No aparecerá en el mapa de reservas futuras.`, () => {
        listaMesas = listaMesas.filter(m => m.id !== id);
        localStorage.setItem("crm_mesas_config", JSON.stringify(listaMesas));
        localStorage.setItem("crm_reservas_mapa_mesas", JSON.stringify(listaMesas));
        poblarDesplegablesZonas();
        renderizarTablasConfiguracion();
        showToastNotification("Mesa purgada del plano del local.");
    });
};

/**
 * ==========================================================================
 * MI PARTE 3: CONTROL DE SEGURIDAD DEL SOFTWARE
 * ==========================================================================
 */
function guardarSeguridadParametros(e) {
    e.preventDefault();
    const nuevaPass = document.getElementById("cfg-pass").value;

    if (nuevaPass.trim().length > 0) {
        if (nuevaPass.length < 4) {
            showToastNotification("⚠️ La contraseña debe tener al menos 4 caracteres.", "danger");
            return;
        }

        // ¡CONEXIÓN CON EL LOGIN!: Guardamos la contraseña del admin en la clave que lee el index.html
        localStorage.setItem("crm_admin_password", nuevaPass);

        showToastNotification("🔒 Credenciales modificadas. Se requerirá en el próximo inicio.");
        document.getElementById("cfg-pass").value = "";
    } else {
        showToastNotification("Configuración de tiempo de inactividad salvada.");
    }
}

function alternarVisibilidadPassword() {
    const input = document.getElementById("cfg-pass");
    if (input.type === "password") {
        input.type = "text";
        this.innerText = "🔒";
    } else {
        input.type = "password";
        this.innerText = "👁️";
    }
}

function dispararCierreSesionesAlert() {
    abrirVentanaConfirmacion("¿Deseas revocar los tokens de acceso y cerrar las sesiones de las terminales del equipo?", () => {
        // Leemos el estado, forzamos a todos a volver a "ACTIVO" (Cerrado en control de accesos)
        let totalEmpleados = JSON.parse(localStorage.getItem("crm_employees")) || [];
        totalEmpleados.forEach(emp => {
            emp.status = "ACTIVO";
        });
        localStorage.setItem("crm_employees", JSON.stringify(totalEmpleados));
        renderizarTablasConfiguracion();
        showToastNotification("Sesiones externas expiradas de forma inmediata.");
    });
}
/**
 * ==========================================================================
 * MIS COMPONENTES COMPARTIDOS: MODALES DE CONFIRMACIÓN Y TOASTS
 * ==========================================================================
 */
function abrirVentanaConfirmacion(texto, callback) {
    confirmText.innerText = texto;
    callbackConfirmacion = callback;
    confirmModal.classList.add("open");
}

function ejecutarAccionConfirmada() {
    if (callbackConfirmacion) callbackConfirmacion();
    confirmModal.classList.remove("open");
    callbackConfirmacion = null;
}

function showToastNotification(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    if (type === "danger") toast.style.background = "#ef4444";
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}