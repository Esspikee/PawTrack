from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone
import uuid
import enum

# ==========================================
# ==========================================
# ENUMS
# ==========================================
class EspeciePermitida(str, enum.Enum):
    GATO = "Gato"
    PERRO = "Perro"

# ==========================================
# MODELOS DE BASE DE DATOS
# ==========================================
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
    fecha_creacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relaciones para acceder rápidamente a los registros creados por el usuario
    animales_descubiertos_rel = relationship("Animal", back_populates="descubridor")
    avistamientos_realizados_rel = relationship("Avistamiento", back_populates="usuario")
    confirmaciones_realizadas_rel = relationship("Confirmacion", back_populates="usuario")

    # Propiedades dinámicas para el perfil de usuario
    @property
    def animales_descubiertos(self):
        return len(self.animales_descubiertos_rel)

    @property
    def avistamientos_realizados(self):
        return len(self.avistamientos_realizados_rel)

    @property
    def confirmaciones_realizadas(self):
        return len(self.confirmaciones_realizadas_rel)

class Animal(Base):
    __tablename__ = "animales"
    
    id_animal = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_descubridor = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario"), nullable=False)
    especie = Column(SQLEnum(EspeciePermitida), nullable=False)
    color_principal = Column(String(50), nullable=False)
    foto_principal = Column(String(255), nullable=True)
    
    fecha_primer_avistamiento = Column(DateTime(timezone=True), nullable=False)
    fecha_ultimo_avistamiento = Column(DateTime(timezone=True), nullable=False)
    total_avistamientos = Column(Integer, default=1)
    ultima_latitud = Column(Float, nullable=False)
    ultima_longitud = Column(Float, nullable=False)
    
    # Relaciones
    descubridor = relationship("Usuario", back_populates="animales_descubiertos_rel")
    avistamientos = relationship("Avistamiento", back_populates="animal", cascade="all, delete-orphan")

    @property
    def cantidad_confirmaciones(self):
        """Suma las confirmaciones de todos los avistamientos de este animal"""
        return sum(len(a.confirmaciones) for a in self.avistamientos)

class Avistamiento(Base):
    __tablename__ = "avistamientos"
    
    id_avistamiento = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_animal = Column(UUID(as_uuid=True), ForeignKey("animales.id_animal"), nullable=False)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario"), nullable=False)
    
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    descripcion = Column(String(255), nullable=False)
    foto_url = Column(String(255), nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relaciones
    animal = relationship("Animal", back_populates="avistamientos")
    usuario = relationship("Usuario", back_populates="avistamientos_realizados_rel")
    confirmaciones = relationship("Confirmacion", back_populates="avistamiento", cascade="all, delete-orphan")

    @property
    def cantidad_confirmaciones(self):
        """Retorna el número de personas que han confirmado este avistamiento particular"""
        return len(self.confirmaciones)

class Confirmacion(Base):
    __tablename__ = "confirmaciones"

    id_confirmacion = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario = Column(UUID(as_uuid=True), ForeignKey("usuarios.id_usuario"), nullable=False)
    id_avistamiento = Column(UUID(as_uuid=True), ForeignKey("avistamientos.id_avistamiento"), nullable=False)
    fecha_confirmacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relaciones
    usuario = relationship("Usuario", back_populates="confirmaciones_realizadas_rel")
    avistamiento = relationship("Avistamiento", back_populates="confirmaciones")

    # RESTRICCIÓN FÍSICA DE BASE DE DATOS: Previene que un usuario confirme dos veces el mismo avistamiento
    __table_args__ = (
        UniqueConstraint('id_usuario', 'id_avistamiento', name='_usuario_avistamiento_uc'),
    )