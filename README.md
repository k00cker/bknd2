# E-Commerce API - Entrega Final

Servidor Node.js/Express con MongoDB para un sistema completo de e-commerce con gestión de productos, carritos, paginación, filtros y vistas dinámicas.

## ✨ Características Principales

- ✅ **Base de datos MongoDB** - Persistencia completa con Mongoose
- ✅ **Paginación** - Soporte para limit, page y navegación
- ✅ **Filtros avanzados** - Por categoría y disponibilidad
- ✅ **Ordenamiento** - Por precio (ascendente/descendente)
- ✅ **Sistema de carritos** - Completo con populate de referencias
- ✅ **Vistas dinámicas** - Handlebars con datos en tiempo real
- ✅ **API RESTful** - Endpoints completos para productos y carritos
- ✅ **Validaciones** - De datos y manejo robusto de errores
- ✅ **WebSockets** - Real-time para productos con Socket.io
- ✅ **Autenticación JWT** - Sistema seguro con Passport
- ✅ **Encriptación Bcrypt** - Hash seguro de contraseñas
- ✅ **Gestión de Usuarios** - Registro, login y autorización

## 📋 Requisitos Previos

- Node.js (v14+)
- MongoDB Atlas o MongoDB local
- npm o yarn

## 🚀 Instalación

### 1. Clonar repositorio
```bash
git clone <repositorio>
cd ecommerce-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=ecommerce
PORT=8080
NODE_ENV=development
JWT_SECRET=tu_secreto_jwt_muy_seguro_cambiar_en_produccion
```

### 4. Iniciar el servidor

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:8080`

## 📁 Estructura del Proyecto

```
ecommerce-api/
├── .env                          # Variables de entorno (no commitear)
├── .gitignore                    # Archivos a ignorar en Git
├── package.json                  # Dependencias del proyecto
├── README.md                     # Este archivo
├── AUTENTICACION.md              # Documentación de autenticación
├── EJEMPLOS_AUTENTICACION.md     # Ejemplos de uso de autenticación
│
├── src/
│   ├── app.js                   # Configuración principal de Express
│   │
│   ├── config/
│   │   └── passport.js          # Configuración de Passport (estrategias)
│   │
│   ├── db/
│   │   ├── connection.js        # Conexión a MongoDB
│   │   ├── Product.js           # Esquema de Producto
│   │   ├── Cart.js              # Esquema de Carrito
│   │   └── User.js              # Esquema de Usuario (nuevo)
│   │
│   ├── managers/
│   │   ├── ProductManager.js    # Lógica de productos
│   │   ├── CartManager.js       # Lógica de carritos
│   │   └── UserManager.js       # Lógica de usuarios (nuevo)
│   │
│   ├── routes/
│   │   ├── products.js          # Rutas de API /api/products
│   │   ├── carts.js             # Rutas de API /api/carts
│   │   ├── sessions.js          # Rutas de API /api/sessions (nuevo)
│   │   └── views.js             # Rutas de vistas Handlebars
│   │
│   └── views/
│       ├── layouts/
│       │   └── main.handlebars  # Layout principal
│       ├── home.handlebars      # Home con listado de productos
│       ├── products.handlebars  # Listado con paginación
│       ├── productDetail.handlebars # Detalle de producto
│       ├── cart.handlebars      # Vista del carrito
│       ├── realTimeProducts.handlebars # Real-time con WebSockets
│       └── error.handlebars     # Página de error
│
└── public/
    └── test.html                # HTML de prueba
