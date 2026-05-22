const productosIniciales = [
    { id: 1, nombre: "Coca Cola", categoria: "BEBIDAS", precio: 1.50, stock: 48 },
    { id: 2, nombre: "Fanta Naranja", categoria: "BEBIDAS", precio: 1.50, stock: 36 },
    { id: 3, nombre: "Fanta Limón", categoria: "BEBIDAS", precio: 1.50, stock: 34 },
    { id: 4, nombre: "Agua", categoria: "BEBIDAS", precio: 1.00, stock: 72 },
    { id: 5, nombre: "Nestea", categoria: "BEBIDAS", precio: 1.60, stock: 30 },
    { id: 6, nombre: "Nestea Maracuyá", categoria: "BEBIDAS", precio: 1.60, stock: 24 },
    { id: 7, nombre: "Tónica", categoria: "BEBIDAS", precio: 1.40, stock: 20 },
    { id: 8, nombre: "Ballantines", categoria: "BEBIDAS ALCOHÓLICAS", precio: 4.50, stock: 8 },
    { id: 9, nombre: "Red Label", categoria: "BEBIDAS ALCOHÓLICAS", precio: 4.50, stock: 7 },
    { id: 10, nombre: "Sigrams", categoria: "BEBIDAS ALCOHÓLICAS", precio: 5.00, stock: 6 },
    { id: 11, nombre: "Puerto de Indias", categoria: "BEBIDAS ALCOHÓLICAS", precio: 5.50, stock: 9 },
    { id: 12, nombre: "Barceló", categoria: "BEBIDAS ALCOHÓLICAS", precio: 4.80, stock: 5 },
    { id: 13, nombre: "Brugal", categoria: "BEBIDAS ALCOHÓLICAS", precio: 4.80, stock: 6 },
    { id: 14, nombre: "Queso", categoria: "EMBUTIDOS", precio: 2.20, stock: 12 },
    { id: 15, nombre: "Jamón Serrano", categoria: "EMBUTIDOS", precio: 3.00, stock: 10 },
    { id: 16, nombre: "Jamón Dulce", categoria: "EMBUTIDOS", precio: 1.80, stock: 9 },
    { id: 17, nombre: "Fuet", categoria: "EMBUTIDOS", precio: 2.00, stock: 14 },
    { id: 18, nombre: "Chorizo", categoria: "EMBUTIDOS", precio: 1.95, stock: 11 },
    { id: 19, nombre: "Sal", categoria: "CONDIMENTOS", precio: 0.30, stock: 20 },
    { id: 20, nombre: "Pimienta", categoria: "CONDIMENTOS", precio: 0.50, stock: 18 },
    { id: 21, nombre: "Tomillo", categoria: "CONDIMENTOS", precio: 0.45, stock: 15 },
    { id: 22, nombre: "Ajo en Polvo", categoria: "CONDIMENTOS", precio: 0.60, stock: 16 },
    { id: 23, nombre: "Pimiento", categoria: "CONDIMENTOS", precio: 0.55, stock: 13 },
    { id: 24, nombre: "Tomate", categoria: "FRUTAS Y VEGETALES", precio: 0.80, stock: 40 },
    { id: 25, nombre: "Patata", categoria: "FRUTAS Y VEGETALES", precio: 0.50, stock: 55 }
];

let inventario = JSON.parse(localStorage.getItem("crm_inventario")) || productosIniciales;

document.addEventListener("DOMContentLoaded", () => {
    guardarEnLocalStorage();
    renderizarTabla();
    actualizarTarjetasEstadisticas();

    document.getElementById('btn-open-modal').addEventListener('click', () => abrirModal());
    document.getElementById('btn-close-modal').addEventListener('click', cerrarModal);
    document.getElementById('form-product').addEventListener('submit', guardarProducto);

    document.getElementById('product-search').addEventListener('input', filtrarInventario);
    document.getElementById('category-filter').addEventListener('change', filtrarInventario);
});

function guardarEnLocalStorage() {
    localStorage.setItem("crm_inventario", JSON.stringify(inventario));
}

function actualizarTarjetasEstadisticas() {
    // 1. REFRESH: Forzamos a la función a leer los datos más nuevos del almacén
    const inventarioVivo = JSON.parse(localStorage.getItem("crm_inventario")) || [];

    let totalUnidades = 0;
    let pocoStock = 0;
    let agotados = 0;

    // 2. Recorremos el buffer vivo del LocalStorage
    inventarioVivo.forEach(p => {
        const stockActual = parseInt(p.stock) || 0;

        totalUnidades += stockActual;

        if (stockActual === 0) {
            agotados++;
        } else if (stockActual <= 10) {
            pocoStock++; // Cuenta +1 por cada producto diferente que esté entre 1 y 10 unidades
        }
    });

    // 3. Inyectamos los contadores puros en los ganchos del DOM
    if (document.getElementById('stat-total-stock')) {
        document.getElementById('stat-total-stock').innerText = totalUnidades;
    }
    if (document.getElementById('stat-low-stock')) {
        document.getElementById('stat-low-stock').innerText = pocoStock;
    }
    if (document.getElementById('stat-out-stock')) {
        document.getElementById('stat-out-stock').innerText = agotados;
    }
}

