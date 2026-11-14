import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  mode: 'landing' | 'admin';
  onSwitchMode: (mode: 'landing' | 'admin') => void;
}

export function Navbar({ mode, onSwitchMode }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileOpen(false);
    if (mode !== 'landing') {
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
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('inicio');
          }}
          className="font-display text-lg font-bold tracking-tight text-zinc-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm"
        >
          César Braher
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

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onSwitchMode(mode === 'admin' ? 'landing' : 'admin');
            }}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090A0F]"
          >
            {mode === 'admin' ? 'Volver al Sitio' : 'Administrar Blog'}
          </button>

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
          <div className="pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onSwitchMode(mode === 'admin' ? 'landing' : 'admin');
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              {mode === 'admin' ? 'Volver al Sitio' : 'Administrar Blog'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
