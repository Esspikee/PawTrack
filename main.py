from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import JWTError, jwt
from typing import List
from datetime import datetime, timezone, timedelta

# Importaciones locales
from database import engine, SessionLocal
import models, schemas, security

# 1. Le decimos a SQLAlchemy que construya las tablas si no existen
models.Base.metadata.create_all(bind=engine)

# 2. Inicializamos la aplicación
app = FastAPI(title="PawTrack API", description="API para el rastreo comunitario de mascotas")

# 🛡️ 3. Agregamos CORS para que el Frontend (React/Web) pueda conectarse sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En una Beta cerrada, permitimos conexión desde cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Configuramos el sistema de seguridad
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CONSTANTES DE NEGOCIO
AVISTAMIENTO_COOLDOWN_MINUTES = 5

# ==========================================
# MANEJO DE ERRORES GLOBALES
# ==========================================
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    print(f"🔥 Error interceptado en la BD: {exc}")
    # Aunque FastAPI cierra la conexión, forzar el rollback es una buena práctica
    db = SessionLocal()
    db.rollback()
    db.close()
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Error de integridad de datos. Verifica que el payload enviado cumpla con las reglas de la BD."
        },
    )

# ==========================================
# DEPENDENCIAS
# ==========================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales o el token ha expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    usuario = db.query(models.Usuario).filter(models.Usuario.email == token_data.email).first()
    if usuario is None:
        raise credentials_exception
        
    return usuario

# ==========================================
# FUNCIONES AUXILIARES (LÓGICA DE NEGOCIO)
# ==========================================
def actualizar_nivel_usuario(usuario: models.Usuario, db: Session):
    nivel_correspondiente = db.query(models.Nivel)\
        .filter(models.Nivel.puntos_requeridos <= usuario.puntos_totales)\
        .order_by(models.Nivel.puntos_requeridos.desc())\
        .first()
        
    if nivel_correspondiente and usuario.nivel_actual != nivel_correspondiente.nivel:
        usuario.nivel_actual = nivel_correspondiente.nivel

def verificar_cooldown(id_usuario: str, db: Session):
    """Verifica si han pasado 5 minutos desde el último avistamiento del usuario para evitar farmeo"""
    ultimo_avistamiento = db.query(models.Avistamiento)\
        .filter(models.Avistamiento.id_usuario == id_usuario)\
        .order_by(models.Avistamiento.fecha_creacion.desc())\
        .first()
        
    if ultimo_avistamiento and ultimo_avistamiento.fecha_creacion:
        ahora = datetime.now(timezone.utc)
        fecha_ultimo = ultimo_avistamiento.fecha_creacion
        if fecha_ultimo.tzinfo is None:
            fecha_ultimo = fecha_ultimo.replace(tzinfo=timezone.utc)
            
        tiempo_transcurrido = ahora - fecha_ultimo
        if tiempo_transcurrido < timedelta(minutes=AVISTAMIENTO_COOLDOWN_MINUTES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Debes esperar antes de registrar otro animal o avistamiento."
            )

# ==========================================
# ENDPOINT DE INICIO
# ==========================================
@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor de PawTrack está vivo! 🐾"}

# ==========================================
# ENDPOINTS DE USUARIOS Y LOGIN
# ==========================================
@app.get("/usuarios/me", response_model=schemas.UsuarioResponse, description="Obtiene el perfil completo del usuario autenticado.")
def obtener_perfil_usuario(current_user: models.Usuario = Depends(get_current_user)):
    """
    Devuelve la información del usuario actual basándose únicamente en su Token JWT.
    Incluye estadísticas calculadas automáticamente por los modelos de SQLAlchemy.
    """
    return current_user

