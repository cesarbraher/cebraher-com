import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  Database,
  Edit3,
  ExternalLink,
  Eye,
  FolderPlus,
  Github,
  Inbox,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Rss,
  Save,
  Star,
  Trash2,
} from 'lucide-react';
import { COVER_PRESETS, formatSpanishDate, resolveCoverImage } from '../lib/assets';
import type {
  BlogPost,
  BloggerConfig,
  Category,
  ContactMessage,
  Project,
  ProjectStatus,
  SystemStatus,
} from '../lib/types';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  posts: BlogPost[];
  categories: Category[];
  projects: Project[];
  status: SystemStatus | null;
  bloggerConfig: BloggerConfig;
  bloggerSynced: boolean;
  syncingBlogger: boolean;
  onUpdateBloggerConfig: (next: Partial<BloggerConfig>) => Promise<void>;
  onSyncBlogger: () => Promise<void>;
  onRefreshAll: () => Promise<void>;
  onBackToSite: () => void;
}

type AdminTab = 'posts' | 'categories' | 'projects' | 'messages' | 'mongodb';

export function AdminDashboard({
  posts,
  categories,
  projects,
  status,
  bloggerConfig,
  bloggerSynced,
  syncingBlogger,
  onUpdateBloggerConfig,
  onSyncBlogger,
  onRefreshAll,
  onBackToSite,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('posts');
  const [adminUser, setAdminUser] = useState<string>(() => sessionStorage.getItem('cebra_admin_user') || '');
  const [adminKey, setAdminKey] = useState<string>(() => sessionStorage.getItem('cebra_admin_key') || '');
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem('cebra_admin_unlocked') === 'true'
  );
  const [authError, setAuthError] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Blogger Config Form State
  const [blogNameInput, setBlogNameInput] = useState(bloggerConfig.blogName || 'CESARBRAHER');
  const [accountEmailInput, setAccountEmailInput] = useState(bloggerConfig.accountEmail || 'cesarbraher@gmail.com');
  const [blogUrlInput, setBlogUrlInput] = useState(bloggerConfig.blogUrl || 'https://cesarbraher.blogspot.com');
  const [blogIdInput, setBlogIdInput] = useState(bloggerConfig.blogId || '');
  const [apiKeyInput, setApiKeyInput] = useState(bloggerConfig.apiKey || '');
  const [bloggerEnabledInput, setBloggerEnabledInput] = useState(bloggerConfig.enabled);
  const [includeFallbackInput, setIncludeFallbackInput] = useState(bloggerConfig.includeLocalFallback);
  const [savingBlogger, setSavingBlogger] = useState(false);

  // Post Editor State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCategorySlug, setPostCategorySlug] = useState(categories[0]?.slug || 'tecnologia-ia');
  const [postCoverImage, setPostCoverImage] = useState('ai-architecture');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPublished, setPostPublished] = useState(true);
  const [postFeatured, setPostFeatured] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Project Form State
  const [showNewProject, setShowNewProject] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projSubtitle, setProjSubtitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('Ingeniería & IA');
  const [projNextMilestone, setProjNextMilestone] = useState('');
  const [newMilestoneText, setNewMilestoneText] = useState<Record<string, string>>({});

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const authHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminUser) h['x-admin-user'] = adminUser.trim();
    if (adminKey) h['x-admin-key'] = adminKey;
    return h;
  };

  const showToast = (msg: string) => {
    setFeedback(msg);
    setErrorMsg(null);
    setTimeout(() => setFeedback(null), 3500);
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/messages', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (unlocked && activeTab === 'messages') {
      loadMessages();
    }
  }, [unlocked, activeTab]);

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
    onBackToSite();
  };

  const resetPostForm = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostCategorySlug(categories[0]?.slug || 'tecnologia-ia');
    setPostCoverImage('ai-architecture');
    setPostExcerpt('');
    setPostContent('');
    setPostPublished(true);
    setPostFeatured(false);
    setShowPostForm(false);
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostCategorySlug(post.categorySlug);
    setPostCoverImage(post.coverImage);
    setPostExcerpt(post.excerpt);
    setPostContent(post.content);
    setPostPublished(post.published);
    setPostFeatured(post.featured);
    setShowPostForm(true);
  };

  const handleSavePost = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cat = categories.find((c) => c.slug === postCategorySlug);
    setSavingPost(true);
    try {
      const payload = {
        title: postTitle,
        excerpt: postExcerpt,
        content: postContent,
        categorySlug: postCategorySlug,
        categoryName: cat?.name || postCategorySlug,
        coverImage: postCoverImage,
        published: postPublished,
        featured: postFeatured,
      };
      const res = await fetch(editingPostId ? `/api/posts/${editingPostId}` : '/api/posts', {
        method: editingPostId ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'No se pudo guardar la entrada.');
      }
      await onRefreshAll();
      resetPostForm();
      showToast(editingPostId ? 'Entrada actualizada en la base de datos.' : 'Nueva entrada publicada.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSavingPost(false);
    }
  };

  const handleTogglePostField = async (post: BlogPost, field: 'published' | 'featured') => {
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ [field]: !post[field] }),
    });
    if (res.ok) {
      await onRefreshAll();
      showToast('Estado de la entrada actualizado.');
    }
  };

  const handleDeletePost = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await onRefreshAll();
      showToast('Entrada eliminada.');
    }
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name: catName, description: catDesc }),
    });
    if (res.ok) {
      setCatName('');
      setCatDesc('');
      await onRefreshAll();
      showToast('Categoría creada.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await onRefreshAll();
      showToast('Categoría eliminada.');
    }
  };

  const handleUpdateProject = async (id: string, patch: Partial<Project>) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      await onRefreshAll();
      showToast('Seguimiento actualizado.');
    }
  };

  const handleToggleMilestone = async (project: Project, milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    );
    const doneCount = updatedMilestones.filter((m) => m.done).length;
    const autoProgress = updatedMilestones.length
      ? Math.round((doneCount / updatedMilestones.length) * 100)
      : project.progress;
    const autoStatus: ProjectStatus =
      autoProgress === 100 ? 'Completado' : autoProgress > 0 ? 'En Progreso' : 'Planificado';
    await handleUpdateProject(project.id, {
      milestones: updatedMilestones,
      progress: autoProgress,
      status: autoStatus,
    });
  };

  const handleAddMilestone = async (project: Project) => {
    const text = (newMilestoneText[project.id] || '').trim();
    if (!text) return;
    const updatedMilestones = [
      ...project.milestones,
      { id: `m-${Date.now()}`, title: text, done: false },
    ];
    const doneCount = updatedMilestones.filter((m) => m.done).length;
    const autoProgress = Math.round((doneCount / updatedMilestones.length) * 100);
    setNewMilestoneText((prev) => ({ ...prev, [project.id]: '' }));
    await handleUpdateProject(project.id, {
      milestones: updatedMilestones,
      progress: autoProgress,
    });
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projSubtitle.trim() || !projDesc.trim()) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        title: projTitle,
        subtitle: projSubtitle,
        description: projDesc,
        category: projCategory,
        status: 'En Progreso',
        progress: 15,
        stack: ['Node.js', 'MongoDB', 'React'],
        impactMetric: 'Iniciativa en fase de lanzamiento',
        nextMilestone: projNextMilestone || 'Definir arquitectura inicial',
        milestones: [
          { id: `m-${Date.now()}`, title: projNextMilestone || 'Definir arquitectura inicial', done: false },
        ],
      }),
    });
    if (res.ok) {
      setProjTitle('');
      setProjSubtitle('');
      setProjDesc('');
      setProjNextMilestone('');
      setShowNewProject(false);
      await onRefreshAll();
      showToast('Proyecto agregado al panel de seguimiento.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await onRefreshAll();
      showToast('Proyecto eliminado.');
    }
  };

  const handleToggleMessageRead = async (msg: ContactMessage) => {
    const res = await fetch(`/api/messages/${msg.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ read: !msg.read }),
    });
    if (res.ok) {
      await loadMessages();
      await onRefreshAll();
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const res = await fetch(`/api/messages/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await loadMessages();
      await onRefreshAll();
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#090A0F] p-4">
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-md rounded-2xl bg-[#11131C] border border-zinc-800 p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold text-zinc-50">Acceso Administrar Blog</h1>
          </div>
          <p className="text-sm text-zinc-400">
            Ingresa tu usuario y contraseña de administrador para gestionar el blog, proyectos y configuración de Blogger.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Usuario</label>
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="Usuario"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Contraseña de acceso"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {authError && <p className="text-xs text-rose-400">{authError}</p>}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={onBackToSite}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:text-zinc-100 cursor-pointer"
            >
              Volver al sitio
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer"
            >
              Ingresar al panel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#090A0F] text-zinc-100 flex flex-col lg:flex-row">
      {/* Left Sidebar (250px on desktop) */}
      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-[#0D0E15] p-4 sm:p-6 flex flex-col justify-between gap-6">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium text-amber-400 mb-1">Consola Editorial</p>
            <h1 className="font-display text-lg font-bold text-zinc-50">Administrador CMS</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Motor activo:{' '}
              <span className="text-zinc-200 font-medium">
                {status?.db.engine === 'hostinger-mysql'
                  ? 'MySQL Hostinger'
                  : status?.db.engine === 'mongodb'
                    ? 'MongoDB'
                    : 'JSON Local (Fallback)'}
              </span>
            </p>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'posts'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Edit3 className="w-4 h-4 shrink-0" aria-hidden="true" />
              Entradas ({posts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <FolderPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
              Categorías ({categories.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
              Proyectos &amp; Hitos ({projects.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Inbox className="w-4 h-4 shrink-0" aria-hidden="true" />
              Mensajes ({status?.counts.unreadMessages ?? 0} sin leer)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mongodb')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'mongodb'
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" aria-hidden="true" />
              Hostinger DB &amp; GitHub
            </button>
          </nav>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onBackToSite}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            Ver Landing Pública
          </button>
          <button
            type="button"
            onClick={handleLockSession}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl">
        {/* Top Feedback Banner */}
        {feedback && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 flex items-center justify-between">
            <span>{feedback}</span>
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: BLOG POSTS & BLOGGER INTEGRATION */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Blogger Integration Card */}
            <div className="rounded-2xl bg-[#11131C] border border-amber-500/35 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Rss className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Conexión Blogger Activa
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        bloggerSynced
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {bloggerSynced ? 'Feed sincronizado en vivo' : 'Listo para recibir entradas'}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-zinc-50">
                    Blog: {bloggerConfig.blogName} ({bloggerConfig.accountEmail})
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                    Lo que subas a Blogger en tu cuenta <strong className="text-zinc-200">{bloggerConfig.accountEmail}</strong> del blog{' '}
                    <strong className="text-zinc-200">{bloggerConfig.blogName}</strong> aparece automáticamente en las últimas entradas de la Landing Page y en la sección del Blog.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      await onSyncBlogger();
                      showToast('Sincronización con Blogger ejecutada.');
                    }}
                    disabled={syncingBlogger}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-700 text-xs font-semibold text-zinc-200 hover:border-amber-500 hover:text-amber-400 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingBlogger ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {syncingBlogger ? 'Sincronizando...' : 'Sincronizar ahora'}
                  </button>
                  <a
                    href="https://www.blogger.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    Abrir Blogger
                  </a>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSavingBlogger(true);
                  setErrorMsg(null);
                  try {
                    const nextCfg: Partial<BloggerConfig> = {
                      blogName: blogNameInput.trim() || 'CESARBRAHER',
                      accountEmail: accountEmailInput.trim() || 'cesarbraher@gmail.com',
                      blogUrl: blogUrlInput.trim() || 'https://cesarbraher.blogspot.com',
                      blogId: blogIdInput.trim(),
                      apiKey: apiKeyInput.trim(),
                      enabled: bloggerEnabledInput,
                      includeLocalFallback: includeFallbackInput,
                    };
                    await fetch('/api/blogger/config', {
                      method: 'PUT',
                      headers: authHeaders(),
                      body: JSON.stringify(nextCfg),
                    }).catch(() => null);
                    await onUpdateBloggerConfig(nextCfg);
                    showToast('Configuración de Blogger guardada y sincronizada.');
                  } catch (err: any) {
                    setErrorMsg(err?.message || 'Error al guardar configuración de Blogger.');
                  } finally {
                    setSavingBlogger(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Nombre del Blog</label>
                    <input
                      type="text"
                      value={blogNameInput}
                      onChange={(e) => setBlogNameInput(e.target.value)}
                      placeholder="CESARBRAHER"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Cuenta de Blogger</label>
                    <input
                      type="email"
                      value={accountEmailInput}
                      onChange={(e) => setAccountEmailInput(e.target.value)}
                      placeholder="cesarbraher@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      URL pública del Blog en Blogger
                    </label>
                    <input
                      type="text"
                      value={blogUrlInput}
                      onChange={(e) => setBlogUrlInput(e.target.value)}
                      placeholder="https://cesarbraher.blogspot.com"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Blogger Blog ID (Opcional)
                    </label>
                    <input
                      type="text"
                      value={blogIdInput}
                      onChange={(e) => setBlogIdInput(e.target.value)}
                      placeholder="Ej. 1234567890123456789"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-5">
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bloggerEnabledInput}
                        onChange={(e) => setBloggerEnabledInput(e.target.checked)}
                        className="accent-amber-500 w-4 h-4"
                      />
                      Sincronización automática con Blogger activa
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeFallbackInput}
                        onChange={(e) => setIncludeFallbackInput(e.target.checked)}
                        className="accent-amber-500 w-4 h-4"
                      />
                      Incluir entradas del estudio como complemento
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingBlogger}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    {savingBlogger ? 'Guardando...' : 'Guardar conexión Blogger'}
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-50">Entradas Sincronizadas y Locales</h2>
                <p className="text-sm text-zinc-400">
                  Las entradas de Blogger ({bloggerConfig.blogName}) tienen prioridad automática en la Landing Page y en la sección del Blog.
                </p>
              </div>
              {!showPostForm && (
                <button
                  type="button"
                  onClick={() => {
                    resetPostForm();
                    setShowPostForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-200 text-xs font-semibold hover:border-amber-500 hover:text-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Nueva entrada local
                </button>
              )}
            </div>

            {showPostForm ? (
              <form
                onSubmit={handleSavePost}
                className="rounded-2xl bg-[#11131C] border border-zinc-800 p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="font-display text-lg font-bold text-zinc-50">
                    {editingPostId ? 'Editar entrada del blog' : 'Redactar nueva entrada'}
                  </h3>
                  <button
                    type="button"
                    onClick={resetPostForm}
                    className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Título del artículo</label>
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Ej. Arquitectura limpia con Node.js y MongoDB"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Categoría</label>
                    <select
                      value={postCategorySlug}
                      onChange={(e) => setPostCategorySlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <label className="block text-xs font-medium text-zinc-300">
                      Fotografía de portada (elige una galería o ingresa URL)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COVER_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setPostCoverImage(preset.key)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                            postCoverImage === preset.key
                              ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-medium'
                              : 'border-zinc-800 bg-[#090A0F] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={postCoverImage}
                      onChange={(e) => setPostCoverImage(e.target.value)}
                      placeholder="Clave predefinida o URL https://..."
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="lg:col-span-5">
                    <p className="text-xs font-medium text-zinc-400 mb-1.5">Vista previa de portada</p>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-[#090A0F]">
                      <ResilientImage
                        src={resolveCoverImage(postCoverImage)}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        fallbackTitle="Portada personalizada"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Resumen breve (Extracto)</label>
                  <textarea
                    rows={2}
                    value={postExcerpt}
                    onChange={(e) => setPostExcerpt(e.target.value)}
                    placeholder="Síntesis de 1-2 líneas que aparecerá en las tarjetas de últimas entradas..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Contenido completo (separa párrafos con doble salto de línea)
                  </label>
                  <textarea
                    rows={8}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Escribe el artículo completo aquí..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 leading-relaxed focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-800">
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postPublished}
                        onChange={(e) => setPostPublished(e.target.checked)}
                        className="accent-amber-500 w-4 h-4"
                      />
                      Publicar inmediatamente
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postFeatured}
                        onChange={(e) => setPostFeatured(e.target.checked)}
                        className="accent-amber-500 w-4 h-4"
                      />
                      Destacar en portada del blog
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPost}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    {savingPost ? 'Guardando...' : editingPostId ? 'Guardar cambios' : 'Publicar entrada'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-[#11131C] divide-y divide-zinc-800/70 overflow-hidden">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#141724]/60"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-zinc-800 shrink-0 bg-[#090A0F]">
                        <ResilientImage
                          src={resolveCoverImage(post.coverImage)}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-1">
                          {post.source === 'blogger' && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
                              Blogger · {bloggerConfig.blogName}
                            </span>
                          )}
                          <span className="text-amber-400 font-medium">{post.categoryName}</span>
                          <span aria-hidden="true">·</span>
                          <span className={post.published ? 'text-emerald-400' : 'text-zinc-500'}>
                            {post.published ? 'Publicado' : 'Borrador'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{formatSpanishDate(post.createdAt)}</span>
                        </div>
                        <h3 className="font-display text-sm sm:text-base font-semibold text-zinc-100 truncate">
                          {post.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {post.source === 'blogger' ? (
                        post.externalUrl && (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-amber-400 hover:border-amber-500"
                          >
                            Ver en Blogger
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTogglePostField(post, 'featured')}
                            title="Destacar en portada"
                            className={`p-2 rounded-lg border text-xs cursor-pointer ${
                              post.featured
                                ? 'border-amber-500/60 text-amber-400 bg-amber-500/10'
                                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePostField(post, 'published')}
                            className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-600 cursor-pointer"
                          >
                            {post.published ? 'Pasar a borrador' : 'Publicar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditPost(post)}
                            className="p-2 rounded-lg border border-zinc-800 text-zinc-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
                            aria-label={`Editar ${post.title}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:border-rose-500/60 hover:text-rose-400 cursor-pointer"
                            aria-label={`Eliminar ${post.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-zinc-50">Categorías del Blog</h2>
              <p className="text-sm text-zinc-400">
                Organiza las temáticas editoriales visibles en los filtros de la landing page.
              </p>
            </div>

            <form
              onSubmit={handleCreateCategory}
              className="rounded-2xl bg-[#11131C] border border-zinc-800 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
            >
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Nombre de categoría</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ej. Inteligencia Artificial"
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Descripción breve</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Temas cubiertos en esta sección..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-zinc-800 bg-[#11131C] divide-y divide-zinc-800/70">
              {categories.map((cat) => {
                const count = posts.filter((p) => p.categorySlug === cat.slug).length;
                return (
                  <div key={cat.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-semibold text-zinc-100">{cat.name}</h3>
                        <span className="font-mono text-xs text-zinc-500">/{cat.slug}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{cat.description || 'Sin descripción'}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-xs text-zinc-400 tabular-nums">{count} entradas</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:border-rose-500/60 hover:text-rose-400 cursor-pointer"
                        aria-label={`Eliminar categoría ${cat.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS & TRACKING MILESTONES */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-50">Proyectos y Seguimiento Operativo</h2>
                <p className="text-sm text-zinc-400">
                  Marca hitos cumplidos o ajusta el porcentaje de avance; el panel público se actualiza automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProject((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 whitespace-nowrap shrink-0 cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                {showNewProject ? 'Cerrar formulario' : 'Nuevo proyecto'}
              </button>
            </div>

            {showNewProject && (
              <form
                onSubmit={handleCreateProject}
                className="rounded-2xl bg-[#11131C] border border-zinc-800 p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="Nombre del proyecto"
                    className="px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    placeholder="Categoría (ej. Ingeniería & IA)"
                    className="px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <input
                  type="text"
                  value={projSubtitle}
                  onChange={(e) => setProjSubtitle(e.target.value)}
                  placeholder="Subtítulo corto"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Descripción del proyecto..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={projNextMilestone}
                    onChange={(e) => setProjNextMilestone(e.target.value)}
                    placeholder="Primer hito a completar"
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 cursor-pointer"
                  >
                    Crear iniciativa
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-2xl bg-[#11131C] border border-zinc-800 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                        <span className="text-amber-400 font-medium">{proj.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{proj.progress}% avance</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-zinc-50">{proj.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={proj.status}
                        onChange={(e) =>
                          handleUpdateProject(proj.id, { status: e.target.value as ProjectStatus })
                        }
                        className="px-3 py-1.5 text-xs rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="En Progreso">En Progreso</option>
                        <option value="Completado">Completado</option>
                        <option value="Planificado">Planificado</option>
                      </select>

                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={proj.progress}
                        onChange={(e) => handleUpdateProject(proj.id, { progress: Number(e.target.value) })}
                        className="w-28 accent-amber-500 cursor-pointer"
                        aria-label={`Avance de ${proj.title}`}
                      />

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:border-rose-500/60 hover:text-rose-400 cursor-pointer"
                        aria-label={`Eliminar proyecto ${proj.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Milestones interactive checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {proj.milestones.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#090A0F] border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 cursor-pointer hover:border-zinc-700"
                      >
                        <input
                          type="checkbox"
                          checked={m.done}
                          onChange={() => handleToggleMilestone(proj, m.id)}
                          className="accent-amber-500 w-4 h-4 shrink-0"
                        />
                        <span className={m.done ? 'line-through text-zinc-500' : 'text-zinc-200'}>{m.title}</span>
                      </label>
                    ))}
                  </div>

                  {/* Add milestone inline */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newMilestoneText[proj.id] || ''}
                      onChange={(e) =>
                        setNewMilestoneText((prev) => ({ ...prev, [proj.id]: e.target.value }))
                      }
                      placeholder="Añadir nuevo hito..."
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddMilestone(proj)}
                      className="px-3.5 py-2 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-200 hover:border-amber-500 hover:text-amber-400 cursor-pointer whitespace-nowrap"
                    >
                      + Hito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-zinc-50">Bandeja de Mensajes</h2>
                <p className="text-sm text-zinc-400">
                  Consultas recibidas desde el formulario de contacto de la landing page.
                </p>
              </div>
              <button
                type="button"
                onClick={loadMessages}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-600 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} aria-hidden="true" />
                Actualizar
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-[#11131C] p-10 text-center text-sm text-zinc-400">
                No hay mensajes en la bandeja todavía.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-2xl border p-5 space-y-2 ${
                      msg.read
                        ? 'bg-[#0D0E15] border-zinc-800/70'
                        : 'bg-[#11131C] border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-zinc-400">
                        <span className="text-zinc-100 font-semibold text-sm mr-2">{msg.name}</span>
                        <span>({msg.email})</span>
                        <span className="mx-2" aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{formatSpanishDate(msg.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleMessageRead(msg)}
                          className="px-3 py-1 rounded-lg border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-600 cursor-pointer"
                        >
                          {msg.read ? 'Marcar no leído' : 'Marcar leído'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer"
                          aria-label="Eliminar mensaje"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-amber-400">{msg.subject}</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: HOSTINGER DB & GITHUB DEPLOYMENT */}
        {activeTab === 'mongodb' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-zinc-50">
                Base de Datos de Hostinger &amp; Publicación en GitHub
              </h2>
              <p className="text-sm text-zinc-400">
                Estado real de tu base de datos y guía para conectar MySQL / MariaDB de Hostinger hPanel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-[#11131C] border border-zinc-800 p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <Database className="w-5 h-5" aria-hidden="true" />
                  <h3 className="font-display text-lg font-bold text-zinc-50">Estado del Motor de Datos</h3>
                </div>
                <p className="text-sm text-zinc-300">
                  Motor actual:{' '}
                  <strong className="text-zinc-50">
                    {status?.db.engine === 'hostinger-mysql'
                      ? `MySQL Hostinger (${status.db.database})`
                      : status?.db.engine === 'mongodb'
                        ? `MongoDB (${status.db.database})`
                        : 'Almacenamiento Local JSON (data/db.json)'}
                  </strong>
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Al configurar las credenciales MySQL de tu cuenta Hostinger, el servidor crea automáticamente las
                  tablas <code className="text-zinc-200">categories</code>,{' '}
                  <code className="text-zinc-200">blog_posts</code>, <code className="text-zinc-200">projects</code> y{' '}
                  <code className="text-zinc-200">contact_messages</code> (también disponibles en{' '}
                  <code className="text-zinc-200">database/hostinger_schema.sql</code> para phpMyAdmin).
                </p>
              </div>

              <div className="rounded-2xl bg-[#11131C] border border-zinc-800 p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <Github className="w-5 h-5" aria-hidden="true" />
                  <h3 className="font-display text-lg font-bold text-zinc-50">Variables de Hostinger en .env</h3>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#090A0F] border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
{`DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="u123456789_cebraher"
DB_USER="u123456789_admin"
DB_PASSWORD="tu_password_hostinger"
REQUIRE_ADMIN_AUTH="true"
ADMIN_ACCESS_KEY="tu_clave_secreta"`}
                </pre>
                <p className="text-xs text-zinc-400">
                  Comandos para desplegar desde GitHub: <code className="text-zinc-200">npm run build</code> y{' '}
                  <code className="text-zinc-200">npm start</code>.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
