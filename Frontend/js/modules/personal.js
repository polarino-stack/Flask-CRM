document.addEventListener("DOMContentLoaded", () => {
    const api = window.crmApi;
    const { escapeHtml } = window.crmUtils;

    const state = {
        empleados: [],
        editingId: null,
        search: ""
    };

    const form = document.getElementById("empleado-form");
    const notice = document.getElementById("personal-notice");
    const tableBody = document.getElementById("personal-table-body");
    const searchInput = document.getElementById("personal-search");
    const summary = document.getElementById("personal-summary");
    const totalChip = document.getElementById("personal-total-chip");
    const hoursChip = document.getElementById("personal-hours-chip");
    const formTitle = document.getElementById("empleado-form-title");
    const submitButton = document.getElementById("empleado-submit");
    const cancelButton = document.getElementById("empleado-cancel");

    const fields = {
        id: document.getElementById("empleado-id"),
        nombre: document.getElementById("empleado-nombre"),
        apellido: document.getElementById("empleado-apellido"),
        dni: document.getElementById("empleado-dni"),
        telefono: document.getElementById("empleado-telefono"),
        horasSemanales: document.getElementById("empleado-horas-semanales"),
        horasMensuales: document.getElementById("empleado-horas-mensuales")
    };

    form.addEventListener("submit", handleSubmit);
    cancelButton.addEventListener("click", resetForm);
    searchInput.addEventListener("input", (event) => {
        state.search = event.target.value.trim().toLowerCase();
        renderTable();
        renderSummary();
    });

    loadEmpleados();

    async function loadEmpleados() {
        try {
            setNotice("");
            state.empleados = await api.get("/empleados");
            renderSummary();
            renderTable();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function renderSummary() {
        const filtered = getFilteredEmpleados();
        const totalHoras = filtered.reduce((acc, empleado) => acc + Number(empleado.horasSemanales || 0), 0);

        totalChip.textContent = `${state.empleados.length} empleados`;
        hoursChip.textContent = `${totalHoras} horas semanales`;
        summary.innerHTML = `
            <span class="summary-chip">${filtered.length} visibles</span>
            <span class="summary-chip">${totalHoras} horas filtradas</span>
        `;
    }

    function renderTable() {
        const empleados = getFilteredEmpleados();

        if (!empleados.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">No hay empleados para mostrar.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = empleados.map((empleado) => `
            <tr>
                <td>
                    <div class="stack">
                        <strong>${escapeHtml(`${empleado.nombre} ${empleado.apellido}`)}</strong>
                        <span class="muted">ID ${empleado.id}</span>
                    </div>
                </td>
                <td>${escapeHtml(empleado.dni || "-")}</td>
                <td>${escapeHtml(empleado.numeroTelefono || "-")}</td>
                <td>
                    <div class="stack">
                        <span><strong>${escapeHtml(String(empleado.horasSemanales ?? 0))}</strong> h/semana</span>
                        <span class="muted">${escapeHtml(String(empleado.horasMensuales ?? 0))} h/mes</span>
                    </div>
                </td>
                <td>
                    <div class="row-actions">
                        <button class="btn-icon secondary" data-action="edit" data-id="${empleado.id}">Editar</button>
                        <button class="btn-icon danger" data-action="delete" data-id="${empleado.id}">Borrar</button>
                    </div>
                </td>
            </tr>
        `).join("");

        tableBody.querySelectorAll("[data-action='edit']").forEach((button) => {
            button.addEventListener("click", () => editEmpleado(Number(button.dataset.id)));
        });

        tableBody.querySelectorAll("[data-action='delete']").forEach((button) => {
            button.addEventListener("click", () => deleteEmpleado(Number(button.dataset.id)));
        });
    }

    function getFilteredEmpleados() {
        if (!state.search) {
            return state.empleados;
        }

        return state.empleados.filter((empleado) => {
            const hayCoincidencia = [
                empleado.nombre,
                empleado.apellido,
                empleado.dni
            ].some((value) => String(value || "").toLowerCase().includes(state.search));
            return hayCoincidencia;
        });
    }

    function editEmpleado(id) {
        const empleado = state.empleados.find((item) => Number(item.id) === id);
        if (!empleado) {
            return;
        }

        state.editingId = id;
        fields.id.value = id;
        fields.nombre.value = empleado.nombre || "";
        fields.apellido.value = empleado.apellido || "";
        fields.dni.value = empleado.dni || "";
        fields.telefono.value = empleado.numeroTelefono || "";
        fields.horasSemanales.value = empleado.horasSemanales ?? "";
        fields.horasMensuales.value = empleado.horasMensuales ?? "";
        submitButton.textContent = "Actualizar empleado";
        cancelButton.hidden = false;
        formTitle.textContent = "Editar empleado";
        setNotice("Editando empleado. Cambia los campos y guarda los cambios.", "success");
        fields.nombre.focus();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            nombre: fields.nombre.value.trim(),
            apellido: fields.apellido.value.trim(),
            dni: fields.dni.value.trim(),
            numeroTelefono: fields.telefono.value.trim() || null,
            horasSemanales: Number(fields.horasSemanales.value),
            horasMensuales: Number(fields.horasMensuales.value)
        };

        try {
            if (state.editingId) {
                await api.put(`/empleados/${state.editingId}`, payload);
                setNotice("Empleado actualizado correctamente.", "success");
            } else {
                await api.post("/empleados", payload);
                setNotice("Empleado guardado correctamente.", "success");
            }

            resetForm();
            await loadEmpleados();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    async function deleteEmpleado(id) {
        const empleado = state.empleados.find((item) => Number(item.id) === id);
        if (!empleado || !window.confirm(`Borrar a ${empleado.nombre} ${empleado.apellido}?`)) {
            return;
        }

        try {
            await api.del(`/empleados/${id}`);
            setNotice("Empleado borrado correctamente.", "success");
            if (state.editingId === id) {
                resetForm();
            }
            await loadEmpleados();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function resetForm() {
        state.editingId = null;
        form.reset();
        fields.id.value = "";
        fields.horasSemanales.value = "";
        fields.horasMensuales.value = "";
        submitButton.textContent = "Guardar empleado";
        cancelButton.hidden = true;
        formTitle.textContent = "Nuevo empleado";
        setNotice("");
    }

    function setNotice(message, type = "") {
        notice.textContent = message;
        notice.className = `notice${type ? ` ${type}` : ""}`;
    }
});
