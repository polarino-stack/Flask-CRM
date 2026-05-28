/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO DE INFORMES, MÉTRICAS AVANZADAS Y AUDITORÍA (BI)
 * ==========================================================================
 */

// Buffers dinámicos de almacenamiento (APIs de Spring Boot)
let datosInventarioReporte = [];
let datosPersonalReporte = [];

// Elementos DOM
const tbodyInventario = document.getElementById("rep-table-inventario");
const tbodyPersonal = document.getElementById("rep-table-personal");
const timelineContainer = document.getElementById("sys-timeline");

const reportSearch = document.getElementById("report-search");
const filterPeriod = document.getElementById("filter-period");
const filterCategory = document.getElementById("filter-category-rep");
const filterDateInput = document.getElementById("filter-date-rep");

document.addEventListener("DOMContentLoaded", () => {
    // Sincronizamos el arranque inicial con la fecha local
    const d = new Date();
    const hoyLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (filterDateInput) filterDateInput.value = hoyLocal;

    // ARRANQUE EN CADENA ASÍNCRONO CONTRA LAS APIS
    cargarInventarioDesdeAPIParaReportes();

    // Listeners reactivos
    if (reportSearch) reportSearch.addEventListener("input", ejecutarAnaliticaCRM);
    if (filterPeriod) filterPeriod.addEventListener("change", ejecutarAnaliticaCRM);
    if (filterCategory) filterCategory.addEventListener("change", ejecutarAnaliticaCRM);
    if (filterDateInput) filterDateInput.addEventListener("change", ejecutarAnaliticaCRM);
});

// ==========================================================================
// CAPA DE CONEXIÓN CON LOS ENDPOINTS DE JAVA (SPRING BOOT)
// ==========================================================================
async function cargarInventarioDesdeAPIParaReportes() {
    try {
        console.log("Cargando inventario asíncrono para reportes en:", `${API_BASE_URL}/stock`);
        const response = await fetch(`${API_BASE_URL}/stock`);
        if (response.ok) {
            datosInventarioReporte = await response.json();
            window.inventario = datosInventarioReporte;
        }
    } catch (error) {
        console.error("🔴 Error al cargar stock en reportes:", error);
    } canceladores: {
        // Pasamos al siguiente eslabón: cargar el personal real
        await cargarEmpleadosDesdeAPIParaReportes();
    }
}

async function cargarEmpleadosDesdeAPIParaReportes() {
    try {
        console.log("Cargando personal asíncrono para reportes en:", `${API_BASE_URL}/empleados`);
        const response = await fetch(`${API_BASE_URL}/empleados`);
        if (response.ok) {
            datosPersonalReporte = await response.json();
        }
    } catch (error) {
        console.error("🔴 Error al cargar empleados en reportes:", error);
        // Fallback de seguridad local si se cae el servidor
        datosPersonalReporte = JSON.parse(localStorage.getItem("crm_employees")) || [];
    } finally {
        // Cuando ya tenemos todos los datos de Java listos, disparamos la analítica
        ejecutarAnaliticaCRM();
    }
}

function ejecutarAnaliticaCRM() {
    const fechaSeleccionada = filterDateInput.value;
    const d = new Date();
    const hoyISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // CASO 1: INTENTAN MIRAR EL FUTURO
    if (fechaSeleccionada > hoyISO) {
        mostrarPantallaFuturoVacía(fechaSeleccionada);
        return;
    }

    // CASO 2: PASADO O PRESENTE
    calcularTarjetasAvanzadas();
    renderizarTablasReporte();
    construirTimelineAuditoria();
}

