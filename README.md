# Cesar Braher — Arquitectura Digital, Arte & Blog (Node.js + Hostinger MySQL)

Plataforma web personal, portafolio de proyectos, panel de seguimiento operativo y sistema de blog administrable construido por **Cesar Augusto Bravo Hernández (Cesar Braher / CEBRA)**.

## Características principales

- **Landing Page Editorial Oscura**: Diseño sobrio de alto contraste con fotografía de portada en estudio, manifiesto creativo y enlaces directos (`@cebraher` en YouTube, Behance, LinkedIn, X, GitHub, Facebook y Spotify oficial).
- **Sección de Proyectos**: Vitrina filtrable por disciplina (*Ingeniería & IA*, *Impacto Social*, *Arte & Marca*, *Arte & Música*) con vista de detalle e hitos.
- **Panel de Seguimiento Intuitivo**: Monitoreo en tiempo real del avance porcentual, estado (`En Progreso`, `Completado`, `Planificado`) e hitos de cada iniciativa.
- **Sistema de Blog Completo + CMS**: Entradas con fotografía de portada, categorías dinámicas, buscador, lectura en modal editorial y panel administrador completo.
- **Base de Datos MySQL en Hostinger**: Adaptado nativamente con `mysql2` para crear las tablas (`categories`, `blog_posts`, `projects`, `contact_messages`) de forma automática en tu base de datos de Hostinger (también incluye script SQL en `database/hostinger_schema.sql`), con respaldo local automático en `data/db.json` para desarrollo sin credenciales.

## Configuración con Base de Datos de Hostinger

1. En **Hostinger hPanel**, entra a **Bases de datos → Bases de datos MySQL** y crea una base de datos con su usuario y contraseña.
2. Copia `.env.example` a `.env` y coloca tus credenciales de Hostinger:
   ```env
   DB_HOST="localhost" # o el host remoto de Hostinger (ej. srvXXXX.hstgr.io)
   DB_PORT="3306"
   DB_NAME="uXXXXXXXXX_cebraher"
   DB_USER="uXXXXXXXXX_admin"
   DB_PASSWORD="tu_password_de_hostinger"
   REQUIRE_ADMIN_AUTH="true"
   ADMIN_ACCESS_KEY="tu_clave_segura"
   ```
   *(Opcionalmente puedes importar `database/hostinger_schema.sql` en phpMyAdmin, aunque el servidor Node.js crea e inicializa las tablas automáticamente al arrancar).*

## Publicación desde GitHub

```bash
npm install
npm run build
npm start
```

Para desarrollo local:
```bash
npm run dev
```

## Licencia

Apache License 2.0 — Cesar Augusto Bravo Hernández (`@cebraher`).
