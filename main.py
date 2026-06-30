from fastapi import FastAPI, Depends, HTTPException, Request, status, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import JWTError, jwt
from typing import List
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
from contextlib import asynccontextmanager

# Importaciones locales
from database import engine, SessionLocal
import models, schemas, security, config, logging_config

logger = logging_config.get_logger(__name__)

# ==========================================
# BOOTSTRAP: datos semilla de niveles (gamificación)
# ==========================================
# Fuente de verdad de la curva de niveles. Sin esto, una base de datos NUEVA
# deja la tabla 'niveles' vacía y el PRIMER registro de usuario falla por la
# llave foránea nivel_actual -> niveles.nivel. Por eso se siembra al arrancar.
NIVELES_SEED = [
    (1, "Novato", 0),
    (2, "Explorador", 10),
    (3, "Veterano", 50),
    (4, "Héroe", 150),
    (5, "Leyenda", 500),
]


def seed_niveles() -> None:
    """Inserta los niveles base de forma idempotente (no duplica si ya existen)."""
    db = SessionLocal()
    try:
        existentes = {n.nivel for n in db.query(models.Nivel).all()}
        nuevos = [
            models.Nivel(nivel=n, titulo=t, puntos_requeridos=p)
            for (n, t, p) in NIVELES_SEED
            if n not in existentes
        ]
        if nuevos:
            db.add_all(nuevos)
            db.commit()
            logger.info("Niveles seed inserted | count=%d", len(nuevos))
    except Exception:
        db.rollback()
        logger.exception("Failed to seed niveles", exc_info=True)
        raise
    finally:
        db.close()


def ensure_optional_animal_name_column() -> None:
    """Adds animales.nombre for existing databases created before this feature."""
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("animales")}
    if "nombre" in columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE animales ADD COLUMN nombre VARCHAR(80)"))
    logger.info("Database migrated | added animales.nombre")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- startup ---
    # 1. Construir las tablas si no existen (gestionado por los modelos SQLAlchemy).
    models.Base.metadata.create_all(bind=engine)
    # 2. Aplicar migraciones ligeras para bases existentes.
    ensure_optional_animal_name_column()
    # 3. Sembrar los niveles base (idempotente).
    seed_niveles()
    logger.info(
        "PawTrack backend started successfully | environment=%s | db_configured=%s | version=%s",
        config.ENVIRONMENT,
        bool(config.DATABASE_URL),
        config.APP_VERSION,
    )
    yield
    # --- shutdown --- (nada que limpiar por ahora)


# Inicializamos la aplicación con el ciclo de vida (lifespan) moderno.
app = FastAPI(
    title="PawTrack API",
    description="API para el rastreo comunitario de mascotas",
    lifespan=lifespan,
)

# Rate limiting (slowapi). Se puede desactivar con RATE_LIMIT_ENABLED=false
# (útil en desarrollo local y en pruebas automatizadas).
limiter = Limiter(key_func=get_remote_address, enabled=config.RATE_LIMIT_ENABLED)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}))

# 3. CORS para que el frontend web pueda conectarse al API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOWED_ORIGINS,
    allow_origin_regex=config.CORS_ALLOW_ORIGIN_REGEX,
    # La autenticacion es por header Authorization (Bearer JWT), no por cookies.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Configuramos el sistema de seguridad
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ==========================================
# CONFIGURACIÓN DE CARGA DE IMÁGENES (LOCAL, MVP)
# ==========================================
# Directorio anclado a la ubicación de este archivo (NO al CWD), salvo que
# despliegue configure UPLOADS_DIR para apuntar a un disco persistente.
UPLOADS_DIR = (
    Path(config.UPLOADS_DIR).expanduser()
    if config.UPLOADS_DIR
    else Path(__file__).resolve().parent / "uploads"
)
# Se crea automáticamente al iniciar la app (y antes de montar StaticFiles).
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Límite de tamaño: 5 MB. No confiamos en Content-Length; contamos bytes reales.
MAX_FILE_SIZE = 5 * 1024 * 1024
UPLOAD_CHUNK_SIZE = 1024 * 1024  # 1 MB por lectura (streaming a disco)

# Tipos permitidos -> extensión canónica. La extensión NUNCA proviene del
# nombre original enviado por el cliente, sino de este mapa controlado.
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

