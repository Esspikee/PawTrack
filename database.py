from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import config

# El "motor" que se encarga de la conexión
# DATABASE_URL is loaded from config.py (which reads from environment variables)
engine = create_engine(config.DATABASE_URL)

# La fábrica de sesiones (abre una "conversación" con la base de datos cada vez que se necesita)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# La clase base de la cual heredarán nuestras tablas
Base = declarative_base()