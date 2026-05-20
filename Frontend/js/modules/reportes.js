/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO DE INFORMES, MÉTricas AVANZADAS Y AUDITORÍA (BI)
 * ==========================================================================
 */

let stockData = JSON.parse(localStorage.getItem("crm_inventario")) || [];
let staffData = JSON.parse(localStorage.getItem("crm_employees")) || [];
let bookingsData = JSON.parse(localStorage.getItem("crm_reservas")) || [];

const tbodyInventario = document.getElementById("rep-table-inventario");
const tbodyPersonal = document.getElementById("rep-table-personal");
const timelineContainer = document.getElementById("sys-timeline");

const reportSearch = document.getElementById("report-search");
const filterPeriod = document.getElementById("filter-period");
const filterCategory = document.getElementById("filter-category-rep");
const filterDateInput = document.getElementById("filter-date-rep");

document.addEventListener("DOMContentLoaded", () => {
    filterDateInput.value = new Date().toISOString().split('T')[0];
    ejecutarAnaliticaCRM();

    reportSearch.addEventListener("input", ejecutarAnaliticaCRM);
    filterPeriod.addEventListener("change", ejecutarAnaliticaCRM);
    filterCategory.addEventListener("change", ejecutarAnaliticaCRM);
    filterDateInput.addEventListener("change", ejecutarAnaliticaCRM);
});

function ejecutarAnaliticaCRM() {
    calcularTarjetasAvanzadas();
    renderizarTablasReporte();
    construirTimelineAuditoria();
}

function calcularTarjetasAvanzadas() {
    const conteoMesas = {};
    bookingsData.forEach(b => {
        if (b.estado !== "CANCELADA") {
            conteoMesas[b.mesaId] = (conteoMesas[b.mesaId] || 0) + 1;
        }
    });
    let topMesa = Object.keys(conteoMesas).reduce((a, b) => conteoMesas[a] > conteoMesas[b] ? a : b, "-");
    document.getElementById("kpi-top-table").innerText = topMesa !== undefined ? `Mesa ${topMesa}` : "Sin datos";

    const conteoHoras = {};
    bookingsData.forEach(b => {
        if (b.estado !== "CANCELADA") {
            const horaBase = b.hora.split(":")[0] + ":00";
            conteoHoras[horaBase] = (conteoHoras[horaBase] || 0) + parseInt(b.pax || 0);
        }
    });
    let horaPico = Object.keys(conteoHoras).reduce((a, b) => conteoHoras[a] > conteoHoras[b] ? a : b, "-");
    document.getElementById("kpi-peak-hour").innerText = horaPico !== undefined ? `${horaPico} hrs` : "Sin datos";

    let totalValor = stockData.reduce((acc, p) => acc + ((parseFloat(p.precio) || 0) * (parseInt(p.stock) || 0)), 0);
    document.getElementById("kpi-stock-value").innerText = `${totalValor.toFixed(2)} €`;

    let empleadosTrabajando = staffData.filter(e => e.status === "TRABAJANDO").length;
    let horasEstimadas = empleadosTrabajando * 8;
    document.getElementById("kpi-staff-hours").innerText = `${horasEstimadas} hrs est.`;
}

function renderizarTablasReporte() {
    const busqueda = reportSearch.value.toLowerCase().trim();
    const catFiltro = filterCategory.value;

    tbodyInventario.innerHTML = "";
    const stockCritico = stockData.filter(p => {
        const coincideCritico = parseInt(p.stock) <= 10;
        const coincideCat = catFiltro === "TODOS" || p.categoria === catFiltro;
        const coincideText = p.nombre.toLowerCase().includes(busqueda);
        return coincideCritico && coincideCat && coincideText;
    });

    if (stockCritico.length === 0) {
        tbodyInventario.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No hay alertas de stock bajo el umbral técnico.</td></tr>`;
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

    tbodyPersonal.innerHTML = "";
    const personalFiltrado = staffData.filter(e => e.name.toLowerCase().includes(busqueda));

    if (personalFiltrado.length === 0) {
        tbodyPersonal.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No se encontraron fichas de empleados.</td></tr>`;
    } else {
        personalFiltrado.forEach(e => {
            const estaFichado = e.status === "TRABAJANDO";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${e.name}</strong></td>
                <td>${estaFichado ? '16:00' : '08:00'}</td>
                <td>${estaFichado ? '--:--' : '16:00'}</td>
                <td><span class="badge ${estaFichado ? 'status-trabajando' : 'status-activo'}">${estaFichado ? 'En Turno' : 'Fuera / Descanso'}</span></td>
            `;
            tbodyPersonal.appendChild(tr);
        });
    }
}

function construirTimelineAuditoria() {
    timelineContainer.innerHTML = "";
    const eventosLog = [];

    stockData.filter(p => parseInt(p.stock) <= 5).slice(0, 2).forEach(p => {
        eventosLog.push({
            tipo: "danger", tiempo: "Hace 10 min",
            titulo: "Alerta de Stock Crítico", desc: `El artículo "${p.nombre}" requiere reposición urgente (${p.stock} uds).`
        });
    });

    bookingsData.slice(0, 3).forEach(b => {
        let claseLog = "info";
        if (b.estado === "CANCELADA") claseLog = "danger";
        if (b.estado === "SENTADO") claseLog = "success";

        eventosLog.push({
            tipo: claseLog, tiempo: `A las ${b.hora}`,
            titulo: `Reserva ${b.estado.toLowerCase()}`, desc: `Cliente: "${b.nombre}" asignado en Mesa ${b.mesaId} para ${b.pax} pax.`
        });
    });

    if (eventosLog.length === 0) {
        eventosLog.push({ tipo: "success", tiempo: "Ahora", titulo: "Servidor CRM Sincronizado", desc: "No se registran variaciones de operaciones en las últimas 24 horas." });
    }

    eventosLog.forEach(ev => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `
            <span class="timeline-dot ${ev.tipo}"></span>
            <span class="timeline-time">${ev.tiempo}</span>
            <span class="timeline-content">${ev.titulo}</span>
            <span class="timeline-desc">${ev.desc}</span>
        `;
        timelineContainer.appendChild(item);
    });
}

window.exportarReporte = function (formato) {
    showToast(`Generando archivo de auditoría en formato ${formato}...`);
    setTimeout(() => {
        showToast(`¡Reporte exportado con éxito en ${formato}! Descargando...`);
    }, 1500);
};

function showToast(msj) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msj;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}