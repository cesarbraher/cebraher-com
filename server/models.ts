import mongoose, { Schema, type Document } from 'mongoose';

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface IBlogPost {
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

export interface IMilestone {
  id: string;
  title: string;
  done: boolean;
}

export type ProjectStatus = 'En Progreso' | 'Completado' | 'Planificado';

export interface IProject {
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
  milestones: IMilestone[];
  updatedAt: string;
}

export interface IContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface CategoryDoc extends Document {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
}

interface BlogPostDoc extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectDoc extends Document {
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
  milestones: { id: string; title: string; done: boolean }[];
  updatedAt: Date;
}

interface ContactMessageDoc extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const CategorySchema = new Schema<CategoryDoc>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const BlogPostSchema = new Schema<BlogPostDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    coverImage: { type: String, default: 'ai-architecture' },
    readTimeMinutes: { type: Number, default: 5 },
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    author: { type: String, default: 'César Augusto Bravo Hernández' },
  },
  { timestamps: true }
);

const ProjectSchema = new Schema<ProjectDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['En Progreso', 'Completado', 'Planificado'],
      default: 'En Progreso',
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    stack: { type: [String], default: [] },
    url: { type: String },
    repoUrl: { type: String },
    impactMetric: { type: String, default: '' },
    nextMilestone: { type: String, default: '' },
    milestones: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        done: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const ContactMessageSchema = new Schema<ContactMessageDoc>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const CategoryModel =
  mongoose.models.Category || mongoose.model<CategoryDoc>('Category', CategorySchema);

export const BlogPostModel =
  mongoose.models.BlogPost || mongoose.model<BlogPostDoc>('BlogPost', BlogPostSchema);

export const ProjectModel =
  mongoose.models.Project || mongoose.model<ProjectDoc>('Project', ProjectSchema);

export const ContactMessageModel =
  mongoose.models.ContactMessage ||
  mongoose.model<ContactMessageDoc>('ContactMessage', ContactMessageSchema);