```

## � Autenticación y Autorización

El proyecto implementa un sistema completo de autenticación con JWT y Passport:

### Características de Seguridad
- **Contraseñas hasheadas** con bcrypt (10 rondas)
- **JWT tokens** con expiración de 24 horas
- **Cookies HttpOnly** para protección contra XSS
- **CSRF protection** con SameSite=Strict
- **Modelo de Usuario** con validaciones integradas

### Endpoints de Autenticación
- `POST /api/sessions/register` - Registrar nuevo usuario
- `POST /api/sessions/login` - Iniciar sesión
- `GET /api/sessions/current` - Obtener usuario actual (requiere autenticación)
- `GET /api/sessions/logout` - Cerrar sesión


## 🔌 Endpoints de la API

### Productos

#### GET `/api/products`
Listar productos con paginación, filtros y ordenamiento.

**Query Parameters:**
- `limit` (number, default: 10) - Productos por página
- `page` (number, default: 1) - Número de página
- `query` (string) - Filtrar por categoría o disponibilidad
- `sort` (string: 'asc'|'desc') - Ordenar por precio

**Respuesta:**
```json
{
  "status": "success",
  "payload": [...],
  "totalPages": 1,
  "prevPage": null,
  "nextPage": null,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevLink": null,
  "nextLink": null
}
```

**Ejemplos:**
```
GET /api/products?limit=10&page=1
GET /api/products?query=electrónica&sort=asc
GET /api/products?query=disponible&limit=5
```

#### GET `/api/products/:pid`
Obtener un producto específico por ID.

```
GET /api/products/69987ee79972089ace35e237
```

#### POST `/api/products`
Crear un nuevo producto.

**Body:**
```json
{
  "title": "Laptop Dell XPS 13",
  "description": "Laptop ultraligera y potente",
  "code": "DELL-XPS-001",
  "price": 1200,
  "stock": 15,
  "category": "electrónica",
  "status": true,
  "thumbnails": []
}
```

#### PUT `/api/products/:pid`
Actualizar un producto.

#### DELETE `/api/products/:pid`
Eliminar un producto.

### Carritos

#### POST `/api/carts`
Crear un nuevo carrito vacío.

#### GET `/api/carts/:cid`
Obtener un carrito con todos sus productos (con populate).

```
GET /api/carts/69987f079972089ace35e249
```

Respuesta incluye productos completos, no solo IDs.

#### POST `/api/carts/:cid/product/:pid`
Agregar un producto al carrito. Si ya existe, incrementa cantidad.

```
POST /api/carts/69987f079972089ace35e249/product/69987ee79972089ace35e237
```

#### PUT `/api/carts/:cid/product/:pid`
Actualizar la cantidad de un producto en el carrito.

**Body:**
```json
{
  "quantity": 5
}
```

#### DELETE `/api/carts/:cid/product/:pid`
Eliminar un producto específico del carrito.

```
DELETE /api/carts/69987f079972089ace35e249/product/69987ee79972089ace35e237
```

#### PUT `/api/carts/:cid`
Actualizar carrito con un array completo de productos.

**Body:**
```json
{
  "products": [
    {
      "product": "69987ee79972089ace35e237",
      "quantity": 2
    },
    {
      "product": "69987eed9972089ace35e23a",
      "quantity": 1
    }
  ]
}
```

#### DELETE `/api/carts/:cid`
Vaciar el carrito completamente.

```
DELETE /api/carts/69987f079972089ace35e249
```

## 🌐 Rutas de Vistas

- **GET `/`** - Home con listado de productos
- **GET `/products`** - Listado de productos con filtros y paginación
- **GET `/products/:pid`** - Detalle de un producto
- **GET `/carts/:cid`** - Vista del carrito
- **GET `/realtimeproducts`** - Productos en tiempo real con WebSockets

## 🔍 Ejemplos de Uso

### Crear un producto (API)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Monitor LG 32\"",
    "description": "Monitor 4K profesional",
    "code": "LG-MON-001",
    "price": 600,
    "stock": 8,
    "category": "monitores"
  }'
```

### Obtener productos con filtro
```bash
# Por categoría
curl http://localhost:8080/api/products?query=electrónica

# Por disponibilidad
curl http://localhost:8080/api/products?query=disponible

# Ordenados por precio (ascendente)
curl http://localhost:8080/api/products?sort=asc

# Combinado con paginación
curl "http://localhost:8080/api/products?query=audio&sort=asc&limit=5&page=2"
```

### Crear carrito y agregar productos
```bash
# Crear carrito
CART_ID=$(curl -s -X POST http://localhost:8080/api/carts | jq -r '.payload._id')

# Agregar producto
curl -X POST http://localhost:8080/api/carts/$CART_ID/product/PRODUCT_ID

# Ver carrito
curl http://localhost:8080/api/carts/$CART_ID
```

## 📚 Documentación Adicional


- **[E-Commerce-API.postman_collection.json](./E-Commerce-API.postman_collection.json)** - Colección de Postman para testing

