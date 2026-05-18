function verificarAutenticacion(){
    const token = localStorage.getItem("jwt_token");

    // Subimos dos niveles desde js/views/ para encontrar el index.html de la raíz
    if(!token && !window.location.pathname.endsWith("index.html")){
        window.location.href = "../../index.html";
    }
}

verificarAutenticacion();