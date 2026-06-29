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

##  Instalación y Ejecución en Local

Para levantar todo el ecosistema con un solo comando, abre la terminal en la raíz del proyecto y ejecuta:

```bash
docker-compose up --build