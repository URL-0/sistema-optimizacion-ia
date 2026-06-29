from fastapi import APIRouter, HTTPException, status
from database.db import obtener_conexion
from models.producto_model import ProductoCrear
from mysql.connector import Error

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)

@router.get("/")
def listar_productos():
    """Consulta la base de datos y devuelve la lista completa de productos"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="No se pudo conectar a la base de datos")
    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT * FROM productos;")
        return cursor.fetchall()
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Error al listar productos: {str(e)}")
    finally:
        cursor.close()
        conexion.close()


@router.post("/", status_code=status.HTTP_201_CREATED)
def crear_producto(producto: ProductoCrear):
    """Inserta un nuevo registro de producto en la base de datos MySQL"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
        
    try:
        cursor = conexion.cursor()
        query = """
            INSERT INTO productos (codigo_barras, id_categoria, nombre_producto, precio_unitario, stock_actual, stock_minimo_alerta)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        valores = (
            producto.codigo_barras,
            producto.id_categoria,
            producto.nombre_producto,
            producto.precio_unitario,
            producto.stock_actual,
            producto.stock_minimo_alerta
        )
        
        cursor.execute(query, valores)
        conexion.commit()
        
        return {
            "status": "success",
            "message": "Producto creado exitosamente", 
            "id_generado": cursor.lastrowid
        }
        
    except Error as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Error de persistencia: {str(e)}"
        )
    finally:
        cursor.close()
        conexion.close()