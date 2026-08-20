import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-100/30 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-6">
            <Smartphone size={14} />
            Now Available in Mamburao
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Your Tricycle,{' '}
            <span className="text-blue-600">One Tap Away</span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-lg">
            Book affordable tricycle rides in Mamburao, Occidental Mindoro.
            Quick, safe, and reliable — the easiest way to get around town.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/portal"
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/portal"
              className="h-12 px-6 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              Become a Driver
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Free to download
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Cashless & cash payments
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2">
          <div className="w-72 h-[480px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-200 p-4 flex flex-col items-center justify-center">
            <img src="/SundoGo_Logo.svg" alt="SundoGo" className="w-20 h-20 mb-4" />
            <p className="text-sm font-semibold text-slate-900">SundoGo</p>
            <p className="text-xs text-slate-400 mt-1">Coming Soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
