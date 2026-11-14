import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Mail, MessageCircle, Send } from 'lucide-react';

interface ManifestoContactSectionProps {
  onMessageSent?: () => void;
}

const ECOSYSTEM_LINKS = [
  { label: 'CEBRA.TECH', desc: 'Arquitectura Web & IA', url: 'https://cebra.tech' },
  { label: 'CEBRAHER.COM', desc: 'Hub Personal & Portafolio', url: 'https://cebraher.com' },
  { label: 'Ángeles de Esperanza A.C.', desc: 'Impacto Social & Comunidad', url: 'https://angelesdeesperanzaac.org' },
  { label: 'YouTube · @cebraher', desc: 'Arte Digital, Código & Música', url: 'https://www.youtube.com/@cebraher' },
  { label: 'Behance · @cebraher', desc: 'Identidad Visual & Branding', url: 'https://www.behance.net/cebraher' },
  { label: 'LinkedIn · @cebraher', desc: 'Perfil Profesional & Dirección', url: 'https://www.linkedin.com/in/cebraher' },
  { label: 'X · @cebraher', desc: 'Ideas & Comunidad Tech', url: 'https://x.com/cebraher' },
  { label: 'GitHub · @cebraher', desc: 'Código Abierto Apache 2.0', url: 'https://github.com/cebraher' },
  { label: 'Facebook · @cebraher', desc: 'Página Oficial & Novedades', url: 'https://www.facebook.com/cebraher' },
  { label: 'Spotify · César Bravo', desc: 'Catálogo Musical Oficial', url: 'https://open.spotify.com/intl-es/artist/66p3p4W65G4huFUZITROUW' },
];

export function ManifestoContactSection({ onMessageSent }: ManifestoContactSectionProps) {
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
                    César Augusto Bravo Hernández (César Braher) · Fundador de CEBRA
                  </footer>
                </blockquote>
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold text-zinc-100 mb-4">
                  Canales oficiales y plataformas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ECOSYSTEM_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3.5 rounded-xl bg-[#11131C] border border-zinc-800/80 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                          {item.label}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">{item.desc}</p>
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

      {/* Quiet Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#07080C] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} César Augusto Bravo Hernández (César Braher) · CEBRA Arte Digital &amp; Tecnología.
          </p>
          <p>
            Valle de Santiago &amp; Salamanca, Guanajuato, México · Código bajo licencia Apache 2.0
          </p>
        </div>
      </footer>

      {/* Clean WhatsApp Floating Button (from user's CODIGO_FUENTE attachment, sized within sticky cap) */}
      <a
        href="https://wa.me/524641093886?text=Hola%20C%C3%A9sar%2C%20vengo%20de%20tu%20p%C3%A1gina%20web%20y%20me%20gustar%C3%ADa%20platicar%20contigo%20sobre%20un%20proyecto."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar a César Braher por WhatsApp"
        title="¿Hablamos de tu proyecto por WhatsApp?"
        className="fixed bottom-5 right-5 z-40 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      </a>
    </>
  );
}
