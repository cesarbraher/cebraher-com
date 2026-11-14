export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  categoryName: string;
  coverImage: string;
  readTimeMinutes: number;
  published: boolean;
  featured: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export type ProjectStatus = 'En Progreso' | 'Completado' | 'Planificado';

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  stack: string[];
  url?: string;
  repoUrl?: string;
  impactMetric: string;
  nextMilestone: string;
  milestones: Milestone[];
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SystemStatus {
  db: {
    engine: 'hostinger-mysql' | 'mongodb' | 'local-json';
    connected: boolean;
    database: string;
    hostingerConfigured?: boolean;
  };
  requireAuth: boolean;
  counts: {
    postsTotal: number;
    postsPublished: number;
    categories: number;
    projects: number;
    unreadMessages: number;
  };
}