# Firmas binarias ("magic bytes") para verificar que el contenido real coincide
# con el Content-Type declarado (defensa en profundidad contra spoofing).
def _content_matches_declared_type(content_type: str, header: bytes) -> bool:
    if content_type == "image/jpeg":
        return header[:3] == b"\xff\xd8\xff"
    if content_type == "image/png":
        return header[:8] == b"\x89PNG\r\n\x1a\n"
    if content_type == "image/webp":
        return header[:4] == b"RIFF" and header[8:12] == b"WEBP"
    return False

# 5. Servir archivos estáticos: las imágenes subidas quedan disponibles en /uploads/<archivo>
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# ==========================================
# MANEJO DE ERRORES GLOBALES
# ==========================================
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.exception(
        "IntegrityError intercepted while processing request %s",
        request.url.path,
        exc_info=True,
    )
    return JSONResponse(
        status_code=400,
        content={
            "detail": "Error de integridad de datos. Verifica que el payload enviado cumpla con las reglas de la BD."
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled exception during request %s",
        request.url.path,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please contact support if the problem persists."},
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


def commit_db(db: Session):
    try:
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Database transaction failed, rollback executed", exc_info=True)
        raise


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db), request: Request = None):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales o el token ha expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.warning("JWT token decoded without subject", extra={"client_ip": request.client.host if request and request.client else "unknown"})
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError as exc:
        logger.warning(
            "JWT validation failed while authenticating request %s | client_ip=%s",
            request.url.path if request else "unknown",
            request.client.host if request and request.client else "unknown",
        )
        raise credentials_exception from exc
        
    usuario = db.query(models.Usuario).filter(models.Usuario.email == token_data.email).first()
    if usuario is None:
        logger.warning(
            "JWT validated email not found in DB | email=%s | client_ip=%s",
            token_data.email,
            request.client.host if request and request.client else "unknown",
        )
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

# ==========================================
# ENDPOINT DE INICIO
# ==========================================
@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor de PawTrack está vivo! 🐾"}

# ==========================================
# ENDPOINTS DE USUARIOS Y LOGIN
# ==========================================
@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": config.ENVIRONMENT,
        "version": config.APP_VERSION,
    }


@app.get("/usuarios/me", response_model=schemas.UsuarioResponse, description="Obtiene el perfil completo del usuario autenticado.")
def obtener_perfil_usuario(current_user: models.Usuario = Depends(get_current_user)):
    """
    Devuelve la información del usuario actual basándose únicamente en su Token JWT.
    Incluye estadísticas calculadas automáticamente por los modelos de SQLAlchemy.
    """
    return current_user

@app.get("/usuarios/", response_model=List[schemas.UsuarioPublico])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
@limiter.limit("3/minute")
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db), request: Request = None):
    """Crear nuevo usuario. Retorna datos completos incluyendo email al usuario que se registró."""
    # Pre-chequeo de duplicados para devolver un mensaje claro al frontend.
    # (La UniqueConstraint de la BD sigue siendo la garantía final ante una carrera.)
    if db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado.")
    if db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El nombre de usuario ya está en uso.")

    hashed_pwd = security.obtener_password_hasheado(usuario.password)
    nuevo_usuario = models.Usuario(
        username=usuario.username, 
        email=usuario.email,       
        password=hashed_pwd
    )
    db.add(nuevo_usuario)
    commit_db(db)
    db.refresh(nuevo_usuario)

    logger.info(
        "User registered | username=%s | user_id=%s",
        usuario.username,
        nuevo_usuario.id_usuario,
    )
    return nuevo_usuario

