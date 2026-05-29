/**
 * ==========================================================================
 * CRM RESTAURANTE: CAPA DE CONEXIÓN CON SPRING BOOT (MÓDULO PRODUCTOS)
 * ==========================================================================
 */

let inventario = [];
let categoriasRaw = {};

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
        categoriasRaw = await response.json();

        // Poblamos los dropdowns automáticamente
        poblarFiltrosDeCategorias();
    } catch (error) {
        console.error("🔴 Error al recuperar las categorías de la API:", error);
    }
}

function poblarFiltrosDeCategorias() {
    const filterSelect = document.getElementById("category-filter");
    const modalSelect = document.getElementById("prod-category");
    const listaCategorias = Object.keys(categoriasRaw);

    // 1. Poblamos el filtro del catálogo general
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="TODOS">Todas las Categorías</option>';
        listaCategorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.toUpperCase();
            opt.innerText = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            filterSelect.appendChild(opt);
        });
    }

    // 2. Poblamos el desplegable del formulario de agregar productos
    if (modalSelect) {
        modalSelect.innerHTML = '<option value="">Selecciona categoría...</option>';
        listaCategorias.forEach(cat => {
            const opt = document.createElement("option");
            // Guardamos el string plano como value
            opt.value = cat;
            opt.innerText = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            modalSelect.appendChild(opt);
        });
    }
}

// Control de los tres estados de stock para los KPIs superiores
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

// Renderizado dinámico de la tabla con sincronización total en Rojo (0) y Amarillo (1-10)
function renderizarTabla(listaFiltrada = inventario) {
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;
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
        } else if (stockReal <= 10) {
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
                <button class="action-btn sell" onclick="registrarVentaDirecta(${p.id})" ${stockReal === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Vender 1</button>
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

window.abrirModal = function (id = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('form-product');
    const title = document.getElementById('modal-title');

    form.reset();
    modal.classList.add('open');

    if (id) {
        title.innerText = "Modificar Existencias / Producto";
        const p = inventario.find(prod => prod.id === id);

        let categoriaVal = "";
        if (p.categoria) {
            categoriaVal = p.categoria.nombre || "";
        }

        document.getElementById('product-id').value = p.id;
        document.getElementById('prod-name').value = p.nombre;
        document.getElementById('prod-category').value = categoriaVal;
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
    const categoriaSelect = document.getElementById('prod-category');
    const categoriaVal = categoriaSelect.value;
    const precio = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);

    // Formateamos la primera letra en mayúscula (ej: "Bebida")
    const formatoCategoriaCorrecto = categoriaVal.charAt(0).toUpperCase() + categoriaVal.slice(1).toLowerCase();

    // Intentamos extraer el ID numérico de la categoría de la lista si existiera
    const subListaMapeada = categoriasRaw[formatoCategoriaCorrecto] || [];
    let idCategoriaEncontrado = null;
    if (subListaMapeada.length > 0 && subListaMapeada[0].categoria) {
        idCategoriaEncontrado = subListaMapeada[0].categoria.id;
    }

    // MULTI-BLINDAJE JSON: Enviamos todas las variantes posibles de mapeo
    const payload = {
        nombre: nombre,
        precio: precio,
        cantidad: stock,
        nombreCategoria: formatoCategoriaCorrecto, // Para el CrearProductoStockRequest plano
        categoriaId: idCategoriaEncontrado,        // Por si pide el ID plano
        categoria: {                               // Objeto completo por si usa Hibernate Relacional
            id: idCategoriaEncontrado,
            nombre: formatoCategoriaCorrecto
        }
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_BASE_URL}/stock/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(id), ...payload })
            });
            if (response.ok) showToast("Producto actualizado correctamente.");
        } else {
            response = await fetch(`${API_BASE_URL}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) showToast("Nuevo producto añadido al catálogo.");
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Error de validación interna");
        }

        cerrarModal();
        await cargarInventarioDesdeAPI();

    } catch (error) {
        console.error("🔴 Error detallado de Spring Boot:", error);
        showToast("Error al guardar: " + error.message);
    }
}

window.eliminarProducto = async function (id) {
    if (confirm("¿Estás completamente seguro de eliminar este producto del inventario?")) {
        try {
            const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
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
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}