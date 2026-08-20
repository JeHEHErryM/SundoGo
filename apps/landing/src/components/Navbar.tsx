import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/SundoGo_Logo.svg" alt="SundoGo" className="h-8 w-auto" />
          <span className="text-lg font-bold text-slate-900">SundoGo</span>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <Link to="/portal" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link to="/portal" className="h-9 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Sign Up
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        className={`sm:hidden overflow-hidden transition-all duration-200 ${
          mobileOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          <Link to="/portal" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-600 hover:text-slate-900">
            Login
          </Link>
          <Link to="/portal" onClick={() => setMobileOpen(false)} className="block h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg text-center transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
