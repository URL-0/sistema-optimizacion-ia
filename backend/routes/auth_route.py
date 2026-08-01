from fastapi import APIRouter, HTTPException, status
from mysql.connector import Error

from database.db import obtener_conexion
from models.usuario_model import UsuarioLogin
from services.auth_service import crear_token, verificar_password

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)


@router.post("/login")
def login(credenciales: UsuarioLogin):
    """Valida username/password contra la tabla usuarios y devuelve un JWT si son correctos"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE username = %s;", (credenciales.username,))
        usuario = cursor.fetchone()
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar usuario: {str(e)}")
    finally:
        cursor.close()
        conexion.close()

    if not usuario or not verificar_password(credenciales.password, usuario["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    token = crear_token(usuario["username"], usuario["rol"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": usuario["username"],
        "rol": usuario["rol"]
    }
