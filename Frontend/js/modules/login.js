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

    // 1. Obtener clave del Administrador del LocalStorage (Por defecto: admin1234)
    const adminPasswordConfig = localStorage.getItem("crm_admin_password") || "admin1234";

    // 2. SEMILLERO DE SEGURIDAD (Arranque limpio para la casa de tu compañero o instituto)
    let listaEmpleados = JSON.parse(localStorage.getItem("crm_employees"));

    if (!listaEmpleados || listaEmpleados.length === 0) {
        listaEmpleados = [
            { id: "1", name: "Carlos Martínez", username: "cmartinez", password: "1234", role: "SUPERVISOR" },
            { id: "2", name: "Lucía Gómez", username: "lgomez", password: "1234", role: "CAMARERO" }
        ];
        // Dejamos el semillero inicializado en el storage para el resto de pantallas
        localStorage.setItem("crm_employees", JSON.stringify(listaEmpleados));
    }

    let accesoConcedido = false;
    let rolUsuario = "";
    let nombreCompleto = "";

    // CASO A: ¿Intenta entrar el Administrador Principal (Julio)?
    if (userInput.toLowerCase() === "julio admin" || userInput.toLowerCase() === "admin") {
        if (passInput === adminPasswordConfig) {
            accesoConcedido = true;
            rolUsuario = "Admin";
            nombreCompleto = "Julio Administrador";
        }
    }
    // CASO B: ¿Intenta entrar uno de los empleados de la plantilla?
    else {
        const empleadoEncontrado = listaEmpleados.find(emp => emp.username === userInput);

        // Verificamos si coincide su clave o la maestra de la demo "1234"
        const contrasenaCorrecta = empleadoEncontrado && (empleadoEncontrado.password === passInput || passInput === "1234");

        if (empleadoEncontrado && contrasenaCorrecta) {
            accesoConcedido = true;
            rolUsuario = empleadoEncontrado.role;
            nombreCompleto = empleadoEncontrado.name;

            // Fichaje automático reflejo al loguearse
            empleadoEncontrado.status = "TRABAJANDO";
            empleadoEncontrado.lastAccess = `Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            localStorage.setItem("crm_employees", JSON.stringify(listaEmpleados));
        }
    }

    // CONTROL DE ACCESO FINAL
    if (accesoConcedido) {
        if (errorMsg) errorMsg.style.display = "none";

        // Grabamos sesión viva
        localStorage.setItem("jwt_token", "token_simulado_" + Date.now());
        localStorage.setItem("crm_logged_user_name", nombreCompleto);
        localStorage.setItem("crm_logged_user_role", rolUsuario);

        // ALINEACIÓN DE RUTA ORIGINAL CORREGIDA:
        // Tu HTML busca "js/views/dashboard.html", nos aseguramos de mantener tu mapa de carpetas exacto
        window.location.href = "js/views/dashboard.html";
    } else {
        // Activamos el cartel rojo de error
        if (errorMsg) errorMsg.style.display = "flex";
    }
});