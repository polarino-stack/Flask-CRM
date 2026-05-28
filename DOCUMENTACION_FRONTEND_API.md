# Documentación del Frontend - Guía para Implementación de API

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Estructura de la Aplicación](#estructura-de-la-aplicación)
3. [Módulos Principales](#módulos-principales)
4. [Gestión de Datos](#gestión-de-datos)
5. [Endpoints Requeridos](#endpoints-requeridos)
6. [Estructura de Datos](#estructura-de-datos)
7. [Flujos de Autenticación](#flujos-de-autenticación)
8. [Patrones de Comunicación](#patrones-de-comunicación)

---

## 1. Descripción General

**RestauranteCRM** es una aplicación web para gestión integral de restaurantes con las siguientes características:

- **Autenticación y control de acceso** basado en roles (Admin, Supervisor, Camarero, Cocina)
- **Gestión de reservas** con asignación dinámica de mesas
- **Control de inventario** de productos y stock
- **Gestión de personal** con fichaje y estados de empleados
- **Dashboard analítico** con KPIs de ventas, ocupación, stock
- **Configuración del local** (información, horarios, mesas)

**Tecnología Actual:**
- Frontend: HTML5, CSS3, JavaScript vanilla
- Almacenamiento: LocalStorage (temporal, simulado)
- No tiene backend API implementada actualmente

---

## 2. Estructura de la Aplicación

### 2.1 Estructura de Carpetas

```
Flask-CRM/
├── Frontend/
│   ├── index.html                    # Página de login
│   ├── css/
│   │   ├── login.css                 # Estilos de login
│   │   ├── dashboard.css             # Estilos generales (reutilizado)
│   │   ├── productos.css
│   │   ├── reservas.css
│   │   └── ...
│   └── js/
│       ├── main.js                   # Script de carga de sidebar
│       ├── api.js                    # Vacío - aquí irán las llamadas API
│       ├── auth.js                   # Lógica de autenticación
│       ├── modules/
│       │   ├── login.js              # Lógica de login
│       │   ├── dashboard.js          # Dashboard principal con KPIs
│       │   ├── productos.js          # Gestión de inventario
│       │   ├── reservas.js           # Gestión de reservas
│       │   ├── personal.js           # Gestión de empleados
│       │   ├── configuracion.js      # Configuración del local
│       │   └── reportes.js           # (A implementar)
│       └── views/
│           ├── dashboard.html
│           ├── productos.html
│           ├── reservas.html
│           ├── personal.html
│           ├── configuracion.html
│           └── reportes.html
├── Backend/                          # (Proyecto Node.js existente)
└── BackendAPI/                       # (Proyecto Spring Boot existente)
```

### 2.2 Flujo de Navegación

```
login (index.html)
    ↓
dashboard.html (Panel Principal)
    ├── productos.html (Inventario)
    ├── reservas.html (Reservas)
    ├── personal.html (Empleados)
    ├── configuracion.html (Configuración)
    └── reportes.html (Reportes)
```

---

## 3. Módulos Principales

### 3.1 Login y Autenticación (`login.js`)

**Funcionalidad:**
- Permite login con usuario/contraseña
- Soporta dos tipos de usuarios:
  - Administrador: usuario "julio admin" / "admin", password "admin1234"
  - Empleados: lista de empleados con roles específicos

**Datos Utilizados:**
- `crm_admin_password`: Contraseña del admin (localStorage)
- `crm_employees`: Lista de empleados (localStorage)
- `crm_logged_user_name`: Nombre del usuario logueado
- `crm_logged_user_role`: Rol del usuario logueado
- `jwt_token`: Token de sesión simulado

**Flujo Actual:**
1. Usuario ingresa credenciales
2. Se valida contra lista en localStorage o credencial de admin
3. Se genera token simulado
4. Se redirige al dashboard

---

### 3.2 Dashboard (`dashboard.js`)

**Funcionalidad Principal:**
Panel de control centralizado con métricas en tiempo real del restaurante.

**KPIs Mostrados:**

| KPI | Descripción | Fuente |
|-----|-------------|--------|
| **Ventas del Día** | Total en € de ventas (mesas + tienda) | crm_reservas + crm_inventario |
| **Stock Total** | Unidades totales en inventario | crm_inventario |
| **Reservas Hoy** | Cantidad de reservas para la fecha actual | crm_reservas |
| **Ocupación %** | Porcentaje de mesas ocupadas (máx 16) | crm_reservas |
| **Personal** | Empleados activos/trabajando | crm_employees |

**Datos Utilizados:**
- `crm_restaurant_info`: Información del local (nombre, dirección, teléfono, email, horario)
- `crm_inventario`: Lista de productos con precios y stock
- `crm_employees`: Lista de empleados
- `crm_reservas`: Lista de reservas del día
- `crm_ventas_acumuladas`: Total acumulado de ventas en €
- `crm_ventas_categorias`: Ventas por categoría de producto

**Gráficos:**
1. **Ventas de la Semana** (Chart.js) - Línea o Barras
2. **Reservas por Hora** (Chart.js) - Barras
3. **Distribución de Stock** (Chart.js) - Pie/Donut

**Información del Restaurante Mostrada:**
- Nombre del restaurante
- Dirección
- Teléfono
- Email
- Horario de apertura

---

### 3.3 Gestión de Productos/Inventario (`productos.js`)

**Funcionalidad:**
Gestión completa del inventario de productos del restaurante.

**Operaciones:**

| Operación | Descripción |
|-----------|-------------|
| **Listar** | Ver todos los productos con filtros |
| **Crear** | Agregar nuevo producto |
| **Editar** | Modificar datos de producto existente |
| **Eliminar** | Remover producto del inventario |
| **Vender 1** | Decrementar stock y registrar venta |

**Estructura de Producto:**

```javascript
{
  id: 1,                          // Identificador único
  nombre: "Coca Cola",            // Nombre del producto
  categoria: "BEBIDAS",           // Categoría
  precio: 1.50,                   // Precio en €
  stock: 48                       // Stock actual en unidades
}
```

**Categorías Predefinidas:**
- BEBIDAS
- BEBIDAS ALCOHÓLICAS
- EMBUTIDOS
- CONDIMENTOS
- FRUTAS Y VEGETALES

**Funcionalidades de Filtrado:**
- Por nombre/descripción
- Por categoría
- Búsqueda libre

**Estados de Stock:**
- ✅ Correcto: stock > 10 unidades
- ⚠️ Bajo Stock: 1-10 unidades
- 🔴 Agotado: 0 unidades

**Datos Utilizados:**
- `crm_inventario`: Array de productos
- `crm_ventas_acumuladas`: Total de ventas por unidades vendidas a mano
- `crm_ventas_categorias`: Ventas registradas por categoría

---

### 3.4 Gestión de Reservas (`reservas.js`)

**Funcionalidad:**
Control completo del sistema de reservas y gestión de mesas.

**Operaciones:**

| Operación | Descripción |
|-----------|-------------|
| **Crear Reserva** | Nueva reserva con datos del cliente |
| **Editar Reserva** | Modificar datos de reserva existente |
| **Cambiar Estado** | PENDIENTE → CONFIRMADA → SENTADO → FINALIZADA |
| **Cancelar Reserva** | Eliminar reserva |
| **Visualizar Mapa** | Mapa dinámico interactivo de mesas |

**Estructura de Reserva:**

```javascript
{
  id: "1",                        // Identificador único
  nombre: "Mesa Marta",           // Nombre del cliente
  telefono: "612345678",          // Contacto
  pax: 2,                         // Cantidad de comensales
  hora: "13:30",                  // Hora de reserva
  fecha: "2026-05-19",            // Fecha (YYYY-MM-DD)
  mesaId: "M3",                   // Mesa asignada
  notas: "Ninguna",               // Observaciones especiales
  estado: "CONFIRMADA",           // Estado actual
  responsable: "Julio Admin"      // Usuario que hizo la reserva
}
```

**Estados de Reserva:**
- 🟡 **PENDIENTE**: Reserva registrada, a la espera de confirmación
- 🟢 **CONFIRMADA**: Reserva confirmada, cliente a llegar
- 🪑 **SENTADO**: Cliente sentado en la mesa
- ✅ **FINALIZADA**: Servicio completado, cobrado

**Estructura de Mesa:**

```javascript
{
  id: "M1",                       // Identificador (M=interior, T=terraza)
  zona: "INTERIOR",               // Zona del restaurante
  paxMax: 2                       // Capacidad máxima
}
```

**Zonas Disponibles:**
- INTERIOR: 8 mesas (M1-M8)
- TERRAZA: 8 mesas (T1-T8)
- **Capacidades:** 2, 4, 6, 8 pax según mesa

**Funcionalidades Especiales:**
- **Mapa Dinámico de Mesas**: Visualización visual y clickeable de mesas
- **Color Dinámico**: Indica estado de cada mesa (libre, ocupada, pendiente)
- **Cálculo de Ocupación**: % de ocupación por zona
- **Asignación Automática**: Sugiere mesas según pax

**Datos Utilizados:**
- `crm_reservas`: Array de reservas
- `crm_mesas_config`: Configuración de mesas y zonas

**Cálculo de Ventas:**
- Ticket medio por persona: 22.50 €
- Solo se contabilizan reservas con estado FINALIZADA
- Fórmula: pax × 22.50 €

---

### 3.5 Gestión de Personal (`personal.js`)

**Funcionalidad:**
Administración de empleados, roles, horarios y fichaje.

**Operaciones:**

| Operación | Descripción |
|-----------|-------------|
| **Listar Empleados** | Ver lista con filtros |
| **Crear Empleado** | Agregar nuevo empleado |
| **Editar Empleado** | Modificar datos |
| **Eliminar Empleado** | Remover empleado |
| **Cambiar Estado** | ACTIVO → BAJA, TRABAJANDO, etc. |

**Estructura de Empleado:**

```javascript
{
  id: "1",                        // Identificador único
  name: "Carlos Martínez",        // Nombre completo
  email: "carlos.m@restaurante.com",
  phone: "600123456",             // Teléfono de contacto
  role: "SUPERVISOR",             // Rol: SUPERVISOR, CAMARERO, COCINA, BARMAN
  shift: "Completo (Partido)",    // Tipo de turno
  schedule: "12:30-16:30, 20:00-00:00", // Horario específico
  status: "ACTIVO",               // Estado: ACTIVO, TRABAJANDO, BAJA
  joinDate: "2024-01-15",         // Fecha de incorporación (YYYY-MM-DD)
  avatar: "",                     // Avatar/foto del empleado
  username: "cmartinez",          // Nombre de usuario para login
  password: "1234"                // Contraseña (almacenada localmente, no segura)
}
```

**Roles Disponibles:**
- 👔 **SUPERVISOR**: Jefe de sala, control general
- 🍽️ **CAMARERO**: Atención al cliente
- 👨‍🍳 **COCINA**: Personal de cocina
- 🍸 **BARMAN**: Personal de barra

**Estados:**
- ✅ ACTIVO: Empleado en plantilla
- 🔄 TRABAJANDO: Fichado actualmente
- ❌ BAJA: Fuera de servicio

**Datos Utilizados:**
- `crm_employees`: Array de empleados
- Almacenaje de historial de fichajes

---

### 3.6 Configuración del Local (`configuracion.js`)

**Funcionalidad:**
Centraliza la configuración del restaurante y gestión de infraestructura.

**Secciones:**

#### A. Información del Restaurante

**Estructura:**

```javascript
{
  nombre: "La Trattoria Premium",
  direccion: "Carrer de Pujades, 102, Poblenou",
  telefono: "933001122",
  email: "contacto@latrattoria.com",
  horario: "Mar - Dom: 13:00 - 16:30, 20:00 - 00:00"
}
```

**Campos Editables:**
- Nombre del restaurante
- Dirección
- Teléfono de contacto
- Email de contacto
- Horario de funcionamiento

#### B. Configuración de Mesas

**Funcionalidades:**
- Crear nuevas mesas
- Editar capacidad y zona
- Eliminar mesas
- Filtrar por zona

**Datos Requeridos:**
- ID (ej: M1, T5)
- Zona (INTERIOR, TERRAZA, BARRA, etc.)
- Capacidad máxima (pax)

#### C. Seguridad y Acceso

**Funcionalidades:**
- Cambiar contraseña del administrador
- Historial de accesos
- Cierre de sesiones activas
- Control de permisos (futuro)

**Datos:**
- `crm_admin_password`: Contraseña del admin
- Historial de accesos con timestamp

---

## 4. Gestión de Datos

### 4.1 Almacenamiento Actual (LocalStorage)

Todos los datos se almacenan actualmente en el navegador usando LocalStorage:

| Clave | Contenido | Tipo | Descripción |
|-------|----------|------|-------------|
| `jwt_token` | Token simulado | string | Token de sesión |
| `crm_logged_user_name` | Nombre usuario | string | Usuario logueado |
| `crm_logged_user_role` | Rol usuario | string | Rol del usuario |
| `crm_admin_password` | Contraseña | string | Contraseña del admin |
| `crm_employees` | Array JSON | JSON | Lista de empleados |
| `crm_inventario` | Array JSON | JSON | Productos e inventario |
| `crm_reservas` | Array JSON | JSON | Reservas registradas |
| `crm_mesas_config` | Array JSON | JSON | Configuración de mesas |
| `crm_restaurant_info` | Objeto JSON | JSON | Info del local |
| `crm_ventas_acumuladas` | Total en € | string | Ventas totales del día |
| `crm_ventas_categorias` | Objeto JSON | JSON | Ventas por categoría |

### 4.2 Ciclo de Vida de Datos

```
LocalStorage 
    ↓
Lectura al cargar vista
    ↓
Modificación en memoria (array JS)
    ↓
Guardar en LocalStorage
    ↓
Actualizar UI
```

### 4.3 Persistencia y Sincronización

**Características Actuales:**
- Datos se guardan al completar operaciones
- No hay sincronización entre pestañas (excepto localStorage nativo)
- Sincronización básica con `window.addEventListener('storage')`
- Los cambios en una pestaña se reflejan parcialmente en otra

**Requisitos para API:**
- Implementar actualización automática en tiempo real
- Sincronización entre múltiples dispositivos/usuarios
- Historial de cambios auditable
- Respaldos en servidor

---

## 5. Endpoints Requeridos

### 5.1 Autenticación

#### POST `/api/auth/login`
**Descripción:** Autenticación de usuario

**Request:**
```json
{
  "username": "cmartinez",
  "password": "1234",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "Carlos Martínez",
    "role": "SUPERVISOR",
    "email": "carlos.m@restaurante.com"
  },
  "expiresIn": 3600
}
```

#### POST `/api/auth/logout`
**Descripción:** Cierre de sesión

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/refresh`
**Descripción:** Renovar token

---

### 5.2 Inventario/Productos

#### GET `/api/products`
**Descripción:** Obtener lista de productos

**Query Parameters:**
- `category`: Filtrar por categoría
- `search`: Búsqueda por nombre
- `limit`: Límite de registros
- `offset`: Paginación

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Coca Cola",
      "categoria": "BEBIDAS",
      "precio": 1.50,
      "stock": 48,
      "createdAt": "2026-05-20T10:00:00Z",
      "updatedAt": "2026-05-20T15:30:00Z"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

#### GET `/api/products/{id}`
**Descripción:** Obtener detalle de producto

#### POST `/api/products`
**Descripción:** Crear nuevo producto

**Request:**
```json
{
  "nombre": "Nuevoproducto",
  "categoria": "BEBIDAS",
  "precio": 2.50,
  "stock": 100
}
```

#### PUT `/api/products/{id}`
**Descripción:** Actualizar producto

#### DELETE `/api/products/{id}`
**Descripción:** Eliminar producto

#### POST `/api/products/{id}/sell`
**Descripción:** Registrar venta unitaria

**Request:**
```json
{
  "quantity": 1,
  "price": 1.50
}
```

---

### 5.3 Reservas

#### GET `/api/reservas`
**Descripción:** Obtener reservas

**Query Parameters:**
- `fecha`: Filtrar por fecha (YYYY-MM-DD)
- `estado`: PENDIENTE, CONFIRMADA, SENTADO, FINALIZADA
- `mesaId`: Filtrar por mesa
- `search`: Búsqueda por cliente o teléfono

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nombre": "Mesa Marta",
      "telefono": "612345678",
      "pax": 2,
      "hora": "13:30",
      "fecha": "2026-05-19",
      "mesaId": "M3",
      "notas": "Ninguna",
      "estado": "CONFIRMADA",
      "responsable": "Julio Admin",
      "createdAt": "2026-05-19T10:00:00Z"
    }
  ],
  "total": 15
}
```

#### GET `/api/reservas/{id}`
**Descripción:** Obtener detalle de reserva

#### POST `/api/reservas`
**Descripción:** Crear nueva reserva

**Request:**
```json
{
  "nombre": "Cliente Nuevo",
  "telefono": "666123456",
  "pax": 4,
  "hora": "20:00",
  "fecha": "2026-05-22",
  "mesaId": "M5",
  "notas": "Cumpleaños - Velas incluidas"
}
```

#### PUT `/api/reservas/{id}`
**Descripción:** Actualizar reserva

#### PATCH `/api/reservas/{id}/estado`
**Descripción:** Cambiar estado de reserva

**Request:**
```json
{
  "estado": "SENTADO"
}
```

#### DELETE `/api/reservas/{id}`
**Descripción:** Cancelar reserva

#### GET `/api/mesas`
**Descripción:** Obtener mapa de mesas

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "M1",
      "zona": "INTERIOR",
      "paxMax": 2,
      "disponible": true,
      "ocupadaPor": null
    }
  ],
  "total": 16
}
```

#### POST `/api/mesas`
**Descripción:** Crear nueva mesa

#### PUT `/api/mesas/{id}`
**Descripción:** Actualizar mesa

#### DELETE `/api/mesas/{id}`
**Descripción:** Eliminar mesa

---

### 5.4 Empleados/Personal

#### GET `/api/empleados`
**Descripción:** Obtener lista de empleados

**Query Parameters:**
- `role`: Filtrar por rol
- `status`: Filtrar por estado
- `search`: Búsqueda por nombre

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Carlos Martínez",
      "email": "carlos.m@restaurante.com",
      "phone": "600123456",
      "role": "SUPERVISOR",
      "shift": "Completo (Partido)",
      "schedule": "12:30-16:30, 20:00-00:00",
      "status": "ACTIVO",
      "joinDate": "2024-01-15",
      "username": "cmartinez",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 15
}
```

#### GET `/api/empleados/{id}`
**Descripción:** Obtener detalle de empleado

#### POST `/api/empleados`
**Descripción:** Crear nuevo empleado

**Request:**
```json
{
  "name": "Nuevo Empleado",
  "email": "nuevo@restaurante.com",
  "phone": "666999888",
  "role": "CAMARERO",
  "shift": "Tarde",
  "schedule": "16:00 - 00:00",
  "username": "nempleado",
  "password": "hash_seguro"
}
```

#### PUT `/api/empleados/{id}`
**Descripción:** Actualizar empleado

#### PATCH `/api/empleados/{id}/status`
**Descripción:** Cambiar estado de empleado

#### DELETE `/api/empleados/{id}`
**Descripción:** Eliminar empleado

---

### 5.5 Configuración

#### GET `/api/configuracion/restaurante`
**Descripción:** Obtener información del local

#### PUT `/api/configuracion/restaurante`
**Descripción:** Actualizar información del local

**Request:**
```json
{
  "nombre": "La Trattoria Premium",
  "direccion": "Carrer de Pujades, 102",
  "telefono": "933001122",
  "email": "contacto@latrattoria.com",
  "horario": "Mar - Dom: 13:00 - 16:30, 20:00 - 00:00"
}
```

#### PUT `/api/configuracion/admin-password`
**Descripción:** Cambiar contraseña del admin

#### GET `/api/configuracion/auditoria`
**Descripción:** Historial de accesos

---

### 5.6 Dashboard/Reportes

#### GET `/api/dashboard/kpis`
**Descripción:** Obtener KPIs del día

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ventasDelDia": 1240.50,
    "stockTotal": 500,
    "reservasHoy": 8,
    "porcentajeOcupacion": 62,
    "personalActivo": 5,
    "personalTrabajando": 3
  }
}
```

#### GET `/api/dashboard/ventas`
**Descripción:** Datos de ventas para gráficos

**Query Parameters:**
- `periodo`: "dia", "semana", "mes"

#### GET `/api/dashboard/reservas`
**Descripción:** Datos de reservas para gráficos

#### GET `/api/dashboard/stock`
**Descripción:** Datos de stock para gráficos

---

## 6. Estructura de Datos

### 6.1 Modelo de Usuario

```javascript
{
  id: string,              // Identificador único
  name: string,            // Nombre completo
  email: string,           // Correo electrónico
  phone: string,           // Teléfono
  role: string,            // ADMIN, SUPERVISOR, CAMARERO, COCINA
  username: string,        // Usuario para login
  password: string,        // Hash de contraseña (bcrypt, nunca texto plano)
  avatar: string,          // URL de avatar/foto
  status: string,          // ACTIVO, BAJA, INACTIVO
  createdAt: ISO8601,      // Fecha de creación
  updatedAt: ISO8601,      // Fecha de actualización
  createdBy: string,       // Usuario que lo creó
  lastLogin: ISO8601       // Último login
}
```

### 6.2 Modelo de Producto

```javascript
{
  id: number,              // Identificador único
  nombre: string,          // Nombre del producto
  categoria: string,       // BEBIDAS, EMBUTIDOS, etc.
  precio: number,          // Precio en € (decimal)
  stock: number,           // Cantidad en almacén
  descripcion: string,     // Descripción opcional
  supplier: string,        // Proveedor
  sku: string,            // Código de barras
  createdAt: ISO8601,
  updatedAt: ISO8601,
  createdBy: string
}
```

### 6.3 Modelo de Reserva

```javascript
{
  id: string,              // Identificador único
  nombre: string,          // Nombre del cliente
  telefono: string,        // Teléfono de contacto
  email: string,           // Email del cliente (nuevo)
  pax: number,             // Número de comensales
  hora: string,            // Hora de reserva (HH:mm)
  fecha: string,           // Fecha (YYYY-MM-DD)
  mesaId: string,          // ID de mesa asignada
  notas: string,           // Observaciones especiales
  estado: string,          // PENDIENTE, CONFIRMADA, SENTADO, FINALIZADA
  responsable: string,     // Usuario que registró
  montoTotal: number,      // Total cobrado (cuando FINALIZADA)
  createdAt: ISO8601,
  updatedAt: ISO8601,
  confirmadoAt: ISO8601,   // Cuando fue confirmada
  sentadoAt: ISO8601,      // Cuando se sentó
  finalizadoAt: ISO8601    // Cuando finalizó
}
```

### 6.4 Modelo de Mesa

```javascript
{
  id: string,              // M1, T5, etc.
  zona: string,            // INTERIOR, TERRAZA, BARRA
  paxMax: number,          // Capacidad máxima
  activa: boolean,         // ¿Está disponible?
  notas: string,           // Observaciones
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### 6.5 Modelo de Empleado

```javascript
{
  id: string,              // Identificador único
  name: string,            // Nombre completo
  email: string,           // Correo
  phone: string,           // Teléfono
  role: string,            // SUPERVISOR, CAMARERO, COCINA, BARMAN
  shift: string,           // Tipo de turno
  schedule: string,        // Horario específico
  status: string,          // ACTIVO, TRABAJANDO, BAJA
  joinDate: string,        // YYYY-MM-DD
  salary: number,          // Salario (opcional)
  bankAccount: string,     // IBAN (opcional, cifrado)
  username: string,        // Usuario login
  lastAccess: ISO8601,     // Último acceso
  createdAt: ISO8601,
  updatedAt: ISO8601
}
```

### 6.6 Modelo de Configuración

```javascript
{
  id: string,
  restaurante: {
    nombre: string,
    direccion: string,
    telefono: string,
    email: string,
    horario: string,
    web: string,            // URL del sitio web
    logo: string            // URL del logo
  },
  seguridad: {
    adminPassword: string,  // Hash bcrypt
    ultimaCambio: ISO8601,
    requiereAuth2FA: boolean // Autenticación de dos factores
  },
  configuracionGlobal: {
    monedaLocal: string,    // EUR, USD, etc.
    zona: string,           // Europe/Madrid
    idioma: string,         // es, en, fr
    ticketMedioPorPersona: number,
    diasApertura: [],       // Array de días abiertos
    horarioFlexible: boolean
  }
}
```

---

## 7. Flujos de Autenticación

### 7.1 Flujo de Login

```
Usuario
  ↓
Ingresa credenciales en index.html
  ↓
login.js valida credenciales
  ↓
[NUEVA] POST /api/auth/login
  ↓
Servidor valida usuario
  ↓
Retorna JWT token
  ↓
Frontend guarda token en localStorage + sessionStorage
  ↓
Redirige a dashboard.html
  ↓
dashboard.js lee token y carga datos
```

### 7.2 Protección de Rutas

**Tokens deben ser incluidos en headers:**

```javascript
fetch('/api/reservas', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### 7.3 Control de Acceso por Rol

**El Frontend debe validar:**

```javascript
// En cada módulo (ejemplo reservas.js)
const userRole = localStorage.getItem("crm_logged_user_role");

if (!['SUPERVISOR', 'ADMIN'].includes(userRole)) {
  // Ocular botones de eliminación
  // No permitir cambios críticos
}
```

**El Backend debe validar:**
- Admin: Acceso total
- Supervisor: Crear/editar reservas, personal, configuración
- Camarero: Ver reservas, cambiar estado (SENTADO)
- Cocina: Solo lectura de pedidos (futuro)

---

## 8. Patrones de Comunicación

### 8.1 Llamadas HTTP Estándar

**Todos los endpoints deben seguir RESTful:**

```javascript
// GET - Obtener datos
GET /api/products
GET /api/products/1

// POST - Crear
POST /api/products
Body: { nombre, precio, ... }

// PUT - Actualizar completo
PUT /api/products/1
Body: { nombre, precio, ... }

// PATCH - Actualizar parcial
PATCH /api/products/1/stock
Body: { stock: 45 }

// DELETE - Eliminar
DELETE /api/products/1
```

### 8.2 Respuestas Estandarizadas

**Éxito (2xx):**
```json
{
  "success": true,
  "data": { /* objeto o array */ },
  "message": "Operación realizada exitosamente"
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "CODIGO_ERROR",
  "message": "Descripción del error",
  "details": {}
}
```

### 8.3 Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Mesa ya ocupada, etc. |
| 422 | Unprocessable Entity - Validación |
| 500 | Internal Server Error |

### 8.4 Manejo de Errores en Frontend

```javascript
async function obtenerProductos() {
  try {
    const response = await fetch('/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, redirigir a login
        localStorage.removeItem('jwt_token');
        window.location.href = '/';
      }
      throw new Error(`Error ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      // Usar data.data
    }
  } catch (error) {
    // Mostrar error al usuario
    console.error('Error:', error);
  }
}
```

### 8.5 Headers Requeridos

**Todo request debe incluir:**

```
Authorization: Bearer {token}
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

**Respuestas incluirán:**

```
Content-Type: application/json
Cache-Control: no-cache, no-store, must-revalidate
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Conclusión

Este documento proporciona una visión completa del frontend actual y los requisitos necesarios para implementar una API que lo respalde. La API debe:

1. **Reemplazar LocalStorage** con persistencia en servidor
2. **Mantener la misma estructura de datos** (nombres de campos, tipos)
3. **Implementar autenticación JWT** segura
4. **Usar REST API estándar** con códigos HTTP apropiados
5. **Validar datos** en servidor (no confiar en cliente)
6. **Implementar control de acceso** basado en roles
7. **Auditar cambios** (createdBy, updatedAt)
8. **Proporcionar sincronización** en tiempo real
9. **Realizar respaldos** automáticos de datos
10. **Documentar bien** cada endpoint

El frontend continuará funcionando sin cambios mayores una vez que se implemente la API, ya que los módulos están diseñados para ser agnósticos del almacenamiento.
