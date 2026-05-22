<script>
    document.getElementById('form-login').addEventListener('submit', function (e) {
        e.preventDefault();

    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-message');

    // 1. Obtener la contraseña actual del Administrador (la de la pantalla Configuración)
    // Si nunca la has cambiado, la de por defecto será 'admin1234'
    const adminPasswordConfig = localStorage.getItem("crm_admin_password") || "admin1234";

    // 2. Obtener la lista de empleados reales de tu sección de Personal
    const listaEmpleados = JSON.parse(localStorage.getItem("crm_employees")) || [];

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
    // CASO B: ¿Intenta entrar uno de los empleados creados en Personal?
    else {
            const empleadoEncontrado = listaEmpleados.find(emp => emp.username === userInput);
    if (empleadoEncontrado && empleadoEncontrado.password === passInput) {
        accesoConcedido = true;
    rolUsuario = empleadoEncontrado.role;
    nombreCompleto = empleadoEncontrado.name;

    // Efecto reflejo: Cambiamos su estado a "TRABAJANDO" porque acaba de loguearse
    empleadoEncontrado.status = "TRABAJANDO";
    empleadoEncontrado.lastAccess = `Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    localStorage.setItem("crm_employees", JSON.stringify(listaEmpleados));
            }
        }

    // CONTROL DE ACCESO
    if (accesoConcedido) {
        errorMsg.style.display = "none";

    // Guardamos los datos de la sesión actual para las cabeceras del CRM
    localStorage.setItem("jwt_token", "token_simulado_" + Date.now());
    localStorage.setItem("crm_logged_user_name", nombreCompleto);
    localStorage.setItem("crm_logged_user_role", rolUsuario);

    // Redirección limpia al panel principal
    window.location.href = "js/views/dashboard.html";
        } else {
        // Si falla, mostramos el cartel de error rojo que tienes en el HTML
        errorMsg.style.display = "flex";
        }
    });
</script>