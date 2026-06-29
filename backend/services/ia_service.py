from database.db import obtener_conexion
from mysql.connector import Error
import math

def calcular_optimizacion_producto(id_product: int, lead_time_dias: int = 3):
    """
    Analiza el histórico de transacciones para determinar de forma predictiva
    el Stock de Seguridad y el Punto de Reorden (ROP) óptimo.
    """
    conexion = obtener_conexion()
    if not conexion:
        return None
        
    try:
        cursor = conexion.cursor(dictionary=True)
        
        query = """
            SELECT cantidad, fecha_movimiento 
            FROM transacciones 
            WHERE id_product = %s AND tipo_movimiento = 'SALIDA';
        """
        cursor.execute(query, (id_product,))
        salidas = cursor.fetchall()
        
        if len(salidas) < 2:
            return {
                "status": "insufficient_data",
                "mensaje": "Historial insuficiente para cálculo predictivo. Se aplican valores base de contingencia.",
                "stock_seguridad_sugerido": 5,
                "punto_reorden_sugerido": 10
            }
            
        total_vendido = sum(s['cantidad'] for s in salidas if s['cantidad'] is not None)
        
        fecha_inicio = salidas[0]['fecha_movimiento']
        fecha_fin = salidas[-1]['fecha_movimiento']
        
        dias_totales = max((fecha_fin - fecha_inicio).days, 1)
        demanda_promedio_diaria = total_vendido / dias_totales
        
        # Algoritmo de Variabilidad: Cálculo de Desviación Estándar de la demanda
        variaciones = [(s['cantidad'] - demanda_promedio_diaria) ** 2 for s in salidas]
        desviacion_estandar = math.sqrt(sum(variaciones) / len(salidas))
        
        # Nivel de confianza Z = 1.65 (Equivalente al 95% de nivel de servicio)
        stock_seguridad = math.ceil(1.65 * desviacion_estandar * math.sqrt(lead_time_dias))
        
        # Cálculo del Punto de Reorden (Reorder Point - ROP)
        punto_reorden = math.ceil((demanda_promedio_diaria * lead_time_dias) + stock_seguridad)
        
        return {
            "status": "success",
            "id_product": id_product,
            "demanda_promedio_diaria": round(demanda_promedio_diaria, 2),
            "stock_seguridad_sugerido": stock_seguridad,
            "punto_reorden_sugerido": punto_reorden,
            "lead_time_evaluado_dias": lead_time_dias
        }
        
    except Error:
        return None
    finally:
        cursor.close()
        conexion.close()