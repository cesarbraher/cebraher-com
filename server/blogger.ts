import fs from 'fs';
import path from 'path';
import type { IBlogPost, ICategory } from './models.ts';
import { slugify } from './db.ts';

export interface BloggerConfig {
  blogName: string;
  accountEmail: string;
  blogUrl: string;
  blogId: string;
  apiKey: string;
  enabled: boolean;
  includeLocalFallback: boolean;
  lastSyncedAt?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BLOGGER_CONFIG_FILE = path.join(DATA_DIR, 'blogger.json');

const DEFAULT_BLOGGER_CONFIG: BloggerConfig = {
  blogName: process.env.BLOGGER_BLOG_NAME?.trim() || 'CESARBRAHER',
  accountEmail: process.env.BLOGGER_ACCOUNT_EMAIL?.trim() || 'cesarbraher@gmail.com',
  blogUrl: process.env.BLOGGER_BLOG_URL?.trim() || 'https://cesarbraher.blogspot.com',
  blogId: process.env.BLOGGER_BLOG_ID?.trim() || '',
  apiKey: process.env.BLOGGER_API_KEY?.trim() || '',
  enabled: process.env.BLOGGER_ENABLED !== 'false',
  includeLocalFallback: process.env.BLOGGER_LOCAL_FALLBACK !== 'false',
};

const COVER_KEYS = ['ai-architecture', 'music-production', 'digital-art', 'social-impact', 'studio-hero'];

let cachedConfig: BloggerConfig | null = null;
let cachedPosts: { posts: IBlogPost[]; fetchedAt: number; feedTitle?: string } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache for live updates

export function normalizeBloggerUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return 'https://cesarbraher.blogspot.com';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!trimmed.includes('.')) {
    return `https://${trimmed.toLowerCase()}.blogspot.com`;
  }
  return `https://${trimmed}`;
}

