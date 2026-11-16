import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, PenSquare, RefreshCw, Rss, Search, X } from 'lucide-react';
import { formatSpanishDate, resolveCoverImage } from '../lib/assets';
import type { BlogPost, BloggerConfig, Category } from '../lib/types';
import { ResilientImage } from './ResilientImage';

interface BlogSectionProps {
  posts: BlogPost[];
  categories: Category[];
  bloggerConfig: BloggerConfig;
  bloggerSynced: boolean;
  syncingBlogger: boolean;
  onSyncBlogger: () => void;
  onOpenAdmin: () => void;
  readingPost: BlogPost | null;
  onSelectPost: (post: BlogPost | null) => void;
}

export function BlogSection({
  posts,
  categories,
  bloggerConfig,
  bloggerSynced,
  syncingBlogger,
  onSyncBlogger,
  onOpenAdmin,
  readingPost,
  onSelectPost,
}: BlogSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const publishedPosts = useMemo(() => posts.filter((p) => p.published), [posts]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of publishedPosts) {
      map[p.categorySlug] = (map[p.categorySlug] || 0) + 1;
    }
    return map;
  }, [publishedPosts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedPosts.filter((p) => {
      const catMatch = activeCategory === 'all' || p.categorySlug === activeCategory;
      const searchMatch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [publishedPosts, activeCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    if (filteredPosts.length === 0) return null;
    return filteredPosts.find((p) => p.featured) || filteredPosts[0];
  }, [filteredPosts]);

  const secondaryPosts = useMemo(() => {
    if (!featuredPost) return [];
    return filteredPosts.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  return (
    <section id="blog" className="py-16 lg:py-24 border-b border-zinc-800/80 bg-[#0B0C12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <p className="text-xs font-medium text-amber-400 tracking-wide">
                03. Últimas Entradas &amp; Bitácora Editorial
              </p>
              <span className="text-zinc-700" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Rss className="w-3 h-3" aria-hidden="true" />
                Blogger: {bloggerConfig.blogName} ({bloggerConfig.accountEmail})
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-3">
              Últimas entradas desde Blogger · {bloggerConfig.blogName}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Cada entrada que publiques en tu cuenta de Blogger (<strong className="text-zinc-200">{bloggerConfig.accountEmail}</strong> · Blog{' '}
              <strong className="text-zinc-200">{bloggerConfig.blogName}</strong>) se sincroniza automáticamente aquí y en las últimas entradas de la Landing Page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={onSyncBlogger}
              disabled={syncingBlogger}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-200 hover:border-amber-500 hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingBlogger ? 'animate-spin' : ''}`} aria-hidden="true" />
              {syncingBlogger ? 'Sincronizando...' : 'Sincronizar Blogger'}
            </button>

            <a
              href="https://www.blogger.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              Publicar en Blogger
            </a>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5" aria-hidden="true" />
              Configurar Blogger / CMS
            </button>
          </div>
        </div>

        {/* Blogger connection banner */}
        <div className="mb-8 px-4 py-3 rounded-xl bg-[#11131C] border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${bloggerSynced ? 'bg-emerald-400' : 'bg-amber-400'}`}
              aria-hidden="true"
            />
            <span>
              Fuente editorial activa:{' '}
              <strong className="text-zinc-200">Blogger ({bloggerConfig.blogName})</strong> · Cuenta:{' '}
              <span className="font-mono text-zinc-300">{bloggerConfig.accountEmail}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={bloggerConfig.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
            >
              Abrir {bloggerConfig.blogUrl.replace(/^https?:\/\//, '')}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Category Filter Tabs + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#11131C] border border-zinc-800 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Todas ({publishedPosts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {cat.name} ({categoryCounts[cat.slug] || 0})
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el blog..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#11131C] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-[#11131C] p-12 text-center">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-base font-medium text-zinc-200 mb-1">No se encontraron entradas</p>
            <p className="text-sm text-zinc-400 mb-5">
              Prueba cambiando de categoría o sube una nueva entrada en Blogger ({bloggerConfig.blogName}).
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500 cursor-pointer"
            >
              Ver todas las entradas
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Latest Entry with Photo */}
            {featuredPost && (
              <article
                onClick={() => onSelectPost(featuredPost)}
                className="group grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden bg-[#11131C] border border-zinc-800/80 hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                <div className="lg:col-span-6 aspect-[4/3] lg:aspect-auto lg:min-h-[340px] overflow-hidden bg-[#0D0E15]">
                  <ResilientImage
                    src={resolveCoverImage(featuredPost.coverImage)}
                    alt={featuredPost.title}
                    fallbackTitle={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold">
                        {featuredPost.source === 'blogger' ? `Blogger · ${bloggerConfig.blogName}` : 'Última Entrada'}
                      </span>
                      <span className="text-amber-400 font-semibold">{featuredPost.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatSpanishDate(featuredPost.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{featuredPost.readTimeMinutes} min de lectura</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-50 group-hover:text-amber-400 transition-colors leading-tight mb-4">
                      {featuredPost.title}
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-zinc-800/70">
                    <span className="text-xs text-zinc-400">Por {featuredPost.author}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      Leer artículo completo
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* Latest Entries Grid with Photos */}
            {secondaryPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondaryPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className="group flex flex-col rounded-2xl overflow-hidden bg-[#11131C] border border-zinc-800/80 hover:border-amber-500/50 transition-colors cursor-pointer"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#0D0E15] border-b border-zinc-800/60">
                      <ResilientImage
                        src={resolveCoverImage(post.coverImage)}
                        alt={post.title}
                        fallbackTitle={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-3">
                          <span className="text-amber-400 font-medium">{post.categoryName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{formatSpanishDate(post.createdAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{post.readTimeMinutes} min</span>
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-zinc-50 group-hover:text-amber-400 transition-colors leading-snug mb-2.5">
                          {post.title}
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 mb-5">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-zinc-800/70 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 truncate">{post.author}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-200 group-hover:text-amber-400 whitespace-nowrap shrink-0">
                          Leer
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Article Reader Modal */}
      {readingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => onSelectPost(null)}
        >
          <article
            className="w-full max-w-3xl rounded-2xl bg-[#11131C] border border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0D0E15] shrink-0">
              <div className="flex items-center gap-2 text-xs text-zinc-400 truncate">
                <span className="text-amber-400 font-semibold">{readingPost.categoryName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{formatSpanishDate(readingPost.createdAt)}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{readingPost.readTimeMinutes} min de lectura</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectPost(null)}
                className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 cursor-pointer shrink-0"
                aria-label="Cerrar artículo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto">
              <div className="aspect-[16/9] max-h-[340px] w-full overflow-hidden bg-[#090A0F] border-b border-zinc-800">
                <ResilientImage
                  src={resolveCoverImage(readingPost.coverImage)}
                  alt={readingPost.title}
                  fallbackTitle={readingPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-10">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-50 leading-tight mb-4">
                  {readingPost.title}
                </h2>
                <p className="text-base text-zinc-300 font-medium leading-relaxed mb-8 pb-6 border-b border-zinc-800/80">
                  {readingPost.excerpt}
                </p>

                {readingPost.contentHtml ? (
                  <div
                    className="space-y-4 text-base text-zinc-300 leading-[1.75] max-w-[68ch] [&_p]:mb-4 [&_a]:text-amber-400 [&_a]:underline [&_img]:rounded-xl [&_img]:my-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-100 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: readingPost.contentHtml }}
                  />
                ) : (
                  <div className="space-y-5 text-base text-zinc-300 leading-[1.75] max-w-[68ch]">
                    {readingPost.content.split(/\n\n+/).map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                )}

                <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{readingPost.author}</p>
                    <p className="text-xs text-zinc-400">
                      Blogger · {bloggerConfig.blogName} ({bloggerConfig.accountEmail})
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {readingPost.externalUrl && (
                      <a
                        href={readingPost.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-200 hover:border-amber-500 hover:text-amber-400 transition-colors"
                      >
                        Ver en Blogger
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectPost(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      Volver al blog
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
