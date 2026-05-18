document.addEventListener("DOMContentLoaded", () => {
    cargarSidebar();
    marcarEnlaceActivo();
});

function cargarSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    // Subimos un nivel a /js/ y entramos en /components/
    fetch('../components/sidebar.html')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo encontrar el archivo sidebar.html");
            return response.text();
        })
        .then(html => {
            sidebarContainer.innerHTML = html;
            
            // Asignar el evento de cerrar sesión una vez cargado el botón en el DOM
            document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
        })
        .catch(error => console.error("Error cargando el menú lateral:", error));
}

function marcarEnlaceActivo() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    
    setTimeout(() => {
        if (page === "dashboard.html") document.getElementById("link-dashboard")?.classList.add("active");
        if (page === "productos.html") document.getElementById("link-productos")?.classList.add("active");
        if (page === "reservas.html") document.getElementById("link-reservas")?.classList.add("active");
        if (page === "personal.html") document.getElementById("link-personal")?.classList.add("active");
    }, 150);
}

function cerrarSesion() {
    localStorage.removeItem("jwt_token");
    window.location.href = "../../index.html";
}