from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import EspeciePermitida
import uuid

# ==========================================
# ESQUEMAS BÁSICOS
# ==========================================
class UsuarioBasico(BaseModel):
    id_usuario: uuid.UUID
    username: str
    
    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS DE USUARIO
# ==========================================
class UsuarioBase(BaseModel):
    username: str
    email: str

class UsuarioCreate(UsuarioBase):
    # 🛡️ Protección contra el bug de Bcrypt (Límite de 72 bytes)
    password: str = Field(..., max_length=70)

class UsuarioResponse(UsuarioBase):
    id_usuario: uuid.UUID
    puntos_totales: int
    nivel_actual: int
    fecha_creacion: datetime
    animales_descubiertos: int
    avistamientos_realizados: int
    confirmaciones_realizadas: int

    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS DE CONFIRMACIÓN
# ==========================================
class ConfirmacionResponse(BaseModel):
    id_confirmacion: uuid.UUID
    id_usuario: uuid.UUID
    id_avistamiento: uuid.UUID
    fecha_confirmacion: datetime
    
    class Config:
        from_attributes = True

class ListaConfirmacionesResponse(BaseModel):
    cantidad_total: int
    usuarios: List[UsuarioBasico]

# ==========================================
# ESQUEMAS DE AVISTAMIENTO (EVENTO)
# ==========================================
class AvistamientoBase(BaseModel):
    latitud: float
    longitud: float
    descripcion: str
    foto_url: Optional[str] = None

class AvistamientoCreate(AvistamientoBase):
    pass

class AvistamientoResponse(AvistamientoBase):
    id_avistamiento: uuid.UUID
    id_animal: uuid.UUID
    id_usuario: uuid.UUID
    fecha_creacion: datetime
    cantidad_confirmaciones: int
    
    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS DE ANIMAL (INDIVIDUO)
# ==========================================
class AnimalCreate(BaseModel):
    especie: EspeciePermitida
    color_principal: str
    foto_principal: Optional[str] = None
    latitud: float
    longitud: float
    descripcion: str

class AnimalUpdate(BaseModel):
    especie: EspeciePermitida
    color_principal: str
    foto_principal: Optional[str] = None

class AnimalResponse(BaseModel):
    id_animal: uuid.UUID
    especie: EspeciePermitida
    color_principal: str
    foto_principal: Optional[str] = None
    total_avistamientos: int
    ultima_latitud: float
    ultima_longitud: float
    fecha_ultimo_avistamiento: datetime
    cantidad_confirmaciones: int

    class Config:
        from_attributes = True

class AnimalDetalleResponse(AnimalResponse):
    id_descubridor: uuid.UUID
    fecha_primer_avistamiento: datetime
    avistamientos: List[AvistamientoResponse] = []

    class Config:
        from_attributes = True

# ==========================================
# ESQUEMAS DE AUTENTICACIÓN
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None