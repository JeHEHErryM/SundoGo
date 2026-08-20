import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-300/10" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Your Tricycle,{' '}
            <span className="text-primary-600">One Tap Away</span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-lg">
            Book affordable tricycle rides in Mamburao, Occidental Mindoro.
            Quick, safe, and reliable — the easiest way to get around town.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="inline-flex h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-600/25"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/portal"
              className="inline-flex h-12 px-6 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 items-center justify-center gap-2 transition-colors"
            >
              Become a Driver
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Free to download
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Cash & digital payments
            </div>
          </div>
        </div>

        <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2">
          <div className="relative animate-[float_6s_ease-in-out_infinite]">
            <div className="w-[280px] h-[560px] bg-slate-900 rounded-[3rem] shadow-2xl p-3">
              <div className="w-full h-full bg-white rounded-[2.25rem] overflow-hidden flex flex-col items-center justify-center relative">
                <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 rounded-b-2xl flex items-center justify-center">
                  <div className="w-16 h-5 bg-black rounded-full" />
                </div>

                <img src="/SundoGo_Logo.svg" alt="SundoGo" className="w-32 h-32 mb-4" />
                <p className="text-xl font-bold text-slate-900">SundoGo</p>
                <p className="text-sm text-slate-400 mt-1">Mamburao, Occidental Mindoro</p>

                <div className="absolute bottom-6 inset-x-6">
                  <Link
                    to="/login"
                    className="w-full h-11 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="text-white text-sm font-semibold">Book a Ride</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
