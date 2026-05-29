from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

# ==========================================
# ESQUEMAS DE USUARIO
# ==========================================

# Lo que la app móvil envía para registrar a alguien
class UsuarioCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str 

# Lo que el servidor devuelve cuando consultas tu perfil
class UsuarioResponse(BaseModel):
    id_usuario: UUID
    username: str
    email: str
    puntos_totales: int
    nivel_actual: int
    fecha_creacion: datetime

    class Config:
        # Esto le permite a Pydantic "traducir" automáticamente los datos que vienen de SQLAlchemy
        from_attributes = True 

# ==========================================
# ESQUEMAS DE AVISTAMIENTO
# ==========================================

# Lo que la app envía cuando ves un peludito en la calle
class AvistamientoCreate(BaseModel):
    id_usuario: UUID
    especie: str = Field(..., description="Debe ser 'Gato' o 'Perro'")
    color: str = Field(..., max_length=50, description="Color del animal (ej: Negro con blanco)") # <--- NUEVO CAMPO
    descripcion: Optional[str] = None
    latitud: float = Field(..., ge=-90, le=90)
    longitud: float = Field(..., ge=-180, le=180)
    foto_url: Optional[str] = None

# Lo que el servidor responde para pintar el pin en el mapa
class AvistamientoResponse(BaseModel):
    id_avistamiento: UUID
    id_usuario: UUID
    especie: str
    color: str # <--- NUEVO CAMPO
    descripcion: Optional[str]
    latitud: float
    longitud: float
    foto_url: Optional[str]
    fecha_registro: datetime

    class Config:
        from_attributes = True