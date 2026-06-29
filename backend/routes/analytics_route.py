from fastapi import APIRouter, HTTPException, status
from database.db import obtener_conexion
from datetime import datetime
import re
from mysql.connector import Error

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/prediccion/{producto_id}")
def calcular_prediccion_agotamiento(producto_id: str):
    """Calcula la analítica predictiva de agotamiento de stock basada en el histórico de ventas"""
    conexion = obtener_conexion()
    if not conexion:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    try:
        cursor = conexion.cursor(dictionary=True)
        
        id_limpio = None
        numeros_encontrados = re.findall(r'\d+', str(producto_id))
        if numeros_encontrados:
            id_limpio = int(numeros_encontrados[-1])
        
        producto = None
        
        if id_limpio is not None:
            cursor.execute("SELECT id_product, nombre_producto, stock_actual FROM productos WHERE id_product = %s", (id_limpio,))
            producto = cursor.fetchone()
            
        if not producto:
            nombre_exacto = re.sub(r'\s*\(ID:\s*\d+\)\s*', '', str(producto_id)).strip()
            cursor.execute("SELECT id_product, nombre_producto, stock_actual FROM productos WHERE nombre_producto = %s", (nombre_exacto,))
            producto = cursor.fetchone()
            
        if not producto:
            return {
                "producto": f"No identificado ({producto_id})",
                "stock_actual": 0,
                "velocidad_diaria": 0.0,
                "dias_restantes": 0,
                "alerta": "SIN HISTORIAL"
            }
            
        real_id_product = producto['id_product']
        stock_actual = producto['stock_actual']
        
        query_ventas = """
            SELECT cantidad, fecha_movimiento 
            FROM transacciones 
            WHERE id_product = %s AND (tipo_movimiento = 'SALIDA' OR tipo_movimiento = 'VENTA')
            ORDER BY fecha_movimiento ASC
        """
        cursor.execute(query_ventas, (real_id_product,))
        ventas = cursor.fetchall()
        
        if not ventas or len(ventas) < 1:
            return {
                "producto": producto['nombre_producto'],
                "stock_actual": stock_actual,
                "velocidad_diaria": 0.0,
                "dias_restantes": 0,
                "alerta": "SIN HISTORIAL"
            }
            
        total_vendido = sum(v['cantidad'] for v in ventas if v['cantidad'] is not None)
        fecha_primera_venta = ventas[0]['fecha_movimiento']
        fecha_actual = datetime.now()
        
        if isinstance(fecha_primera_venta, str):
            try:
                fecha_primera_venta = datetime.strptime(fecha_primera_venta, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    fecha_primera_venta = datetime.strptime(fecha_primera_venta, "%Y-%m-%d")
                except:
                    fecha_primera_venta = fecha_actual
        elif not fecha_primera_venta:
            fecha_primera_venta = fecha_actual
            
        try:
            dias_transcurridos = (fecha_actual - fecha_primera_venta).days
        except Exception:
            dias_transcurridos = 1
        
        if dias_transcurridos <= 0:
            dias_transcurridos = 1 
            
        velocidad_diaria = round(total_vendido / dias_transcurridos, 2)
        
        if velocidad_diaria > 0:
            dias_restantes = round(stock_actual / velocidad_diaria, 1)
            if dias_restantes <= 3:
                alerta = "CRÍTICO"
            elif dias_restantes <= 7:
                alerta = "MODERADO"
            else:
                alerta = "ESTABLE"
        else:
            dias_restantes = 0
            alerta = "ESTABLE"
            
        return {
            "producto": producto['nombre_producto'],
            "stock_actual": stock_actual,
            "velocidad_diaria": velocidad_diaria,
            "dias_restantes": dias_restantes,
            "alerta": alerta
        }
        
    except Error as e:
        return {
            "producto": "Error de procesamiento interno",
            "stock_actual": 0,
            "velocidad_diaria": 0.0,
            "dias_restantes": 0,
            "alerta": "ERROR SERVIDOR"
        }
    finally:
        cursor.close()
        conexion.close()