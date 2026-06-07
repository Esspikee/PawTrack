from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

# Importaciones locales
from database import engine, SessionLocal
import models, schemas, security

# 1. Le decimos a SQLAlchemy que construya las tablas si no existen
models.Base.metadata.create_all(bind=engine)

# 2. Inicializamos la aplicación
app = FastAPI(title="PawTrack API", description="API para el rastreo comunitario de mascotas")

# 3. Configuramos el sistema de seguridad (El candado)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ==========================================
# MANEJO DE ERRORES GLOBALES
# ==========================================
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    print(f"🔥 Error interceptado en la BD: {exc}")
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Error de integridad de datos. Verifica que el payload enviado cumpla con las reglas de la BD o que no haya correos duplicados."
        },
    )

# ==========================================
# DEPENDENCIA DE BASE DE DATOS
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# ENDPOINT DE INICIO
# ==========================================
@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor de PawTrack está vivo! 🐾"}

# ==========================================
# ENDPOINTS DE USUARIOS Y LOGIN
# ==========================================
@app.get("/usuarios/", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Encriptamos la contraseña
    hashed_pwd = security.obtener_password_hasheado(usuario.password)
    
    # Alineado estrictamente con models.py
    nuevo_usuario = models.Usuario(
        username=usuario.username, 
        email=usuario.email,       
        password=hashed_pwd
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscamos al usuario usando 'email' y 'password' que son los nombres actuales
    usuario_db = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    
    if not usuario_db or not security.verificar_password(form_data.password, usuario_db.password):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.crear_token_acceso(data={"sub": usuario_db.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# ENDPOINTS DE AVISTAMIENTOS
# ==========================================
@app.get("/avistamientos/", response_model=List[schemas.AvistamientoResponse])
def obtener_avistamientos(db: Session = Depends(get_db)):
    return db.query(models.Avistamiento).all()

@app.post("/avistamientos/", response_model=schemas.AvistamientoResponse)
def crear_avistamiento(
    avistamiento: schemas.AvistamientoCreate, 
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme) # 🔐 Candado para crear
):
    existe_usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == avistamiento.id_usuario).first()
    if not existe_usuario:
        raise HTTPException(status_code=404, detail="El usuario especificado no existe")

    nuevo_avistamiento = models.Avistamiento(
        id_usuario=avistamiento.id_usuario,
        especie=avistamiento.especie,
        color=avistamiento.color,
        descripcion=avistamiento.descripcion,
        latitud=avistamiento.latitud,
        longitud=avistamiento.longitud,
        foto_url=avistamiento.foto_url
    )
    
    db.add(nuevo_avistamiento)
    db.commit()
    db.refresh(nuevo_avistamiento)
    return nuevo_avistamiento

@app.put("/avistamientos/{id_avistamiento}", response_model=schemas.AvistamientoResponse)
def actualizar_avistamiento(
    id_avistamiento: str, 
    avistamiento_actualizado: schemas.AvistamientoCreate, 
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme) # 🔐 Candado para actualizar
):
    avistamiento_db = db.query(models.Avistamiento).filter(models.Avistamiento.id_avistamiento == id_avistamiento).first()
    
    if not avistamiento_db:
        raise HTTPException(status_code=404, detail="El avistamiento no existe.")

    avistamiento_db.especie = avistamiento_actualizado.especie
    avistamiento_db.color = avistamiento_actualizado.color
    avistamiento_db.descripcion = avistamiento_actualizado.descripcion
    avistamiento_db.latitud = avistamiento_actualizado.latitud
    avistamiento_db.longitud = avistamiento_actualizado.longitud
    avistamiento_db.foto_url = avistamiento_actualizado.foto_url

    db.commit()
    db.refresh(avistamiento_db)
    return avistamiento_db

@app.delete("/avistamientos/{id_avistamiento}")
def eliminar_avistamiento(
    id_avistamiento: str, 
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme) # 🔐 Candado para borrar
):
    avistamiento_db = db.query(models.Avistamiento).filter(models.Avistamiento.id_avistamiento == id_avistamiento).first()
    
    if not avistamiento_db:
        raise HTTPException(status_code=404, detail="El avistamiento no existe.")

    db.delete(avistamiento_db)
    db.commit()
    
    return {"mensaje": "El avistamiento fue eliminado exitosamente del mapa"}