function mostrarPantallaFuturoVacía(fecha) {
    document.getElementById("kpi-top-table").innerText = "—";
    document.getElementById("kpi-peak-hour").innerText = "—";
    document.getElementById("kpi-stock-value").innerText = "—";
    document.getElementById("kpi-staff-hours").innerText = "0 hrs";

    tbodyInventario.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:24px;">🔮 El día ${fecha} aún no ha comenzado. No hay proyecciones de stock.</td></tr>`;
    tbodyPersonal.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:24px;">🚫 No se puede controlar el turno de una jornada futura.</td></tr>`;

    timelineContainer.innerHTML = `
        <div style="text-align:center; color:var(--text-muted); padding: 24px; font-size: 13px;">
            ⏳ Operaciones no iniciadas para esta fecha.
        </div>`;
}

function calcularTarjetasAvanzadas() {
    const bookingsData = JSON.parse(localStorage.getItem("crm_reservas")) || [];
    const fechaSeleccionada = filterDateInput.value;
    const reservasFiltradas = bookingsData.filter(b => b.fecha === fechaSeleccionada && (b.estado || "").toUpperCase() !== "CANCELADA");

    if (reservasFiltradas.length > 0) {
        const conteoMesas = {};
        reservasFiltradas.forEach(b => {
            conteoMesas[b.mesaId] = (conteoMesas[b.mesaId] || 0) + 1;
        });
        let topMesa = Object.keys(conteoMesas).reduce((a, b) => conteoMesas[a] > conteoMesas[b] ? a : b);
        document.getElementById("kpi-top-table").innerText = `Mesa ${topMesa}`;
    } else {
        document.getElementById("kpi-top-table").innerText = "Mesa M3";
    }

    if (reservasFiltradas.length > 0) {
        const conteoHoras = {};
        reservasFiltradas.forEach(b => {
            const horaBase = b.hora.split(":")[0] + ":00";
            conteoHoras[horaBase] = (conteoHoras[horaBase] || 0) + parseInt(b.pax || 0);
        });
        let horaPico = Object.keys(conteoHoras).reduce((a, b) => conteoHoras[a] > conteoHoras[b] ? a : b);
        document.getElementById("kpi-peak-hour").innerText = `${horaPico} hrs`;
    } else {
        document.getElementById("kpi-peak-hour").innerText = "14:00 hrs";
    }

    let totalValor = datosInventarioReporte.reduce((acc, p) => acc + ((parseFloat(p.precio) || 1.50) * (parseInt(p.cantidad) || 0)), 0);
    document.getElementById("kpi-stock-value").innerText = `${totalValor.toFixed(2)} €`;

    // Calculamos horas estimadas usando el buffer real de la API
    let empleadosTrabajando = datosPersonalReporte.filter(e => (e.status || "").toUpperCase() === "TRABAJANDO").length;
    let horasEstimadas = empleadosTrabajando * 8;
    document.getElementById("kpi-staff-hours").innerText = `${horasEstimadas} hrs est.`;
}

