import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise';
import mongoose from 'mongoose';
import {
  BlogPostModel,
  CategoryModel,
  ContactMessageModel,
  ProjectModel,
  type IBlogPost,
  type ICategory,
  type IContactMessage,
  type IProject,
} from './models.ts';
import { SEED_CATEGORIES, SEED_MESSAGES, SEED_POSTS, SEED_PROJECTS } from './seed.ts';

interface LocalStoreData {
  categories: ICategory[];
  posts: IBlogPost[];
  projects: IProject[];
  messages: IContactMessage[];
}

type DbEngine = 'hostinger-mysql' | 'mongodb' | 'local-json';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

let activeEngine: DbEngine = 'local-json';
let activeDatabaseName = 'data/db.json';
let mysqlPool: Pool | null = null;
let localCache: LocalStoreData | null = null;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
}

function toMysqlDatetime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function readLocalStore(): LocalStoreData {
  if (localCache) return localCache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initial: LocalStoreData = {
      categories: structuredClone(SEED_CATEGORIES),
      posts: structuredClone(SEED_POSTS),
      projects: structuredClone(SEED_PROJECTS),
      messages: structuredClone(SEED_MESSAGES),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    localCache = initial;
    return initial;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
    localCache = {
      categories: parsed.categories?.length ? parsed.categories : structuredClone(SEED_CATEGORIES),
      posts: parsed.posts?.length ? parsed.posts : structuredClone(SEED_POSTS),
      projects: parsed.projects?.length ? parsed.projects : structuredClone(SEED_PROJECTS),
      messages: parsed.messages ?? structuredClone(SEED_MESSAGES),
    };
    return localCache;
  } catch {
    localCache = {
      categories: structuredClone(SEED_CATEGORIES),
      posts: structuredClone(SEED_POSTS),
      projects: structuredClone(SEED_PROJECTS),
      messages: structuredClone(SEED_MESSAGES),
    };
    writeLocalStore(localCache);
    return localCache;
  }
}

