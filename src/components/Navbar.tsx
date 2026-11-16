import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SITE_ICON } from '../lib/assets';

interface NavbarProps {
  mode: 'landing' | 'admin' | 'cancelar-donacion' | 'gracias-por-donar';
  onSwitchMode: (mode: 'landing' | 'admin') => void;
}

export function Navbar({ mode, onSwitchMode }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileOpen(false);
    if (mode !== 'landing') {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', `/#${sectionId}`);
      }
      onSwitchMode('landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#090A0F]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Site Icon (firma.png) on the left of Cesar Braher */}
        <a
          href="/#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('inicio');
          }}
          className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-zinc-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm"
        >
          <img
            src={SITE_ICON}
            alt="Cesar Braher"
            className="w-9 h-9 rounded-lg object-contain border border-zinc-800 bg-[#141414] shrink-0"
          />
          <span>Cesar Braher</span>
        </a>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400" aria-label="Navegación principal">
          <button
            type="button"
            onClick={() => handleNavClick('proyectos')}
            className="hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Proyectos
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('seguimiento')}
            className="hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Seguimiento
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('blog')}
            className="hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Blog
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('manifiesto')}
            className="hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Manifiesto
          </button>
        </nav>

        {/* Zone 3: Mobile menu trigger & back to site button when in sub-view */}
        <div className="flex items-center gap-3 shrink-0">
          {mode !== 'landing' && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                if (window.location.pathname !== '/') {
                  window.history.pushState({}, '', '/');
                }
                onSwitchMode('landing');
              }}
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-200 hover:border-amber-500 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Volver al Sitio
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#0D0E15] px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('proyectos')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 rounded-lg hover:bg-zinc-900"
          >
            Proyectos
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('seguimiento')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 rounded-lg hover:bg-zinc-900"
          >
            Seguimiento
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('blog')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 rounded-lg hover:bg-zinc-900"
          >
            Blog
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('manifiesto')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 rounded-lg hover:bg-zinc-900"
          >
            Manifiesto
          </button>
          {mode !== 'landing' && (
            <div className="pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  if (window.location.pathname !== '/') {
                    window.history.pushState({}, '', '/');
                  }
                  onSwitchMode('landing');
                }}
                className="w-full py-2 px-4 text-xs font-semibold rounded-lg border border-zinc-700 text-zinc-200"
              >
                Volver al Sitio
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
