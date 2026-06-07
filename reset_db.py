"""
Drop all tables and recreate schema from SQLAlchemy models (destructive).
Then seed `niveles` with default entries.
Run with the project's Python executable.
"""
from database import engine, SessionLocal
import models
from datetime import datetime

print('Dropping all tables...')
models.Base.metadata.drop_all(bind=engine)
print('Creating all tables from models...')
models.Base.metadata.create_all(bind=engine)

print('Seeding niveles...')
s = SessionLocal()
try:
    # Clear any existing rows (should be empty after drop)
    s.query(models.Nivel).delete()
    # Insert default levels
    niveles = [
        models.Nivel(nivel=1, titulo='Novato', puntos_requeridos=0),
        models.Nivel(nivel=2, titulo='Explorador', puntos_requeridos=10),
        models.Nivel(nivel=3, titulo='Veterano', puntos_requeridos=50),
        models.Nivel(nivel=4, titulo='Héroe', puntos_requeridos=150),
        models.Nivel(nivel=5, titulo='Leyenda', puntos_requeridos=500),
    ]
    s.add_all(niveles)
    s.commit()
    print('Seeded niveles successfully.')
finally:
    s.close()

print('DB reset complete.')
