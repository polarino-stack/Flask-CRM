// ==========================================================================
// CRM RESTAURANTE: CAPA DE CONEXIÓN CON SPRING BOOT (MÓDULO PRODUCTOS)
// ==========================================================================
// Mapeo clásico: la variable API_BASE_URL viene cargada globalmente desde config.js

let inventario = [];
let listaCategoriasVivas = []; // Buffer para guardar las categorías reales de la API

document.addEventListener("DOMContentLoaded", () => {
    // Inicialización del catálogo asíncrono
    cargarInventarioDesdeAPI();

    document.getElementById('btn-open-modal').addEventListener('click', () => abrirModal());
    document.getElementById('btn-close-modal').addEventListener('click', cerrarModal);
    document.getElementById('form-product').addEventListener('submit', guardarProducto);

    document.getElementById('product-search').addEventListener('input', filtrarInventario);
    document.getElementById('category-filter').addEventListener('change', filtrarInventario);
});

// ==========================================================================
// 1. OPERACIÓN READ (GET): Traer productos y categorías en vivo
// ==========================================================================
async function cargarInventarioDesdeAPI() {
    try {
        console.log("Conectando con el endpoint de productos en:", `${API_BASE_URL}/stock`);
        const response = await fetch(`${API_BASE_URL}/stock`);

        if (!response.ok) throw new Error(`Fallo en servidor Java: ${response.status}`);
        inventario = await response.json();

        // Llamamos a la API de categorías para renderizar los selectores dinámicos
        await cargarCategoriasDesdeAPI();

        // Sincronizamos la interfaz de usuario con los datos reales
        renderizarTabla(inventario);
        actualizarTarjetasEstadisticas(inventario);

    } catch (error) {
        console.error("🔴 Error al conectar con Spring Boot:", error);
        showToast("Error de conexión con la base de datos.");
    }
}

async function cargarCategoriasDesdeAPI() {
    try {
        console.log("Conectando con el endpoint de categorías en:", `${API_BASE_URL}/stock/categorias`);
        const response = await fetch(`${API_BASE_URL}/stock/categorias`);

        if (!response.ok) throw new Error();
        const dataCategorias = await response.json();

        // Extraemos los nombres de las categorías del JSON de tu amigo ("Bebida", etc.)
        listaCategoriasVivas = Object.keys(dataCategorias);

        // Poblamos los dropdowns automáticamente
        poblarFiltrosDeCategorias();
    } catch (error) {
        console.error("🔴 Error al recuperar las categorías de la API:", error);
    }
}

function poblarFiltrosDeCategorias() {
    const filterSelect = document.getElementById("category-filter");
    const modalSelect = document.getElementById("prod-category");

    // 1. Poblamos el filtro del catálogo general
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="TODOS">Todas las Categorías</option>';
        listaCategoriasVivas.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.toUpperCase();
            opt.innerText = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            filterSelect.appendChild(opt);
        });
    }

    // 2. Poblamos el desplegable del formulario de agregar productos
    if (modalSelect) {
        modalSelect.innerHTML = '';
        listaCategoriasVivas.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.toUpperCase();
            opt.innerText = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            modalSelect.appendChild(opt);
        });
    }
}

function actualizarTarjetasEstadisticas(inventarioVivo) {
    let totalUnidades = 0;
    let pocoStock = 0;
    let agotados = 0;

    inventarioVivo.forEach(p => {
        const stockActual = parseInt(p.cantidad) || 0;
        totalUnidades += stockActual;

        if (stockActual === 0) {
            agotados++;
        } else if (stockActual <= 10) {
            pocoStock++;
        }
    });

    if (document.getElementById('stat-total-stock')) document.getElementById('stat-total-stock').innerText = totalUnidades;
    if (document.getElementById('stat-low-stock')) document.getElementById('stat-low-stock').innerText = pocoStock;
    if (document.getElementById('stat-out-stock')) document.getElementById('stat-out-stock').innerText = agotados;
}