## ✅ Validaciones Implementadas

### Productos
- ✓ Campos requeridos: title, description, code, price, stock, category
- ✓ Código único (no permite duplicados)
- ✓ Validación de tipos de datos
- ✓ Validación de montos positivos
- ✓ Manejo de errores con mensajes claros

### Carritos
- ✓ Validación de ObjectId
- ✓ Cantidad mínima de 1
- ✓ Validación de productos existentes
- ✓ Prevent crashes en errores

## 🔐 Seguridad

- Variables de entorno en `.env` (no versionadas)
- Validación de entrada en todos los endpoints
- Uso de Mongoose para validaciones de esquema
- Manejo centralizado de errores

## 🛠 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Handlebars** - Motor de plantillas
- **Socket.io** - WebSockets
- **Nodemon** - Auto-reload en desarrollo

## 📦 Dependencias

```json
{
  "express": "^4.18.2",
  "express-handlebars": "^8.0.3",
  "mongoose": "^7.x",
  "dotenv": "^16.x",
  "socket.io": "^4.8.3"
}
```

## 🚦 Scripts Disponibles

```json
{
  "start": "node src/app.js",
  "dev": "nodemon src/app.js"
}
```

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con auto-reload

## 🐛 Troubleshooting

### Conexión a MongoDB
```
Error: No MONGODB_URI in .env
```
Asegúrate de tener el archivo `.env` con la URL de conexión.

### Puerto en uso
```
Error: listen EADDRINUSE :::8080
```
Cambia PORT en `.env` o termina el proceso usando el puerto 8080.

### Módulos no encontrados
```
npm ERR! missing: mongoose
```
Ejecuta `npm install` nuevamente.

## 📝 Notas Importantes

- El archivo `.env` contiene credenciales y NO debe ser commiteado
- Los archivos JSON de datos locales (`data/`) ya no se usan, todo está en MongoDB
- El sistema maneja automáticamente populate de referencias en carritos
- Socket.io requiere un cliente compatible para real-time

## 👤 Autor
Felipe Menendez R.

Entrega Final- BACKEND 2 CODERHOUSE - Proyecto E-Commerce con MongoDB y Mongoose

## 📄 Licencia

Este proyecto es para uso educativo.
  - Ejemplo: `GET http://localhost:8080/api/products/1`

- **POST /** - Crear nuevo producto
  - Body (JSON):
    ```json
    {
      "title": "Producto",
      "description": "Descripción",
      "code": "PROD-001",
      "price": 100,
      "stock": 10,
      "category": "Categoría",
      "status": true,
      "thumbnails": ["url1", "url2"]
    }
    ```

- **PUT /:pid** - Actualizar producto
  - Body (JSON): Enviar los campos a actualizar
  - Nota: El ID no puede ser actualizado

- **DELETE /:pid** - Eliminar producto
  - Ejemplo: `DELETE http://localhost:8080/api/products/1`

### Carritos (`/api/carts`)

- **POST /** - Crear nuevo carrito
  - Ejemplo: `POST http://localhost:8080/api/carts`

- **GET /:cid** - Obtener productos del carrito
  - Ejemplo: `GET http://localhost:8080/api/carts/1`

- **POST /:cid/product/:pid** - Agregar producto al carrito
  - Ejemplo: `POST http://localhost:8080/api/carts/1/product/2`
  - Nota: Si el producto ya existe, incrementa la cantidad

## Ejemplo de Flujo

1. Crear un carrito:
   ```
   POST /api/carts
   ```
   Respuesta: `{ "id": 1, "products": [] }`

2. Crear un producto:
   ```
   POST /api/products
   Body:
   {
     "title": "Laptop",
     "description": "Laptop de 15 pulgadas",
     "code": "LAP-001",
     "price": 999.99,
     "stock": 5,
     "category": "Electrónica"
   }
   ```
   Respuesta: `{ "id": 1, "title": "Laptop", ... }`

3. Agregar producto al carrito:
   ```
   POST /api/carts/1/product/1
   ```
   Respuesta: Carrito actualizado con el producto

## Archivos de Persistencia

- `data/productos.json` - Almacena todos los productos
- `data/carrito.json` - Almacena todos los carritos
