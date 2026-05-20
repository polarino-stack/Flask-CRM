/**
 * ==========================================================================
 * CRM RESTAURANTE: MÓDULO DE GESTIÓN DE PERSONAL (CORE JS)
 * ==========================================================================
 */

// 1. ESTADO GLOBAL DE LA APLICACIÓN (Simulación de Base de Datos / Preparado para API)
let employees = [
    {
        id: "1",
        name: "Carlos Martínez",
        email: "carlos.m@restaurante.com",
        phone: "600123456",
        role: "SUPERVISOR", // Jefe de sala
        shift: "Completo (Partido)",
        schedule: "12:30-16:30, 20:00-00:00",
        status: "ACTIVO",
        joinDate: "2024-01-15",
        avatar: "",
        username: "cmartinez"
    },
    {
        id: "2",
        name: "Lucía Gómez",
        email: "lucia.g@restaurante.com",
        phone: "611987654",
        role: "CAMARERO",
        shift: "Tarde",
        schedule: "16:00 - 00:00",
        status: "TRABAJANDO",
        joinDate: "2025-03-10",
        avatar: "",
        username: "lgomez"
    },
    {
        id: "3",
        name: "Miguel Ruiz",
        email: "miguel.r@restaurante.com",
        phone: "622456789",
        role: "COCINA",
        shift: "Mañana",
        schedule: "08:00 - 16:00",
        status: "BAJA",
        joinDate: "2023-11-01",
        avatar: "",
        username: "mruiz"
    }
];

// Registro en memoria de asistencias (Fichajes)
let attendanceHistory = [];

// 2. SELECTORES DE ELEMENTOS DEL DOM
const personalTableBody = document.getElementById("personal-table-body");
const searchInput = document.getElementById("search-employee");
const filterRole = document.getElementById("filter-role");
const filterStatus = document.getElementById("filter-status");

const employeeModal = document.getElementById("employee-modal");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const formEmployee = document.getElementById("form-employee");
const modalTitle = document.getElementById("modal-title");

// Inputs del formulario
const empIdInput = document.getElementById("employee-id");
const empNameInput = document.getElementById("emp-name");
const empEmailInput = document.getElementById("emp-email");
const empPhoneInput = document.getElementById("emp-phone");
const empRoleInput = document.getElementById("emp-role");
const empShiftInput = document.getElementById("emp-shift");
const empScheduleInput = document.getElementById("emp-schedule");
const empDateInput = document.getElementById("emp-date");
const empStatusInput = document.getElementById("emp-status");
const empAvatarInput = document.getElementById("emp-avatar");
const empUsernameInput = document.getElementById("emp-username");
const empPasswordInput = document.getElementById("emp-password");

// 3. INICIALIZADOR DEL MÓDULO
document.addEventListener("DOMContentLoaded", () => {
    // Si tienes localStorage y quieres persistencia local inmediata:
    if (localStorage.getItem("crm_employees")) {
        employees = JSON.parse(localStorage.getItem("crm_employees"));
    }
    initApp();
});

function initApp() {
    renderEmployeeTable();
    calculateDashboardStats();
    setupEventListeners();
}

// 4. ESCUCHADORES DE EVENTOS (EVENT LISTENERS)
function setupEventListeners() {
    // Filtros e hilos dinámicos de búsqueda
    searchInput.addEventListener("input", filterAndRender);
    filterRole.addEventListener("change", filterAndRender);
    filterStatus.addEventListener("change", filterAndRender);

    // Control de ventanas Modales
    btnOpenModal.addEventListener("click", () => openModalStructure());
    btnCloseModal.addEventListener("click", closeModalStructure);

    // Cierre al pulsar fuera de la caja blanca del modal
    employeeModal.addEventListener("click", (e) => {
        if (e.target === employeeModal) closeModalStructure();
    });

    // Envío del Formulario (Creación o Edición)
    formEmployee.addEventListener("submit", handleFormSubmit);
}

