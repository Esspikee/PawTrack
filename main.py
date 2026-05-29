from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List

# Importamos las herramientas que construiste en los pasos anteriores
from database import SessionLocal
import models
import schemas

# 1. Instanciamos la aplicación (El servidor en sí)
app = FastAPI(title="PawTrack API", description="API para el rastreo comunitario de mascotas")

# 2. Inyección de Dependencias (El Portero)
# Esta función abre una "llamada" a PostgreSQL por cada petición web y la cierra al terminar
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 3. Nuestro primer "Endpoint" (Ruta de prueba)
@app.get("/")
def inicio():
    return {"mensaje": "¡El servidor de PawTrack está vivo! 🐾"}

# 4. Ruta para pedir los usuarios
# Fíjate cómo usa schemas.UsuarioResponse para darle formato a la salida
@app.get("/usuarios/", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(models.Usuario).all()
    return usuarios