function writeLocalStore(data: LocalStoreData): void {
  localCache = data;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function initMysqlTablesAndSeed(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(160) NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
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
      author VARCHAR(180) NOT NULL DEFAULT 'Cesar Augusto Bravo Hernández',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      email VARCHAR(180) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [catRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM categories');
  if (Number(catRows[0]?.cnt ?? 0) === 0) {
    for (const c of SEED_CATEGORIES) {
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, created_at) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.slug, c.description, toMysqlDatetime(c.createdAt)]
      );
    }
  }

  const [postRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM blog_posts');
  if (Number(postRows[0]?.cnt ?? 0) === 0) {
    for (const p of SEED_POSTS) {
      await pool.query(
        `INSERT INTO blog_posts (
          id, title, slug, excerpt, content, category_slug, category_name,
          cover_image, read_time_minutes, published, featured, author, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.title,
          p.slug,
          p.excerpt,
          p.content,
          p.categorySlug,
          p.categoryName,
          p.coverImage,
          p.readTimeMinutes,
          p.published ? 1 : 0,
          p.featured ? 1 : 0,
          p.author,
          toMysqlDatetime(p.createdAt),
          toMysqlDatetime(p.updatedAt),
        ]
      );
    }
  }

  const [projRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM projects');
  if (Number(projRows[0]?.cnt ?? 0) === 0) {
    for (const pr of SEED_PROJECTS) {
      await pool.query(
        `INSERT INTO projects (
          id, title, slug, subtitle, description, category, status, progress,
          stack_json, url, repo_url, impact_metric, next_milestone, milestones_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pr.id,
          pr.title,
          pr.slug,
          pr.subtitle,
          pr.description,
          pr.category,
          pr.status,
          pr.progress,
          JSON.stringify(pr.stack),
          pr.url || '',
          pr.repoUrl || '',
          pr.impactMetric,
          pr.nextMilestone,
          JSON.stringify(pr.milestones),
          toMysqlDatetime(pr.updatedAt),
        ]
      );
    }
  }

  const [msgRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM contact_messages');
  if (Number(msgRows[0]?.cnt ?? 0) === 0) {
    for (const m of SEED_MESSAGES) {
      await pool.query(
        'INSERT INTO contact_messages (id, name, email, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [m.id, m.name, m.email, m.subject, m.message, m.read ? 1 : 0, toMysqlDatetime(m.createdAt)]
      );
    }
  }
}

async function seedMongoIfEmpty(): Promise<void> {
  const [catCount, postCount, projCount, msgCount] = await Promise.all([
    CategoryModel.countDocuments(),
    BlogPostModel.countDocuments(),
    ProjectModel.countDocuments(),
    ContactMessageModel.countDocuments(),
  ]);

  if (catCount === 0) {
    await CategoryModel.insertMany(
      SEED_CATEGORIES.map(({ id: _id, ...rest }) => ({
        ...rest,
        createdAt: new Date(rest.createdAt),
      }))
    );
  }
  if (postCount === 0) {
    await BlogPostModel.insertMany(
      SEED_POSTS.map(({ id: _id, ...rest }) => ({
        ...rest,
        createdAt: new Date(rest.createdAt),
        updatedAt: new Date(rest.updatedAt),
      }))
    );
  }
  if (projCount === 0) {
    await ProjectModel.insertMany(
      SEED_PROJECTS.map(({ id: _id, ...rest }) => ({
        ...rest,
        updatedAt: new Date(rest.updatedAt),
      }))
    );
  }
  if (msgCount === 0) {
    await ContactMessageModel.insertMany(
      SEED_MESSAGES.map(({ id: _id, ...rest }) => ({
        ...rest,
        createdAt: new Date(rest.createdAt),
      }))
    );
  }
}

export async function initDatabase(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL?.trim();
  const dbHost = process.env.DB_HOST?.trim();
  const dbUser = process.env.DB_USER?.trim();
  const dbName = process.env.DB_NAME?.trim();

  // 1. Prioridad principal: Base de Datos MySQL / MariaDB en Hostinger
  if (dbUrl?.startsWith('mysql://') || (dbHost && dbUser && dbName)) {
    try {
      mysqlPool = dbUrl
        ? mysql.createPool({ uri: dbUrl, waitForConnections: true, connectionLimit: 10 })
        : mysql.createPool({
            host: dbHost,
            port: Number(process.env.DB_PORT) || 3306,
            user: dbUser,
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            charset: 'utf8mb4',
          });

      await mysqlPool.query('SELECT 1');
      await initMysqlTablesAndSeed(mysqlPool);
      activeEngine = 'hostinger-mysql';
      activeDatabaseName = dbName || 'Hostinger MySQL';
      console.log(`[DB] Conectado a MySQL Hostinger (${activeDatabaseName})`);
      return;
    } catch (err) {
      console.warn('[DB] Error conectando a MySQL Hostinger, intentando respaldo:', err);
      mysqlPool = null;
    }
  }

  // 2. Alternativa opcional: MongoDB
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      activeEngine = 'mongodb';
      activeDatabaseName = mongoose.connection.name || 'mongodb';
      await seedMongoIfEmpty();
      console.log(`[DB] Conectado a MongoDB (${activeDatabaseName})`);
      return;
    } catch (err) {
      console.warn('[DB] No se pudo conectar a MONGODB_URI, usando almacenamiento local JSON:', err);
    }
  }

  // 3. Respaldo local persistente para desarrollo inmediato
  activeEngine = 'local-json';
  activeDatabaseName = 'data/db.json';
  readLocalStore();
  console.log(
    '[DB] Usando almacenamiento local JSON (data/db.json). Configura DB_HOST/DB_USER/DB_NAME o DATABASE_URL para MySQL Hostinger.'
  );
}

export function getDbStatus() {
  return {
    engine: activeEngine,
    connected: true,
    database: activeDatabaseName,
    hostingerConfigured: Boolean(
      process.env.DATABASE_URL?.trim()?.startsWith('mysql://') ||
        (process.env.DB_HOST?.trim() && process.env.DB_USER?.trim() && process.env.DB_NAME?.trim())
    ),
  };
}

