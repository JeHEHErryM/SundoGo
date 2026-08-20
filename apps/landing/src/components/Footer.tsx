import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/SundoGo_Logo.svg" alt="SundoGo" className="h-9 w-auto" />
              <span className="text-lg font-bold text-white">SundoGo</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your trusted tricycle ride-booking platform.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/portal" className="hover:text-white transition-colors">Get Started</Link></li>
              <li><Link to="/portal" className="hover:text-white transition-colors">Become a Driver</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Mamburao, Occidental Mindoro</li>
              <li>Philippines</li>
              <li className="pt-2">
                <a href="mailto:hello@sundogo.ph" className="hover:text-white transition-colors">hello@sundogo.ph (inactive)</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>&copy; {new Date().getFullYear()} SundoGo. All rights reserved.</span>
          <span>Made with care for Mamburao</span>
        </div>
      </div>
    </footer>
  );
}