@app.get("/usuarios/", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    hashed_pwd = security.obtener_password_hasheado(usuario.password)
    nuevo_usuario = models.Usuario(
        username=usuario.username, 
        email=usuario.email,       
        password=hashed_pwd
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario_db = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    if not usuario_db or not security.verificar_password(form_data.password, usuario_db.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.crear_token_acceso(data={"sub": usuario_db.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# ENDPOINTS DE ANIMALES (INDIVIDUO Y CICLO DE VIDA)
# ==========================================
@app.get("/animales/", response_model=List[schemas.AnimalResponse])
def obtener_animales(db: Session = Depends(get_db)):
    return db.query(models.Animal).all()

@app.get("/animales/{id_animal}", response_model=schemas.AnimalDetalleResponse)
def obtener_animal_detalle(id_animal: str, db: Session = Depends(get_db)):
    animal_db = db.query(models.Animal).filter(models.Animal.id_animal == id_animal).first()
    if not animal_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El animal no existe.")
    return animal_db

@app.post("/animales/", response_model=schemas.AnimalDetalleResponse)
def registrar_nuevo_animal(
    datos: schemas.AnimalCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # 1. Verificar antifraude
    verificar_cooldown(current_user.id_usuario, db)
        
    ahora = datetime.now(timezone.utc)

    # 2. Crear Animal
    nuevo_animal = models.Animal(
        id_descubridor=current_user.id_usuario,
        especie=datos.especie,
        color_principal=datos.color_principal,
        foto_principal=datos.foto_principal,
        fecha_primer_avistamiento=ahora,
        fecha_ultimo_avistamiento=ahora,
        total_avistamientos=1,
        ultima_latitud=datos.latitud,
        ultima_longitud=datos.longitud
    )
    db.add(nuevo_animal)
    db.flush() 

    # 3. Crear Primer Avistamiento
    nuevo_avistamiento = models.Avistamiento(
        id_animal=nuevo_animal.id_animal,
        id_usuario=current_user.id_usuario,
        latitud=datos.latitud,
        longitud=datos.longitud,
        descripcion=datos.descripcion,
        foto_url=datos.foto_principal,
        fecha_creacion=ahora
    )
    db.add(nuevo_avistamiento)

    # 4. Otorgar XP
    current_user.puntos_totales += 5
    actualizar_nivel_usuario(current_user, db)

    db.commit()
    db.refresh(nuevo_animal)
    return nuevo_animal

@app.put("/animales/{id_animal}", response_model=schemas.AnimalResponse)
def actualizar_animal(
    id_animal: str, 
    animal_actualizado: schemas.AnimalUpdate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    animal_db = db.query(models.Animal).filter(models.Animal.id_animal == id_animal).first()
    if not animal_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El animal no existe.")
    if str(animal_db.id_descubridor) != str(current_user.id_usuario):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para modificar el perfil de este animal.")

    animal_db.especie = animal_actualizado.especie
    animal_db.color_principal = animal_actualizado.color_principal
    animal_db.foto_principal = animal_actualizado.foto_principal

    db.commit()
    db.refresh(animal_db)
    return animal_db

# ==========================================
# ENDPOINTS DE SEGUIMIENTO (FASE 4.5)
# ==========================================
@app.post("/animales/{id_animal}/avistamientos", response_model=schemas.AvistamientoResponse)
def agregar_avistamiento(
    id_animal: str,
    datos: schemas.AvistamientoCreate,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """Registra una nueva ubicación o foto para un animal que ya existe en el mapa."""
    # 1. Verificar si el animal existe
    animal_db = db.query(models.Animal).filter(models.Animal.id_animal == id_animal).first()
    if not animal_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El animal no existe.")

    # 2. Verificar antifraude
    verificar_cooldown(current_user.id_usuario, db)
    ahora = datetime.now(timezone.utc)

    # 3. Crear el nuevo registro del evento
    nuevo_avistamiento = models.Avistamiento(
        id_animal=animal_db.id_animal,
        id_usuario=current_user.id_usuario,
        latitud=datos.latitud,
        longitud=datos.longitud,
        descripcion=datos.descripcion,
        foto_url=datos.foto_url,
        fecha_creacion=ahora
    )
    db.add(nuevo_avistamiento)

    # 4. Actualizar los datos desnormalizados del animal para el mapa
    animal_db.fecha_ultimo_avistamiento = ahora
    animal_db.ultima_latitud = datos.latitud
    animal_db.ultima_longitud = datos.longitud
    animal_db.total_avistamientos += 1

    # 5. Otorgar XP al usuario por contribuir al seguimiento
    current_user.puntos_totales += 5
    actualizar_nivel_usuario(current_user, db)

    # 6. Guardar transacción completa
    db.commit()
    db.refresh(nuevo_avistamiento)
    return nuevo_avistamiento

@app.get("/animales/{id_animal}/historial", response_model=List[schemas.AvistamientoResponse])
def obtener_historial_animal(id_animal: str, db: Session = Depends(get_db)):
    """Obtiene toda la ruta y el historial cronológico de un animal."""
    animal_db = db.query(models.Animal).filter(models.Animal.id_animal == id_animal).first()
    if not animal_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El animal no existe.")

    historial = db.query(models.Avistamiento)\
        .filter(models.Avistamiento.id_animal == id_animal)\
        .order_by(models.Avistamiento.fecha_creacion.desc())\
        .all()
        
    return historial

# ==========================================
# ENDPOINTS DE CONFIRMACIONES
# ==========================================
@app.post("/avistamientos/{id_avistamiento}/confirmar", response_model=schemas.ConfirmacionResponse)
def confirmar_avistamiento(
    id_avistamiento: str, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    avistamiento = db.query(models.Avistamiento).filter(models.Avistamiento.id_avistamiento == id_avistamiento).first()
    if not avistamiento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avistamiento no encontrado.")

    if str(avistamiento.id_usuario) == str(current_user.id_usuario):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes confirmar tu propio avistamiento.")

    confirmacion_existente = db.query(models.Confirmacion).filter(
        models.Confirmacion.id_usuario == current_user.id_usuario,
        models.Confirmacion.id_avistamiento == id_avistamiento
    ).first()

    if confirmacion_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya has confirmado este avistamiento.")

    nueva_confirmacion = models.Confirmacion(
        id_usuario=current_user.id_usuario,
        id_avistamiento=avistamiento.id_avistamiento
    )
    db.add(nueva_confirmacion)

    current_user.puntos_totales += 1
    actualizar_nivel_usuario(current_user, db)

    db.commit()
    db.refresh(nueva_confirmacion)
    
    return nueva_confirmacion

@app.delete("/avistamientos/{id_avistamiento}/confirmar")
def eliminar_confirmacion(
    id_avistamiento: str, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    confirmacion = db.query(models.Confirmacion).filter(
        models.Confirmacion.id_usuario == current_user.id_usuario,
        models.Confirmacion.id_avistamiento == id_avistamiento
    ).first()

    if not confirmacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No tienes una confirmación registrada para este avistamiento.")

    db.delete(confirmacion)

    current_user.puntos_totales = max(0, current_user.puntos_totales - 1)
    actualizar_nivel_usuario(current_user, db)

    db.commit()
    return {"mensaje": "Confirmación retirada exitosamente."}

@app.get("/avistamientos/{id_avistamiento}/confirmaciones", response_model=schemas.ListaConfirmacionesResponse)
def obtener_confirmaciones(id_avistamiento: str, db: Session = Depends(get_db)):
    avistamiento = db.query(models.Avistamiento).filter(models.Avistamiento.id_avistamiento == id_avistamiento).first()
    if not avistamiento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avistamiento no encontrado.")

    confirmaciones = db.query(models.Confirmacion).filter(models.Confirmacion.id_avistamiento == id_avistamiento).all()
    
    usuarios_que_confirmaron = [conf.usuario for conf in confirmaciones]

    return {
        "cantidad_total": len(confirmaciones),
        "usuarios": usuarios_que_confirmaron
    }