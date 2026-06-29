from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import productos_route
from routes import transacciones_route
from routes import analytics_route

app = FastAPI(
    title="Sistema de Optimización de Inventarios con IA",
    description="API Modular para Gestión Transaccional y Analytics",
    version="1.0.0"
)


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(productos_route.router)
app.include_router(transacciones_route.router)
app.include_router(analytics_route.router)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Servidor de optimización de inventarios activo correctamente."}