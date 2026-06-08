from pydantic import BaseModel, Field, EmailStr, field_validator
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

class UsuarioPublico(BaseModel):
    """Esquema seguro para listar usuarios públicamente (sin email)."""
    id_usuario: uuid.UUID
    username: str
    puntos_totales: int
    nivel_actual: int
    fecha_creacion: datetime
    animales_descubiertos: int
    avistamientos_realizados: int
    confirmaciones_realizadas: int

    class Config:
        from_attributes = True

class UsuarioCreate(UsuarioBase):
    # Validación de formato de email SOLO en la entrada (creación). Los modelos
    # de respuesta mantienen 'email: str' para no romper la serialización de
    # filas antiguas que pudieran tener un email no conforme (evita 500).
    email: EmailStr
    password: str = Field(..., min_length=1)

    @field_validator("password")
    @classmethod
    def password_dentro_del_limite_bcrypt(cls, v: str) -> str:
        # bcrypt (5.x) LANZA ValueError si la contraseña supera 72 BYTES.
        # max_length contaba caracteres, no bytes: una contraseña multibyte
        # (acentos/emojis) podía pasar el schema y reventar en el hasheo (500).
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede exceder 72 bytes.")
        return v

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
# ESQUEMAS DE CARGA DE IMÁGENES (UPLOAD)
# ==========================================
class UploadResponse(BaseModel):
    """Respuesta del endpoint POST /upload. El frontend toma 'url' y la envía
    como foto_principal / foto_url al crear animales o avistamientos."""
    filename: str
    url: str

# ==========================================
# ESQUEMAS DE AUTENTICACIÓN
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None