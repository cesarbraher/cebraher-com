import { useState, type FormEvent } from 'react';
import { ArrowUpRight, BarChart3, CheckCircle2, Mail, MessageCircle, Send } from 'lucide-react';
import { recordInteraction } from '../lib/analytics';
import { SITE_ICON } from '../lib/assets';

interface ManifestoContactSectionProps {
  onMessageSent?: () => void;
  onOpenStats?: () => void;
}

type SocialIconKey =
  | 'facebook'
  | 'youtube'
  | 'soundcloud'
  | 'x'
  | 'instagram'
  | 'spotify'
  | 'github'
  | 'linkedin';

const ECOSYSTEM_LINKS: {
  key: SocialIconKey;
  label: string;
  desc: string;
  url: string;
}[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    desc: 'facebook.com/cebraher',
    url: 'https://facebook.com/cebraher',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    desc: 'youtube.com/@cebraher',
    url: 'https://youtube.com/@cebraher',
  },
  {
    key: 'soundcloud',
    label: 'SoundCloud',
    desc: 'Catálogo de Audio & Demos',
    url: 'https://on.soundcloud.com/6pCKvtRB7lmvkAUW0A',
  },
  {
    key: 'x',
    label: 'X',
    desc: 'x.com/cebraher',
    url: 'https://x.com/cebraher',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    desc: 'instagram.com/cebraher',
    url: 'https://instagram.com/cebraher',
  },
  {
    key: 'spotify',
    label: 'Spotify',
    desc: 'Música Oficial en Spotify',
    url: 'https://bit.ly/4ezFliv',
  },
  {
    key: 'github',
    label: 'GitHub',
    desc: 'github.com/cesarbraher',
    url: 'https://github.com/cesarbraher',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    desc: 'linkedin.com/in/cebraher',
    url: 'https://www.linkedin.com/in/cebraher',
  },
];

function SocialBrandIcon({ icon }: { icon: SocialIconKey }) {
  switch (icon) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'soundcloud':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.054-.049-.1-.084-.1zm1.896-.899c-.06 0-.109.051-.118.118l-.218 2.933.218 2.863c.009.067.058.118.118.118.061 0 .109-.051.119-.118l.246-2.863-.246-2.933c-.01-.067-.058-.118-.119-.118zm1.933-1.269c-.073 0-.131.06-.14.139l-.212 4.101.212 3.99c.009.079.067.139.14.139.072 0 .13-.06.14-.139l.237-3.99-.237-4.101c-.01-.079-.068-.139-.14-.139zm1.958-.708c-.087 0-.157.072-.165.163l-.195 4.645.195 4.502c.008.091.078.163.165.163.086 0 .155-.072.164-.163l.221-4.502-.221-4.645c-.009-.091-.078-.163-.164-.163zm1.981-.921c-.1 0-.18.082-.189.188l-.18 5.382.18 5.198c.009.106.089.188.189.188.099 0 .18-.082.189-.188l.204-5.198-.204-5.382c-.009-.106-.09-.188-.189-.188zm10.275 3.314c-.391 0-.768.078-1.114.219-.229-2.593-2.401-4.63-5.051-4.63-.649 0-1.281.127-1.859.354-.219.086-.276.176-.278.349v9.066c.003.18.142.326.321.345h7.981c1.536 0 2.782-1.277 2.782-2.852 0-1.574-1.246-2.851-2.782-2.851z" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'spotify':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
  }
}

