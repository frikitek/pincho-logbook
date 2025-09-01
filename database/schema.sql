-- Esquema de base de datos para Laureados Pincho Logbook

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Formato hex (#RRGGBB)
    nivel INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pinchos
CREATE TABLE pinchos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    bar VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de valoraciones
CREATE TABLE valoraciones (
    id SERIAL PRIMARY KEY,
    pincho_id INTEGER REFERENCES pinchos(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pincho_id, user_id, DATE(fecha)) -- Un usuario solo puede valorar un pincho una vez por día
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_pinchos_categoria ON pinchos(categoria_id);
CREATE INDEX idx_valoraciones_pincho ON valoraciones(pincho_id);
CREATE INDEX idx_valoraciones_user ON valoraciones(user_id);
CREATE INDEX idx_valoraciones_fecha ON valoraciones(fecha);

-- Datos iniciales de categorías
INSERT INTO categorias (nombre, color, nivel) VALUES
    ('Excelente', '#22c55e', 1),
    ('Muy Bueno', '#3b82f6', 2),
    ('Bueno', '#eab308', 3),
    ('Regular', '#f97316', 4),
    ('Malo', '#ef4444', 5),
    ('Muy Malo', '#a855f7', 6);

-- Usuario de prueba (password: laurelados)
INSERT INTO users (email, password_hash) VALUES
    ('roberto@laurelados.com', '$2b$10$rQZ8K9mN2pL1vX3yA6bC7dE8fG9hI0jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE1fG2hI3jK4lM5nO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA5bC6dE7fG8hI9jK0lM1nO2pQ3rS4tU5vW6xY7zA8bC9dE0fG1hI2jK3kL4mN5oP6qR7sT8uV9wX0yZ'),
    ('endika@laurelados.com', '$2b$10$rQZ8K9mN2pL1vX3yA6bC7dE8fG9hI0jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE1fG2hI3jK4lM5nO6pQ7rS8tU9vW0xY1zA2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4zA5bC6dE7fG8hI9jK0lM1nO2pQ3rS4tU5vW6xY7zA8bC9dE0fG1hI2jK3kL4mN5oP6qR7sT8uV9wX0yZ');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pinchos_updated_at BEFORE UPDATE ON pinchos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
