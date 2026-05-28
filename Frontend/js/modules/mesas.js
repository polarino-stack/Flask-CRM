document.addEventListener("DOMContentLoaded", () => {
    const api = window.crmApi;
    const { escapeHtml } = window.crmUtils;

    const state = {
        mesas: [],
        editingId: null,
        search: ""
    };

    const form = document.getElementById("mesa-form");
    const notice = document.getElementById("mesas-notice");
    const tableBody = document.getElementById("mesas-table-body");
    const searchInput = document.getElementById("mesa-search");
    const summary = document.getElementById("mesas-summary");
    const totalChip = document.getElementById("mesas-total-chip");
    const capacityChip = document.getElementById("mesas-capacidad-chip");
    const formTitle = document.getElementById("mesa-form-title");
    const submitButton = document.getElementById("mesa-submit");
    const cancelButton = document.getElementById("mesa-cancel");

    const fields = {
        id: document.getElementById("mesa-id"),
        numero: document.getElementById("mesa-numero"),
        capacidad: document.getElementById("mesa-capacidad")
    };

    form.addEventListener("submit", handleSubmit);
    cancelButton.addEventListener("click", resetForm);
    searchInput.addEventListener("input", (event) => {
        state.search = event.target.value.trim().toLowerCase();
        renderSummary();
        renderTable();
    });

    loadMesas();

    async function loadMesas() {
        try {
            setNotice("");
            state.mesas = await api.get("/mesas");
            renderSummary();
            renderTable();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function renderSummary() {
        const filtered = getFilteredMesas();
        const totalCapacidad = filtered.reduce((acc, mesa) => acc + Number(mesa.capacidad || 0), 0);

        totalChip.textContent = `${state.mesas.length} mesas`;
        capacityChip.textContent = `${state.mesas.reduce((acc, mesa) => acc + Number(mesa.capacidad || 0), 0)} plazas`;
        summary.innerHTML = `
            <span class="summary-chip">${filtered.length} visibles</span>
            <span class="summary-chip">${totalCapacidad} plazas filtradas</span>
        `;
    }

    function renderTable() {
        const mesas = getFilteredMesas();

        if (!mesas.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        <div class="empty-state">No hay mesas para mostrar.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = mesas.map((mesa) => `
            <tr>
                <td>
                    <div class="stack">
                        <strong>Mesa ${escapeHtml(String(mesa.numeroMesa))}</strong>
                        <span class="muted">ID ${mesa.id}</span>
                    </div>
                </td>
                <td>${escapeHtml(String(mesa.capacidad ?? 0))} plazas</td>
                <td>
                    <div class="row-actions">
                        <button class="btn-icon secondary" data-action="edit" data-id="${mesa.id}">Editar</button>
                        <button class="btn-icon danger" data-action="delete" data-id="${mesa.id}">Borrar</button>
                    </div>
                </td>
            </tr>
        `).join("");

        tableBody.querySelectorAll("[data-action='edit']").forEach((button) => {
            button.addEventListener("click", () => editMesa(Number(button.dataset.id)));
        });

        tableBody.querySelectorAll("[data-action='delete']").forEach((button) => {
            button.addEventListener("click", () => deleteMesa(Number(button.dataset.id)));
        });
    }

    function getFilteredMesas() {
        if (!state.search) {
            return state.mesas;
        }

        return state.mesas.filter((mesa) => {
            return [
                mesa.numeroMesa,
                mesa.capacidad
            ].some((value) => String(value ?? "").toLowerCase().includes(state.search));
        });
    }

    function editMesa(id) {
        const mesa = state.mesas.find((item) => Number(item.id) === id);
        if (!mesa) {
            return;
        }

        state.editingId = id;
        fields.id.value = id;
        fields.numero.value = mesa.numeroMesa ?? "";
        fields.capacidad.value = mesa.capacidad ?? "";
        submitButton.textContent = "Actualizar mesa";
        cancelButton.hidden = false;
        formTitle.textContent = "Editar mesa";
        setNotice("Editando mesa. Cambia los datos y guarda los cambios.", "success");
        fields.numero.focus();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            numeroMesa: Number(fields.numero.value),
            capacidad: Number(fields.capacidad.value)
        };

        try {
            if (state.editingId) {
                await api.put(`/mesas/${state.editingId}`, payload);
                setNotice("Mesa actualizada correctamente.", "success");
            } else {
                await api.post("/mesas", payload);
                setNotice("Mesa guardada correctamente.", "success");
            }

            resetForm();
            await loadMesas();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    async function deleteMesa(id) {
        const mesa = state.mesas.find((item) => Number(item.id) === id);
        if (!mesa || !window.confirm(`Borrar la mesa ${mesa.numeroMesa}?`)) {
            return;
        }

        try {
            await api.del(`/mesas/${id}`);
            setNotice("Mesa borrada correctamente.", "success");
            if (state.editingId === id) {
                resetForm();
            }
            await loadMesas();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function resetForm() {
        state.editingId = null;
        form.reset();
        fields.id.value = "";
        submitButton.textContent = "Guardar mesa";
        cancelButton.hidden = true;
        formTitle.textContent = "Nueva mesa";
        setNotice("");
    }

    function setNotice(message, type = "") {
        notice.textContent = message;
        notice.className = `notice${type ? ` ${type}` : ""}`;
    }
});
