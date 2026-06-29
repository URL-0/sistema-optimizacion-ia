from pydantic import BaseModel, Field
from typing import Literal

class TransaccionCrear(BaseModel):
    id_product: int
    tipo_movimiento: Literal['ENTRADA', 'SALIDA']
    cantidad: int = Field(..., gt=0)
    descripcion: str | None = Field(None, max_length=255)