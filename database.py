from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# URL de conexión: postgresql://usuario:contraseña@servidor/base_de_datos
SQLALCHEMY_DATABASE_URL = "postgresql://pawtrack_admin:luisandres1895@localhost/pawtrack_db"

# El "motor" que se encarga de la conexión
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# La fábrica de sesiones (abre una "conversación" con la base de datos cada vez que se necesita)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# La clase base de la cual heredarán nuestras tablas
Base = declarative_base()