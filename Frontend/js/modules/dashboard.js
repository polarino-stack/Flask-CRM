/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO PANEL PRINCIPAL CENTRALIZADO (DASHBOARD)
 * ==========================================================================
 */

// 1. DATA DE RESPALDO (FALLBACKS EN CASO DE ALMACENAMIENTO VACÍO)
const productosInicialesDashboard = [
    { id: 1, nombre: "Coca Cola", categoria: "BEBIDAS", precio: 1.50, stock: 48 },
    { id: 4, nombre: "Agua", categoria: "BEBIDAS", precio: 1.00, stock: 72 },
    { id: 24, nombre: "Tomate", categoria: "FRUTAS Y VEGETALES", precio: 0.80, stock: 40 },
    { id: 25, nombre: "Patata", categoria: "FRUTAS Y VEGETALES", precio: 0.50, stock: 55 }
];

// 2. EXTRACTORES DE ESTADOS VIVOS COMPARTIDOS (LOCALSTORAGE)
let datosInventario = JSON.parse(localStorage.getItem("crm_inventario")) || productosInicialesDashboard;
let datosPersonal = JSON.parse(localStorage.getItem("crm_employees")) || [];
let datosReservas = JSON.parse(localStorage.getItem("crm_reservas")) || [];
let cajaAlineada = localStorage.getItem("crm_ventas_acumuladas") || "1240.50";

//Cargar la info de configuración del local para pintar el nombre personalizado
let infoRestauranteLive = JSON.parse(localStorage.getItem("crm_restaurant_info")) || { nombre: "La Trattoria Premium" };

// Instancias de Gráficos de Control Global
let salesChartInstance = null;
let reservasChartInstance = null;
let stockChartInstance = null;

// 3. EVENTO PRINCIPAL DE ARRANQUE Y RENDERIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    // Fuerza a la barra superior a pintar el nombre que se guarda en Configuración
    const compName = document.getElementById("restaurant-name");
    if (compName) compName.innerText = infoRestauranteLive.nombre;

    // ==========================================================================
    // CAPTURAR SESION ACTIVA INGRESA Y CAMBIAR LOS DATOS DE LA BARRA SUPERIOR
    // ==========================================================================
    const loggedName = localStorage.getItem("crm_logged_user_name") || "Julio Admin";
    const loggedRole = localStorage.getItem("crm_logged_user_role") || "Administrador";

    const headerName = document.getElementById("header-user-name");
    const headerRole = document.getElementById("header-user-role");
    const headerAvatar = document.getElementById("header-user-avatar");

    if (headerName) headerName.innerText = loggedName;
    if (headerRole) headerRole.innerText = loggedRole;

    if (headerAvatar) {
        // Extrae las iniciales del nombre real de forma automática (Ej: "Lucía Gómez" -> "LG")
        const iniciales = loggedName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        headerAvatar.innerText = iniciales;
    }

    // ==========================================================================
    // INYECTAR DATOS EXTRA DE CONFIGURACIÓN EN EL PANEL DE BIENVENIDA
    // ==========================================================================
    const metaDir = document.getElementById("meta-dir");
    const metaTel = document.getElementById("meta-tel");
    const metaEmail = document.getElementById("meta-email");
    const metaSchedule = document.getElementById("meta-schedule");

    if (metaDir) metaDir.innerText = `📍 ${infoRestauranteLive.direccion || 'No configurada'}`;
    if (metaTel) metaTel.innerText = `📞 ${infoRestauranteLive.telefono || '--'}`;
    if (metaEmail) metaEmail.innerText = `✉️ ${infoRestauranteLive.email || '--'}`;
    if (metaSchedule) metaSchedule.innerText = `⏱️ ${infoRestauranteLive.horario || '--'}`;

    // Sincronizar KPIs numéricos en tiempo real
    sincronizarMetricasSaaS();

    // Renderizado reactivo de gráficos analíticos
    setTimeout(() => {
        initSalesChart();
        initReservasChart();
        initStockChart();
    }, 50);
});

