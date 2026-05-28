-- 1. Habilitar la generación automática de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear la tabla de Niveles
CREATE TABLE niveles (
    nivel INTEGER PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    puntos_requeridos INTEGER NOT NULL
);

-- 3. Crear la tabla de Usuarios
CREATE TABLE usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    puntos_totales INTEGER DEFAULT 0,
    nivel_actual INTEGER DEFAULT 1 REFERENCES niveles(nivel),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear la tabla de Avistamientos
CREATE TABLE avistamientos (
    id_avistamiento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    especie VARCHAR(10) CHECK (especie IN ('Gato', 'Perro')),
    descripcion TEXT,
    latitud DECIMAL(9,6) NOT NULL,
    longitud DECIMAL(9,6) NOT NULL,
    foto_url VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insertar los niveles base para que el juego funcione desde el día 1
INSERT INTO niveles (nivel, titulo, puntos_requeridos) VALUES 
(1, 'Cachorro', 0),
(2, 'Rastreador', 25),
(3, 'Ojeador', 50),
(4, 'Veterano', 100),
(5, 'Maestro', 200);