import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Circle, X } from 'lucide-react';
import type { Project } from '../lib/types';

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category)));
    return ['Todos', ...unique];
  }, [projects]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'Todos') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <section id="proyectos" className="py-16 lg:py-24 border-b border-zinc-800/80 bg-[#0B0C12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-amber-400 tracking-wide mb-2">
              01. Portafolio &amp; Arquitectura
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-3">
              Proyectos donde el software dialoga con el arte
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Plataformas web administrables, laboratorios de Inteligencia Artificial, impacto social comunitario y
              producción musical independiente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#12141E] border border-zinc-800 rounded-xl self-start lg:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, index) => {
            const isFeaturedSpan = index === 0 && filtered.length >= 4;
            return (
              <article
                key={project.id}
                onClick={() => setActiveProject(project)}
                className={`group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#11131C] border border-zinc-800/80 hover:border-amber-500/50 transition-colors cursor-pointer ${
                  isFeaturedSpan ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  {/* Clean unboxed metadata row */}
                  <div className="flex items-center justify-between gap-4 text-xs text-zinc-400 mb-4">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-amber-400 font-medium">{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.status}</span>
                    </div>
                    <span className="font-mono text-zinc-300 tabular-nums shrink-0">{project.progress}%</span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-50 group-hover:text-amber-400 transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-zinc-300 mb-3">{project.subtitle}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{project.description}</p>
                </div>

                <div className="pt-5 border-t border-zinc-800/70 space-y-4">
                  {/* Stack as clean unboxed typographic line */}
                  <p className="text-xs text-zinc-400 truncate">
                    {project.stack.join(' · ')}
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-zinc-300 truncate">{project.impactMetric}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 whitespace-nowrap shrink-0">
                      Ver detalle
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[#11131C] border border-zinc-800 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                  <span className="text-amber-400 font-medium">{activeProject.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeProject.status}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{activeProject.progress}% completado</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-50">
                  {activeProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="w-9 h-9 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 cursor-pointer shrink-0"
                aria-label="Cerrar detalle del proyecto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm sm:text-base text-zinc-200 font-medium mb-3">{activeProject.subtitle}</p>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{activeProject.description}</p>

            <div className="mb-6 pb-6 border-b border-zinc-800/80">
              <p className="text-xs font-medium text-zinc-400 mb-2">Tecnologías y disciplinas</p>
              <p className="text-sm text-zinc-200">{activeProject.stack.join(' · ')}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                <span>Hitos del proyecto</span>
                <span className="font-mono tabular-nums">
                  {activeProject.milestones.filter((m) => m.done).length} / {activeProject.milestones.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {activeProject.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#0B0C12] border border-zinc-800/60"
                  >
                    {m.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" aria-hidden="true" />
                    )}
                    <span className={`text-sm ${m.done ? 'text-zinc-300' : 'text-zinc-400'}`}>{m.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-400">
                Próximo paso: <span className="text-zinc-200">{activeProject.nextMilestone}</span>
              </p>
              <div className="flex items-center gap-3">
                {activeProject.repoUrl && (
                  <a
                    href={activeProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500 transition-colors"
                  >
                    Repositorio / Portafolio
                  </a>
                )}
                {activeProject.url && (
                  <a
                    href={activeProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors"
                  >
                    Visitar sitio
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