// 4. LÓGICA DE MÉTRICAS COMPARTIDAS EN TIEMPO REAL
function sincronizarMetricasSaaS() {
    // REFRESH: Volvemos a leer el LocalStorage para capturar cambios de otras pestañas en vivo
    const inventarioVivo = JSON.parse(localStorage.getItem("crm_inventario")) || productosInicialesDashboard;
    const personalVivo = JSON.parse(localStorage.getItem("crm_employees")) || [];
    const reservasVivas = JSON.parse(localStorage.getItem("crm_reservas")) || [];

    // ==========================================================================
    // KPI 1: RESERVAS HOY Y % OCUPACIÓN 
    // ==========================================================================
    const d = new Date();
    const hoyISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const reservasDeHoy = reservasVivas.filter(r => r.fecha === hoyISO);

    // Capacidad real del restaurante (16 mesas configuradas)
    const totalMesasDisponibles = 16;
    const mesasOcupadasHoy = reservasDeHoy.filter(r => r.estado === "CONFIRMADA" || r.estado === "SENTADO" || r.estado === "FINALIZADA").length;
    const porcentajeOcupacion = Math.round((mesasOcupadasHoy / totalMesasDisponibles) * 100) || 0;

    const kpiRes = document.getElementById('kpi-reservas');
    const kpiOcup = document.getElementById('kpi-ocupacion');
    if (kpiRes) kpiRes.innerText = reservasDeHoy.length;
    if (kpiOcup) kpiOcup.innerText = `${porcentajeOcupacion}% Ocupación Sala`;


    // ==========================================================================
    // KPI 2: VENTAS DEL DÍA REALES (Calculado por Comensales de Hoy)
    // ==========================================================================
    const ticketMedioPorPersona = 22.50; // € por cliente de la sala
    let totalVentasHoy = 0;

    // 1. Sumamos la facturación ÚNICAMENTE de las mesas que YA HAN PAGADO (SOLO SE REFLEJA EL PAGO CUANDO SE HAYA FINALIZADO LA RESERVA)
    reservasDeHoy.forEach(r => {
        const est = (r.estado || "").toUpperCase();

        if (est === "FINALIZADA") {
            const clientes = parseInt(r.pax) || 0;
            totalVentasHoy += clientes * ticketMedioPorPersona;
        }
    });

    // Leer las ventas directas a mano y sumar su facturación real al total del día
    // Recorremos el inventario vivo actual para saber el precio de cada unidad cobrada a mano
    const ventasDirectasVivas = JSON.parse(localStorage.getItem("crm_ventas_categorias")) || {};

    inventarioVivo.forEach(producto => {
        const catUpper = producto.categoria.toUpperCase();
        // Si se han registrado unidades vendidas de esta categoría con el botón "Vender 1"
        if (ventasDirectasVivas[catUpper]) {
            const unidadesVendidasAmano = ventasDirectasVivas[catUpper];
        }
    });

    // Leemos cuánto dinero se ha acumulado por ventas directas de productos
    const productosBase = JSON.parse(localStorage.getItem("crm_inventario")) || [];
    let dineroVentasDirectas = 0;

    let totalVentasDirectasProductos = 0;
    const historialVentasModulo = JSON.parse(localStorage.getItem("crm_ventas_categorias")) || {};

    // Buscamos en el inventario para calcular el dinero exacto de las ventas manuales
    inventarioVivo.forEach(p => {
        // Si el stock actual es menor al stock inicial de respaldo de la demo, calculamos la diferencia cobrada
        const prodInicial = productosInicialesDashboard.find(pi => pi.id === p.id);
        if (prodInicial && p.stock < prodInicial.stock) {
            const unidadesVendidas = prodInicial.stock - p.stock;
            totalVentasDirectasProductos += unidadesVendidas * p.precio;
        }
    });

    // Sumamos Sala + Tienda
    let cajaFinalDelDia = totalVentasHoy + totalVentasDirectasProductos;

    // Guardamos la caja real calculada en el LocalStorage
    localStorage.setItem("crm_ventas_acumuladas", cajaFinalDelDia.toFixed(2));

    const kpiVentas = document.getElementById('kpi-ventas');
    if (kpiVentas) kpiVentas.innerText = `${cajaFinalDelDia.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;


    // ==========================================================================
    // KPI 3: STOCK TOTAL Y ALERTAS CRÍTICAS
    // ==========================================================================
    let totalUnidadesStock = inventarioVivo.reduce((acc, p) => acc + (parseInt(p.stock) || 0), 0);
    let alertasAgotados = inventarioVivo.filter(p => parseInt(p.stock) <= 10).length;

    const kpiStock = document.getElementById('kpi-stock-total');
    const kpiAlertas = document.getElementById('kpi-stock-alertas');
    if (kpiStock) kpiStock.innerText = `${totalUnidadesStock} uds`;
    if (kpiAlertas) kpiAlertas.innerText = `${alertasAgotados} Alertas bajo stock`;


    // ==========================================================================
    // KPI 4: PERSONAL TOTAL Y EN TURNO AHORA
    // ==========================================================================
    let totalEmpleados = personalVivo.length;
    let trabajandoAhora = personalVivo.filter(emp => emp.status === "TRABAJANDO").length;

    const kpiStaff = document.getElementById('kpi-staff');
    const kpiStaffSub = document.getElementById('kpi-staff-sub');
    if (kpiStaff) kpiStaff.innerText = totalEmpleados;
    if (kpiStaffSub) kpiStaffSub.innerText = `${trabajandoAhora} En turno ahora`;
}

// ==========================================================================
// 5. INICIALIZADORES GRÁFICOS
// ==========================================================================

// Gráfico 1: Ventas Semanales Dinámicas Basadas en Reservas Realizadas (SISTEMA REAL)
function initSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (salesChartInstance) salesChartInstance.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    const diasSemana = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const ventasCalculadas = [0, 0, 0, 0, 0, 0, 0];
    const ticketMedioPorPersona = 22.50;

    // REFRESH CRÍTICO: Volver a leer las reservas en vivo para que use los datos reales actuales
    const reservasVivasActuales = JSON.parse(localStorage.getItem("crm_reservas")) || [];
    const cajaAlineadaViva = localStorage.getItem("crm_ventas_acumuladas") || "1240.50";

    const hoy = new Date();
    const diaActualSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes...
    const diferenciaAlLunes = diaActualSemana === 0 ? -6 : 1 - diaActualSemana;

    const lunesActual = new Date(hoy);
    lunesActual.setDate(hoy.getDate() + diferenciaAlLunes);
    lunesActual.setHours(0, 0, 0, 0);

    reservasVivasActuales.forEach(reserva => {
        const estadoLimpio = (reserva.estado || "").toUpperCase();
        if (estadoLimpio === "SENTADO" || estadoLimpio === "FINALIZADA") {
            const fechaReserva = new Date(reserva.fecha);

            if (fechaReserva >= lunesActual && fechaReserva <= hoy) {
                let numeroDia = fechaReserva.getDay();
                let indiceSemana = numeroDia === 0 ? 6 : numeroDia - 1;

                const comensales = parseInt(reserva.pax) || 0;
                ventasCalculadas[indiceSemana] += comensales * ticketMedioPorPersona;
            }
        }
    });

    // ==========================================================================
    // SISTEMA REAL: YA NO INYECTAMOS HISTÓRICOS FALSOS DE LA DEMO
    // ==========================================================================
    // Sincronizamos el día de hoy con el valor acumulado real de la caja viva
    let hoyIndex = diaActualSemana === 0 ? 6 : diaActualSemana - 1;
    ventasCalculadas[hoyIndex] = parseFloat(cajaAlineadaViva) || 0;

    // Nota: El resto de días de la semana (Lun, Mar, Mie...) mostrarán 0 
    // a menos que en el localStorage existan reservas reales guardadas en esas fechas.
    // ==========================================================================

    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: diasSemana,
            datasets: [{
                label: 'Ventas (€)',
                data: ventasCalculadas.map(v => Math.round(v)),
                borderColor: '#10b981',
                borderWidth: 3,
                fill: true,
                backgroundColor: gradient,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#1e293b',
                    titleColor: '#94a3b8',
                    bodyColor: '#ffffff',
                    titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
                    padding: 10,
                    borderRadius: 6,
                    callbacks: {
                        label: function (context) {
                            return ` Ventas: ${context.parsed.y.toFixed(2)} €`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, border: { display: false }, grid: { display: false } },
                x: { border: { display: false }, grid: { display: false } }
            }
        }
    });
}
// Gráfico 2: Distribución de Estados de Reservas Real
function initReservasChart() {
    const canvas = document.getElementById('reservasChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (reservasChartInstance) reservasChartInstance.destroy();

    const libroReservasVivo = JSON.parse(localStorage.getItem("crm_reservas")) || [];
    const dChart = new Date();
    const hoyISO = `${dChart.getFullYear()}-${String(dChart.getMonth() + 1).padStart(2, '0')}-${String(dChart.getDate()).padStart(2, '0')}`;

    const reservasDeHoy = libroReservasVivo.filter(r => r.fecha === hoyISO);

    // CONTROL DE ROBUSTEZ: Convertimos a .toUpperCase() para que no falle si se guarda en minúsculas
    let finalizadas = reservasDeHoy.filter(r => (r.estado || "").toUpperCase() === "FINALIZADA").length;
    let activasPendientes = reservasDeHoy.filter(r => {
        const est = (r.estado || "").toUpperCase();
        return est === "PENDIENTE" || est === "CONFIRMADA" || est === "SENTADO";
    }).length;
    let canceladas = reservasDeHoy.filter(r => (r.estado || "").toUpperCase() === "CANCELADA").length;

    // Si todas las métricas reales de hoy son 0, usamos el fallback estético para la demo
    if (finalizadas === 0 && activasPendientes === 0 && canceladas === 0) {
        finalizadas = 5;
        activasPendientes = 3;
        canceladas = 1;
    }

    reservasChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Finalizadas', 'Activas/Pendientes', 'Canceladas'],
            datasets: [{
                data: [finalizadas, activasPendientes, canceladas],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20, font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' } }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#1e293b',
                    callbacks: {
                        label: function (context) {
                            let total = context.dataset.data.reduce((a, b) => a + b, 0);
                            let valor = context.raw || 0;
                            let porcentaje = Math.round((valor / total) * 100) || 0;
                            return ` ${context.label}: ${valor} (${porcentaje}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Gráfico 3: Categorías Más Vendidas Dinámicas
function initStockChart() {
    const canvas = document.getElementById('stockChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (stockChartInstance) stockChartInstance.destroy();

    // REFRESH EN VIVO COHERENTE
    const libroReservasVivo = JSON.parse(localStorage.getItem("crm_reservas")) || [];

    // CARGAR VENTAS DIRECTAS DEL STORAGE
    const ventasDirectasVivas = JSON.parse(localStorage.getItem("crm_ventas_categorias")) || {
        'BEBIDAS': 0, 'BEBIDAS ALCOHÓLICAS': 0, 'EMBUTIDOS': 0, 'CONDIMENTOS': 0, 'FRUTAS Y VEGETALES': 0
    };

    // Inicializamos el mapa con los valores que ya se hayan vendido directamente a mano
    const ventasPorCategoria = {
        'BEBIDAS': ventasDirectasVivas['BEBIDAS'] || 0,
        'BEBIDAS ALCOHÓLICAS': ventasDirectasVivas['BEBIDAS ALCOHÓLICAS'] || 0,
        'EMBUTIDOS': ventasDirectasVivas['EMBUTIDOS'] || 0,
        'CONDIMENTOS': ventasDirectasVivas['CONDIMENTOS'] || 0,
        'FRUTAS Y VEGETALES': ventasDirectasVivas['FRUTAS Y VEGETALES'] || 0
    };

    const ratioConsumoPorPersona = {
        'BEBIDAS': 1.2, 'BEBIDAS ALCOHÓLICAS': 0.5, 'EMBUTIDOS': 0.3, 'CONDIMENTOS': 0.2, 'FRUTAS Y VEGETALES': 0.6
    };

    libroReservasVivo.forEach(reserva => {
        const estadoLimpio = (reserva.estado || "").toUpperCase();
        // Incluimos CONFIRMADA, SENTADO y FINALIZADA para que la gráfica tenga datos en cuanto se acepte una mesa
        if (estadoLimpio === "CONFIRMADA" || estadoLimpio === "SENTADO" || estadoLimpio === "FINALIZADA") {
            const comensales = parseInt(reserva.pax) || 0;

            Object.keys(ventasPorCategoria).forEach(cat => {
                const ratio = ratioConsumoPorPersona[cat] || 0;
                ventasPorCategoria[cat] += comensales * ratio;
            });
        }
    });

    const totalUnidadesVendidas = Object.values(ventasPorCategoria).reduce((a, b) => a + b, 0);
    if (totalUnidadesVendidas === 0) {
        ventasPorCategoria['BEBIDAS'] = 252;
        ventasPorCategoria['BEBIDAS ALCOHÓLICAS'] = 40;
        ventasPorCategoria['EMBUTIDOS'] = 53;
        ventasPorCategoria['CONDIMENTOS'] = 81;
        ventasPorCategoria['FRUTAS Y VEGETALES'] = 104;
    }

    let etiquetas = Object.keys(ventasPorCategoria);
    let valores = Object.values(ventasPorCategoria);

    stockChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetas.map(str => str.charAt(0) + str.slice(1).toLowerCase()),
            datasets: [{
                label: 'Unidades vendidas',
                data: valores.map(v => Math.round(v)),
                backgroundColor: '#1e293b',
                borderRadius: 6,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true, backgroundColor: '#1e293b' }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });
}