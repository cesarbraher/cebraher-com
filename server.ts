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
import {
  extractCategoriesFromPosts,
  fetchBloggerPostsFromServer,
  getBloggerConfig,
  saveBloggerConfig,
} from './server/blogger.ts';

async function getCombinedBlogPosts(options?: {
  includeDrafts?: boolean;
  category?: string;
  forceRefresh?: boolean;
}) {
  const bloggerCfg = getBloggerConfig();
  const [bloggerResult, dbPosts] = await Promise.all([
    fetchBloggerPostsFromServer(Boolean(options?.forceRefresh)),
    listPosts({ includeDrafts: options?.includeDrafts }),
  ]);

  let combined = [...bloggerResult.posts];

  if (combined.length === 0 || bloggerCfg.includeLocalFallback) {
    const existingSlugs = new Set(combined.map((p) => p.slug));
    const localMarked = dbPosts
      .filter((p) => !existingSlugs.has(p.slug))
      .map((p) => ({
        ...p,
        source: 'local' as const,
        featured: combined.length > 0 ? false : p.featured,
      }));
    combined = [...combined, ...localMarked];
  }

  if (options?.category && options.category !== 'all') {
    combined = combined.filter((p) => p.categorySlug === options.category);
  }

  return {
    posts: combined,
    bloggerSynced: bloggerResult.synced,
    bloggerPostsCount: bloggerResult.posts.length,
    bloggerError: bloggerResult.error,
  };
}

async function startServer() {
  await initDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const requireAuth = process.env.REQUIRE_ADMIN_AUTH !== 'false';
  const adminUser = process.env.ADMIN_USER || 'CESARBRAHER';
  const adminKey = process.env.ADMIN_ACCESS_KEY || 'Juan14:16';

  app.use(express.json({ limit: '4mb' }));

  const isValidAdminCredentials = (userHeader?: string, keyHeader?: string) => {
    const u = (userHeader || '').trim();
    const k = keyHeader || '';
    if (u && k) {
      return u.toUpperCase() === adminUser.toUpperCase() && k === adminKey;
    }
    return k === adminKey;
  };

  const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!requireAuth) return next();
    const providedUser = typeof req.headers['x-admin-user'] === 'string' ? req.headers['x-admin-user'] : undefined;
    const providedKey = typeof req.headers['x-admin-key'] === 'string' ? req.headers['x-admin-key'] : undefined;
    if (isValidAdminCredentials(providedUser, providedKey)) return next();
    return res.status(401).json({ error: 'Usuario o contraseña de administrador inválidos.' });
  };

  // --- Health & Status ---
  app.get('/api/status', async (_req, res) => {
    try {
      const [blogData, dbCategories, projects, messages] = await Promise.all([
        getCombinedBlogPosts({ includeDrafts: true }),
        listCategories(),
        listProjects(),
        listMessages(),
      ]);
      const bloggerCfg = getBloggerConfig();
      const categories = extractCategoriesFromPosts(blogData.posts, dbCategories);
      res.json({
        db: getDbStatus(),
        blogger: {
          blogName: bloggerCfg.blogName,
          accountEmail: bloggerCfg.accountEmail,
          blogUrl: bloggerCfg.blogUrl,
          blogId: bloggerCfg.blogId,
          enabled: bloggerCfg.enabled,
          includeLocalFallback: bloggerCfg.includeLocalFallback,
          synced: blogData.bloggerSynced,
          bloggerPostsCount: blogData.bloggerPostsCount,
        },
        requireAuth,
        counts: {
          postsTotal: blogData.posts.length,
          postsPublished: blogData.posts.filter((p) => p.published).length,
          categories: categories.length,
          projects: projects.length,
          unreadMessages: messages.filter((m) => !m.read).length,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'No se pudo consultar el estado del sistema.' });
    }
  });

  // --- Blogger Configuration & Sync ---
  app.get('/api/blogger/config', async (_req, res) => {
    const cfg = getBloggerConfig();
    res.json({
      blogName: cfg.blogName,
      accountEmail: cfg.accountEmail,
      blogUrl: cfg.blogUrl,
      blogId: cfg.blogId,
      enabled: cfg.enabled,
      includeLocalFallback: cfg.includeLocalFallback,
      lastSyncedAt: cfg.lastSyncedAt,
    });
  });

  app.put('/api/blogger/config', checkAdmin, async (req, res) => {
    try {
      const updated = saveBloggerConfig(req.body ?? {});
      const syncResult = await getCombinedBlogPosts({ includeDrafts: true, forceRefresh: true });
      res.json({
        config: {
          blogName: updated.blogName,
          accountEmail: updated.accountEmail,
          blogUrl: updated.blogUrl,
          blogId: updated.blogId,
          enabled: updated.enabled,
          includeLocalFallback: updated.includeLocalFallback,
          lastSyncedAt: updated.lastSyncedAt,
        },
        synced: syncResult.bloggerSynced,
        bloggerPostsCount: syncResult.bloggerPostsCount,
        posts: syncResult.posts,
      });
    } catch {
      res.status(500).json({ error: 'No se pudo actualizar la configuración de Blogger.' });
    }
  });

  app.post('/api/blogger/sync', async (_req, res) => {
    try {
      const syncResult = await getCombinedBlogPosts({ includeDrafts: true, forceRefresh: true });
      res.json({
        synced: syncResult.bloggerSynced,
        bloggerPostsCount: syncResult.bloggerPostsCount,
        error: syncResult.bloggerError,
        posts: syncResult.posts,
      });
    } catch {
      res.status(500).json({ error: 'Error al sincronizar con Blogger.' });
    }
  });

  app.post('/api/admin/verify', (req, res) => {
    if (!requireAuth) return res.json({ valid: true });
    const { user, key, password } = req.body ?? {};
    const pass = password ?? key;
    if (isValidAdminCredentials(user, pass)) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false, error: 'Usuario o contraseña incorrectos.' });
  });

  // --- Categories ---
  app.get('/api/categories', async (_req, res) => {
    try {
      const [dbCategories, blogData] = await Promise.all([
        listCategories(),
        getCombinedBlogPosts({ includeDrafts: false }),
      ]);
      const categories = extractCategoriesFromPosts(blogData.posts, dbCategories);
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
      const forceRefresh = req.query.refresh === 'true';
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const { posts } = await getCombinedBlogPosts({ includeDrafts, category, forceRefresh });
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
    app.all(['/cancelar-donacion', '/cancelar-donacion/', '/gracias-por-donar', '/gracias-por-donar/'], (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
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
    console.log(`Servidor Cesar Braher escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
