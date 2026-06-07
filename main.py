from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import SessionLocal

app = FastAPI(title="PawTrack API", description="API para el rastreo comunitario de mascotas")

# Dependencia para la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor de PawTrack está vivo! 🐾"}


# ==========================================
# ENDPOINTS DE USUARIOS
# ==========================================

@app.get("/usuarios/", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Verificar si el email ya está registrado
    existe_email = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if existe_email:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
        
    # Crear la instancia del modelo SQLAlchemy
    nuevo_usuario = models.Usuario(
        username=usuario.username,
        email=usuario.email
    )
    
    db.add(nuevo_usuario) # Preparar el guardado
    db.commit()           # Guardar en la base de datos real
    db.refresh(nuevo_usuario) # Traer el ID y fecha generados por Postgres
    return nuevo_usuario
# ==========================================
# ACTUALIZAR Y ELIMINAR AVISTAMIENTOS (PUT / DELETE)
# ==========================================

@app.put("/avistamientos/{id_avistamiento}", response_model=schemas.AvistamientoResponse)
def actualizar_avistamiento(id_avistamiento: str, avistamiento_actualizado: schemas.AvistamientoCreate, db: Session = Depends(get_db)):
    # 1. Buscamos si el avistamiento existe en la base de datos
    avistamiento_db = db.query(models.Avistamiento).filter(models.Avistamiento.id_avistamiento == id_avistamiento).first()
    
    if not avistamiento_db:
        raise HTTPException(status_code=404, detail="El avistamiento no existe.")

    # 2. Reemplazamos los datos viejos con los nuevos
    avistamiento_db.especie = avistamiento_actualizado.especie
    avistamiento_db.color = avistamiento_actualizado.color
    avistamiento_db.descripcion = avistamiento_actualizado.descripcion
    avistamiento_db.latitud = avistamiento_actualizado.latitud
    avistamiento_db.longitud = avistamiento_actualizado.longitud
    avistamiento_db.foto_url = avistamiento_actualizado.foto_url

    # 3. Guardamos los cambios en PostgreSQL
    db.commit()
    db.refresh(avistamiento_db)
    return avistamiento_db

@app.delete("/avistamientos/{id_avistamiento}")
def eliminar_avistamiento(id_avistamiento: str, db: Session = Depends(get_db)):
    # 1. Buscamos el reporte
    avistamiento_db = db.query(models.Avistamiento).filter(models.Avistamiento.id_avistamiento == id_avistamiento).first()
    
    if not avistamiento_db:
        raise HTTPException(status_code=404, detail="El avistamiento no existe.")

    # 2. Lo eliminamos de PostgreSQL
    db.delete(avistamiento_db)
    db.commit()
    
    # Devolvemos un mensaje de éxito limpio
    return {"mensaje": "El avistamiento fue eliminado exitosamente del mapa"}


# ==========================================
# ENDPOINTS DE AVISTAMIENTOS
# ==========================================

@app.get("/avistamientos/", response_model=List[schemas.AvistamientoResponse])
def obtener_avistamientos(db: Session = Depends(get_db)):
    return db.query(models.Avistamiento).all()

@app.post("/avistamientos/", response_model=schemas.AvistamientoResponse)
def crear_avistamiento(avistamiento: schemas.AvistamientoCreate, db: Session = Depends(get_db)):
    # Verificar que el usuario que reporta realmente exista
    existe_usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == avistamiento.id_usuario).first()
    if not existe_usuario:
        raise HTTPException(status_code=404, detail="El usuario especificado no existe")

    # Crear la instancia incorporando tu campo personalizado de color
    nuevo_avistamiento = models.Avistamiento(
        id_usuario=avistamiento.id_usuario,
        especie=avistamiento.especie,
        color=avistamiento.color, # <--- Tu campo personalizado guardándose en la base de datos
        descripcion=avistamiento.descripcion,
        latitud=avistamiento.latitud,
        longitud=avistamiento.longitud,
        foto_url=avistamiento.foto_url
    )
    
    db.add(nuevo_avistamiento)
    db.commit()
    db.refresh(nuevo_avistamiento)
    return nuevo_avistamiento