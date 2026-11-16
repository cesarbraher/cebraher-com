export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface BloggerConfig {
  blogName: string;
  accountEmail: string;
  blogUrl: string;
  blogId?: string;
  apiKey?: string;
  enabled: boolean;
  includeLocalFallback: boolean;
  lastSyncedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentHtml?: string;
  categorySlug: string;
  categoryName: string;
  coverImage: string;
  readTimeMinutes: number;
  published: boolean;
  featured: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
  source?: 'blogger' | 'local';
  externalUrl?: string;
  labels?: string[];
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
  blogger?: {
    blogName: string;
    accountEmail: string;
    blogUrl: string;
    blogId?: string;
    enabled: boolean;
    includeLocalFallback: boolean;
    synced: boolean;
    bloggerPostsCount: number;
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
