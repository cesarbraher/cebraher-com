import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Search, SlidersHorizontal } from 'lucide-react';
import type { Project, ProjectStatus } from '../lib/types';

interface TrackingPanelProps {
  projects: Project[];
  onManageInAdmin: () => void;
}

const STATUS_FILTERS: ('Todos' | ProjectStatus)[] = ['Todos', 'En Progreso', 'Completado', 'Planificado'];

export function TrackingPanel({ projects, onManageInAdmin }: TrackingPanelProps) {
  const [statusFilter, setStatusFilter] = useState<'Todos' | ProjectStatus>('Todos');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(projects[0]?.id ?? null);

  const metrics = useMemo(() => {
    const total = projects.length;
    const avgProgress = total
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / total)
      : 0;
    const allMilestones = projects.flatMap((p) => p.milestones);
    const doneMilestones = allMilestones.filter((m) => m.done).length;
    const inProgressCount = projects.filter((p) => p.status === 'En Progreso').length;
    return {
      total,
      avgProgress,
      doneMilestones,
      totalMilestones: allMilestones.length,
      inProgressCount,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.nextMilestone.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, search]);

  const getStatusLabelStyle = (status: ProjectStatus) => {
    if (status === 'Completado') return 'text-emerald-400';
    if (status === 'En Progreso') return 'text-amber-400';
    return 'text-zinc-400';
  };

  return (
    <section id="seguimiento" className="py-16 lg:py-24 border-b border-zinc-800/80 bg-[#090A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-amber-400 tracking-wide mb-2">
              02. Panel de Seguimiento Intuitivo
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-3">
              Avance operativo de iniciativas y entregables
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Control transparente de progreso, hitos cumplidos y próximos objetivos de cada plataforma y producción
              en curso.
            </p>
          </div>

          <button
            type="button"
            onClick={onManageInAdmin}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-200 hover:border-amber-500 hover:text-amber-400 transition-colors self-start lg:self-auto whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            Actualizar hitos en Admin
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-[#11131C] border border-zinc-800/80">
            <p className="text-xs text-zinc-400 mb-1">Iniciativas monitoreadas</p>
            <p className="font-mono text-2xl font-semibold text-zinc-50 tabular-nums">{metrics.total}</p>
          </div>
          <div className="p-5 rounded-xl bg-[#11131C] border border-zinc-800/80">
            <p className="text-xs text-zinc-400 mb-1">Avance global promedio</p>
            <p className="font-mono text-2xl font-semibold text-amber-400 tabular-nums">{metrics.avgProgress}%</p>
          </div>
          <div className="p-5 rounded-xl bg-[#11131C] border border-zinc-800/80">
            <p className="text-xs text-zinc-400 mb-1">Hitos completados</p>
            <p className="font-mono text-2xl font-semibold text-zinc-50 tabular-nums">
              {metrics.doneMilestones} / {metrics.totalMilestones}
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#11131C] border border-zinc-800/80">
            <p className="text-xs text-zinc-400 mb-1">Frentes en ejecución</p>
            <p className="font-mono text-2xl font-semibold text-emerald-400 tabular-nums">
              {metrics.inProgressCount} activos
            </p>
          </div>
        </div>

        {/* Toolbar: Status Filters & Live Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#11131C] border border-zinc-800 rounded-xl self-start">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === status
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar proyecto o hito..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#11131C] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Interactive Tracking List */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#11131C] divide-y divide-zinc-800/70 overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-400 mb-3">
                No hay iniciativas que coincidan con los filtros actuales.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Todos');
                  setSearch('');
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-200 hover:border-zinc-500 cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isExpanded = expandedId === project.id;
              const doneCount = project.milestones.filter((m) => m.done).length;
              return (
                <div key={project.id} className="transition-colors hover:bg-[#141724]/60">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-1">
                        <span className={`font-semibold ${getStatusLabelStyle(project.status)}`}>
                          {project.status}
                        </span>
                        <span className="text-zinc-600" aria-hidden="true">
                          /
                        </span>
                        <span className="text-zinc-400">{project.category}</span>
                        <span className="text-zinc-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono text-zinc-400 tabular-nums">
                          {doneCount}/{project.milestones.length} hitos
                        </span>
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-semibold text-zinc-100 truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 truncate mt-0.5">
                        Próximo hito: {project.nextMilestone}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 lg:w-72 shrink-0">
                      <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              project.status === 'Completado' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-mono text-sm font-semibold text-zinc-100 tabular-nums w-11 text-right">
                        {project.progress}%
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-zinc-800/50 bg-[#0D0F17]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3">
                        {project.milestones.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2.5 text-sm py-2 px-3 rounded-lg bg-[#11131C] border border-zinc-800/60"
                          >
                            {m.done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                            ) : (
                              <Circle className="w-4 h-4 text-zinc-600 shrink-0" aria-hidden="true" />
                            )}
                            <span className={m.done ? 'text-zinc-300 line-through decoration-zinc-600' : 'text-zinc-200'}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