export function getBloggerConfig(): BloggerConfig {
  if (cachedConfig) return cachedConfig;

  try {
    if (fs.existsSync(BLOGGER_CONFIG_FILE)) {
      const raw = fs.readFileSync(BLOGGER_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<BloggerConfig>;
      cachedConfig = {
        ...DEFAULT_BLOGGER_CONFIG,
        ...parsed,
        blogUrl: normalizeBloggerUrl(parsed.blogUrl || DEFAULT_BLOGGER_CONFIG.blogUrl),
      };
      return cachedConfig;
    }
  } catch {
    // Fallback to default config
  }

  cachedConfig = {
    ...DEFAULT_BLOGGER_CONFIG,
    blogUrl: normalizeBloggerUrl(DEFAULT_BLOGGER_CONFIG.blogUrl),
  };
  return cachedConfig;
}

export function saveBloggerConfig(patch: Partial<BloggerConfig>): BloggerConfig {
  const current = getBloggerConfig();
  const updated: BloggerConfig = {
    ...current,
    ...patch,
    blogName: (patch.blogName ?? current.blogName).trim() || 'CESARBRAHER',
    accountEmail: (patch.accountEmail ?? current.accountEmail).trim() || 'cesarbraher@gmail.com',
    blogUrl: normalizeBloggerUrl(patch.blogUrl ?? current.blogUrl),
    blogId: (patch.blogId ?? current.blogId).trim(),
    apiKey: (patch.apiKey ?? current.apiKey).trim(),
    enabled: patch.enabled ?? current.enabled,
    includeLocalFallback: patch.includeLocalFallback ?? current.includeLocalFallback,
  };

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(BLOGGER_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  cachedConfig = updated;
  cachedPosts = null; // Invalidate cache on config change
  return updated;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function htmlToPlainParagraphs(html: string): string {
  if (!html) return '';
  const withBreaks = html
    .replace(/<\s*(br|\/p|\/div|\/h[1-6]|\/li|\/blockquote)\b[^>]*>/gi, '\n\n')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '');

  return decodeHtmlEntities(withBreaks)
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

export function upgradeBloggerImageUrl(url: string): string {
  if (!url) return '';
  return url
    .replace(/\/s\d+(-c)?\//, '/s1600/')
    .replace(/=s\d+(-c)?$/, '=s1600')
    .replace(/\/w\d+-h\d+(-p-k-no-nu)?\//, '/s1600/');
}

export function extractFirstImageFromHtml(html: string, thumbnailUrl?: string): string {
  if (html) {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
      return upgradeBloggerImageUrl(imgMatch[1]);
    }
  }
  if (thumbnailUrl) {
    return upgradeBloggerImageUrl(thumbnailUrl);
  }
  return '';
}

function pickFallbackCover(categoryName: string, index: number): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes('músic') || lower.includes('music') || lower.includes('sonor') || lower.includes('indie')) {
    return 'music-production';
  }
  if (lower.includes('arte') || lower.includes('diseñ') || lower.includes('visual') || lower.includes('cebra')) {
    return 'digital-art';
  }
  if (lower.includes('social') || lower.includes('human') || lower.includes('esperanza') || lower.includes('comunidad')) {
    return 'social-impact';
  }
  if (lower.includes('ia') || lower.includes('código') || lower.includes('tech') || lower.includes('node') || lower.includes('web')) {
    return 'ai-architecture';
  }
  return COVER_KEYS[index % COVER_KEYS.length];
}

export function parseBloggerFeedJson(data: any, indexOffset = 0): IBlogPost[] {
  const entries: any[] = data?.feed?.entry;
  if (!Array.isArray(entries) || entries.length === 0) return [];

  return entries.map((entry, idx) => {
    const rawId: string = entry?.id?.$t || `blogger-${idx}`;
    const postIdMatch = rawId.match(/post-(\d+)/);
    const id = postIdMatch ? `blogger-${postIdMatch[1]}` : `blogger-${slugify(rawId).slice(-24) || idx}`;

    const title = String(entry?.title?.$t || 'Entrada de CESARBRAHER').trim();
    const rawHtml = String(entry?.content?.$t || entry?.summary?.$t || '');
    const plainContent = htmlToPlainParagraphs(rawHtml) || title;
    const summaryText = entry?.summary?.$t
      ? htmlToPlainParagraphs(String(entry.summary.$t))
      : plainContent.split(/\n\n+/)[0] || title;
    const excerpt = summaryText.length > 220 ? `${summaryText.slice(0, 217).trim()}...` : summaryText;

    const categories: string[] = Array.isArray(entry?.category)
      ? entry.category.map((c: any) => String(c?.term || '').trim()).filter(Boolean)
      : [];
    const categoryName = categories[0] || 'CESARBRAHER Blog';
    const categorySlug = slugify(categoryName) || 'cesarbraher-blog';

    const thumbUrl = entry?.['media$thumbnail']?.url;
    const extractedImg = extractFirstImageFromHtml(rawHtml, thumbUrl);
    const coverImage = extractedImg || pickFallbackCover(categoryName, idx + indexOffset);

    const links: any[] = Array.isArray(entry?.link) ? entry.link : [];
    const alternateLink = links.find((l) => l?.rel === 'alternate' && l?.href)?.href || '';

    const authorName =
      entry?.author?.[0]?.name?.$t && entry.author[0].name.$t !== 'Unknown'
        ? String(entry.author[0].name.$t)
        : 'Cesar Augusto Bravo Hernández';

    const createdAt = entry?.published?.$t
      ? new Date(entry.published.$t).toISOString()
      : new Date().toISOString();
    const updatedAt = entry?.updated?.$t
      ? new Date(entry.updated.$t).toISOString()
      : createdAt;

    const wordCount = plainContent.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 180));

    return {
      id,
      title,
      slug: slugify(title) || id,
      excerpt,
      content: plainContent,
      contentHtml: rawHtml,
      categorySlug,
      categoryName,
      coverImage,
      readTimeMinutes,
      published: true,
      featured: idx === 0,
      author: authorName,
      createdAt,
      updatedAt,
      source: 'blogger',
      externalUrl: alternateLink,
      labels: categories,
    } as IBlogPost & {
      contentHtml?: string;
      source?: 'blogger' | 'local';
      externalUrl?: string;
      labels?: string[];
    };
  });
}

function parseBloggerApiV3Items(items: any[]): IBlogPost[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  return items.map((item, idx) => {
    const id = `blogger-${item.id || idx}`;
    const title = String(item.title || 'Entrada de CESARBRAHER').trim();
    const rawHtml = String(item.content || '');
    const plainContent = htmlToPlainParagraphs(rawHtml) || title;
    const firstParagraph = plainContent.split(/\n\n+/)[0] || title;
    const excerpt = firstParagraph.length > 220 ? `${firstParagraph.slice(0, 217).trim()}...` : firstParagraph;

    const labels: string[] = Array.isArray(item.labels) ? item.labels.map(String) : [];
    const categoryName = labels[0] || 'CESARBRAHER Blog';
    const categorySlug = slugify(categoryName) || 'cesarbraher-blog';

    const apiImage = item.images?.[0]?.url;
    const coverImage = extractFirstImageFromHtml(rawHtml, apiImage) || pickFallbackCover(categoryName, idx);

    const createdAt = item.published ? new Date(item.published).toISOString() : new Date().toISOString();
    const updatedAt = item.updated ? new Date(item.updated).toISOString() : createdAt;
    const wordCount = plainContent.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 180));

    return {
      id,
      title,
      slug: slugify(title) || id,
      excerpt,
      content: plainContent,
      contentHtml: rawHtml,
      categorySlug,
      categoryName,
      coverImage,
      readTimeMinutes,
      published: true,
      featured: idx === 0,
      author: item.author?.displayName || 'Cesar Augusto Bravo Hernández',
      createdAt,
      updatedAt,
      source: 'blogger',
      externalUrl: item.url || '',
      labels,
    } as IBlogPost;
  });
}

