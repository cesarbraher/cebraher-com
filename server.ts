import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import {
  createCategory,
  createMessage,
  createPost,
  createProject,
  deleteCategory,
  deleteMessage,
  deletePost,
  deleteProject,
  getDbStatus,
  initDatabase,
  listCategories,
  listMessages,
  listPosts,
  listProjects,
  markMessageRead,
  updatePost,
  updateProject,
} from './server/db.ts';

async function startServer() {
  await initDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const requireAuth = process.env.REQUIRE_ADMIN_AUTH === 'true';
  const adminKey = process.env.ADMIN_ACCESS_KEY || 'cebra2026';

  app.use(express.json({ limit: '4mb' }));

  const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!requireAuth) return next();
    const provided = req.headers['x-admin-key'];
    if (provided === adminKey) return next();
    return res.status(401).json({ error: 'Clave de administrador inválida o ausente.' });
  };

  // --- Health & Status ---
  app.get('/api/status', async (_req, res) => {
    try {
      const [posts, categories, projects, messages] = await Promise.all([
        listPosts({ includeDrafts: true }),
        listCategories(),
        listProjects(),
        listMessages(),
      ]);
      res.json({
        db: getDbStatus(),
        requireAuth,
        counts: {
          postsTotal: posts.length,
          postsPublished: posts.filter((p) => p.published).length,
          categories: categories.length,
          projects: projects.length,
          unreadMessages: messages.filter((m) => !m.read).length,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'No se pudo consultar el estado del sistema.' });
    }
  });

  app.post('/api/admin/verify', (req, res) => {
    if (!requireAuth) return res.json({ valid: true });
    const { key } = req.body ?? {};
    if (key === adminKey) return res.json({ valid: true });
    return res.status(401).json({ valid: false, error: 'Clave incorrecta.' });
  });

  // --- Categories ---
  app.get('/api/categories', async (_req, res) => {
    try {
      const categories = await listCategories();
      res.json(categories);
    } catch {
      res.status(500).json({ error: 'Error al obtener categorías.' });
    }
  });

  app.post('/api/categories', checkAdmin, async (req, res) => {
    try {
      const { name, description } = req.body ?? {};
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
      }
      const created = await createCategory({ name, description });
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: 'Error al crear categoría.' });
    }
  });

  app.delete('/api/categories/:id', checkAdmin, async (req, res) => {
    try {
      const deleted = await deleteCategory(String(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'Categoría no encontrada.' });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar categoría.' });
    }
  });

  // --- Blog Posts ---
  app.get('/api/posts', async (req, res) => {
    try {
      const includeDrafts = req.query.all === 'true';
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const posts = await listPosts({ includeDrafts, category });
      res.json(posts);
    } catch {
      res.status(500).json({ error: 'Error al obtener las entradas del blog.' });
    }
  });

  app.post('/api/posts', checkAdmin, async (req, res) => {
    try {
      const { title, excerpt, content, categorySlug, categoryName, coverImage, readTimeMinutes, published, featured, author } =
        req.body ?? {};
      if (!title?.trim() || !excerpt?.trim() || !content?.trim() || !categorySlug) {
        return res.status(400).json({ error: 'Título, resumen, contenido y categoría son obligatorios.' });
      }
      const post = await createPost({
        title,
        excerpt,
        content,
        categorySlug,
        categoryName: categoryName || categorySlug,
        coverImage,
        readTimeMinutes,
        published,
        featured,
        author,
      });
      res.status(201).json(post);
    } catch {
      res.status(500).json({ error: 'Error al crear la entrada del blog.' });
    }
  });

  app.put('/api/posts/:id', checkAdmin, async (req, res) => {
    try {
      const updated = await updatePost(String(req.params.id), req.body ?? {});
      if (!updated) return res.status(404).json({ error: 'Entrada no encontrada.' });
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Error al actualizar la entrada.' });
    }
  });

  app.delete('/api/posts/:id', checkAdmin, async (req, res) => {
    try {
      const deleted = await deletePost(String(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'Entrada no encontrada.' });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar la entrada.' });
    }
  });

  // --- Projects & Tracking ---
  app.get('/api/projects', async (_req, res) => {
    try {
      const projects = await listProjects();
      res.json(projects);
    } catch {
      res.status(500).json({ error: 'Error al obtener proyectos.' });
    }
  });

  app.post('/api/projects', checkAdmin, async (req, res) => {
    try {
      const { title, subtitle, description, category, status, progress, stack, url, repoUrl, impactMetric, nextMilestone, milestones } =
        req.body ?? {};
      if (!title?.trim() || !subtitle?.trim() || !description?.trim()) {
        return res.status(400).json({ error: 'Título, subtítulo y descripción son obligatorios.' });
      }
      const created = await createProject({
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        category: category || 'Ingeniería & IA',
        status: status || 'En Progreso',
        progress: Number(progress ?? 0),
        stack: Array.isArray(stack) ? stack : [],
        url: url || '',
        repoUrl: repoUrl || '',
        impactMetric: impactMetric || '',
        nextMilestone: nextMilestone || '',
        milestones: Array.isArray(milestones) ? milestones : [],
      });
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: 'Error al crear proyecto.' });
    }
  });

  app.patch('/api/projects/:id', checkAdmin, async (req, res) => {
    try {
      const updated = await updateProject(String(req.params.id), req.body ?? {});
      if (!updated) return res.status(404).json({ error: 'Proyecto no encontrado.' });
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Error al actualizar proyecto.' });
    }
  });

  app.delete('/api/projects/:id', checkAdmin, async (req, res) => {
    try {
      const deleted = await deleteProject(String(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'Proyecto no encontrado.' });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar proyecto.' });
    }
  });

  // --- Contact Messages ---
  app.get('/api/messages', checkAdmin, async (_req, res) => {
    try {
      const messages = await listMessages();
      res.json(messages);
    } catch {
      res.status(500).json({ error: 'Error al obtener mensajes.' });
    }
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body ?? {};
      if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({ error: 'Nombre, correo electrónico y mensaje son obligatorios.' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
      }
      const created = await createMessage({
        name,
        email,
        subject: subject?.trim() || 'Consulta desde el sitio web',
        message,
      });
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: 'No se pudo guardar tu mensaje.' });
    }
  });

  app.patch('/api/messages/:id', checkAdmin, async (req, res) => {
    try {
      const updated = await markMessageRead(String(req.params.id), Boolean(req.body?.read));
      if (!updated) return res.status(404).json({ error: 'Mensaje no encontrado.' });
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Error al actualizar mensaje.' });
    }
  });

  app.delete('/api/messages/:id', checkAdmin, async (req, res) => {
    try {
      const deleted = await deleteMessage(String(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'Mensaje no encontrado.' });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar mensaje.' });
    }
  });

  // --- Frontend Serving ---
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor César Braher escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
