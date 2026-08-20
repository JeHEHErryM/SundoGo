import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import PortalCards from '../components/PortalCards';
import Footer from '../components/Footer';

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Sign Up</h1>
            <p className="mt-3 text-slate-500 max-w-md mx-auto">
              Choose how you'd like to use SundoGo
            </p>
          </div>

          <PortalCards />
        </div>
      </section>
      <Footer />
    </div>
  );
}
