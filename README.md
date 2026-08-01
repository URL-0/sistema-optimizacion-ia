# Sistema de Optimización de Inventario con IA 

Este es un sistema inteligente de gestión de inventarios completamente contenedorizado. Permite controlar el stock físico de almacén, registrar flujos transaccionales (entradas, salidas y ventas) y ofrece un módulo con endpoints analíticos predictivos potenciados por Inteligencia Artificial.

##  Tecnologías Utilizadas

* **Frontend:** React + Vite (JavaScript / Tailwind CSS)
* **Backend:** Python + FastAPI / Uvicorn
* **Base de Datos:** MySQL 8.0
* **Orquestación y Entorno:** Docker & Docker Compose

##  Arquitectura del Proyecto

El proyecto está diseñado bajo una arquitectura de microservicios locales orquestados por Docker, asegurando que corra exactamente igual en cualquier máquina:

1. **`frontend`**: Servidor de desarrollo en Vite que despliega la interfaz de usuario.
2. **`backend`**: API REST en Python encargada de la lógica de negocio y los algoritmos analíticos.
3. **`database`**: Motor MySQL 8.0 con persistencia de datos configurada mediante volúmenes de Docker para evitar la pérdida de información.

##  Variables de Entorno

El proyecto necesita un archivo `.env` en la raíz (no se sube al repositorio) con las credenciales de la base de datos y la clave usada para firmar los tokens de sesión. Copia la plantilla y complétala:

```bash
cp .env.example .env
```

```
DB_PASSWORD=tu_password_de_mysql
JWT_SECRET_KEY=una_clave_aleatoria_larga
```

Puedes generar una clave aleatoria segura con:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

##  Instalación y Ejecución en Local

Para levantar todo el ecosistema con un solo comando, abre la terminal en la raíz del proyecto y ejecuta:

```bash
docker compose up -d --build
```

Esto construye las imágenes y levanta los 3 servicios (`database`, `backend`, `frontend`) conectados entre sí:

* **Frontend:** http://localhost:5173
* **Backend / API:** http://localhost:8000
* **Documentación interactiva (Swagger):** http://localhost:8000/docs
* **MySQL:** localhost:3307

##  Autenticación

Las rutas que modifican datos (crear productos, registrar transacciones) requieren iniciar sesión. El script de inicialización de la base de datos (`backend/script.sql`) crea dos usuarios de prueba:

| Usuario    | Contraseña     | Rol       |
|------------|----------------|-----------|
| `admin`    | `admin123`     | Admin     |
| `operario` | `operario123`  | Operario  |

El login se hace contra `POST /auth/login`, que devuelve un token JWT válido por 60 minutos. Ese token debe enviarse en el header `Authorization: Bearer <token>` en las peticiones protegidas. La interfaz web ya maneja esto automáticamente al iniciar sesión desde el frontend.