@app.post("/login", response_model=schemas.Token)
@limiter.limit("5/minute")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db), request: Request = None):
    usuario_db = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    client_ip = request.client.host if request and request.client else "unknown"
    if not usuario_db or not security.verificar_password(form_data.password, usuario_db.password):
        logger.warning(
            "Login failed | attempted_email=%s | client_ip=%s",
            form_data.username,
            client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.crear_token_acceso(data={"sub": usuario_db.email})
    logger.info(
        "Login successful | user_id=%s | email=%s",
        usuario_db.id_usuario,
        usuario_db.email,
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# ENDPOINT DE CARGA DE IMÁGENES (LOCAL, MVP)
# ==========================================
@app.post("/upload", response_model=schemas.UploadResponse)
@limiter.limit("20/minute")
async def subir_imagen(
    request: Request,
    file: UploadFile = File(...),
    current_user: models.Usuario = Depends(get_current_user),
):
    """
    Recibe UNA imagen vía multipart/form-data, la valida y la guarda localmente
    en uploads/ con un nombre UUID. Devuelve la URL pública servida por StaticFiles.

    El frontend luego envía esa 'url' como foto_principal / foto_url al crear
    animales o avistamientos. Este endpoint NO toca la base de datos.
    """
    # 1. Validar el tipo MIME declarado (rechaza todo lo que no sea jpg/png/webp).
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        logger.warning(
            "Image upload rejected (unsupported type) | user_id=%s | content_type=%s",
            current_user.id_usuario,
            content_type or "none",
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type",
        )

    extension = ALLOWED_IMAGE_TYPES[content_type]
    stored_filename = f"{uuid4().hex}.{extension}"
    destino = UPLOADS_DIR / stored_filename

    # Cinturón y tirantes: garantizamos que el destino quede DENTRO de uploads/.
    # Como el nombre es un UUID generado por nosotros esto nunca debería fallar,
    # pero protege ante cualquier regresión futura (path traversal).
    if UPLOADS_DIR.resolve() not in destino.resolve().parents:
        logger.error(
            "Image upload aborted (path escape detected) | user_id=%s | target=%s",
            current_user.id_usuario,
            destino,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid storage path",
        )

    # 2. Leer el primer bloque y verificar las firmas binarias ANTES de escribir.
    first_chunk = await file.read(UPLOAD_CHUNK_SIZE)
    if not _content_matches_declared_type(content_type, first_chunk[:16]):
        logger.warning(
            "Image upload rejected (content/type mismatch) | user_id=%s | content_type=%s",
            current_user.id_usuario,
            content_type,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not match its declared type",
        )

    # 3. Volcar a disco por streaming, contando bytes reales para imponer el límite.
    total_bytes = 0
    try:
        with destino.open("wb") as buffer:
            chunk = first_chunk
            while chunk:
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE:
                    buffer.close()
                    destino.unlink(missing_ok=True)
                    logger.warning(
                        "Image upload rejected (too large) | user_id=%s | bytes_so_far=%s",
                        current_user.id_usuario,
                        total_bytes,
                    )
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File exceeds maximum size of 5 MB",
                    )
                buffer.write(chunk)
                chunk = await file.read(UPLOAD_CHUNK_SIZE)
    except HTTPException:
        raise
    except Exception:
        # Fallo de almacenamiento: limpiamos cualquier archivo parcial y reportamos.
        destino.unlink(missing_ok=True)
        logger.exception(
            "Image upload failed (storage error) | user_id=%s",
            current_user.id_usuario,
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not store the uploaded file",
        )
    finally:
        await file.close()

    # 4. Éxito. NUNCA registramos contenido ni binario, solo metadatos.
    logger.info(
        "Image uploaded | user_id=%s | stored_filename=%s | bytes=%s",
        current_user.id_usuario,
        stored_filename,
        total_bytes,
    )
    return {"filename": stored_filename, "url": f"/uploads/{stored_filename}"}

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
    ahora = datetime.now(timezone.utc)

    # 1. Crear Animal
    nuevo_animal = models.Animal(
        id_descubridor=current_user.id_usuario,
        nombre=datos.nombre.strip() if datos.nombre else None,
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

    # 2. Crear Primer Avistamiento
    nuevo_avistamiento = models.Avistamiento(
        id_animal=nuevo_animal.id_animal,
        id_usuario=current_user.id_usuario,
        latitud=datos.latitud,
        longitud=datos.longitud,
        descripcion=datos.descripcion or "",
        foto_url=datos.foto_principal,
        fecha_creacion=ahora
    )
    db.add(nuevo_avistamiento)

    # 3. Otorgar XP
    current_user.puntos_totales += 5
    actualizar_nivel_usuario(current_user, db)

    commit_db(db)
    db.refresh(nuevo_animal)

    logger.info(
        "Animal created | animal_id=%s | nombre=%s | especie=%s",
        nuevo_animal.id_animal,
        nuevo_animal.nombre,
        nuevo_animal.especie,
    )
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

    animal_db.nombre = animal_actualizado.nombre.strip() if animal_actualizado.nombre else None
    animal_db.especie = animal_actualizado.especie
    animal_db.color_principal = animal_actualizado.color_principal
    animal_db.foto_principal = animal_actualizado.foto_principal

    commit_db(db)
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

    ahora = datetime.now(timezone.utc)

    # 2. Crear el nuevo registro del evento
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

    # 3. Actualizar los datos desnormalizados del animal para el mapa
    animal_db.fecha_ultimo_avistamiento = ahora
    animal_db.ultima_latitud = datos.latitud
    animal_db.ultima_longitud = datos.longitud
    animal_db.total_avistamientos += 1

    # 4. Otorgar XP al usuario por contribuir al seguimiento
    current_user.puntos_totales += 5
    actualizar_nivel_usuario(current_user, db)

    # 5. Guardar transacción completa
    commit_db(db)
    db.refresh(nuevo_avistamiento)

    logger.info(
        "Sighting created | user_id=%s | animal_id=%s | sighting_id=%s",
        current_user.id_usuario,
        animal_db.id_animal,
        nuevo_avistamiento.id_avistamiento,
    )
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

@app.delete("/avistamientos/{id_avistamiento}")
def eliminar_avistamiento(
    id_avistamiento: str,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    """
    Elimina un avistamiento que el propio usuario registró (corregir un error).

    Transacción atómica que mantiene la integridad de TODO el grafo:
      - Solo el autor del avistamiento puede borrarlo.
      - No se permite borrar el ÚNICO avistamiento de un animal (dejaría al
        animal huérfano y con ubicación obsoleta); en ese caso se responde 400.
      - Revierte el XP otorgado en su día: -5 al autor y -1 a cada usuario cuya
        confirmación se borra en cascada (consistente con DELETE /confirmar).
      - Recalcula los campos desnormalizados del animal (total y última
        ubicación/fecha) a partir de los avistamientos restantes.
    """
    avistamiento = db.query(models.Avistamiento)\
        .filter(models.Avistamiento.id_avistamiento == id_avistamiento).first()
    if not avistamiento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avistamiento no encontrado.")

    # 1. Autorización: solo el autor puede borrar su avistamiento.
    if str(avistamiento.id_usuario) != str(current_user.id_usuario):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar este avistamiento."
        )

    id_animal = avistamiento.id_animal

    # 2. No permitir borrar el último avistamiento de un animal (lo dejaría huérfano).
    total_avistamientos = db.query(models.Avistamiento)\
        .filter(models.Avistamiento.id_animal == id_animal).count()
    if total_avistamientos <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar el único avistamiento de un animal."
        )

    # 3. Revertir el XP de cada confirmación que se borrará en cascada.
    confirmaciones = db.query(models.Confirmacion)\
        .filter(models.Confirmacion.id_avistamiento == id_avistamiento).all()
    for confirmacion in confirmaciones:
        confirmador = confirmacion.usuario
        if confirmador:
            confirmador.puntos_totales = max(0, confirmador.puntos_totales - 1)
            actualizar_nivel_usuario(confirmador, db)

    # 4. Revertir el XP que se otorgó al autor por crear este avistamiento.
    current_user.puntos_totales = max(0, current_user.puntos_totales - 5)
    actualizar_nivel_usuario(current_user, db)

    # 5. Borrar el avistamiento (sus confirmaciones caen por cascade) y persistir.
    db.delete(avistamiento)
    db.flush()

    # 6. Recalcular los datos desnormalizados del animal con lo que queda.
    restantes = db.query(models.Avistamiento)\
        .filter(models.Avistamiento.id_animal == id_animal)\
        .order_by(models.Avistamiento.fecha_creacion.desc())\
        .all()
    animal_db = db.query(models.Animal).filter(models.Animal.id_animal == id_animal).first()
    if animal_db and restantes:
        mas_reciente = restantes[0]
        animal_db.total_avistamientos = len(restantes)
        animal_db.fecha_ultimo_avistamiento = mas_reciente.fecha_creacion
        animal_db.ultima_latitud = mas_reciente.latitud
        animal_db.ultima_longitud = mas_reciente.longitud

    commit_db(db)

    logger.info(
        "Sighting deleted | user_id=%s | sighting_id=%s | animal_id=%s",
        current_user.id_usuario,
        id_avistamiento,
        id_animal,
    )
    return {"mensaje": "Avistamiento eliminado exitosamente."}

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

    commit_db(db)
    db.refresh(nueva_confirmacion)
    logger.info(
        "Sighting confirmed | user_id=%s | sighting_id=%s",
        current_user.id_usuario,
        nueva_confirmacion.id_avistamiento,
    )
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

    commit_db(db)
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