export function ManifestoContactSection({ onMessageSent, onOpenStats }: ManifestoContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Por favor completa tu nombre, correo electrónico y mensaje.');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'No se pudo enviar el mensaje.');
      }
      recordInteraction('contactSubmissions');
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      onMessageSent?.();
    } catch (err: any) {
      setError(err.message || 'Error al enviar el mensaje.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section id="manifiesto" className="py-16 lg:py-24 bg-[#090A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Manifesto & Digital Ecosystem */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <p className="text-xs font-medium text-amber-400 tracking-wide mb-2">
                  04. Manifiesto &amp; Ecosistema Digital
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-4">
                  Constructor de posibilidades entre código, arte y conciencia
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
                  Toda realidad nace primero como una idea. Desde Salamanca y Valle de Santiago, Guanajuato, he dedicado
                  más de veintidós años a integrar ingeniería web, producción musical, diseño visual y tecnología con
                  sentido humano.
                </p>
                <blockquote className="py-4 px-5 rounded-xl bg-[#11131C] border border-zinc-800/80 text-sm sm:text-base text-zinc-200 italic">
                  “Toda gran obra comienza siendo invisible. Mi labor consiste en darle forma.”
                  <footer className="not-italic text-xs text-zinc-400 mt-2">
                    Cesar Augusto Bravo Hernández (Cesar Braher) · Fundador de CEBRA
                  </footer>
                </blockquote>
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold text-zinc-100 mb-4">
                  Redes y canales oficiales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ECOSYSTEM_LINKS.map((item) => (
                    <a
                      key={item.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3.5 rounded-xl bg-[#11131C] border border-zinc-800/80 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-200 group-hover:text-amber-400 group-hover:border-amber-500/40 flex items-center justify-center shrink-0 transition-colors">
                          <SocialBrandIcon icon={item.key} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                            {item.label}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 shrink-0 ml-2" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Lead Capture / Contact Form */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#11131C] border border-zinc-800/80 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-amber-400" aria-hidden="true" />
                  <h3 className="font-display text-2xl font-bold text-zinc-50">
                    Conectemos y creemos algo trascendente
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Escríbeme para proyectos de desarrollo web/móvil, dirección creativa en CEBRA, colaboraciones en IA o
                  producción musical.
                </p>

                {sent ? (
                  <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-base font-semibold text-zinc-100 mb-1">Mensaje guardado correctamente</p>
                    <p className="text-sm text-zinc-300 mb-5">
                      Tu consulta ya aparece en la bandeja del panel administrador. Te responderé pronto a tu correo.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 cursor-pointer"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Nombre completo
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Correo electrónico
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nombre@dominio.com"
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Asunto o tipo de proyecto
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Ej. Desarrollo plataforma web + Blog / Identidad CEBRA"
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Mensaje
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Cuéntame sobre tu idea, metas o colaboración..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#090A0F] border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 resize-y"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-rose-400 font-medium" role="alert">
                        {error}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <p className="text-xs text-zinc-500">
                        Directo: me@cebraher.com · cebrameta@gmail.com
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        {submitting ? 'Enviando...' : 'Enviar mensaje'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer with exclusive link to /estadisticas */}
      <footer className="border-t border-zinc-800/80 bg-[#07080C] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2.5">
            <img
              src={SITE_ICON}
              alt="Cesar Braher"
              className="w-6 h-6 rounded-md object-contain"
            />
            <p>
              © {new Date().getFullYear()} Cesar Augusto Bravo Hernández (Cesar Braher) · CEBRA Arte Digital &amp; Tecnología.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
            <span>
              Valle de Santiago &amp; Salamanca, Guanajuato, México · Código bajo licencia Apache 2.0
            </span>
            <span className="text-zinc-700" aria-hidden="true">·</span>
            <a
              href="/estadisticas"
              onClick={(e) => {
                if (onOpenStats) {
                  e.preventDefault();
                  onOpenStats();
                }
              }}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 font-medium transition-colors"
              title="Ver estadísticas de visitas del sitio (Acceso con contraseña)"
            >
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              Estadísticas
            </a>
          </div>
        </div>
      </footer>

      {/* Clean WhatsApp Floating Button (from user's CODIGO_FUENTE attachment, sized within sticky cap) */}
      <a
        href="https://wa.me/524641093886?text=Hola%20Cesar%2C%20vengo%20de%20tu%20p%C3%A1gina%20web%20y%20me%20gustar%C3%ADa%20platicar%20contigo%20sobre%20un%20proyecto."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => recordInteraction('whatsappClicks')}
        aria-label="Contactar a Cesar Braher por WhatsApp"
        title="¿Hablamos de tu proyecto por WhatsApp?"
        className="fixed bottom-5 right-5 z-40 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      </a>
    </>
  );
}
