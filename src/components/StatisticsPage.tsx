import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  Compass,
  Cpu,
  Globe,
  Layers,
  Lock,
  Monitor,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatSpanishDate, SITE_ICON } from '../lib/assets';
import { fetchCompleteAnalytics, type AnalyticsSummary } from '../lib/analytics';

interface StatisticsPageProps {
  publishedPostsCount: number;
  projectsCount: number;
  onGoHome: () => void;
  onOpenAdmin: () => void;
}

export function StatisticsPage({
  publishedPostsCount,
  projectsCount,
  onGoHome,
  onOpenAdmin,
}: StatisticsPageProps) {
  const [adminUser, setAdminUser] = useState<string>(() => sessionStorage.getItem('cebra_admin_user') || '');
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem('cebra_admin_key') || '');
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem('cebra_admin_unlocked') === 'true'
  );
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setLoadingStats(true);
    try {
      const summary = await fetchCompleteAnalytics();
      setStats(summary);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      loadAnalytics();
    }
  }, [unlocked, loadAnalytics]);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const normalizedUser = adminUser.trim();
    const isLocalMatch =
      normalizedUser.toUpperCase() === 'CESARBRAHER' && adminKey === 'Juan14:16';

    let isServerMatch = false;
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: normalizedUser, password: adminKey, key: adminKey }),
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          isServerMatch = Boolean(data?.valid);
        }
      }
    } catch {
      // Fallback to local credential verification on static/hybrid hosting
    }

    if (isLocalMatch || isServerMatch) {
      sessionStorage.setItem('cebra_admin_user', normalizedUser);
      sessionStorage.setItem('cebra_admin_key', adminKey);
      sessionStorage.setItem('cebra_admin_unlocked', 'true');
      setUnlocked(true);
    } else {
      setAuthError('Usuario o contraseña incorrectos.');
    }
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('cebra_admin_unlocked');
    sessionStorage.removeItem('cebra_admin_user');
    sessionStorage.removeItem('cebra_admin_key');
    setAdminUser('');
    setAdminKey('');
    setUnlocked(false);
  };

  if (!unlocked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-[#090A0F]">
        <div className="w-full max-w-md rounded-2xl bg-[#11131C] border border-zinc-800 p-8 shadow-2xl">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-50 mb-2">
            Acceso a Estadísticas del Sitio
          </h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Ingresa tus credenciales de administrador para consultar el panel completo de analítica, tráfico y
            telemetría de <span className="text-zinc-200 font-medium">cebraher.com</span>.
          </p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="stats-user-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Usuario (USER)
              </label>
              <input
                id="stats-user-input"
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="Usuario administrador"
                autoComplete="username"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="stats-key-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Contraseña (PASS)
              </label>
              <input
                id="stats-key-input"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              {authError && <p className="text-xs text-rose-400 mt-1.5">{authError}</p>}
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onGoHome}
                className="px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Volver al sitio
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Ver Estadísticas
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const maxDailyViews = stats
    ? Math.max(...stats.dailySeries.map((d) => d.views), 1)
    : 1;
  const maxHourlyViews = stats
    ? Math.max(...stats.hourlyDistribution.map((h) => h.views), 1)
    : 1;

  return (
    <section className="min-h-[calc(100vh-4rem)] py-10 lg:py-14 bg-[#090A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3.5">
            <img
              src={SITE_ICON}
              alt="Cesar Braher"
              className="w-11 h-11 rounded-xl object-contain bg-[#141414] border border-zinc-800 p-1 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Activity className="w-3.5 h-3.5" />
                  Telemetría Activa
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  USER: {adminUser || 'CESARBRAHER'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-50 mt-1">
                Estadísticas y Analítica de Visitas · CESAR BRAHER
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadAnalytics}
              disabled={loadingStats}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11131C] border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-amber-500/60 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              Actualizar métricas
            </button>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-semibold text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrar Blog
            </button>
            <button
              type="button"
              onClick={handleLockSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11131C] border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al Sitio
            </button>
          </div>
        </div>

        {!stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 rounded-2xl bg-[#11131C] border border-zinc-800/80 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Row 1: 4 Primary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>Visitas Totales (Pageviews)</span>
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                </div>
                <p className="font-mono text-3xl font-bold text-zinc-50 tabular-nums">
                  {stats.totalPageViews.toLocaleString('es-MX')}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/70 pt-2.5">
                  <span>Hoy: <strong className="text-emerald-400 font-mono">+{stats.viewsToday}</strong></span>
                  <span>7d: <strong className="text-zinc-200 font-mono">{stats.viewsLast7Days}</strong></span>
                  <span>30d: <strong className="text-zinc-200 font-mono">{stats.viewsLast30Days}</strong></span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>Visitantes Únicos</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="font-mono text-3xl font-bold text-zinc-50 tabular-nums">
                  {stats.uniqueVisitors.toLocaleString('es-MX')}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/70 pt-2.5">
                  <span>Nuevos: <strong className="text-zinc-200 font-mono">{stats.newVisitors}</strong></span>
                  <span>Recurrentes: <strong className="text-amber-400 font-mono">{stats.returningVisitors}</strong></span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>Tiempo de Sesión &amp; Rebote</span>
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <p className="font-mono text-3xl font-bold text-zinc-50 tabular-nums">
                  {stats.avgSessionMinutes} min
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/70 pt-2.5">
                  <span>Rebote: <strong className="text-emerald-400 font-mono">{stats.bounceRatePercent}%</strong></span>
                  <span>En línea ahora: <strong className="text-amber-400 font-mono">{stats.activeSessionsNow}</strong></span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span>Rendimiento &amp; Contenido</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <p className="font-mono text-3xl font-bold text-zinc-50 tabular-nums">
                  {stats.avgLoadTimeMs} ms
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/70 pt-2.5">
                  <span>Posts Blog: <strong className="text-zinc-200 font-mono">{publishedPostsCount}</strong></span>
                  <span>Proyectos: <strong className="text-zinc-200 font-mono">{projectsCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Row 2: 14-Day Traffic Evolution & 24-Hour Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-lg font-bold text-zinc-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Evolución de Visitas (Últimos 14 días)
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Comparativa diaria de páginas vistas totales y visitantes únicos
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Visitas
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" /> Únicos
                    </span>
                  </div>
                </div>

                <div className="h-52 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-zinc-800">
                  {stats.dailySeries.map((day) => {
                    const hViews = Math.max(12, Math.round((day.views / maxDailyViews) * 100));
                    const hUnique = Math.max(8, Math.round((day.unique / maxDailyViews) * 100));
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-mono text-zinc-400 group-hover:text-amber-400 tabular-nums">
                          {day.views}
                        </span>
                        <div className="w-full flex items-end justify-center gap-0.5 h-36">
                          <div
                            style={{ height: `${hViews}%` }}
                            title={`${day.label}: ${day.views} visitas`}
                            className="w-full max-w-[14px] rounded-t bg-amber-500 group-hover:bg-amber-400 transition-all"
                          />
                          <div
                            style={{ height: `${hUnique}%` }}
                            title={`${day.label}: ${day.unique} visitantes únicos`}
                            className="w-full max-w-[10px] rounded-t bg-emerald-500/70 group-hover:bg-emerald-400 transition-all hidden sm:block"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono truncate max-w-full">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <div className="mb-6">
                  <h2 className="font-display text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    Actividad por Hora del Día (24h)
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Distribución horaria de sesiones en horario local
                  </p>
                </div>

                <div className="h-52 flex items-end justify-between gap-1 pt-6 pb-2 border-b border-zinc-800">
                  {stats.hourlyDistribution.map((slot, idx) => {
                    const barHeight = Math.max(10, Math.round((slot.views / maxHourlyViews) * 100));
                    return (
                      <div key={slot.hour} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div className="w-full flex items-end justify-center h-36">
                          <div
                            style={{ height: `${barHeight}%` }}
                            title={`${slot.hour} hrs: ${slot.views} visitas`}
                            className="w-full rounded-t bg-sky-500/80 group-hover:bg-amber-400 transition-all"
                          />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 mt-1.5">
                          {idx % 3 === 0 ? slot.hour.slice(0, 2) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 3: Interactions Counter Strip */}
            <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
              <div className="flex items-center gap-2 mb-4">
                <MousePointerClick className="w-4 h-4 text-amber-400" />
                <h2 className="font-display text-lg font-bold text-zinc-100">
                  Interacciones y Conversiones en el Sitio
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-[#090A0F] border border-zinc-800/80">
                  <p className="text-xs text-zinc-400">Lecturas de Blog (Blogger)</p>
                  <p className="font-mono text-2xl font-bold text-zinc-50 mt-1 tabular-nums">
                    {stats.interactions.blogReads.toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#090A0F] border border-zinc-800/80">
                  <p className="text-xs text-zinc-400">Clics en Proyectos</p>
                  <p className="font-mono text-2xl font-bold text-zinc-50 mt-1 tabular-nums">
                    {stats.interactions.projectClicks.toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#090A0F] border border-zinc-800/80">
                  <p className="text-xs text-zinc-400">Clics Botón Donaciones PayPal</p>
                  <p className="font-mono text-2xl font-bold text-amber-400 mt-1 tabular-nums">
                    {stats.interactions.paypalDonateClicks.toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#090A0F] border border-zinc-800/80">
                  <p className="text-xs text-zinc-400">Clics WhatsApp Directo</p>
                  <p className="font-mono text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
                    {stats.interactions.whatsappClicks.toLocaleString('es-MX')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#090A0F] border border-zinc-800/80">
                  <p className="text-xs text-zinc-400">Formularios de Contacto</p>
                  <p className="font-mono text-2xl font-bold text-sky-400 mt-1 tabular-nums">
                    {stats.interactions.contactSubmissions.toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 4: Top Pages & Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Secciones y Subpáginas Más Visitadas
                </h2>
                <div className="space-y-3">
                  {stats.topPages.map((page) => (
                    <div key={page.path} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200 truncate">
                          {page.label}{' '}
                          <span className="text-zinc-500 font-mono">({page.path})</span>
                        </span>
                        <span className="font-mono text-zinc-300 tabular-nums shrink-0 ml-2">
                          {page.views.toLocaleString('es-MX')} ({page.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#090A0F] overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, page.percent)}%` }}
                          className="h-full rounded-full bg-amber-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Fuentes de Tráfico y Canales de Adquisición
                </h2>
                <div className="space-y-3.5">
                  {stats.trafficSources.map((src) => (
                    <div key={src.source} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-200">{src.source}</span>
                        <span className="font-mono text-zinc-300 tabular-nums">
                          {src.count.toLocaleString('es-MX')} ({src.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#090A0F] overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, src.percent)}%` }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 5: Devices, Browsers, Operating Systems */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Dispositivos
                </h2>
                <div className="space-y-3">
                  {stats.devices.map((dev) => (
                    <div key={dev.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-200 font-medium">{dev.name}</span>
                        <span className="font-mono text-zinc-400">{dev.percent}% ({dev.count})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#090A0F] overflow-hidden">
                        <div style={{ width: `${dev.percent}%` }} className="h-full bg-amber-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Navegadores
                </h2>
                <div className="space-y-3">
                  {stats.browsers.map((br) => (
                    <div key={br.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-200 font-medium">{br.name}</span>
                        <span className="font-mono text-zinc-400">{br.percent}% ({br.count})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#090A0F] overflow-hidden">
                        <div style={{ width: `${br.percent}%` }} className="h-full bg-sky-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  Sistemas Operativos
                </h2>
                <div className="space-y-3">
                  {stats.operatingSystems.map((os) => (
                    <div key={os.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-200 font-medium">{os.name}</span>
                        <span className="font-mono text-zinc-400">{os.percent}% ({os.count})</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#090A0F] overflow-hidden">
                        <div style={{ width: `${os.percent}%` }} className="h-full bg-purple-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 6: Timezones / Regions, Languages & Screen Resolutions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-base font-bold text-zinc-100 mb-4">
                  Regiones y Zonas Horarias
                </h2>
                <div className="space-y-2.5">
                  {stats.timezones.map((tz) => (
                    <div key={tz.tz} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0">
                      <span className="font-mono text-zinc-200 truncate">{tz.tz}</span>
                      <span className="font-mono text-amber-400 shrink-0 ml-2">{tz.percent}% ({tz.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-base font-bold text-zinc-100 mb-4">
                  Idioma del Navegador
                </h2>
                <div className="space-y-2.5">
                  {stats.languages.map((l) => (
                    <div key={l.lang} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0">
                      <span className="font-mono text-zinc-200">{l.lang}</span>
                      <span className="font-mono text-emerald-400">{l.percent}% ({l.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
                <h2 className="font-display text-base font-bold text-zinc-100 mb-4">
                  Resoluciones de Pantalla
                </h2>
                <div className="space-y-2.5">
                  {stats.screens.map((sc) => (
                    <div key={sc.resolution} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0">
                      <span className="font-mono text-zinc-200">{sc.resolution} px</span>
                      <span className="font-mono text-sky-400">{sc.percent}% ({sc.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 7: Real-Time Recent Visits Log */}
            <div className="p-6 rounded-2xl bg-[#11131C] border border-zinc-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-zinc-100">
                    Bitácora de Visitas Recientes en Tiempo Real
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Registro detallado de las últimas sesiones detectadas en el sitio
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Mostrando últimas {stats.recentVisits.length} visitas
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-2.5 pr-4 font-medium">Fecha / Hora</th>
                      <th className="py-2.5 px-3 font-medium">Página / Sección</th>
                      <th className="py-2.5 px-3 font-medium">Canal / Origen</th>
                      <th className="py-2.5 px-3 font-medium">Dispositivo</th>
                      <th className="py-2.5 px-3 font-medium">Navegador / SO</th>
                      <th className="py-2.5 px-3 font-medium">Pantalla</th>
                      <th className="py-2.5 pl-3 font-medium text-right">Carga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {stats.recentVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-zinc-900/50">
                        <td className="py-2.5 pr-4 font-mono text-zinc-400 whitespace-nowrap">
                          {formatSpanishDate(v.timestamp)}{' '}
                          <span className="text-zinc-500">
                            {new Date(v.timestamp).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-zinc-100">
                          {v.pageTitle}{' '}
                          <span className="font-mono text-zinc-500">({v.path})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                            {v.sourceChannel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{v.deviceType}</td>
                        <td className="py-2.5 px-3 text-zinc-400">
                          {v.browser} · {v.os}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-400">{v.screen}</td>
                        <td className="py-2.5 pl-3 font-mono text-emerald-400 text-right whitespace-nowrap">
                          {v.loadTimeMs} ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
