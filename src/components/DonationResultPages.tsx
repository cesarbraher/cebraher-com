import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Heart, Sparkles } from 'lucide-react';
import { HERO_PROFILE_IMAGE, SITE_ICON } from '../lib/assets';
import type { Project } from '../lib/types';
import { PayPalDonateButton } from './PayPalDonateButton';

interface DonationSubpageProps {
  projects: Project[];
  onGoToProjects: () => void;
  onGoToBlog: () => void;
  onGoHome: () => void;
}

export function CancelDonationPage({
  projects,
  onGoToProjects,
  onGoToBlog,
  onGoHome,
}: DonationSubpageProps) {
  return (
    <section className="min-h-[calc(100vh-4rem)] py-16 lg:py-24 bg-[#090A0F] flex flex-col justify-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl bg-[#11131C] border border-zinc-800/80 p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-lg bg-[#090A0F] shrink-0">
              <img
                src={HERO_PROFILE_IMAGE}
                alt="Cesar Braher"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                CESAR BRAHER · Web Personal y Blog
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-50 mb-3">
                Te invito a Seguir mis Proyectos
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                No te preocupes si decidiste cancelar la donación en este momento. Tu visita, lectura y difusión de
                nuestro trabajo en arte digital, código abierto, música e impacto social también son una gran forma de
                apoyar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pb-8 border-b border-zinc-800/80">
            <button
              type="button"
              onClick={onGoToProjects}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-zinc-950 text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Explorar Proyectos
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onGoToBlog}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-zinc-700 text-zinc-200 text-sm font-semibold hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Leer el Blog
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Volver al Inicio
            </button>
          </div>

          {projects.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-bold text-zinc-100 mb-4">
                Iniciativas y proyectos activos para seguir de cerca
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((project) => (
                  <a
                    key={project.id}
                    href={project.url || '/#proyectos'}
                    target={project.url ? '_blank' : undefined}
                    rel={project.url ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      if (!project.url) {
                        e.preventDefault();
                        onGoToProjects();
                      }
                    }}
                    className="group p-4 rounded-xl bg-[#090A0F] border border-zinc-800/80 hover:border-amber-500/50 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={SITE_ICON}
                        alt="Cesar Braher"
                        className="w-7 h-7 rounded-md object-contain bg-[#141414] border border-zinc-800 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{project.subtitle}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 shrink-0 mt-1" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-400">
              ¿Deseas retomar tu aportación voluntaria por PayPal en otro momento?
            </p>
            <PayPalDonateButton />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ThankYouDonationPage({
  onGoToProjects,
  onGoToBlog,
  onGoHome,
}: DonationSubpageProps) {
  return (
    <section className="min-h-[calc(100vh-4rem)] py-16 lg:py-24 bg-[#090A0F] flex flex-col justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl bg-[#11131C] border border-zinc-800/80 p-8 sm:p-12 shadow-2xl text-center">
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-500 shadow-xl bg-[#090A0F]">
              <img
                src={HERO_PROFILE_IMAGE}
                alt="Cesar Braher"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md border-2 border-[#11131C]">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Heart className="w-3.5 h-3.5 fill-emerald-400" aria-hidden="true" />
            Donación recibida vía PayPal
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-50 mb-4">
            ¡Muchas gracias por tu donación!
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto mb-6">
            Tu generosidad impulsa directamente la creación de arte digital, el desarrollo de herramientas tecnológicas
            abiertas, la producción musical independiente y nuestras iniciativas de consejería e impacto social.
          </p>

          <blockquote className="max-w-xl mx-auto py-4 px-6 rounded-xl bg-[#090A0F] border border-zinc-800/80 text-sm text-zinc-200 italic mb-8">
            “Creando arte y tecnología con propósito. Gracias por ser parte de este camino y ayudarnos a transformar
            ideas en realidades que suman a la comunidad.”
            <footer className="not-italic text-xs text-amber-400 font-semibold mt-2">
              — Cesar Braher (Cesar Augusto Bravo Hernández)
            </footer>
          </blockquote>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGoToProjects}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-zinc-950 text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Explorar Proyectos
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onGoToBlog}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-zinc-700 text-zinc-200 text-sm font-semibold hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Ir al Blog
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-zinc-400 hover:text-zinc-100 text-sm font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
