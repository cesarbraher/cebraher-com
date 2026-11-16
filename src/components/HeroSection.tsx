import { ArrowRight, ExternalLink, RefreshCw, Rss } from 'lucide-react';
import {
  formatSpanishDate,
  HERO_PROFILE_IMAGE,
  HERO_STUDIO_IMAGE,
  resolveCoverImage,
} from '../lib/assets';
import type { BlogPost, BloggerConfig } from '../lib/types';
import { PayPalDonateButton } from './PayPalDonateButton';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onExploreProjects: () => void;
  onReadBlog: () => void;
  publishedPostsCount: number;
  projectsCount: number;
  latestPosts: BlogPost[];
  bloggerConfig: BloggerConfig;
  bloggerSynced: boolean;
  syncingBlogger: boolean;
  onSyncBlogger: () => void;
  onOpenPost: (post: BlogPost) => void;
}

export function HeroSection({
  onExploreProjects,
  onReadBlog,
  publishedPostsCount,
  projectsCount,
  latestPosts,
  bloggerConfig,
  bloggerSynced,
  syncingBlogger,
  onSyncBlogger,
  onOpenPost,
}: HeroSectionProps) {
  const topThreePosts = latestPosts.slice(0, 3);

  return (
    <section id="inicio" className="relative border-b border-zinc-800/80 bg-[#090A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Typographic Hierarchy + Circular Profile Photo + PayPal Donations Button */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs sm:text-sm font-medium text-zinc-400 tracking-wide mb-5">
                Cesar Augusto Bravo Hernández · Salamanca &amp; Valle de Santiago, México
              </p>

              {/* Circular image (me.png) to the left of the main header title */}
              <div className="flex items-center gap-4 sm:gap-6 mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-xl bg-[#111219] shrink-0">
                  <img
                    src={HERO_PROFILE_IMAGE}
                    alt="Cesar Braher"
                    className="w-full h-full object-cover object-center rounded-full"
                  />
                </div>
                <h1 className="font-display text-[clamp(1.85rem,3.6vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-zinc-50">
                  Creando arte y tecnología con propósito.
                </h1>
              </div>

              <p className="text-base sm:text-lg text-zinc-300 font-medium leading-relaxed max-w-xl mb-6">
                Artista Digital | @google DevRel | Consejero en Adicciones | Músico | Web &amp; App Developer.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* PayPal DONACIONES button placed directly above "Explorar Proyectos" */}
              <div>
                <PayPalDonateButton />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={onExploreProjects}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-zinc-950 text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  Explorar Proyectos
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={onReadBlog}
                  className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-amber-400 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Leer últimas entradas de Blogger
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Uploaded Studio Cover Photograph */}
          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[320px] lg:min-h-[450px] rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#111219]">
              <ResilientImage
                src={HERO_STUDIO_IMAGE}
                alt="Cesar Braher tocando guitarra acústica en su estudio de producción musical y desarrollo digital"
                className="w-full h-full object-cover object-center"
                fallbackTitle="Estudio Cesar Braher — Música y Código"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F]/85 via-[#090A0F]/15 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-zinc-300 font-medium">
                    Cesar Braher · En el estudio
                  </p>
                  <p className="text-sm text-zinc-100 font-semibold">
                    Producción sonora, arquitectura Full-Stack y dirección creativa
                  </p>
                </div>
                <span className="font-mono text-xs text-amber-400 tabular-nums whitespace-nowrap">
                  CEBRA · 1986–2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Últimas Entradas en la Landing Page (Sincronizadas con Blogger: CESARBRAHER) */}
        {topThreePosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Rss className="w-3.5 h-3.5" aria-hidden="true" />
                  Blogger · {bloggerConfig.blogName}
                </span>
                <h2 className="font-display text-sm sm:text-base font-bold text-zinc-100">
                  Últimas entradas publicadas ({bloggerConfig.accountEmail})
                </h2>
                {bloggerSynced && (
                  <span className="text-xs text-emerald-400 font-medium">
                    · En vivo desde Blogger
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={onSyncBlogger}
                  disabled={syncingBlogger}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
                  title="Sincronizar últimas entradas de Blogger"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingBlogger ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Actualizar feed
                </button>
                <span className="text-zinc-700" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={onReadBlog}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Ir a la sección del Blog
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThreePosts.map((post, idx) => (
                <article
                  key={post.id}
                  onClick={() => onOpenPost(post)}
                  className="group flex items-start gap-3.5 p-3.5 rounded-xl bg-[#11131C]/90 border border-zinc-800/80 hover:border-amber-500/50 transition-colors cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#0D0E15] border border-zinc-800/70 shrink-0">
                    <ResilientImage
                      src={resolveCoverImage(post.coverImage)}
                      alt={post.title}
                      fallbackTitle={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1">
                      <span className="text-amber-400 font-semibold truncate">
                        {idx === 0 ? 'Última entrada' : post.categoryName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums shrink-0">{formatSpanishDate(post.createdAt)}</span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>Leer entrada</span>
                      {post.externalUrl && (
                        <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Full-width 4-Column KPI / Identity Strip below the hero split */}
        <div className="mt-10 pt-8 border-t border-zinc-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-zinc-50 tabular-nums">
              22+ años
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Trayectoria en arte digital, branding y web
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-zinc-50 tabular-nums">
              {projectsCount} iniciativas
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Ecosistemas activos con seguimiento en vivo
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-zinc-50 tabular-nums">
              {publishedPostsCount} artículos
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Entradas sincronizadas con Blogger ({bloggerConfig.blogName})
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-amber-400 tabular-nums">
              Apache 2.0
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Compromiso con código abierto e impacto social
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