function renderizarTabla(listaFiltrada = inventario) {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = "";

    if (listaFiltrada.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No se encontraron productos.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(p => {
        const stockReal = parseInt(p.cantidad) || 0;
        const categoriaReal = p.categoria && p.categoria.nombre ? p.categoria.nombre.toUpperCase() : "SIN CATEGORÍA";
        const precioReal = p.precio ? parseFloat(p.precio) : 1.50;

        let badgeClass = "success";
        let badgeText = "Correcto";

        if (stockReal === 0) {
            badgeClass = "danger";
            badgeText = "Agotado";
        } else if (stockReal <= 40) {
            badgeClass = "warning";
            badgeText = "Bajo Stock";
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:600;">${p.nombre}</td>
            <td style="color:var(--text-muted); font-size:13px;">${categoriaReal}</td>
            <td>${precioReal.toFixed(2)} €</td>
            <td style="font-weight:700;">${stockReal}</td>
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
    const categoriaFiltro = document.getElementById('category-filter').value;

    const resultado = inventario.filter(p => {
        const categoriaProducto = p.categoria && p.categoria.nombre ? p.categoria.nombre.toUpperCase() : "";
        const coincideNombre = p.nombre.toLowerCase().includes(busqueda) || categoriaProducto.toLowerCase().includes(busqueda);
        const coincideCategoria = (categoriaFiltro === "TODOS" || categoriaProducto === categoriaFiltro);
        return coincideNombre && coincideCategoria;
    });

    renderizarTabla(resultado);
}

// ==========================================================================
// 2. TRANSACTORES EN VIVO (PUT): Venta Directa y descuento de Stock
// ==========================================================================
window.registrarVentaDirecta = async function (id) {
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    const stockReal = parseInt(producto.cantidad) || 0;

    if (stockReal > 0) {
        try {
            const nuevoStock = stockReal - 1;
            const response = await fetch(`${API_BASE_URL}/stock/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...producto,
                    cantidad: nuevoStock
                })
            });

            if (!response.ok) throw new Error();
            showToast(`Venta registrada: 1 unidad de ${producto.nombre} descontada.`);
            await cargarInventarioDesdeAPI();

        } catch (error) {
            console.error(error);
            showToast("Fallo al registrar la transacción.");
        }
    } else {
        showToast(`Error: ${producto.nombre} está totalmente agotado.`);
    }
};

// ==========================================================================
// 3. MODALES Y FORMULARIOS: Vincular datos para Create / Update
// ==========================================================================
window.abrirModal = function (id = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('form-product');
    const title = document.getElementById('modal-title');

    form.reset();
    modal.classList.add('open');

    if (id) {
        title.innerText = "Modificar Existencias / Producto";
        const p = inventario.find(prod => prod.id === id);
        const categoriaActual = p.categoria && p.categoria.nombre ? p.categoria.nombre.toUpperCase() : "";

        document.getElementById('product-id').value = p.id;
        document.getElementById('prod-name').value = p.nombre;
        document.getElementById('prod-category').value = categoriaActual;
        document.getElementById('prod-price').value = p.precio || 1.50;
        document.getElementById('prod-stock').value = p.cantidad || 0;
    } else {
        title.innerText = "Agregar Nuevo Producto";
        document.getElementById('product-id').value = "";
    }
};

window.cerrarModal = function () {
    document.getElementById('product-modal').classList.remove('open');
};

// ==========================================================================
// 4. OPERACIONES CREATE / UPDATE (POST & PUT)
// ==========================================================================
async function guardarProducto(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const nombre = document.getElementById('prod-name').value;
    const categoriaStr = document.getElementById('prod-category').value;
    const precio = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);

    const payload = {
        nombre,
        categoria: { nombre: categoriaStr.charAt(0) + categoriaStr.slice(1).toLowerCase() },
        precio,
        cantidad: stock
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_BASE_URL}/stock/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(id), ...payload })
            });
            if (response.ok) showToast("Producto actualizado correctamente.");
        } else {
            response = await fetch(`${API_BASE_URL}/stock/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) showToast("Nuevo producto añadido al catálogo.");
        }

        if (!response.ok) throw new Error("Fallo en la persistencia de datos.");

        cerrarModal();
        await cargarInventarioDesdeAPI();

    } catch (error) {
        console.error(error);
        showToast("Error al guardar los cambios en la API.");
    }
}

// ==========================================================================
// 5. OPERACIÓN DELETE (DELETE)
// ==========================================================================
window.eliminarProducto = async function (id) {
    if (confirm("¿Estás completamente seguro de eliminar este producto del inventario?")) {
        try {
            const response = await fetch(`${API_BASE_URL}/stock/productos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error("No se pudo eliminar de la base de datos.");

            showToast("Producto eliminado de la base de datos.");
            await cargarInventarioDesdeAPI();

        } catch (error) {
            console.error(error);
            showToast("Error al procesar la baja del producto.");
        }
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