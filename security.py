from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import bcrypt  # <- Importamos bcrypt directo

# CONFIGURACIÓN DEL TOKEN
SECRET_KEY = "tu_clave_secreta_super_segura_para_el_proyecto_pawtrack"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 1. Función para encriptar la contraseña (Sin passlib)
def obtener_password_hasheado(password: str) -> str:
    # bcrypt exige que el texto se convierta a bytes primero
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8') # Lo volvemos texto para guardarlo en PostgreSQL

# 2. Función para verificar si la contraseña coincide
def verificar_password(password_plano: str, password_hasheado: str) -> bool:
    password_plano_bytes = password_plano.encode('utf-8')
    password_hasheado_bytes = password_hasheado.encode('utf-8')
    return bcrypt.checkpw(password_plano_bytes, password_hasheado_bytes)

# 3. Función para generar el Token JWT
def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt