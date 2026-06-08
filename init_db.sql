-- ============================================================================
-- PawTrack — Bootstrap de base de datos
-- ============================================================================
-- IMPORTANTE: el ESQUEMA (tablas usuarios, animales, avistamientos,
-- confirmaciones, niveles) lo gestiona SQLAlchemy mediante
-- `models.Base.metadata.create_all()` al arrancar la app. NO se definen
-- tablas aquí para evitar que este archivo quede desfasado respecto a los
-- modelos (como ocurrió con la versión anterior, previa a la Fase 4).
--
-- La app también siembra los niveles automáticamente al iniciar
-- (ver seed_niveles() en main.py). Este archivo es un respaldo idempotente
-- y opcional para sembrar manualmente sobre una BD ya creada.
--
-- Uso (opcional): psql -d pawtrack_db -f init_db.sql
-- ============================================================================

-- 1. Extensión para generación de UUIDs (por si se usa a nivel de BD).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Sembrar los niveles base de forma idempotente.
--    Estos valores son la fuente de verdad de la curva de gamificación y
--    deben coincidir con NIVELES_SEED en main.py.
INSERT INTO niveles (nivel, titulo, puntos_requeridos) VALUES
    (1, 'Novato', 0),
    (2, 'Explorador', 10),
    (3, 'Veterano', 50),
    (4, 'Héroe', 150),
    (5, 'Leyenda', 500)
ON CONFLICT (nivel) DO NOTHING;