function renderizarTabla(listaFiltrada = inventario) {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = "";

    if (listaFiltrada.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No se encontraron productos.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(p => {
        let badgeClass = "success";
        let badgeText = "Correcto";

        if (p.stock === 0) {
            badgeClass = "danger";
            badgeText = "Agotado";
        } else if (p.stock <= 10) {
            badgeClass = "warning";
            badgeText = "Bajo Stock";
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:600;">${p.nombre}</td>
            <td style="color:var(--text-muted); font-size:13px;">${p.categoria}</td>
            <td>${p.precio.toFixed(2)} €</td>
            <td style="font-weight:700;">${p.stock}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td>
                <button class="action-btn sell" onclick="registrarVentaDirecta(${p.id})">Vender 1</button>
                <button class="action-btn edit" onclick="abrirModal(${p.id})">Editar</button>
                <button class="action-btn delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarInventario() {
    const busqueda = document.getElementById('product-search').value.toLowerCase();
    const categoria = document.getElementById('category-filter').value;

    const resultado = inventario.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(busqueda) || p.categoria.toLowerCase().includes(busqueda);
        const coincideCategoria = (categoria === "TODOS" || p.categoria === categoria);
        return coincideNombre && coincideCategoria;
    });

    renderizarTabla(resultado);
}

window.registrarVentaDirecta = function (id) {
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    if (producto.stock > 0) {
        producto.stock--;

        let ventasTotales = parseFloat(localStorage.getItem("crm_ventas_acumuladas")) || 1240.50;
        ventasTotales += producto.precio;
        localStorage.setItem("crm_ventas_acumuladas", ventasTotales.toFixed(2));

        // ==========================================================================
        // GUARDAR LA VENTA DIRECTA POR CATEGORÍA
        // ==========================================================================
        let historialCategorias = JSON.parse(localStorage.getItem("crm_ventas_categorias")) || {
            'BEBIDAS': 0, 'BEBIDAS ALCOHÓLICAS': 0, 'EMBUTIDOS': 0, 'CONDIMENTOS': 0, 'FRUTAS Y VEGETALES': 0
        };

        // Sumamos una unidad a la categoría de este producto de forma estricta
        const catUpper = producto.categoria.toUpperCase();
        if (historialCategorias[catUpper] !== undefined) {
            historialCategorias[catUpper]++;
            localStorage.setItem("crm_ventas_categorias", JSON.stringify(historialCategorias));
        }

        guardarEnLocalStorage();
        renderizarTabla();
        actualizarTarjetasEstadisticas();
        showToast(`Venta registrada: 1 unidad de ${producto.nombre} descontada.`);
    } else {
        showToast(`Error: ${producto.nombre} está totalmente agotado.`);
    }
};

window.abrirModal = function (id = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('form-product');
    const title = document.getElementById('modal-title');

    form.reset();
    modal.classList.add('open');

    if (id) {
        title.innerText = "Modificar Existencias / Producto";
        const p = inventario.find(prod => prod.id === id);
        document.getElementById('product-id').value = p.id;
        document.getElementById('prod-name').value = p.nombre;
        document.getElementById('prod-category').value = p.categoria;
        document.getElementById('prod-price').value = p.precio;
        document.getElementById('prod-stock').value = p.stock;
    } else {
        title.innerText = "Agregar Nuevo Producto";
        document.getElementById('product-id').value = "";
    }
};

window.cerrarModal = function () {
    document.getElementById('product-modal').classList.remove('open');
};

function guardarProducto(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const nombre = document.getElementById('prod-name').value;
    const categoria = document.getElementById('prod-category').value;
    const precio = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);

    if (id) {
        const index = inventario.findIndex(p => p.id === parseInt(id));
        inventario[index] = { id: parseInt(id), nombre, categoria, precio, stock };
        showToast("Producto actualizado correctamente.");
    } else {
        const nuevoId = inventario.length > 0 ? Math.max(...inventario.map(p => p.id)) + 1 : 1;
        inventario.push({ id: nuevoId, nombre, categoria, precio, stock });
        showToast("Nuevo producto añadido al catálogo.");
    }

    guardarEnLocalStorage();
    cerrarModal();
    filtrarInventario();
    actualizarTarjetasEstadisticas();
}

window.eliminarProducto = function (id) {
    if (confirm("¿Estás completamente seguro de eliminar este producto del inventario?")) {
        inventario = inventario.filter(p => p.id !== id);
        guardarEnLocalStorage();
        filtrarInventario();
        actualizarTarjetasEstadisticas();
        showToast("Producto eliminado de la base de datos.");
    }
};

function showToast(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}