function renderizarTablasReporte() {
    const busqueda = reportSearch.value.toLowerCase().trim();
    const catFiltro = filterCategory.value.toUpperCase();
    const fechaFiltro = filterDateInput.value;

    const d = new Date();
    const hoyISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const bookingsData = JSON.parse(localStorage.getItem("crm_reservas")) || [];
    const huboActividadPasada = bookingsData.some(b => b.fecha === fechaFiltro);

    // ==========================================================================
    // SECCIÓN 1: INVENTARIO CRÍTICO REAL EN VIVO
    // ==========================================================================
    tbodyInventario.innerHTML = "";
    if (fechaFiltro === hoyISO || huboActividadPasada) {
        const stockCritico = datosInventarioReporte.filter(p => {
            const stockReal = parseInt(p.cantidad) || 0;
            const categoriaProducto = p.categoria && p.categoria.nombre ? p.categoria.nombre.toUpperCase() : "SIN CATEGORÍA";

            const coincideCritico = stockReal <= 10;
            const coincideCat = catFiltro === "TODOS" || categoriaProducto === catFiltro;
            const coincideText = p.nombre.toLowerCase().includes(busqueda);

            return coincideCritico && coincideCat && coincideText;
        });

        if (stockCritico.length === 0) {
            tbodyInventario.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No hay alertas de stock bajo el umbral.</td></tr>`;
        } else {
            stockCritico.forEach(p => {
                const stockReal = parseInt(p.cantidad) || 0;
                const categoriaTexto = p.categoria && p.categoria.nombre ? p.categoria.nombre : "Sin Categoría";

                let badgeClass = "warning";
                let badgeText = "Bajo Stock";
                if (stockReal === 0) {
                    badgeClass = "danger";
                    badgeText = "Agotado";
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${p.nombre}</strong></td>
                    <td>${categoriaTexto}</td>
                    <td style="font-weight:700; color: ${stockReal === 0 ? '#dc3545' : 'inherit'};">${stockReal}</td>
                    <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                `;
                tbodyInventario.appendChild(tr);
            });
        }
    } else {
        tbodyInventario.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">📭 Almacén cerrado o sin variaciones registradas en esta fecha histórica.</td></tr>`;
    }

    // ==========================================================================
    // SECCIÓN 2: CONTROL DE JORNADA LABORAL REAL DE LA API (EMPLEADOS REALES)
    // ==========================================================================
    tbodyPersonal.innerHTML = "";

    if (fechaFiltro === hoyISO) {
        const personalFiltrado = datosPersonalReporte.filter(e => {
            const nombreCompleto = `${e.nombre} ${e.apellido || ""}`.toLowerCase();
            return nombreCompleto.includes(busqueda);
        });

        if (personalFiltrado.length === 0) {
            tbodyPersonal.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No se encontraron empleados coincidentes.</td></tr>`;
        } else {
            personalFiltrado.forEach(e => {
                const estadoLimpio = (e.status || "ACTIVO").toUpperCase();
                const estaFichado = estadoLimpio === "TRABAJANDO";
                const nombreCompleto = `${e.nombre} ${e.apellido || ""}`.trim();

                // Mapeo estilístico idéntico para que coincida con tus clases de css
                let badgeClass = "status-activo";
                let badgeText = "Fuera / Descanso";

                if (estaFichado) {
                    badgeClass = "status-trabajando";
                    badgeText = "En Turno";
                } else if (estadoLimpio === "BAJA") {
                    badgeClass = "status-baja";
                    badgeText = "Baja / Ausente";
                } else if (estadoLimpio === "DESCANSO") {
                    badgeClass = "status-descanso";
                    badgeText = "Descanso";
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${nombreCompleto}</strong></td>
                    <td>${estaFichado ? '16:00' : '—'}</td>
                    <td>—</td>
                    <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                `;
                tbodyPersonal.appendChild(tr);
            });
        }
    } else {
        tbodyPersonal.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">📅 No se registran fichajes de asistencia para el día ${fechaFiltro}.</td></tr>`;
    }
}

