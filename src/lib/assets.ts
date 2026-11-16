import blogAiArch from '../assets/images/blog_ai_architecture_1794679064105.jpg';
import blogMusicProd from '../assets/images/blog_music_production_1794679064769.jpg';
import blogDigitalArt from '../assets/images/blog_digital_art_1794679064329.jpg';
import blogSocialImpact from '../assets/images/blog_social_impact_1794679064779.jpg';

export const HERO_STUDIO_IMAGE = '/assets/aistudio/unnamed_9a4f6080.jpg';
export const SITE_ICON = '/firma.png';

export const COVER_PRESETS: { key: string; label: string; src: string }[] = [
  { key: 'ai-architecture', label: 'Estudio Código & IA', src: blogAiArch },
  { key: 'music-production', label: 'Estudio Musical & Guitarra', src: blogMusicProd },
  { key: 'digital-art', label: 'Dirección Creativa & Diseño', src: blogDigitalArt },
  { key: 'social-impact', label: 'Impacto Social & Comunidad', src: blogSocialImpact },
  { key: 'studio-hero', label: 'Portada Estudio Cesar Braher', src: HERO_STUDIO_IMAGE },
];

export function resolveCoverImage(coverImage?: string): string {
  if (!coverImage) return blogAiArch;
  const preset = COVER_PRESETS.find((p) => p.key === coverImage);
  if (preset) return preset.src;
  return coverImage;
}

export function formatSpanishDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
