import { ArrowRight } from 'lucide-react';
import { HERO_STUDIO_IMAGE } from '../lib/assets';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onExploreProjects: () => void;
  onReadBlog: () => void;
  publishedPostsCount: number;
  projectsCount: number;
}

export function HeroSection({
  onExploreProjects,
  onReadBlog,
  publishedPostsCount,
  projectsCount,
}: HeroSectionProps) {
  return (
    <section id="inicio" className="relative border-b border-zinc-800/80 bg-[#090A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs sm:text-sm font-medium text-zinc-400 tracking-wide mb-5">
                César Augusto Bravo Hernández · Salamanca &amp; Valle de Santiago, México
              </p>

              <h1 className="font-display text-[clamp(2.25rem,4vw,3.6rem)] font-bold leading-[1.08] tracking-tight text-zinc-50 mb-6">
                Donde el código se convierte en arte y la tecnología en propósito.
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl mb-8">
                Desarrollador Full-Stack Web &amp; Mobile, artista digital, productor musical y fundador de{' '}
                <span className="text-zinc-100 font-medium">CEBRA.TECH</span> y{' '}
                <span className="text-zinc-100 font-medium">CEBRA.STORE</span>. Más de dos décadas uniendo ingeniería
                con Node.js, MySQL en Hostinger e Inteligencia Artificial con dirección visual y música Indie Rock.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
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
                Leer últimas entradas
              </button>
            </div>
          </div>

          {/* Right Column: Uploaded Studio Cover Photograph */}
          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[320px] lg:min-h-[450px] rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#111219]">
              <ResilientImage
                src={HERO_STUDIO_IMAGE}
                alt="César Braher tocando guitarra acústica en su estudio de producción musical y desarrollo digital"
                className="w-full h-full object-cover object-center"
                fallbackTitle="Estudio César Braher — Música y Código"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F]/85 via-[#090A0F]/15 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-zinc-300 font-medium">
                    César Braher · En el estudio
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

        {/* Full-width 4-Column KPI / Identity Strip below the hero split */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
              Publicaciones administradas en MySQL Hostinger
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
