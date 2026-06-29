from fastapi import APIRouter, HTTPException, status
from database.db import obtener_conexion
from mysql.connector import Error

router = APIRouter(
    prefix="/transacciones",
    tags=["Transacciones"]
)

@router.post("/venta", status_code=status.HTTP_201_CREATED)
def registrar_simulacion_venta(movimiento: dict):
    """Registra un movimiento de salida y actualiza el stock físico del producto"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
        
    try:
        cursor = conexion.cursor(dictionary=True)
        
        codigo_barras = movimiento.get("codigo_barras")
        cantidad = movimiento.get("cantidad")
        
        if not codigo_barras or cantidad is None:
            raise HTTPException(status_code=400, detail="Parámetros insuficientes en la petición")

      
        cursor.execute("SELECT id_product, stock_actual FROM productos WHERE codigo_barras = %s;", (codigo_barras,))
        producto = cursor.fetchone()
        
        if not producto:
            raise HTTPException(status_code=404, detail="El código de barras especificado no está registrado")
            
        id_producto_real = producto['id_product']
        stock_viejo = producto['stock_actual']
        
       
        nuevo_stock = stock_viejo - int(cantidad)
        if nuevo_stock < 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuficiente. Solicitado: {cantidad} und. Disponible: {stock_viejo} und."
            )
        
     
        query_transaccion = """
            INSERT INTO transacciones (id_product, tipo_movimiento, cantidad, descripcion)
            VALUES (%s, %s, %s, %s);
        """
        cursor.execute(query_transaccion, (
            id_producto_real,
            'SALIDA',
            cantidad,
            'Venta simulada desde interfaz de usuario'
        ))
        
        # Sincronización del stock actual del producto
        query_producto = "UPDATE productos SET stock_actual = %s WHERE id_product = %s;"
        cursor.execute(query_producto, (nuevo_stock, id_producto_real))
        
      
        conexion.commit()
        
        return {
            "status": "success",
            "message": "Transacción procesada correctamente",
            "stock_anterior": stock_viejo,
            "nuevo_stock": nuevo_stock
        }
        
    except Error as e:
        conexion.rollback()
        raise HTTPException(status_code=400, detail=f"Fallo en la persistencia de la transacción: {str(e)}")
    finally:
        cursor.close()
        conexion.close()