function construirTimelineAuditoria() {
    timelineContainer.innerHTML = "";
    const eventosLog = [];
    const fechaFiltro = filterDateInput.value;
    const bookingsData = JSON.parse(localStorage.getItem("crm_reservas")) || [];

    const movimientosReservas = bookingsData.filter(b =>
        b.fecha === fechaFiltro && ((b.estado || "").toUpperCase() === "CANCELADA" || (b.estado || "").toUpperCase() === "SENTADO")
    );

    movimientosReservas.forEach(b => {
        const estadoLimpio = b.estado.toUpperCase();
        const claseLog = estadoLimpio === "SENTADO" ? "success" : "danger";
        const etiquetaTitulo = estadoLimpio === "SENTADO" ? "Reserva Sentado" : "Reserva Cancelada";

        eventosLog.push({
            tipo: claseLog,
            tiempo: `A las ${b.hora}`,
            titulo: etiquetaTitulo,
            desc: `Cliente: "${b.nombre}" asignado en Mesa ${b.mesaId} para ${b.pax} pax.`
        });
    });

    datosInventarioReporte.filter(p => (parseInt(p.cantidad) || 0) <= 10).forEach(p => {
        const stockReal = parseInt(p.cantidad) || 0;
        const esAgotado = stockReal === 0;

        eventosLog.push({
            tipo: "danger",
            tiempo: esAgotado ? "Agotado" : "Bajo Stock",
            titulo: esAgotado ? "Alerta de Rotura de Stock (Crítica)" : "Alerta de Stock Crítico",
            desc: esAgotado
                ? `El artículo "${p.nombre}" se encuentra totalmente AGOTADO en la base de datos Java.`
                : `El artículo "${p.nombre}" requiere reposición urgente (${stockReal} uds restantes en almacén).`
        });
    });

    if (eventosLog.length === 0) {
        timelineContainer.innerHTML = `
            <div style="text-align:center; color:var(--text-muted); padding: 24px; font-size: 13px;">
                🔄 No se registran movimientos operativos ni alertas para esta fecha.
            </div>`;
        return;
    }

    eventosLog.forEach(ev => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `
            <span class="timeline-dot ${ev.tipo}"></span>
            <span class="timeline-time" style="font-weight: 700;">${ev.tiempo}</span>
            <span class="timeline-content" style="font-weight: 700; color: var(--text-dark);">${ev.titulo}</span>
            <span class="timeline-desc" style="color: var(--text-muted); display: block; margin-top: 2px;">${ev.desc}</span>
        `;
        timelineContainer.appendChild(item);
    });
}

// EXPORTACIONES
window.exportarReporte = function (formato) {
    const formatoLimpio = (formato || "").toLowerCase();
    if (formatoLimpio === 'excel') {
        showToast("Generando reporte Excel...");
        const fechaFiltro = document.getElementById("filter-date-rep")?.value || new Date().toLocaleDateString();

        let csvContent = "\uFEFF";
        csvContent += `CRM RESTAURANTE - REPORTE DE OPERACIONES;;;\n`;
        csvContent += `Fecha de Auditoría: ${fechaFiltro};;;\n\n`;
        csvContent += `ALERTAS DE INVENTARIO CRÍTICO;;;\n`;
        csvContent += `Artículo;Categoría;Stock Actual;Estado\n`;

        const stockCritico = datosInventarioReporte.filter(p => (parseInt(p.cantidad) || 0) <= 10);
        if (stockCritico.length === 0) {
            csvContent += `No hay alertas de stock bajo el umbral;;;\n`;
        } else {
            stockCritico.forEach(p => {
                const stockReal = parseInt(p.cantidad) || 0;
                const estado = stockReal === 0 ? 'Agotado' : 'Bajo Stock';
                const categoriaTexto = p.categoria && p.categoria.nombre ? p.categoria.nombre : "Sin Categoría";
                csvContent += `"${p.nombre}";"${categoriaTexto}";${stockReal};"${estado}"\n`;
            });
        }

        csvContent += `\n\n`;
        csvContent += `CONTROL DE JORNADA LABORAL;;;\n`;
        csvContent += `Empleado;Hora Entrada;Hora Salida;Estado Actual\n`;

        if (datosPersonalReporte.length === 0) {
            csvContent += `No hay empleados registrados;;;\n`;
        } else {
            datosPersonalReporte.forEach(e => {
                const estaFichado = (e.status || "").toUpperCase() === "TRABAJANDO";
                const entrada = estaFichado ? "16:00" : "—";
                const estadoTxt = estaFichado ? "En Turno" : "Fuera / Descanso";
                csvContent += `"${e.nombre} ${e.apellido || ""}";"${entrada}";"—";"${estadoTxt}"\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Reporte_CRM_${fechaFiltro}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("¡Excel descargado con éxito!");

    } else if (formatoLimpio === 'pdf') {
        showToast("Abriendo asistente de impresión PDF...");
        setTimeout(() => { window.print(); }, 500);
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