function parseJsonSafe<T>(val: unknown, fallback: T): T {
  if (typeof val !== 'string') return (val as T) ?? fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function mapMysqlCategory(row: RowDataPacket): ICategory {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || ''),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapMysqlPost(row: RowDataPacket): IBlogPost {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt),
    content: String(row.content),
    categorySlug: String(row.category_slug),
    categoryName: String(row.category_name),
    coverImage: String(row.cover_image || 'ai-architecture'),
    readTimeMinutes: Number(row.read_time_minutes || 5),
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    author: String(row.author || 'Cesar Augusto Bravo Hernández'),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function mapMysqlProject(row: RowDataPacket): IProject {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    subtitle: String(row.subtitle),
    description: String(row.description),
    category: String(row.category),
    status: row.status,
    progress: Number(row.progress ?? 0),
    stack: parseJsonSafe<string[]>(row.stack_json, []),
    url: row.url ? String(row.url) : '',
    repoUrl: row.repo_url ? String(row.repo_url) : '',
    impactMetric: String(row.impact_metric || ''),
    nextMilestone: String(row.next_milestone || ''),
    milestones: parseJsonSafe(row.milestones_json, []),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function mapMysqlMessage(row: RowDataPacket): IContactMessage {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    subject: String(row.subject),
    message: String(row.message),
    read: Boolean(row.is_read),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapCategoryDoc(doc: any): ICategory {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description || '',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

function mapPostDoc(doc: any): IBlogPost {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    content: doc.content,
    categorySlug: doc.categorySlug,
    categoryName: doc.categoryName,
    coverImage: doc.coverImage || 'ai-architecture',
    readTimeMinutes: Number(doc.readTimeMinutes || 5),
    published: Boolean(doc.published),
    featured: Boolean(doc.featured),
    author: doc.author || 'Cesar Augusto Bravo Hernández',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function mapProjectDoc(doc: any): IProject {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    subtitle: doc.subtitle,
    description: doc.description,
    category: doc.category,
    status: doc.status,
    progress: Number(doc.progress ?? 0),
    stack: Array.isArray(doc.stack) ? doc.stack : [],
    url: doc.url || '',
    repoUrl: doc.repoUrl || '',
    impactMetric: doc.impactMetric || '',
    nextMilestone: doc.nextMilestone || '',
    milestones: Array.isArray(doc.milestones)
      ? doc.milestones.map((m: any) => ({ id: m.id, title: m.title, done: Boolean(m.done) }))
      : [],
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function mapMessageDoc(doc: any): IContactMessage {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    read: Boolean(doc.read),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

// --- Categories ---
export async function listCategories(): Promise<ICategory[]> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM categories ORDER BY created_at ASC');
    return rows.map(mapMysqlCategory);
  }
  if (activeEngine === 'mongodb') {
    const docs = await CategoryModel.find().sort({ createdAt: 1 }).lean();
    return docs.map(mapCategoryDoc);
  }
  return readLocalStore().categories;
}

export async function createCategory(input: { name: string; description?: string }): Promise<ICategory> {
  const slug = slugify(input.name) || `cat-${Date.now()}`;
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [existing] = await mysqlPool.query<RowDataPacket[]>('SELECT id FROM categories WHERE slug = ?', [slug]);
    const finalSlug = existing.length ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
    const id = makeId('cat');
    const now = new Date().toISOString();
    await mysqlPool.query(
      'INSERT INTO categories (id, name, slug, description, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, input.name.trim(), finalSlug, input.description?.trim() || '', toMysqlDatetime(now)]
    );
    return {
      id,
      name: input.name.trim(),
      slug: finalSlug,
      description: input.description?.trim() || '',
      createdAt: now,
    };
  }
  if (activeEngine === 'mongodb') {
    const existing = await CategoryModel.findOne({ slug }).lean();
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
    const created = await CategoryModel.create({
      name: input.name.trim(),
      slug: finalSlug,
      description: input.description?.trim() || '',
    });
    return mapCategoryDoc(created);
  }
  const store = readLocalStore();
  const finalSlug = store.categories.some((c) => c.slug === slug)
    ? `${slug}-${Date.now().toString().slice(-4)}`
    : slug;
  const cat: ICategory = {
    id: makeId('cat'),
    name: input.name.trim(),
    slug: finalSlug,
    description: input.description?.trim() || '',
    createdAt: new Date().toISOString(),
  };
  store.categories.push(cat);
  writeLocalStore(store);
  return cat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [res]: any = await mysqlPool.query('DELETE FROM categories WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
  if (activeEngine === 'mongodb') {
    const res = await CategoryModel.findByIdAndDelete(id);
    return Boolean(res);
  }
  const store = readLocalStore();
  const prevLen = store.categories.length;
  store.categories = store.categories.filter((c) => c.id !== id);
  if (store.categories.length !== prevLen) {
    writeLocalStore(store);
    return true;
  }
  return false;
}

// --- Blog Posts ---
export async function listPosts(options?: { includeDrafts?: boolean; category?: string }): Promise<IBlogPost[]> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const clauses: string[] = [];
    const params: any[] = [];
    if (!options?.includeDrafts) clauses.push('published = 1');
    if (options?.category && options.category !== 'all') {
      clauses.push('category_slug = ?');
      params.push(options.category);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const [rows] = await mysqlPool.query<RowDataPacket[]>(
      `SELECT * FROM blog_posts ${where} ORDER BY created_at DESC`,
      params
    );
    return rows.map(mapMysqlPost);
  }
  if (activeEngine === 'mongodb') {
    const filter: Record<string, any> = {};
    if (!options?.includeDrafts) filter.published = true;
    if (options?.category && options.category !== 'all') filter.categorySlug = options.category;
    const docs = await BlogPostModel.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(mapPostDoc);
  }
  let posts = [...readLocalStore().posts];
  if (!options?.includeDrafts) {
    posts = posts.filter((p) => p.published);
  }
  if (options?.category && options.category !== 'all') {
    posts = posts.filter((p) => p.categorySlug === options.category);
  }
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createPost(input: {
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  categoryName: string;
  coverImage?: string;
  readTimeMinutes?: number;
  published?: boolean;
  featured?: boolean;
  author?: string;
}): Promise<IBlogPost> {
  const baseSlug = slugify(input.title) || `entrada-${Date.now()}`;
  const wordCount = input.content.trim().split(/\s+/).length;
  const computedReadTime = input.readTimeMinutes || Math.max(2, Math.ceil(wordCount / 180));

  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [existing] = await mysqlPool.query<RowDataPacket[]>('SELECT id FROM blog_posts WHERE slug = ?', [baseSlug]);
    const finalSlug = existing.length ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    if (input.featured) {
      await mysqlPool.query('UPDATE blog_posts SET featured = 0');
    }
    const id = makeId('post');
    const now = new Date().toISOString();
    const published = input.published ?? true;
    const featured = Boolean(input.featured);
    const author = input.author?.trim() || 'Cesar Augusto Bravo Hernández';
    const coverImage = input.coverImage || 'ai-architecture';
    await mysqlPool.query(
      `INSERT INTO blog_posts (
        id, title, slug, excerpt, content, category_slug, category_name,
        cover_image, read_time_minutes, published, featured, author, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.title.trim(),
        finalSlug,
        input.excerpt.trim(),
        input.content.trim(),
        input.categorySlug,
        input.categoryName,
        coverImage,
        computedReadTime,
        published ? 1 : 0,
        featured ? 1 : 0,
        author,
        toMysqlDatetime(now),
        toMysqlDatetime(now),
      ]
    );
    return {
      id,
      title: input.title.trim(),
      slug: finalSlug,
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      categorySlug: input.categorySlug,
      categoryName: input.categoryName,
      coverImage,
      readTimeMinutes: computedReadTime,
      published,
      featured,
      author,
      createdAt: now,
      updatedAt: now,
    };
  }

  if (activeEngine === 'mongodb') {
    const existing = await BlogPostModel.findOne({ slug: baseSlug }).lean();
    const finalSlug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    if (input.featured) {
      await BlogPostModel.updateMany({}, { featured: false });
    }
    const created = await BlogPostModel.create({
      title: input.title.trim(),
      slug: finalSlug,
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      categorySlug: input.categorySlug,
      categoryName: input.categoryName,
      coverImage: input.coverImage || 'ai-architecture',
      readTimeMinutes: computedReadTime,
      published: input.published ?? true,
      featured: Boolean(input.featured),
      author: input.author?.trim() || 'Cesar Augusto Bravo Hernández',
    });
    return mapPostDoc(created);
  }

  const store = readLocalStore();
  const finalSlug = store.posts.some((p) => p.slug === baseSlug)
    ? `${baseSlug}-${Date.now().toString().slice(-4)}`
    : baseSlug;
  if (input.featured) {
    store.posts = store.posts.map((p) => ({ ...p, featured: false }));
  }
  const now = new Date().toISOString();
  const newPost: IBlogPost = {
    id: makeId('post'),
    title: input.title.trim(),
    slug: finalSlug,
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    categorySlug: input.categorySlug,
    categoryName: input.categoryName,
    coverImage: input.coverImage || 'ai-architecture',
    readTimeMinutes: computedReadTime,
    published: input.published ?? true,
    featured: Boolean(input.featured),
    author: input.author?.trim() || 'Cesar Augusto Bravo Hernández',
    createdAt: now,
    updatedAt: now,
  };
  store.posts.unshift(newPost);
  writeLocalStore(store);
  return newPost;
}

export async function updatePost(
  id: string,
  patch: Partial<Omit<IBlogPost, 'id' | 'createdAt'>>
): Promise<IBlogPost | null> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [existingRows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (!existingRows.length) return null;
    if (patch.featured) {
      await mysqlPool.query('UPDATE blog_posts SET featured = 0 WHERE id <> ?', [id]);
    }
    const current = mapMysqlPost(existingRows[0]);
    const merged: IBlogPost = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await mysqlPool.query(
      `UPDATE blog_posts SET
        title = ?, excerpt = ?, content = ?, category_slug = ?, category_name = ?,
        cover_image = ?, read_time_minutes = ?, published = ?, featured = ?, author = ?, updated_at = ?
      WHERE id = ?`,
      [
        merged.title,
        merged.excerpt,
        merged.content,
        merged.categorySlug,
        merged.categoryName,
        merged.coverImage,
        merged.readTimeMinutes,
        merged.published ? 1 : 0,
        merged.featured ? 1 : 0,
        merged.author,
        toMysqlDatetime(merged.updatedAt),
        id,
      ]
    );
    return merged;
  }

  if (activeEngine === 'mongodb') {
    if (patch.featured) {
      await BlogPostModel.updateMany({ _id: { $ne: id } }, { featured: false });
    }
    const updated = await BlogPostModel.findByIdAndUpdate(
      id,
      { ...patch, updatedAt: new Date() },
      { new: true }
    ).lean();
    return updated ? mapPostDoc(updated) : null;
  }

  const store = readLocalStore();
  const idx = store.posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  if (patch.featured) {
    store.posts = store.posts.map((p) => ({ ...p, featured: false }));
  }
  const updated: IBlogPost = {
    ...store.posts[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.posts[idx] = updated;
  writeLocalStore(store);
  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [res]: any = await mysqlPool.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
  if (activeEngine === 'mongodb') {
    const res = await BlogPostModel.findByIdAndDelete(id);
    return Boolean(res);
  }
  const store = readLocalStore();
  const prevLen = store.posts.length;
  store.posts = store.posts.filter((p) => p.id !== id);
  if (store.posts.length !== prevLen) {
    writeLocalStore(store);
    return true;
  }
  return false;
}

// --- Projects & Tracking ---
export async function listProjects(): Promise<IProject[]> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM projects ORDER BY updated_at DESC');
    return rows.map(mapMysqlProject);
  }
  if (activeEngine === 'mongodb') {
    const docs = await ProjectModel.find().sort({ updatedAt: -1 }).lean();
    return docs.map(mapProjectDoc);
  }
  return [...readLocalStore().projects];
}

export async function createProject(input: Omit<IProject, 'id' | 'slug' | 'updatedAt'>): Promise<IProject> {
  const baseSlug = slugify(input.title) || `proyecto-${Date.now()}`;
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [existing] = await mysqlPool.query<RowDataPacket[]>('SELECT id FROM projects WHERE slug = ?', [baseSlug]);
    const finalSlug = existing.length ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const id = makeId('proj');
    const now = new Date().toISOString();
    await mysqlPool.query(
      `INSERT INTO projects (
        id, title, slug, subtitle, description, category, status, progress,
        stack_json, url, repo_url, impact_metric, next_milestone, milestones_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.title,
        finalSlug,
        input.subtitle,
        input.description,
        input.category,
        input.status,
        input.progress,
        JSON.stringify(input.stack),
        input.url || '',
        input.repoUrl || '',
        input.impactMetric,
        input.nextMilestone,
        JSON.stringify(input.milestones),
        toMysqlDatetime(now),
      ]
    );
    return { ...input, id, slug: finalSlug, updatedAt: now };
  }
  if (activeEngine === 'mongodb') {
    const existing = await ProjectModel.findOne({ slug: baseSlug }).lean();
    const finalSlug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const created = await ProjectModel.create({
      ...input,
      slug: finalSlug,
    });
    return mapProjectDoc(created);
  }
  const store = readLocalStore();
  const finalSlug = store.projects.some((p) => p.slug === baseSlug)
    ? `${baseSlug}-${Date.now().toString().slice(-4)}`
    : baseSlug;
  const newProj: IProject = {
    ...input,
    id: makeId('proj'),
    slug: finalSlug,
    updatedAt: new Date().toISOString(),
  };
  store.projects.unshift(newProj);
  writeLocalStore(store);
  return newProj;
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<IProject, 'id'>>
): Promise<IProject | null> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [existingRows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existingRows.length) return null;
    const current = mapMysqlProject(existingRows[0]);
    const merged: IProject = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await mysqlPool.query(
      `UPDATE projects SET
        title = ?, subtitle = ?, description = ?, category = ?, status = ?, progress = ?,
        stack_json = ?, url = ?, repo_url = ?, impact_metric = ?, next_milestone = ?,
        milestones_json = ?, updated_at = ?
      WHERE id = ?`,
      [
        merged.title,
        merged.subtitle,
        merged.description,
        merged.category,
        merged.status,
        merged.progress,
        JSON.stringify(merged.stack),
        merged.url || '',
        merged.repoUrl || '',
        merged.impactMetric,
        merged.nextMilestone,
        JSON.stringify(merged.milestones),
        toMysqlDatetime(merged.updatedAt),
        id,
      ]
    );
    return merged;
  }
  if (activeEngine === 'mongodb') {
    const updated = await ProjectModel.findByIdAndUpdate(
      id,
      { ...patch, updatedAt: new Date() },
      { new: true }
    ).lean();
    return updated ? mapProjectDoc(updated) : null;
  }
  const store = readLocalStore();
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: IProject = {
    ...store.projects[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.projects[idx] = updated;
  writeLocalStore(store);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [res]: any = await mysqlPool.query('DELETE FROM projects WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
  if (activeEngine === 'mongodb') {
    const res = await ProjectModel.findByIdAndDelete(id);
    return Boolean(res);
  }
  const store = readLocalStore();
  const prevLen = store.projects.length;
  store.projects = store.projects.filter((p) => p.id !== id);
  if (store.projects.length !== prevLen) {
    writeLocalStore(store);
    return true;
  }
  return false;
}

// --- Contact Messages ---
export async function listMessages(): Promise<IContactMessage[]> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return rows.map(mapMysqlMessage);
  }
  if (activeEngine === 'mongodb') {
    const docs = await ContactMessageModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(mapMessageDoc);
  }
  return [...readLocalStore().messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<IContactMessage> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const id = makeId('msg');
    const now = new Date().toISOString();
    await mysqlPool.query(
      'INSERT INTO contact_messages (id, name, email, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)',
      [id, input.name.trim(), input.email.trim(), input.subject.trim(), input.message.trim(), toMysqlDatetime(now)]
    );
    return {
      id,
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      read: false,
      createdAt: now,
    };
  }
  if (activeEngine === 'mongodb') {
    const created = await ContactMessageModel.create({
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
    });
    return mapMessageDoc(created);
  }
  const store = readLocalStore();
  const msg: IContactMessage = {
    id: makeId('msg'),
    name: input.name.trim(),
    email: input.email.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  store.messages.unshift(msg);
  writeLocalStore(store);
  return msg;
}

export async function markMessageRead(id: string, read: boolean): Promise<IContactMessage | null> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    await mysqlPool.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [read ? 1 : 0, id]);
    const [rows] = await mysqlPool.query<RowDataPacket[]>('SELECT * FROM contact_messages WHERE id = ?', [id]);
    return rows.length ? mapMysqlMessage(rows[0]) : null;
  }
  if (activeEngine === 'mongodb') {
    const updated = await ContactMessageModel.findByIdAndUpdate(id, { read }, { new: true }).lean();
    return updated ? mapMessageDoc(updated) : null;
  }
  const store = readLocalStore();
  const idx = store.messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  store.messages[idx] = { ...store.messages[idx], read };
  writeLocalStore(store);
  return store.messages[idx];
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (activeEngine === 'hostinger-mysql' && mysqlPool) {
    const [res]: any = await mysqlPool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
  if (activeEngine === 'mongodb') {
    const res = await ContactMessageModel.findByIdAndDelete(id);
    return Boolean(res);
  }
  const store = readLocalStore();
  const prevLen = store.messages.length;
  store.messages = store.messages.filter((m) => m.id !== id);
  if (store.messages.length !== prevLen) {
    writeLocalStore(store);
    return true;
  }
  return false;
}
