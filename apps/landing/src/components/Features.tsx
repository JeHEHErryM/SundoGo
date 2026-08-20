import { Shield, Zap, Banknote } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Quick Booking',
    description: 'Book a tricycle in seconds. Just enter your destination and we\'ll match you with the nearest available driver.',
  },
  {
    icon: Shield,
    title: 'Safe & Verified',
    description: 'All drivers are verified with valid IDs and licenses. Track your ride in real-time for peace of mind.',
  },
  {
    icon: Banknote,
    title: 'Affordable Fares',
    description: 'Transparent pricing with no surge charges. Know your fare before you ride — no surprises.',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-lg mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Why SundoGo?</h2>
          <p className="mt-3 text-slate-500">The smarter way to ride around Mamburao</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
                <f.icon size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
