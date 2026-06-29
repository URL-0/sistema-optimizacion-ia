import mysql.connector
from mysql.connector import Error

db_config = {
    "host": "database",
    "user": "root",
    "password": "Desarrollador",  
    "database": "sistema_inventario",
    "port": 3306
}

def obtener_conexion():
    """Abre y retorna una conexión activa a la base de datos MySQL"""
    try:
        conexion = mysql.connector.connect(**db_config)
        if conexion.is_connected():
            return conexion
    except Error as e:
        print(f"Error de infraestructura: No se pudo conectar a la base de datos -> {e}")
        return None