/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO DE INFORMES, MÉTRICAS AVANZADAS Y AUDITORÍA (BI)
 * ==========================================================================
 */

// Elementos DOM
const tbodyInventario = document.getElementById("rep-table-inventario");
const tbodyPersonal = document.getElementById("rep-table-personal");
const timelineContainer = document.getElementById("sys-timeline");

const reportSearch = document.getElementById("report-search");
const filterPeriod = document.getElementById("filter-period");
const filterCategory = document.getElementById("filter-category-rep");
const filterDateInput = document.getElementById("filter-date-rep");

document.addEventListener("DOMContentLoaded", () => {
    // Sincronizamos el arranque inicial con la fecha local de España
    const d = new Date();
    const hoyLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (filterDateInput) filterDateInput.value = hoyLocal;
    ejecutarAnaliticaCRM();

    // Listeners reactivos
    reportSearch.addEventListener("input", ejecutarAnaliticaCRM);
    filterPeriod.addEventListener("change", ejecutarAnaliticaCRM);
    filterCategory.addEventListener("change", ejecutarAnaliticaCRM);
    filterDateInput.addEventListener("change", ejecutarAnaliticaCRM);
});

// ==========================================================================
// CONTROL DEL TIEMPO: CONTROLA PASADO, PRESENTE Y FUTURO
// ==========================================================================
function ejecutarAnaliticaCRM() {
    const fechaSeleccionada = filterDateInput.value;

    const d = new Date();
    const hoyISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // CASO 1: INTENTAN MIRAR EL FUTURO
    if (fechaSeleccionada > hoyISO) {
        mostrarPantallaFuturoVacía(fechaSeleccionada);
        return;
    }

    // CASO 2: PASADO O PRESENTE (Calculamos métricas leyendo LocalStorage en vivo)
    calcularTarjetasAvanzadas();
    renderizarTablasReporte();
    construirTimelineAuditoria();
}

// Función auxiliar para bloquear el futuro
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
    // REFRESH EN VIVO: Extraemos buffers actualizados de la base de datos local
    const stockData = JSON.parse(localStorage.getItem("crm_inventario")) || [];
    const staffData = JSON.parse(localStorage.getItem("crm_employees")) || [];
    const bookingsData = JSON.parse(localStorage.getItem("crm_reservas")) || [];

    const fechaSeleccionada = filterDateInput.value;
    const reservasFiltradas = bookingsData.filter(b => b.fecha === fechaSeleccionada && (b.estado || "").toUpperCase() !== "CANCELADA");

    // A. CALCULAR MESA MÁS RENTABLE (Con Fallback si está vacío)
    if (reservasFiltradas.length > 0) {
        const conteoMesas = {};
        reservasFiltradas.forEach(b => {
            conteoMesas[b.mesaId] = (conteoMesas[b.mesaId] || 0) + 1;
        });
        let topMesa = Object.keys(conteoMesas).reduce((a, b) => conteoMesas[a] > conteoMesas[b] ? a : b);
        document.getElementById("kpi-top-table").innerText = `Mesa ${topMesa}`;
    } else {
        document.getElementById("kpi-top-table").innerText = "Mesa M3"; // Fallback demo
    }

    // B. CALCULAR HORA PICO (Con Fallback si está vacío)
    if (reservasFiltradas.length > 0) {
        const conteoHoras = {};
        reservasFiltradas.forEach(b => {
            const horaBase = b.hora.split(":")[0] + ":00";
            conteoHoras[horaBase] = (conteoHoras[horaBase] || 0) + parseInt(b.pax || 0);
        });
        let horaPico = Object.keys(conteoHoras).reduce((a, b) => conteoHoras[a] > conteoHoras[b] ? a : b);
        document.getElementById("kpi-peak-hour").innerText = `${horaPico} hrs`;
    } else {
        document.getElementById("kpi-peak-hour").innerText = "14:00 hrs"; // Fallback demo
    }

    // C. VALOR TOTAL DEL INVENTARIO ACTUAL REAL
    let totalValor = stockData.reduce((acc, p) => acc + ((parseFloat(p.precio) || 0) * (parseInt(p.stock) || 0)), 0);
    document.getElementById("kpi-stock-value").innerText = `${totalValor.toFixed(2)} €`;

    // D. PRODUCTIVIDAD EN VIVO (Detecta los empleados reales en estado TRABAJANDO)
    let empleadosTrabajando = staffData.filter(e => (e.status || "").toUpperCase() === "TRABAJANDO").length;
    let horasEstimadas = empleadosTrabajando * 8;
    document.getElementById("kpi-staff-hours").innerText = `${horasEstimadas} hrs est.`;
}