// 5. RENDERIZACIÓN Y FILTRADO DE LA TABLA
function filterAndRender() {
    const searchText = searchInput.value.toLowerCase().trim();
    const roleVal = filterRole.value;
    const statusVal = filterStatus.value;

    const filtered = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchText) ||
            emp.email.toLowerCase().includes(searchText) ||
            emp.role.toLowerCase().includes(searchText);

        const matchesRole = (roleVal === "TODOS" || emp.role === roleVal);
        const matchesStatus = (statusVal === "TODOS" || emp.status === statusVal);

        return matchesSearch && matchesRole && matchesStatus;
    });

    renderTableRows(filtered);
}

function renderEmployeeTable() {
    renderTableRows(employees);
}

function renderTableRows(dataArray) {
    personalTableBody.innerHTML = "";

    if (dataArray.length === 0) {
        personalTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #64748b; padding: 32px;">
                    Ningún empleado coincide con los criterios de búsqueda actuales.
                </td>
            </tr>
        `;
        return;
    }

    dataArray.forEach(emp => {
        const tr = document.createElement("tr");

        // Obtener iniciales para el avatar de respaldo
        const initials = emp.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        const avatarHTML = emp.avatar
            ? `<img src="${emp.avatar}" class="profile-cell-avatar" alt="${emp.name}">`
            : `<div class="profile-cell-avatar thumb-fallback">${initials}</div>`;

        tr.innerHTML = `
            <td>
                <div class="profile-cell-wrapper">
                    ${avatarHTML}
                    <div class="profile-cell-info">
                        <span class="profile-cell-name">${emp.name}</span>
                        <span class="profile-cell-sub">${emp.email}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="profile-cell-info">
                    <span class="profile-cell-name" style="font-size: 13px;">${emp.role}</span>
                    <span class="profile-cell-sub">${emp.phone}</span>
                </div>
            </td>
            <td>
                <div class="profile-cell-info">
                    <span class="profile-cell-name" style="font-size: 13px; font-weight:500;">${emp.shift}</span>
                    <span class="profile-cell-sub">⏱️ ${emp.schedule}</span>
                </div>
            </td>
            <td><span style="color: #64748b; font-size: 13px;">${emp.joinDate}</span></td>
            <td><span class="badge status-${emp.status.toLowerCase()}">${emp.status}</span></td>
            <td>
                <div class="row-actions">
                    <button class="action-btn-pill btn-edit" onclick="editEmployee('${emp.id}')" title="Editar ficha">Editar</button>
                    <button class="action-btn-pill btn-attendance" onclick="toggleAttendance('${emp.id}')" title="Simular Registro de Fichaje">Fichar</button>
                    <button class="action-btn-pill btn-delete" onclick="deleteEmployee('${emp.id}')" title="Dar de baja">Eliminar</button>
                </div>
            </td>
        `;
        personalTableBody.appendChild(tr);
    });
}

// 6. CÁLCULO DE MÉTRICAS DINÁMICAS (INTEGRACIÓN DASHBOARD)
function calculateDashboardStats() {
    const total = employees.length;
    const working = employees.filter(e => e.status === "TRABAJANDO").length;
    const active = employees.filter(e => e.status === "ACTIVO").length;
    const absent = employees.filter(e => e.status === "BAJA").length;

    document.getElementById("stat-total").innerText = total;
    document.getElementById("stat-working").innerText = working;
    document.getElementById("stat-active").innerText = active;
    document.getElementById("stat-absent").innerText = absent;
}

function updateStorage() {
    localStorage.setItem("crm_employees", JSON.stringify(employees));
    calculateDashboardStats();
}

// 7. LÓGICA CRUD (MANTENIENDO LA BASE ORIGINAL MEJORADA)
function openModalStructure(employeeObj = null) {
    employeeModal.classList.add("open");
    if (employeeObj) {
        modalTitle.innerText = "Modificar Ficha de Empleado";
        empIdInput.value = employeeObj.id;
        empNameInput.value = employeeObj.name;
        empEmailInput.value = employeeObj.email;
        empPhoneInput.value = employeeObj.phone;
        empRoleInput.value = employeeObj.role;
        empShiftInput.value = employeeObj.shift;
        empScheduleInput.value = employeeObj.schedule;
        empDateInput.value = employeeObj.joinDate;
        empStatusInput.value = employeeObj.status;
        empAvatarInput.value = employeeObj.avatar;
        empUsernameInput.value = employeeObj.username;
        empPasswordInput.value = "••••••••"; // Contraseña enmascarada
        empPasswordInput.required = false; // No obligatoria al editar
    } else {
        modalTitle.innerText = "Registrar Nuevo Empleado";
        formEmployee.reset();
        empIdInput.value = "";
        empPasswordInput.required = true;
    }
}

function closeModalStructure() {
    employeeModal.classList.remove("open");
    formEmployee.reset();
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = empIdInput.value;
    const newEmployeeData = {
        name: empNameInput.value.trim(),
        email: empEmailInput.value.trim(),
        phone: empPhoneInput.value.trim(),
        role: empRoleInput.value,
        shift: empShiftInput.value,
        schedule: empScheduleInput.value.trim(),
        joinDate: empDateInput.value,
        status: empStatusInput.value,
        avatar: empAvatarInput.value.trim(),
        username: empUsernameInput.value.trim()
    };

    if (id) {
        // OPERACIÓN: EDICIÓN / ACTUALIZACIÓN
        const index = employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            // Si modificaron la contraseña, la actualizamos
            if (empPasswordInput.value && empPasswordInput.value !== "••••••••") {
                newEmployeeData.password = empPasswordInput.value;
            } else {
                newEmployeeData.password = employees[index].password;
            }
            newEmployeeData.id = id;
            employees[index] = newEmployeeData;
            showToastNotification(`Ficha de ${newEmployeeData.name} actualizada.`);
        }
    } else {
        // OPERACIÓN: CREACIÓN / NUEVO EMPLEADO
        newEmployeeData.id = Date.now().toString(); // ID único temporal
        newEmployeeData.password = empPasswordInput.value;
        employees.push(newEmployeeData);
        showToastNotification(`Empleado ${newEmployeeData.name} contratado con éxito.`);
    }

    updateStorage();
    filterAndRender();
    closeModalStructure();
}

function editEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (employee) openModalStructure(employee);
}

function deleteEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    // Confirmación nativa elegante integrada
    const confirmDelete = confirm(`¿Estás completamente seguro de que deseas dar de baja o eliminar a ${employee.name}?`);
    if (confirmDelete) {
        employees = employees.filter(e => e.id !== id);
        showToastNotification(`Se eliminó la ficha de ${employee.name}.`, "danger");
        updateStorage();
        filterAndRender();
    }
}

// 8. EXTRAS: SISTEMA DE ASISTENCIA / FICHAJE (SIMULADO EN TIEMPO REAL)
window.toggleAttendance = function (id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    const rightNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (employee.status !== "TRABAJANDO") {
        employee.status = "TRABAJANDO";
        attendanceHistory.push({ id: employee.id, name: employee.name, checkIn: rightNow, checkOut: null });
        showToastNotification(`⏱️ ${employee.name} ha marcado ENTRADA a las ${rightNow}.`);
    } else {
        employee.status = "ACTIVO";
        const record = attendanceHistory.find(r => r.id === employee.id && !r.checkOut);
        if (record) record.checkOut = rightNow;
        showToastNotification(`⏱️ ${employee.name} ha marcado SALIDA a las ${rightNow}.`);
    }

    updateStorage();
    filterAndRender();
};

// 9. TOAST NOTIFICATIONS COMPONENT
function showToastNotification(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type === "danger" ? "toast-danger" : ""}`;

    // Personalización sutil para alertas de borrado si es requerido
    if (type === "danger") {
        toast.style.background = "#ef4444";
    }

    toast.innerText = message;
    container.appendChild(toast);

    // Eliminación automática para evitar saturar el DOM
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Exportar funciones al scope global para que los atributos 'onclick' de las filas las localicen
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;