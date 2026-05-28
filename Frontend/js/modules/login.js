<<<<<<< Updated upstream
// 1. Dejamos el import comentado para que no congele el HTML clásico
//import { API_BASE_URL } from '../config.js';

const API_BASE_URL = "http://172.17.30.202:8082/api";

=======
>>>>>>> Stashed changes
/**
 * ==========================================================================
 * CRM RESTAURANTE: MOTOR DE AUTENTICACIÓN SAAS Y CONTROL DE ACCESO (FRONTEND)
 * ==========================================================================
 */
document.getElementById('form-login').addEventListener('submit', function (e) {
    e.preventDefault();

    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-message');

<<<<<<< Updated upstream
    console.log("Intentando conectar con la API en la dirección:", API_BASE_URL);

    // 1. Obtener clave del Administrador del LocalStorage
    const adminPasswordConfig = localStorage.getItem("crm_admin_password") || "admin1234";

    // 2. SEMILLERO DE SEGURIDAD
=======
    // 1. Obtener clave del Administrador del LocalStorage (Por defecto: admin1234)
    const adminPasswordConfig = localStorage.getItem("crm_admin_password") || "admin1234";

    // 2. SEMILLERO DE SEGURIDAD (Arranque limpio para la casa de tu compañero o instituto)
>>>>>>> Stashed changes
    let listaEmpleados = JSON.parse(localStorage.getItem("crm_employees"));

    if (!listaEmpleados || listaEmpleados.length === 0) {
        listaEmpleados = [
            { id: "1", name: "Carlos Martínez", username: "cmartinez", password: "1234", role: "SUPERVISOR" },
            { id: "2", name: "Lucía Gómez", username: "lgomez", password: "1234", role: "CAMARERO" }
        ];
<<<<<<< Updated upstream
=======
        // Dejamos el semillero inicializado en el storage para el resto de pantallas
>>>>>>> Stashed changes
        localStorage.setItem("crm_employees", JSON.stringify(listaEmpleados));
    }

    let accesoConcedido = false;
    let rolUsuario = "";
    let nombreCompleto = "";

<<<<<<< Updated upstream
    // ==========================================================================
    // CAMBIO 1: Forzamos la contraseña 'admin1234' en texto plano (Evita basura en LocalStorage)
    // ==========================================================================
    if (userInput.toLowerCase() === "julio admin" || userInput.toLowerCase() === "admin") {
        if (passInput === "admin1234") { // <-- MODIFICADO: Cambiado adminPasswordConfig por "admin1234"
=======
    // CASO A: ¿Intenta entrar el Administrador Principal (Julio)?
    if (userInput.toLowerCase() === "julio admin" || userInput.toLowerCase() === "admin") {
        if (passInput === adminPasswordConfig) {
>>>>>>> Stashed changes
            accesoConcedido = true;
            rolUsuario = "Admin";
            nombreCompleto = "Julio Administrador";
        }
    }
<<<<<<< Updated upstream
    // CASO B: ¿Intenta entrar uno de los empleados?
    else {
        const empleadoEncontrado = listaEmpleados.find(emp => emp.username === userInput);
=======
    // CASO B: ¿Intenta entrar uno de los empleados de la plantilla?
    else {
        const empleadoEncontrado = listaEmpleados.find(emp => emp.username === userInput);

        // Verificamos si coincide su clave o la maestra de la demo "1234"
>>>>>>> Stashed changes
        const contrasenaCorrecta = empleadoEncontrado && (empleadoEncontrado.password === passInput || passInput === "1234");

        if (empleadoEncontrado && contrasenaCorrecta) {
            accesoConcedido = true;
            rolUsuario = empleadoEncontrado.role;
            nombreCompleto = empleadoEncontrado.name;

<<<<<<< Updated upstream
=======
            // Fichaje automático reflejo al loguearse
>>>>>>> Stashed changes
            empleadoEncontrado.status = "TRABAJANDO";
            empleadoEncontrado.lastAccess = `Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            localStorage.setItem("crm_employees", JSON.stringify(listaEmpleados));
        }
    }

    // CONTROL DE ACCESO FINAL
    if (accesoConcedido) {
        if (errorMsg) errorMsg.style.display = "none";

<<<<<<< Updated upstream
=======
        // Grabamos sesión viva
>>>>>>> Stashed changes
        localStorage.setItem("jwt_token", "token_simulado_" + Date.now());
        localStorage.setItem("crm_logged_user_name", nombreCompleto);
        localStorage.setItem("crm_logged_user_role", rolUsuario);

<<<<<<< Updated upstream
        // ==========================================================================
        // CAMBIO 2: Ajustamos la ruta para que coincida con tu árbol real de carpetas
        // ==========================================================================
        window.location.href = "js/views/dashboard.html"; // <-- MODIFICADO: Añadido "js/" al inicio
    } else {
=======
        // ALINEACIÓN DE RUTA ORIGINAL CORREGIDA:
        // Tu HTML busca "js/views/dashboard.html", nos aseguramos de mantener tu mapa de carpetas exacto
        window.location.href = "js/views/dashboard.html";
    } else {
        // Activamos el cartel rojo de error
>>>>>>> Stashed changes
        if (errorMsg) errorMsg.style.display = "flex";
    }
});