export async function fetchBloggerPostsFromServer(forceRefresh = false): Promise<{
  posts: IBlogPost[];
  synced: boolean;
  error?: string;
}> {
  const config = getBloggerConfig();
  if (!config.enabled) {
    return { posts: [], synced: false };
  }

  if (!forceRefresh && cachedPosts && Date.now() - cachedPosts.fetchedAt < CACHE_TTL_MS) {
    return { posts: cachedPosts.posts, synced: cachedPosts.posts.length > 0 };
  }

  const candidateFeedUrls: string[] = [];

  if (config.blogId) {
    candidateFeedUrls.push(
      `https://www.blogger.com/feeds/${encodeURIComponent(config.blogId)}/posts/default?alt=json&max-results=50`
    );
  }

  const primaryUrl = normalizeBloggerUrl(config.blogUrl);
  candidateFeedUrls.push(`${primaryUrl}/feeds/posts/default?alt=json&max-results=50`);

  // Also add common CESARBRAHER / CEBRAHER blogspot variations as automatic discovery fallbacks
  for (const fallbackDomain of [
    'https://cesarbraher.blogspot.com',
    'https://cebraher.blogspot.com',
    'https://cesarbravo.blogspot.com',
  ]) {
    const feedUrl = `${fallbackDomain}/feeds/posts/default?alt=json&max-results=50`;
    if (!candidateFeedUrls.includes(feedUrl)) {
      candidateFeedUrls.push(feedUrl);
    }
  }

  // 1. Try Blogger API v3 if API Key is configured
  if (config.apiKey) {
    try {
      let blogId = config.blogId;
      if (!blogId) {
        const byUrlRes = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/byurl?url=${encodeURIComponent(primaryUrl)}&key=${encodeURIComponent(config.apiKey)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (byUrlRes.ok) {
          const blogMeta: any = await byUrlRes.json();
          blogId = blogMeta?.id || '';
        }
      }
      if (blogId) {
        const postsRes = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}/posts?fetchImages=true&maxResults=50&key=${encodeURIComponent(config.apiKey)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (postsRes.ok) {
          const postsJson: any = await postsRes.json();
          const parsed = parseBloggerApiV3Items(postsJson?.items || []);
          if (parsed.length > 0) {
            cachedPosts = { posts: parsed, fetchedAt: Date.now() };
            saveBloggerConfig({ lastSyncedAt: new Date().toISOString(), blogId });
            return { posts: parsed, synced: true };
          }
        }
      }
    } catch {
      // Fallback to public JSON feed
    }
  }

  // 2. Try public Blogger JSON feeds
  let lastError = '';
  for (const feedUrl of candidateFeedUrls) {
    try {
      const res = await fetch(feedUrl, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4500),
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status} en ${feedUrl}`;
        continue;
      }
      const data = await res.json();
      const parsed = parseBloggerFeedJson(data);
      if (parsed.length > 0) {
        cachedPosts = { posts: parsed, fetchedAt: Date.now() };
        return { posts: parsed, synced: true };
      }
    } catch (err: any) {
      lastError = err?.message || 'No se pudo conectar al feed de Blogger';
    }
  }

  return { posts: [], synced: false, error: lastError || undefined };
}

export function extractCategoriesFromPosts(posts: IBlogPost[], existingCategories: ICategory[]): ICategory[] {
  const bySlug = new Map<string, ICategory>();
  for (const c of existingCategories) {
    bySlug.set(c.slug, c);
  }
  for (const p of posts) {
    if (p.categorySlug && !bySlug.has(p.categorySlug)) {
      bySlug.set(p.categorySlug, {
        id: `cat-blogger-${p.categorySlug}`,
        name: p.categoryName || p.categorySlug,
        slug: p.categorySlug,
        description: `Etiqueta sincronizada desde Blogger (${DEFAULT_BLOGGER_CONFIG.blogName})`,
        createdAt: p.createdAt,
      });
    }
  }
  return Array.from(bySlug.values());
}
