import { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { BlogSection } from './components/BlogSection';
import { HeroSection } from './components/HeroSection';
import { ManifestoContactSection } from './components/ManifestoContactSection';
import { Navbar } from './components/Navbar';
import { ProjectsSection } from './components/ProjectsSection';
import { TrackingPanel } from './components/TrackingPanel';
import type { BlogPost, Category, Project, SystemStatus } from './lib/types';

export default function App() {
  const [mode, setMode] = useState<'landing' | 'admin'>('landing');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    try {
      const [postsRes, catsRes, projRes, statusRes] = await Promise.all([
        fetch('/api/posts?all=true'),
        fetch('/api/categories'),
        fetch('/api/projects'),
        fetch('/api/status'),
      ]);
      if (postsRes.ok) setPosts(await postsRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
      if (projRes.ok) setProjects(await projRes.json());
      if (statusRes.ok) setStatus(await statusRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const publishedCount = posts.filter((p) => p.published).length;

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
            publishedPostsCount={publishedCount}
            projectsCount={projects.length}
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
            onOpenAdmin={() => {
              setMode('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <ManifestoContactSection onMessageSent={loadAllData} />
        </main>
      )}
    </div>
  );
}
