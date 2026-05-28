document.addEventListener("DOMContentLoaded", () => {
    const api = window.crmApi;
    const { escapeHtml, formatDate, formatTime, toDateInput, toTimeInput, todayValue } = window.crmUtils;

    const state = {
        reservas: [],
        mesas: [],
        turnos: [],
        editingId: null,
        search: ""
    };

    const form = document.getElementById("reserva-form");
    const notice = document.getElementById("reservas-notice");
    const tableBody = document.getElementById("reservas-table-body");
    const searchInput = document.getElementById("reserva-search");
    const filterDateInput = document.getElementById("reserva-filter-date");
    const summary = document.getElementById("reservas-summary");
    const totalChip = document.getElementById("reservas-total-chip");
    const confirmedChip = document.getElementById("reservas-confirmadas-chip");
    const cancelledChip = document.getElementById("reservas-canceladas-chip");
    const formTitle = document.getElementById("reserva-form-title");
    const submitButton = document.getElementById("reserva-submit");
    const cancelButton = document.getElementById("reserva-cancel");

    const fields = {
        id: document.getElementById("reserva-id"),
        fecha: document.getElementById("reserva-fecha"),
        mesa: document.getElementById("reserva-mesa"),
        turno: document.getElementById("reserva-turno"),
        personas: document.getElementById("reserva-personas"),
        horaInicio: document.getElementById("reserva-hora-inicio"),
        horaFin: document.getElementById("reserva-hora-fin"),
        cliente: document.getElementById("reserva-cliente"),
        telefono: document.getElementById("reserva-telefono"),
        observaciones: document.getElementById("reserva-observaciones")
    };

    filterDateInput.value = todayValue();
    fields.fecha.value = todayValue();

    form.addEventListener("submit", handleSubmit);
    cancelButton.addEventListener("click", resetForm);
    searchInput.addEventListener("input", (event) => {
        state.search = event.target.value.trim().toLowerCase();
        renderSummary();
        renderTable();
    });
    filterDateInput.addEventListener("change", loadReservas);

    initialize();

    async function initialize() {
        try {
            setNotice("");
            await Promise.all([loadMesas(), loadTurnos()]);
            await loadReservas();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    async function loadMesas() {
        state.mesas = await api.get("/mesas");
        renderMesaSelect();
    }

    async function loadTurnos() {
        state.turnos = await api.get("/turnos");
        renderTurnoSelect();
    }

    async function loadReservas() {
        try {
            setNotice("");
            const fecha = filterDateInput.value || todayValue();
            const query = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
            state.reservas = await api.get(`/reservas${query}`);
            renderSummary();
            renderTable();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function renderMesaSelect() {
        const currentValue = fields.mesa.value;
        fields.mesa.innerHTML = `
            <option value="">Selecciona una mesa</option>
            ${state.mesas.map((mesa) => `
                <option value="${mesa.id}">Mesa ${escapeHtml(String(mesa.numeroMesa))} - ${escapeHtml(String(mesa.capacidad))} plazas</option>
            `).join("")}
        `;
        fields.mesa.value = currentValue || "";
    }

    function renderTurnoSelect() {
        const currentValue = fields.turno.value;
        fields.turno.innerHTML = `
            <option value="">Selecciona un turno</option>
            ${state.turnos.map((turno) => `
                <option value="${turno.id}">
                    ${escapeHtml(turno.nombre)} (${formatTime(turno.horaInicio)} - ${formatTime(turno.horaFin)})
                </option>
            `).join("")}
        `;
        fields.turno.value = currentValue || "";
    }

    function renderSummary() {
        const filtered = getFilteredReservas();
        const confirmed = filtered.filter((reserva) => reserva.estado === "CONFIRMADA").length;
        const cancelled = filtered.filter((reserva) => reserva.estado === "CANCELADA").length;

        totalChip.textContent = `${state.reservas.length} reservas`;
        confirmedChip.textContent = `${state.reservas.filter((reserva) => reserva.estado === "CONFIRMADA").length} confirmadas`;
        cancelledChip.textContent = `${state.reservas.filter((reserva) => reserva.estado === "CANCELADA").length} canceladas`;
        summary.innerHTML = `
            <span class="summary-chip">${filtered.length} visibles</span>
            <span class="summary-chip">${confirmed} confirmadas</span>
            <span class="summary-chip">${cancelled} canceladas</span>
        `;
    }

    function renderTable() {
        const reservas = getFilteredReservas();

        if (!reservas.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        <div class="empty-state">No hay reservas para mostrar.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = reservas.map((reserva) => {
            const mesaLabel = reserva.mesa ? `Mesa ${reserva.mesa.numeroMesa}` : "-";
            const turnoLabel = reserva.turno ? reserva.turno.nombre : "-";
            const badgeClass = getEstadoBadgeClass(reserva.estado);
            const nextStatus = reserva.estado === "CANCELADA" ? "CONFIRMADA" : "CANCELADA";
            const nextStatusLabel = reserva.estado === "CANCELADA" ? "Confirmar" : "Cancelar";

            return `
                <tr>
                    <td>${escapeHtml(formatDate(reserva.fechaReserva || reserva.fechaHoraInicio))}</td>
                    <td>
                        <div class="stack">
                            <strong>${escapeHtml(formatTime(reserva.horaInicio || reserva.fechaHoraInicio))}</strong>
                            <span class="muted">${escapeHtml(formatTime(reserva.horaFin))}</span>
                        </div>
                    </td>
                    <td>
                        <div class="stack">
                            <strong>${escapeHtml(reserva.nombreCliente || "-")}</strong>
                            <span class="muted">${escapeHtml(reserva.observaciones || "-")}</span>
                        </div>
                    </td>
                    <td>${escapeHtml(mesaLabel)}</td>
                    <td>${escapeHtml(String(reserva.numeroPersonas ?? 0))}</td>
                    <td>${escapeHtml(turnoLabel)}</td>
                    <td><span class="badge ${badgeClass}">${escapeHtml(reserva.estado || "-")}</span></td>
                    <td>
                        <div class="stack">
                            <strong>${escapeHtml(reserva.telefonoCliente || "-")}</strong>
                            <span class="muted">ID ${reserva.id}</span>
                        </div>
                    </td>
                    <td>
                        <div class="row-actions">
                            <button class="btn-icon secondary" data-action="edit" data-id="${reserva.id}">Editar</button>
                            <button class="btn-icon secondary" data-action="state" data-id="${reserva.id}" data-next-state="${nextStatus}">${escapeHtml(nextStatusLabel)}</button>
                            <button class="btn-icon danger" data-action="delete" data-id="${reserva.id}">Borrar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        tableBody.querySelectorAll("[data-action='edit']").forEach((button) => {
            button.addEventListener("click", () => editReserva(Number(button.dataset.id)));
        });

        tableBody.querySelectorAll("[data-action='delete']").forEach((button) => {
            button.addEventListener("click", () => deleteReserva(Number(button.dataset.id)));
        });

        tableBody.querySelectorAll("[data-action='state']").forEach((button) => {
            button.addEventListener("click", () => changeState(Number(button.dataset.id), button.dataset.nextState));
        });
    }

    function getFilteredReservas() {
        const dateFilter = filterDateInput.value;
        const filteredByDate = dateFilter
            ? state.reservas.filter((reserva) => toDateInput(reserva.fechaReserva || reserva.fechaHoraInicio) === dateFilter)
            : state.reservas;

        if (!state.search) {
            return filteredByDate;
        }

        return filteredByDate.filter((reserva) => {
            return [
                reserva.nombreCliente,
                reserva.telefonoCliente,
                reserva.observaciones,
                reserva.estado,
                reserva.mesa?.numeroMesa,
                reserva.turno?.nombre
            ].some((value) => String(value || "").toLowerCase().includes(state.search));
        });
    }

    function editReserva(id) {
        const reserva = state.reservas.find((item) => Number(item.id) === id);
        if (!reserva) {
            return;
        }

        state.editingId = id;
        fields.id.value = id;
        fields.fecha.value = toDateInput(reserva.fechaReserva || reserva.fechaHoraInicio);
        fields.mesa.value = reserva.mesa?.id ? String(reserva.mesa.id) : "";
        fields.turno.value = reserva.turno?.id ? String(reserva.turno.id) : "";
        fields.personas.value = reserva.numeroPersonas ?? "";
        fields.horaInicio.value = toTimeInput(reserva.horaInicio || reserva.fechaHoraInicio);
        fields.horaFin.value = toTimeInput(reserva.horaFin || "");
        fields.cliente.value = reserva.nombreCliente || "";
        fields.telefono.value = reserva.telefonoCliente || "";
        fields.observaciones.value = reserva.observaciones || "";
        submitButton.textContent = "Actualizar reserva";
        cancelButton.hidden = false;
        formTitle.textContent = "Editar reserva";
        setNotice("Editando reserva. Cambia los campos y guarda los cambios.", "success");
        fields.cliente.focus();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            mesaId: Number(fields.mesa.value),
            turnoId: Number(fields.turno.value),
            nombreCliente: fields.cliente.value.trim(),
            telefonoCliente: fields.telefono.value.trim() || null,
            numeroPersonas: Number(fields.personas.value),
            fechaReserva: fields.fecha.value,
            horaInicio: fields.horaInicio.value,
            horaFin: fields.horaFin.value,
            observaciones: fields.observaciones.value.trim() || null
        };

        try {
            if (state.editingId) {
                await api.put(`/reservas/${state.editingId}`, payload);
                setNotice("Reserva actualizada correctamente.", "success");
            } else {
                await api.post("/reservas", payload);
                setNotice("Reserva guardada correctamente.", "success");
            }

            resetForm();
            await loadReservas();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    async function changeState(id, nextState) {
        try {
            await api.patch(`/reservas/${id}/estado`, { estado: nextState });
            setNotice(`Reserva actualizada a ${nextState.toLowerCase()}.`, "success");
            await loadReservas();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    async function deleteReserva(id) {
        const reserva = state.reservas.find((item) => Number(item.id) === id);
        if (!reserva || !window.confirm(`Borrar la reserva de ${reserva.nombreCliente}?`)) {
            return;
        }

        try {
            await api.del(`/reservas/${id}`);
            setNotice("Reserva borrada correctamente.", "success");
            if (state.editingId === id) {
                resetForm();
            }
            await loadReservas();
        } catch (error) {
            setNotice(error.message, "error");
        }
    }

    function resetForm() {
        state.editingId = null;
        form.reset();
        fields.id.value = "";
        fields.fecha.value = filterDateInput.value || todayValue();
        fields.horaInicio.value = "";
        fields.horaFin.value = "";
        fields.personas.value = "";
        fields.telefono.value = "";
        fields.observaciones.value = "";
        submitButton.textContent = "Guardar reserva";
        cancelButton.hidden = true;
        formTitle.textContent = "Nueva reserva";
        setNotice("");
    }

    function getEstadoBadgeClass(estado) {
        switch (estado) {
            case "CONFIRMADA":
                return "active";
            case "PENDIENTE":
                return "warning";
            case "CANCELADA":
                return "danger";
            default:
                return "neutral";
        }
    }

    function setNotice(message, type = "") {
        notice.textContent = message;
        notice.className = `notice${type ? ` ${type}` : ""}`;
    }
});
