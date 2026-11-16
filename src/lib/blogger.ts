import type { BlogPost, BloggerConfig, Category } from './types';

export const DEFAULT_BLOGGER_CONFIG: BloggerConfig = {
  blogName: 'CESARBRAHER',
  accountEmail: 'cesarbraher@gmail.com',
  blogUrl: 'https://cesarbraher.blogspot.com',
  blogId: '',
  apiKey: '',
  enabled: true,
  includeLocalFallback: true,
};

const STORAGE_KEY = 'cebra_blogger_config_v1';
const COVER_KEYS = ['ai-architecture', 'music-production', 'digital-art', 'social-impact', 'studio-hero'];

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function normalizeBloggerUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return DEFAULT_BLOGGER_CONFIG.blogUrl;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!trimmed.includes('.')) {
    return `https://${trimmed.toLowerCase()}.blogspot.com`;
  }
  return `https://${trimmed}`;
}

export function loadStoredBloggerConfig(): BloggerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BLOGGER_CONFIG;
    const parsed = JSON.parse(raw) as Partial<BloggerConfig>;
    return {
      ...DEFAULT_BLOGGER_CONFIG,
      ...parsed,
      blogUrl: normalizeBloggerUrl(parsed.blogUrl || DEFAULT_BLOGGER_CONFIG.blogUrl),
    };
  } catch {
    return DEFAULT_BLOGGER_CONFIG;
  }
}