function renderizarTablasReporte() {
    const busqueda = reportSearch.value.toLowerCase().trim();
    const catFiltro = filterCategory.value;
    const fechaFiltro = filterDateInput.value;

    const d = new Date();
    const hoyISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const stockData = JSON.parse(localStorage.getItem("crm_inventario")) || [];
    const staffData = JSON.parse(localStorage.getItem("crm_employees")) || [];
    const bookingsData = JSON.parse(localStorage.getItem("crm_reservas")) || [];

    const huboActividadPasada = bookingsData.some(b => b.fecha === fechaFiltro);

    // ==========================================================================
    // SECCIÓN 1: INVENTARIO CRÍTICO REAL EN VIVO
    // ==========================================================================
    tbodyInventario.innerHTML = "";

    if (fechaFiltro === hoyISO || huboActividadPasada) {
        const stockCritico = stockData.filter(p => {
            const coincideCritico = parseInt(p.stock) <= 10;
            const coincideCat = catFiltro === "TODOS" || p.categoria === catFiltro;
            const coincideText = p.nombre.toLowerCase().includes(busqueda);
            return coincideCritico && coincideCat && coincideText;
        });

        if (stockCritico.length === 0) {
            tbodyInventario.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No hay alertas de stock bajo el umbral.</td></tr>`;
        } else {
            stockCritico.forEach(p => {
                const esAgotado = parseInt(p.stock) === 0;
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${p.nombre}</strong></td>
                    <td>${p.categoria}</td>
                    <td style="font-weight:700;">${p.stock}</td>
                    <td><span class="badge ${esAgotado ? 'status-baja' : 'status-descanso'}">${esAgotado ? 'Agotado' : 'Bajo Stock'}</span></td>
                `;
                tbodyInventario.appendChild(tr);
            });
        }
    } else {
        tbodyInventario.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">📭 Almacén cerrado o sin variaciones registradas en esta fecha histórica.</td></tr>`;
    }

    // ==========================================================================
    // SECCIÓN 2: CONTROL DE JORNADA LABORAL EN VIVO (CONECTADO AL STORAGE)
    // ==========================================================================
    tbodyPersonal.innerHTML = "";

    if (fechaFiltro === hoyISO) {
        const personalFiltrado = staffData.filter(e => e.name.toLowerCase().includes(busqueda));

        if (personalFiltrado.length === 0) {
            tbodyPersonal.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No hay empleados registrados en la plantilla.</td></tr>`;
        } else {
            personalFiltrado.forEach(e => {
                const estadoLimpio = (e.status || "").toUpperCase();
                const estaFichado = estadoLimpio === "TRABAJANDO";
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${e.name}</strong></td>
                    <td>${estaFichado ? '16:00' : '—'}</td>
                    <td>—</td>
                    <td><span class="badge ${estaFichado ? 'status-trabajando' : 'status-activo'}">${estaFichado ? 'En Turno' : 'Fuera / Descanso'}</span></td>
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

    const stockData = JSON.parse(localStorage.getItem("crm_inventario")) || [];
    const bookingsData = JSON.parse(localStorage.getItem("crm_reservas")) || [];

    // Filtramos movimientos operativos
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

    // Alertas automáticas de insumos base
    stockData.filter(p => parseInt(p.stock) <= 5).forEach(p => {
        eventosLog.push({
            tipo: "danger",
            tiempo: "Alerta Crítica",
            titulo: "Alerta de Stock Crítico",
            desc: `El artículo "${p.nombre}" requiere reposición urgente (${p.stock} uds).`
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

// ==========================================================================
// SISTEMA DE EXPORTACIÓN REAL (EXCEL CSV Y PDF NATIVO)
// ==========================================================================
window.exportarReporte = function (formato) {

    const formatoLimpio = (formato || "").toLowerCase();
    if (formato === 'excel') {
        showToast("Generando reporte Excel...");

        // 1. Obtener los datos actuales del LocalStorage
        const stockData = JSON.parse(localStorage.getItem("crm_inventario")) || [];
        const staffData = JSON.parse(localStorage.getItem("crm_employees")) || [];
        const fechaFiltro = document.getElementById("filter-date-rep")?.value || new Date().toLocaleDateString();

        // 2. Construir el contenido del archivo CSV (Separado por punto y coma para Excel en Español)
        let csvContent = "\uFEFF"; // BOM para que Excel reconozca los acentos correctamente

        // Bloque 1: Cabecera del Reporte
        csvContent += `CRM RESTAURANTE - REPORTE DE OPERACIONES;;;\n`;
        csvContent += `Fecha de Auditoría: ${fechaFiltro};;;\n\n`;

        // Bloque 2: Tabla de Alertas de Stock
        csvContent += `ALERTAS DE STOCK CRÍTICO;;;\n`;
        csvContent += `Artículo;Categoría;Stock Actual;Estado\n`;

        const stockCritico = stockData.filter(p => parseInt(p.stock) <= 10);
        if (stockCritico.length === 0) {
            csvContent += `No hay alertas de stock bajo el umbral;;;\n`;
        } else {
            stockCritico.forEach(p => {
                const estado = parseInt(p.stock) === 0 ? 'Agotado' : 'Bajo Stock';
                csvContent += `"${p.nombre}";"${p.categoria}";${p.stock};"${estado}"\n`;
            });
        }

        csvContent += `\n\n`; // Separadores visuales

        // Bloque 3: Tabla de Personal en Turno
        csvContent += `CONTROL DE JORNADA LABORAL;;;\n`;
        csvContent += `Empleado;Hora Entrada;Hora Salida;Estado Actual\n`;

        if (staffData.length === 0) {
            csvContent += `No hay empleados registrados;;;\n`;
        } else {
            staffData.forEach(e => {
                const estaFichado = (e.status || "").toUpperCase() === "TRABAJANDO";
                const entrada = estaFichado ? "16:00" : "—";
                const estadoTxt = estaFichado ? "En Turno" : "Fuera / Descanso";
                csvContent += `"${e.name}";"${entrada}";"—";"${estadoTxt}"\n`;
            });
        }

        // 3. Crear el Objeto binario (Blob) y forzar la descarga en el navegador
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

    } else if (formato === 'pdf') {
        showToast("Abriendo asistente de impresión PDF...");
        // Forzamos la ejecución del hilo de impresión nativo del sistema operativo
        setTimeout(() => {
            window.print();
        }, 500);
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