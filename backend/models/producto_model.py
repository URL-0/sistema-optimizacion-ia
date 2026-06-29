from pydantic import BaseModel, Field

class ProductoCrear(BaseModel):
    codigo_barras: str = Field(..., min_length=3, max_length=50)
    id_categoria: int | None = None
    nombre_producto: str = Field(..., min_length=2, max_length=100)
    precio_unitario: float = Field(..., gt=0)
    stock_actual: int = Field(0, ge=0)
    stock_minimo_alerta: int = Field(5, ge=0)