export function saveStoredBloggerConfig(config: Partial<BloggerConfig>): BloggerConfig {
  const current = loadStoredBloggerConfig();
  const next: BloggerConfig = {
    ...current,
    ...config,
    blogName: (config.blogName ?? current.blogName).trim() || 'CESARBRAHER',
    accountEmail: (config.accountEmail ?? current.accountEmail).trim() || 'cesarbraher@gmail.com',
    blogUrl: normalizeBloggerUrl(config.blogUrl ?? current.blogUrl),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  return next;
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

export function sanitizeBloggerHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
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

export function parseBloggerFeedData(data: any): BlogPost[] {
  const entries: any[] = data?.feed?.entry;
  if (!Array.isArray(entries) || entries.length === 0) return [];

  return entries.map((entry, idx) => {
    const rawId: string = entry?.id?.$t || `blogger-${idx}`;
    const postIdMatch = rawId.match(/post-(\d+)/);
    const id = postIdMatch ? `blogger-${postIdMatch[1]}` : `blogger-${slugifyText(rawId).slice(-24) || idx}`;

    const title = String(entry?.title?.$t || 'Entrada de CESARBRAHER').trim();
    const rawHtml = String(entry?.content?.$t || entry?.summary?.$t || '');
    const plainContent = htmlToPlainParagraphs(rawHtml) || title;
    const summaryText = entry?.summary?.$t
      ? htmlToPlainParagraphs(String(entry.summary.$t))
      : plainContent.split(/\n\n+/)[0] || title;
    const excerpt = summaryText.length > 220 ? `${summaryText.slice(0, 217).trim()}...` : summaryText;

    const labels: string[] = Array.isArray(entry?.category)
      ? entry.category.map((c: any) => String(c?.term || '').trim()).filter(Boolean)
      : [];
    const categoryName = labels[0] || 'CESARBRAHER Blog';
    const categorySlug = slugifyText(categoryName) || 'cesarbraher-blog';

    const thumbUrl = entry?.['media$thumbnail']?.url;
    const extractedImg = extractFirstImageFromHtml(rawHtml, thumbUrl);
    const coverImage = extractedImg || pickFallbackCover(categoryName, idx);

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
      slug: slugifyText(title) || id,
      excerpt,
      content: plainContent,
      contentHtml: sanitizeBloggerHtml(rawHtml),
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
      labels,
    };
  });
}

function loadBloggerJsonpFeed(feedBaseUrl: string, timeoutMs = 6500): Promise<BlogPost[]> {
  return new Promise((resolve, reject) => {
    const callbackName = `__cebraBloggerJsonp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const script = document.createElement('script');
    let settled = false;

    const cleanup = () => {
      try {
        delete (window as any)[callbackName];
      } catch {
        (window as any)[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Tiempo de espera agotado al consultar Blogger JSONP'));
    }, timeoutMs);

    (window as any)[callbackName] = (data: any) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      try {
        const posts = parseBloggerFeedData(data);
        resolve(posts);
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      reject(new Error(`No se pudo cargar el feed de Blogger desde ${feedBaseUrl}`));
    };

    const separator = feedBaseUrl.includes('?') ? '&' : '?';
    script.src = `${feedBaseUrl}${separator}alt=json-in-script&max-results=50&callback=${callbackName}`;
    script.async = true;
    document.head.appendChild(script);
  });
}

export async function fetchLiveBloggerPostsBrowser(
  config: BloggerConfig
): Promise<{ posts: BlogPost[]; synced: boolean; activeUrl?: string }> {
  if (!config.enabled) {
    return { posts: [], synced: false };
  }

  // 1. If Blogger API v3 key is provided, try REST v3 first
  if (config.apiKey) {
    try {
      const primaryUrl = normalizeBloggerUrl(config.blogUrl);
      let blogId = config.blogId;
      if (!blogId) {
        const byUrlRes = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/byurl?url=${encodeURIComponent(primaryUrl)}&key=${encodeURIComponent(config.apiKey)}`
        );
        if (byUrlRes.ok) {
          const meta = await byUrlRes.json();
          blogId = meta?.id || '';
        }
      }
      if (blogId) {
        const res = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}/posts?fetchImages=true&maxResults=50&key=${encodeURIComponent(config.apiKey)}`
        );
        if (res.ok) {
          const data = await res.json();
          const items: any[] = data?.items || [];
          if (items.length > 0) {
            const posts: BlogPost[] = items.map((item, idx) => {
              const rawHtml = String(item.content || '');
              const plainContent = htmlToPlainParagraphs(rawHtml) || String(item.title || '');
              const firstPara = plainContent.split(/\n\n+/)[0] || String(item.title || '');
              const excerpt = firstPara.length > 220 ? `${firstPara.slice(0, 217).trim()}...` : firstPara;
              const labels: string[] = Array.isArray(item.labels) ? item.labels.map(String) : [];
              const categoryName = labels[0] || 'CESARBRAHER Blog';
              const categorySlug = slugifyText(categoryName) || 'cesarbraher-blog';
              const coverImage =
                extractFirstImageFromHtml(rawHtml, item.images?.[0]?.url) || pickFallbackCover(categoryName, idx);
              const wordCount = plainContent.split(/\s+/).filter(Boolean).length;
              return {
                id: `blogger-${item.id || idx}`,
                title: String(item.title || 'Entrada de CESARBRAHER'),
                slug: slugifyText(String(item.title || '')) || `blogger-${idx}`,
                excerpt,
                content: plainContent,
                contentHtml: sanitizeBloggerHtml(rawHtml),
                categorySlug,
                categoryName,
                coverImage,
                readTimeMinutes: Math.max(2, Math.ceil(wordCount / 180)),
                published: true,
                featured: idx === 0,
                author: item.author?.displayName || 'Cesar Augusto Bravo Hernández',
                createdAt: item.published ? new Date(item.published).toISOString() : new Date().toISOString(),
                updatedAt: item.updated ? new Date(item.updated).toISOString() : new Date().toISOString(),
                source: 'blogger',
                externalUrl: item.url || '',
                labels,
              };
            });
            return { posts, synced: true, activeUrl: primaryUrl };
          }
        }
      }
    } catch {
      // Fallback to JSONP feed
    }
  }

  // 2. Try JSONP feeds directly from browser (works without CORS or API key on any hosting)
  const candidates: { label: string; feedUrl: string }[] = [];
  if (config.blogId?.trim()) {
    candidates.push({
      label: `Blogger ID ${config.blogId.trim()}`,
      feedUrl: `https://www.blogger.com/feeds/${encodeURIComponent(config.blogId.trim())}/posts/default`,
    });
  }

  const primary = normalizeBloggerUrl(config.blogUrl);
  candidates.push({
    label: primary,
    feedUrl: `${primary}/feeds/posts/default`,
  });

  for (const fallback of [
    'https://cesarbraher.blogspot.com',
    'https://cebraher.blogspot.com',
  ]) {
    if (fallback !== primary) {
      candidates.push({
        label: fallback,
        feedUrl: `${fallback}/feeds/posts/default`,
      });
    }
  }

  for (const candidate of candidates) {
    try {
      const posts = await loadBloggerJsonpFeed(candidate.feedUrl);
      if (posts.length > 0) {
        return { posts, synced: true, activeUrl: candidate.label };
      }
    } catch {
      // Continue to next candidate
    }
  }

  return { posts: [], synced: false };
}

export function mergeBloggerCategories(posts: BlogPost[], baseCategories: Category[]): Category[] {
  const bySlug = new Map<string, Category>();
  for (const cat of baseCategories) {
    bySlug.set(cat.slug, cat);
  }
  for (const post of posts) {
    if (post.categorySlug && !bySlug.has(post.categorySlug)) {
      bySlug.set(post.categorySlug, {
        id: `cat-${post.categorySlug}`,
        name: post.categoryName || post.categorySlug,
        slug: post.categorySlug,
        description: 'Etiqueta de Blogger (CESARBRAHER)',
        createdAt: post.createdAt,
      });
    }
  }
  return Array.from(bySlug.values());
}
