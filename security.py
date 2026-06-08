from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
import bcrypt
import config

# JWT configuration is now loaded from config.py (which reads from environment variables)
SECRET_KEY = config.SECRET_KEY
ALGORITHM = config.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = config.ACCESS_TOKEN_EXPIRE_MINUTES

# 1. Función para encriptar la contraseña
def obtener_password_hasheado(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

# 2. Función para verificar si la contraseña coincide
def verificar_password(password_plano: str, password_hasheado: str) -> bool:
    password_plano_bytes = password_plano.encode('utf-8')
    password_hasheado_bytes = password_hasheado.encode('utf-8')
    return bcrypt.checkpw(password_plano_bytes, password_hasheado_bytes)

# 3. Función para generar el Token JWT
def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt