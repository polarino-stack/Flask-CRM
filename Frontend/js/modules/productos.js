document.addEventListener("DOMContentLoaded", () => {
    const api = window.crmApi;
    const { escapeHtml } = window.crmUtils;

    const state = {
        productos: [],
        editingId: null,
        search: ""
    };

    const form = document.getElementById("producto-form");
    const notice = document.getElementById("productos-notice");
    const tableBody = document.getElementById("productos-table-body");
    const searchInput = document.getElementById("producto-search");
    const summary = document.getElementById("productos-summary");
    const totalChip = document.getElementById("productos-total-chip");
    const alertChip = document.getElementById("productos-alerta-chip");
    const formTitle = document.getElementById("producto-form-title");
    const submitButton = document.getElementById("producto-submit");
    const cancelButton = document.getElementById("producto-cancel");
    const categoryList = document.getElementById("categorias-list");

    const fields = {
        id: document.getElementById("producto-id"),
        categoria: document.getElementById("producto-categoria"),
        nombre: document.getElementById("producto-nombre"),
        cantidad: document.getElementById("producto-cantidad"),
        stockMinimo: document.getElementById("producto-stock-minimo"),
        unidad: document.getElementById("producto-unidad"),
        telefono: document.getElementById("producto-telefono")
    };

    form.addEventListener("submit", handleSubmit);
    cancelButton.addEventListener("click", resetForm);
    searchInput.addEventListener("input", (event) => {
        state.search = event.target.value.trim().toLowerCase();
        renderSummary();
        renderTable();
    });

    loadProductos();

    async function loadProductos() {
        try {
            setNotice("");
            state.productos = await api.get("/stock");
            renderCategoryList();
            renderSummary();
            renderTable();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function renderCategoryList() {
        const categorias = [...new Set(state.productos.map((producto) => producto.categoria?.nombre).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        categoryList.innerHTML = categorias.map((categoria) => `<option value="${escapeHtml(categoria)}"></option>`).join("");
    }

    function renderSummary() {
        const filtered = getFilteredProductos();
        const lowStock = filtered.filter((producto) => Number(producto.cantidad || 0) <= Number(producto.stockMinimo || 0)).length;
        const totalUnits = filtered.reduce((acc, producto) => acc + Number(producto.cantidad || 0), 0);

        totalChip.textContent = `${state.productos.length} productos`;
        alertChip.textContent = `${state.productos.filter((producto) => Number(producto.cantidad || 0) <= Number(producto.stockMinimo || 0)).length} bajo minimo`;
        summary.innerHTML = `
            <span class="summary-chip">${filtered.length} visibles</span>
            <span class="summary-chip">${totalUnits} unidades filtradas</span>
            <span class="summary-chip">${lowStock} alertas en filtro</span>
        `;
    }

    function renderTable() {
        const productos = getFilteredProductos();

        if (!productos.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">No hay productos para mostrar.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = productos.map((producto) => {
            const lowStock = Number(producto.cantidad || 0) <= Number(producto.stockMinimo || 0);
            const stockBadge = lowStock ? "badge warning" : "badge active";
            const stockLabel = lowStock ? "Bajo minimo" : "OK";

            return `
                <tr>
                    <td>
                        <div class="stack">
                            <strong>${escapeHtml(producto.categoria?.nombre || "-")}</strong>
                            <span class="muted">ID ${producto.id}</span>
                        </div>
                    </td>
                    <td>${escapeHtml(producto.nombre || "-")}</td>
                    <td>
                        <div class="stack">
                            <strong>${escapeHtml(String(producto.cantidad ?? 0))}</strong>
                            <span class="${stockBadge}">${stockLabel}</span>
                        </div>
                    </td>
                    <td>${escapeHtml(String(producto.stockMinimo ?? 0))}</td>
                    <td>${escapeHtml(producto.unidadMedida || "-")}</td>
                    <td>${escapeHtml(producto.telefonoProveedor || "-")}</td>
                    <td>
                        <div class="row-actions">
                            <button class="btn-icon secondary" data-action="edit" data-id="${producto.id}">Editar</button>
                            <button class="btn-icon danger" data-action="delete" data-id="${producto.id}">Borrar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        tableBody.querySelectorAll("[data-action='edit']").forEach((button) => {
            button.addEventListener("click", () => editProducto(Number(button.dataset.id)));
        });

        tableBody.querySelectorAll("[data-action='delete']").forEach((button) => {
            button.addEventListener("click", () => deleteProducto(Number(button.dataset.id)));
        });
    }

    function getFilteredProductos() {
        if (!state.search) {
            return state.productos;
        }

        return state.productos.filter((producto) => {
            return [
                producto.categoria?.nombre,
                producto.nombre,
                producto.telefonoProveedor,
                producto.unidadMedida
            ].some((value) => String(value || "").toLowerCase().includes(state.search));
        });
    }

    function editProducto(id) {
        const producto = state.productos.find((item) => Number(item.id) === id);
        if (!producto) {
            return;
        }

        state.editingId = id;
        fields.id.value = id;
        fields.categoria.value = producto.categoria?.nombre || "";
        fields.nombre.value = producto.nombre || "";
        fields.cantidad.value = producto.cantidad ?? "";
        fields.stockMinimo.value = producto.stockMinimo ?? "";
        fields.unidad.value = producto.unidadMedida || "unidades";
        fields.telefono.value = producto.telefonoProveedor || "";
        submitButton.textContent = "Actualizar producto";
        cancelButton.hidden = false;
        formTitle.textContent = "Editar producto";
        setNotice("Editando producto. Cambia los datos y guarda los cambios.", "success");
        fields.categoria.focus();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            categoriaNombre: fields.categoria.value.trim(),
            nombre: fields.nombre.value.trim(),
            cantidad: Number(fields.cantidad.value),
            stockMinimo: fields.stockMinimo.value === "" ? null : Number(fields.stockMinimo.value),
            unidadMedida: fields.unidad.value.trim() || "unidades",
            telefonoProveedor: fields.telefono.value.trim() || null
        };

        try {
            if (state.editingId) {
                await api.put(`/stock/${state.editingId}`, payload);
                setNotice("Producto actualizado correctamente.", "success");
            } else {
                await api.post("/stock", payload);
                setNotice("Producto guardado correctamente.", "success");
            }

            resetForm();
            await loadProductos();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    async function deleteProducto(id) {
        const producto = state.productos.find((item) => Number(item.id) === id);
        if (!producto || !window.confirm(`Borrar el producto ${producto.nombre}?`)) {
            return;
        }

        try {
            await api.del(`/stock/${id}`);
            setNotice("Producto borrado correctamente.", "success");
            if (state.editingId === id) {
                resetForm();
            }
            await loadProductos();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function resetForm() {
        state.editingId = null;
        form.reset();
        fields.id.value = "";
        fields.unidad.value = "unidades";
        submitButton.textContent = "Guardar producto";
        cancelButton.hidden = true;
        formTitle.textContent = "Nuevo producto";
        setNotice("");
    }

    function setNotice(message, type = "") {
        notice.textContent = message;
        notice.className = `notice${type ? ` ${type}` : ""}`;
    }
});
