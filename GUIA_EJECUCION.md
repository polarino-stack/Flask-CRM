# Flask-CRM - Guía de Ejecución y Configuración

## 📋 Requisitos Previos

- **Java 17+** (para ejecutar el backend Spring Boot)
- **MySQL 8.0+** (base de datos)
- **Maven 3.8+** (para compilar el proyecto Java)
- **Navegador moderno** (Chrome, Firefox, Edge, etc.)

## 🚀 Pasos de Instalación y Ejecución

### 1. Configurar la Base de Datos MySQL

Crear una base de datos para el proyecto:

```sql
CREATE DATABASE IF NOT EXISTS restaurante_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY 'crm_password_123';
GRANT ALL PRIVILEGES ON restaurante_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configurar Variables de Entorno del Backend

En el directorio `BackendAPI/demoPruebaNueva/`, crear un archivo `.env`:

```properties
DB_URL=jdbc:mysql://localhost:3306/restaurante_crm
DB_USERNAME=crm_user
DB_PASSWORD=crm_password_123
DB_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
```

Alternativamente, puedes configurar estas variables en el sistema operativo.

### 3. Compilar el Backend (Opcional pero Recomendado)

```bash
cd BackendAPI/demoPruebaNueva
mvn clean compile
```

Esto verificará que todas las dependencias estén correctas sin ejecutar el servidor.

### 4. Iniciar el Backend Spring Boot

```bash
cd BackendAPI/demoPruebaNueva
mvn spring-boot:run
```

El servidor se iniciará en **http://localhost:8082**

El backend ejecutará automáticamente las migraciones Flyway para crear las tablas en MySQL.

### 5. Abrir el Frontend

1. Navega a la carpeta `Frontend/`
2. Abre `index.html` en tu navegador (o sirve con un servidor local)
3. Inicia sesión con:
   - **Usuario:** `admin` o `julio admin`
   - **Contraseña:** `admin1234`

O con empleados de ejemplo:
- **Usuario:** `cmartinez` | **Contraseña:** `1234`
- **Usuario:** `lgomez` | **Contraseña:** `1234`

## 🔌 Endpoints de la API

El backend expone los siguientes endpoints REST bajo `http://localhost:8082/api`:

### Mesas
- `GET /mesas` - Obtener todas las mesas
- `POST /mesas` - Crear nueva mesa

### Reservas
- `GET /reservas` - Obtener reservas (con filtros opcionales: `?fecha=YYYY-MM-DD&turnoId=1`)
- `POST /reservas` - Crear nueva reserva
- `PATCH /reservas/{id}/estado` - Cambiar estado de una reserva

### Turnos
- `GET /turnos` - Obtener turnos de servicio
- `POST /turnos` - Crear nuevo turno

### Empleados
- `GET /empleados` - Obtener lista de empleados
- `POST /empleados` - Registrar nuevo empleado

### Stock
- `GET /stock` - Obtener inventario
- `GET /stock/categorias` - Obtener stock agrupado por categorías
- `POST /stock` - Crear nuevo producto

## 📝 Estructura del Proyecto

```
Flask-CRM/
├── BackendAPI/
│   └── demoPruebaNueva/        # Proyecto Spring Boot
│       ├── src/main/java/      # Código Java
│       │   └── com/polarirob/demopruebanueva/
│       │       ├── controller/  # Controladores REST
│       │       ├── service/     # Lógica de negocio
│       │       ├── model/       # Entidades JPA
│       │       ├── repository/  # Acceso a datos
│       │       └── dto/         # DTOs de comunicación
│       ├── src/main/resources/
│       │   ├── application.properties  # Configuración
│       │   └── db/migration/    # Migraciones Flyway (SQL)
│       └── pom.xml             # Dependencias Maven
├── Frontend/
│   ├── index.html              # Página de login
│   ├── css/                    # Estilos
│   ├── js/
│   │   ├── api.js             # Cliente REST (nuevo)
│   │   ├── auth.js            # Autenticación
│   │   ├── main.js            # Script principal
│   │   ├── modules/           # Módulos funcionales
│   │   │   ├── reservas.js    # Gestión de reservas
│   │   │   ├── dashboard.js   # Dashboard
│   │   │   └── ...
│   │   └── views/             # Vistas HTML
│       ├── reservas.html
│       ├── dashboard.html
│       └── ...
├── database/
│   └── schema.sql              # Documentación de BD
├── README.md                   # Descripción general
└── GUIA_EJECUCION.md          # Este archivo
```

## 🛠️ Solución de Problemas

### "Backend no disponible" al abrir el frontend

1. Verifica que MySQL esté corriendo
2. Verifica que el backend esté iniciado en puerto 8082
3. Revisa los logs del backend: `mvn spring-boot:run`
4. Comprueba que las variables de entorno DB_* estén correctas

### Error de conexión a la base de datos

```
Exception: Access denied for user 'crm_user'@'localhost'
```

**Solución:**
- Verifica las credenciales en `.env` o `application.properties`
- Asegúrate de que el usuario MySQL existe: `SHOW GRANTS FOR 'crm_user'@'localhost';`

### El frontend se ve pero no carga mesas ni reservas

1. Abre la consola del navegador (F12)
2. Busca errores de conexión (error en rojo)
3. Asegúrate de que `http://localhost:8082/api/mesas` es accesible
4. El frontend tiene un fallback a datos locales si la API no responde

### Migraciones no se ejecutan

Asegúrate de que:
1. Flyway está incluido en pom.xml (ya está)
2. Las credenciales de BD son correctas
3. La tabla `flyway_schema_history` se creó automáticamente

## 📚 Documentación Adicional

- **Backend API:** Ver `BackendAPI/demoPruebaNueva/src/main/java/com/.../controller/ReservaController.java`
- **DTOs:** Ver `BackendAPI/demoPruebaNueva/src/main/java/com/.../dto/`
- **Entidades:** Ver `BackendAPI/demoPruebaNueva/src/main/java/com/.../model/`
- **Cliente API Frontend:** Ver `Frontend/js/api.js`

## 🎯 Características Implementadas

✅ Autenticación de usuario (login)  
✅ Gestión de reservas (CRUD)  
✅ Mapa interactivo de mesas  
✅ Filtrado de reservas por fecha y estado  
✅ Cambio de estado de reservas  
✅ Gestión de mesas  
✅ Gestión de turnos de servicio  
✅ API REST funcional  
✅ Sincronización BD ↔ Frontend  
✅ Fallback a datos locales si la API no está disponible  

## 💡 Notas Importantes

1. El frontend en desarrollo usa `http://localhost:8082` como URL base de la API
2. Si necesitas cambiar el puerto del backend, actualiza la constante `API_BASE` en `Frontend/js/api.js`
3. Los estados de reserva válidos son: `PENDIENTE`, `CONFIRMADA`, `SENTADO`, `FINALIZADA`, `CANCELADA`
4. La duración de una reserva por defecto es 90 minutos (configurable en backend)
5. El frontend guarda datos en `localStorage` como respaldo local

---

**Versión:** 2.4.0  
**Última actualización:** Mayo 2026
