from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid
from datetime import datetime, timezone

class Nivel(Base):
    __tablename__ = "niveles"
    
    nivel = Column(Integer, primary_key=True)
    titulo = Column(String(50), nullable=False)
    puntos_requeridos = Column(Integer, nullable=False)

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id_usuario = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    puntos_totales = Column(Integer, default=0)
    nivel_actual = Column(Integer, ForeignKey("niveles.nivel"), default=1)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Avistamiento(Base):
    __tablename__ = "avistamientos"
    
    id_avistamiento = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario", ondelete="CASCADE"))
    especie = Column(String(10)) # Deberá ser 'Gato' o 'Perro'
    color = Column(String(50), nullable=False)
    descripcion = Column(Text)
    latitud = Column(Numeric(9,6), nullable=False)
    longitud = Column(Numeric(9,6), nullable=False)
    foto_url = Column(String(255))
    fecha_registro = Column(DateTime, default=lambda: datetime.now(timezone.utc))