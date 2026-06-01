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

    // 1. Obtener clave del Administrador del LocalStorage
    const adminPasswordConfig = localStorage.getItem("crm_admin_password") || "admin1234";

    // 2. SEMILLERO DE SEGURIDAD (Datos de prueba)
    let listaEmpleados = JSON.parse(localStorage.getItem("crm_employees"));

    if (!listaEmpleados || listaEmpleados.length === 0) {
        listaEmpleados = [
            { id: "1", name: "Carlos Martínez", username: "cmartinez", password: "1234", role: "SUPERVISOR" },
            { id: "2", name: "Lucía Gómez", username: "lgomez", password: "1234", role: "CAMARERO" }
        ];
        localStorage.setItem("crm_employees", JSON.stringify(listaEmpleados));
    }

    let accesoConcedido = false;
    let rolUsuario = "";
    let nombreCompleto = "";

    // ==========================================================================
    // MODO PRUEBAS: Forzamos la contraseña 'admin1234'
    // ==========================================================================
    if (userInput.toLowerCase() === "julio admin" || userInput.toLowerCase() === "admin") {
        if (passInput === "admin1234") { 
            accesoConcedido = true;
            rolUsuario = "Admin";
            nombreCompleto = "Julio Administrador";
        }
    }
    // CASO B: ¿Intenta entrar uno de los empleados de prueba?
    else {
        const empleadoEncontrado = listaEmpleados.find(emp => emp.username === userInput);
        const contrasenaCorrecta = empleadoEncontrado && (empleadoEncontrado.password === passInput || passInput === "1234");

        if (empleadoEncontrado && contrasenaCorrecta) {
            accesoConcedido = true;
            rolUsuario = empleadoEncontrado.role;
            nombreCompleto = empleadoEncontrado.name;

            empleadoEncontrado.status = "TRABAJANDO";
            empleadoEncontrado.lastAccess = `Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            localStorage.setItem("crm_employees", JSON.stringify(listaEmpleados));
        }
    }

    // CONTROL DE ACCESO FINAL
    if (accesoConcedido) {
        // === ENTRÓ POR EL MODO DE PRUEBAS LOCAL ===
        if (errorMsg) errorMsg.style.display = "none";

        localStorage.setItem("jwt_token", "token_simulado_" + Date.now());
        localStorage.setItem("crm_logged_user_name", nombreCompleto);
        localStorage.setItem("crm_logged_user_role", rolUsuario);

        window.location.href = "js/views/dashboard.html"; 
    } else {
        // ==========================================================================
        // LO NUEVO: CONSULTAMOS A LA API USANDO LA URL CENTRALIZADA DE CONFIG.JS
        // ==========================================================================
        fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userInput, password: passInput })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Credenciales inválidas en la base de datos");
            }
            return response.json();
        })
        .then(data => {
            // === ENTRÓ POR LA BASE DE DATOS DE JAVA ===
            if (errorMsg) errorMsg.style.display = "none";
            
            localStorage.setItem("jwt_token", data.token || "token_real");
            localStorage.setItem("crm_logged_user_name", data.nombre || userInput);
            localStorage.setItem("crm_logged_user_role", data.rol || "USUARIO");
            
            window.location.href = "js/views/dashboard.html";
        })
        .catch(error => {
            console.error("Fallo general de acceso:", error);
            if (errorMsg) {
                errorMsg.innerText = "Usuario o contraseña incorrectos";
                errorMsg.style.display = "flex";
            }
        });
    }
});