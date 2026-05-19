// Guardamos las referencias de los gráficos globalmente para poder destruirlos si se duplican
let salesChartInstance = null;
let reservasChartInstance = null;
let stockChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    // Le damos un margen de 50ms al navegador para asegurar que las vistas y el layout estén bien inyectados
    setTimeout(() => {
        initSalesChart();
        initReservasChart();
        initStockChart();
    }, 50);
});

// 1. Gráfico de Ventas Semanales (Lineal)
function initSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Si ya existía la instancia, la destruimos por completo
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
            datasets: [{
                label: 'Ventas (€)',
                data: [850, 1100, 950, 1400, 1800, 2400, 2100],
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
            maintainAspectRatio: false, // Ahora funciona seguro porque el CSS tiene height fijo
            resizeDelay: 100, // Retrasa el cálculo de redimensión si estiras la ventana para que no rompa
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// 2. Gráfico de Reservas (Circular/Doughnut)
function initReservasChart() {
    const canvas = document.getElementById('reservasChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (reservasChartInstance) {
        reservasChartInstance.destroy();
    }

    reservasChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Finalizadas', 'Pendientes', 'Canceladas'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });
}

// 3. Gráfico de Stock/Categorías (Barra)
function initStockChart() {
    const canvas = document.getElementById('stockChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (stockChartInstance) {
        stockChartInstance.destroy();
    }

    stockChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Bebidas', 'Carnes', 'Pastas', 'Postres', 'Vinos'],
            datasets: [{
                label: 'Ventas por categoría',
                data: [450, 600, 320, 210, 540],
                backgroundColor: '#1e293b',
                borderRadius: 6,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });
}