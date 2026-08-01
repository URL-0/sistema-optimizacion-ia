from pydantic import BaseModel, Field


class UsuarioLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=1, max_length=255)
