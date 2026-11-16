import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { BlogSection } from './components/BlogSection';
import { HeroSection } from './components/HeroSection';
import { ManifestoContactSection } from './components/ManifestoContactSection';
import { Navbar } from './components/Navbar';
import { ProjectsSection } from './components/ProjectsSection';
import { TrackingPanel } from './components/TrackingPanel';
import {
  DEFAULT_BLOGGER_CONFIG,
  fetchLiveBloggerPostsBrowser,
  loadStoredBloggerConfig,
  mergeBloggerCategories,
  saveStoredBloggerConfig,
} from './lib/blogger';
import type { BlogPost, BloggerConfig, Category, Project, SystemStatus } from './lib/types';

export default function App() {
  const [mode, setMode] = useState<'landing' | 'admin'>('landing');
  const [serverPosts, setServerPosts] = useState<BlogPost[]>([]);
  const [liveBloggerPosts, setLiveBloggerPosts] = useState<BlogPost[]>([]);
  const [baseCategories, setBaseCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [bloggerConfig, setBloggerConfig] = useState<BloggerConfig>(() => loadStoredBloggerConfig());
  const [bloggerSynced, setBloggerSynced] = useState(false);
  const [syncingBlogger, setSyncingBlogger] = useState(false);
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const syncWithBloggerClient = useCallback(async (cfg: BloggerConfig) => {
    setSyncingBlogger(true);
    try {
      const live = await fetchLiveBloggerPostsBrowser(cfg);
      if (live.synced && live.posts.length > 0) {
        setLiveBloggerPosts(live.posts);
        setBloggerSynced(true);
      }
      return live;
    } finally {
      setSyncingBlogger(false);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [postsRes, catsRes, projRes, statusRes, bloggerCfgRes] = await Promise.all([
        fetch('/api/posts?all=true'),
        fetch('/api/categories'),
        fetch('/api/projects'),
        fetch('/api/status'),
        fetch('/api/blogger/config').catch(() => null),
      ]);

      let activeCfg = loadStoredBloggerConfig();
      if (bloggerCfgRes?.ok) {
        try {
          const remoteCfg = await bloggerCfgRes.json();
          activeCfg = saveStoredBloggerConfig({
            ...DEFAULT_BLOGGER_CONFIG,
            ...remoteCfg,
            ...loadStoredBloggerConfig(),
          });
        } catch {
          // Keep stored/default config
        }
      }
      setBloggerConfig(activeCfg);

      if (postsRes.ok) {
        const loadedPosts: BlogPost[] = await postsRes.json();
        setServerPosts(loadedPosts);
        if (loadedPosts.some((p) => p.source === 'blogger')) {
          setBloggerSynced(true);
        }
      }
      if (catsRes.ok) setBaseCategories(await catsRes.json());
      if (projRes.ok) setProjects(await projRes.json());
      if (statusRes.ok) {
        const st: SystemStatus = await statusRes.json();
        setStatus(st);
        if (st.blogger?.synced) {
          setBloggerSynced(true);
        }
      }

      // Live browser JSONP/API sync directly with Blogger (CESARBRAHER)
      await syncWithBloggerClient(activeCfg);
    } finally {
      setLoading(false);
    }
  }, [syncWithBloggerClient]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleManualSyncBlogger = useCallback(async () => {
    setSyncingBlogger(true);
    try {
      await fetch('/api/blogger/sync', { method: 'POST' }).catch(() => null);
      const postsRes = await fetch('/api/posts?all=true&refresh=true').catch(() => null);
      if (postsRes?.ok) {
        const refreshed: BlogPost[] = await postsRes.json();
        setServerPosts(refreshed);
        if (refreshed.some((p) => p.source === 'blogger')) {
          setBloggerSynced(true);
        }
      }
      await syncWithBloggerClient(bloggerConfig);
    } finally {
      setSyncingBlogger(false);
    }
  }, [bloggerConfig, syncWithBloggerClient]);

  const handleUpdateBloggerConfig = useCallback(
    async (patch: Partial<BloggerConfig>) => {
      const updated = saveStoredBloggerConfig(patch);
      setBloggerConfig(updated);
      await syncWithBloggerClient(updated);
      await loadAllData();
    },
    [loadAllData, syncWithBloggerClient]
  );

  // Combine live Blogger posts (top priority) with server/local fallback posts
  const posts = useMemo(() => {
    if (liveBloggerPosts.length === 0) {
      return serverPosts;
    }
    if (!bloggerConfig.includeLocalFallback) {
      return liveBloggerPosts;
    }
    const seenSlugs = new Set(liveBloggerPosts.map((p) => p.slug));
    const fallbackPosts = serverPosts
      .filter((p) => p.source !== 'blogger' && !seenSlugs.has(p.slug))
      .map((p) => ({ ...p, featured: false }));
    return [...liveBloggerPosts, ...fallbackPosts];
  }, [liveBloggerPosts, serverPosts, bloggerConfig.includeLocalFallback]);

  const categories = useMemo(
    () => mergeBloggerCategories(posts, baseCategories),
    [posts, baseCategories]
  );

  const publishedPosts = useMemo(() => posts.filter((p) => p.published), [posts]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100">
      <Navbar
        mode={mode}
        onSwitchMode={(next) => {
          setMode(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
          <div className="h-12 w-2/3 rounded-xl bg-zinc-900 animate-pulse" />
          <div className="h-64 w-full rounded-2xl bg-zinc-900 animate-pulse" />
        </div>
      ) : mode === 'admin' ? (
        <AdminDashboard
          posts={posts}
          categories={categories}
          projects={projects}
          status={status}
          bloggerConfig={bloggerConfig}
          bloggerSynced={bloggerSynced}
          syncingBlogger={syncingBlogger}
          onUpdateBloggerConfig={handleUpdateBloggerConfig}
          onSyncBlogger={handleManualSyncBlogger}
          onRefreshAll={loadAllData}
          onBackToSite={() => {
            setMode('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <main>
          <HeroSection
            onExploreProjects={() => scrollTo('proyectos')}
            onReadBlog={() => scrollTo('blog')}
            publishedPostsCount={publishedPosts.length}
            projectsCount={projects.length}
            latestPosts={publishedPosts}
            bloggerConfig={bloggerConfig}
            bloggerSynced={bloggerSynced}
            syncingBlogger={syncingBlogger}
            onSyncBlogger={handleManualSyncBlogger}
            onOpenPost={(post) => setReadingPost(post)}
          />
          <ProjectsSection projects={projects} />
          <TrackingPanel
            projects={projects}
            onManageInAdmin={() => {
              setMode('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <BlogSection
            posts={posts}
            categories={categories}
            bloggerConfig={bloggerConfig}
            bloggerSynced={bloggerSynced}
            syncingBlogger={syncingBlogger}
            onSyncBlogger={handleManualSyncBlogger}
            onOpenAdmin={() => {
              setMode('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            readingPost={readingPost}
            onSelectPost={setReadingPost}
          />
          <ManifestoContactSection onMessageSent={loadAllData} />
        </main>
      )}
    </div>
  );
}
