-- Esquema SQL compatible con MySQL / MariaDB en Hostinger (phpMyAdmin)
-- Nota: El servidor Node.js también crea estas tablas automáticamente al iniciar si no existen.

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  category_slug VARCHAR(160) NOT NULL,
  category_name VARCHAR(160) NOT NULL,
  cover_image VARCHAR(512) NOT NULL DEFAULT 'ai-architecture',
  read_time_minutes INT NOT NULL DEFAULT 5,
  published TINYINT(1) NOT NULL DEFAULT 1,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  author VARCHAR(180) NOT NULL DEFAULT 'César Augusto Bravo Hernández',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_category (category_slug),
  INDEX idx_blog_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  subtitle VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(120) NOT NULL,
  status ENUM('En Progreso', 'Completado', 'Planificado') NOT NULL DEFAULT 'En Progreso',
  progress INT NOT NULL DEFAULT 0,
  stack_json JSON NOT NULL,
  url VARCHAR(512),
  repo_url VARCHAR(512),
  impact_metric VARCHAR(255),
  next_milestone VARCHAR(255),
  milestones_json JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
