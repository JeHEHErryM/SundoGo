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
          <p className="mt-3 text-slate-500">The smarter way to ride</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="text-center p-8 rounded-2xl bg-primary-50/50 border border-primary-100 hover:border-primary-200 hover:bg-primary-50 transition-all hover:shadow-md"
            >
              <div className="w-14 h-14 mx-auto mb-5 bg-primary-100 rounded-xl flex items-center justify-center">
                <f.icon size={28} className="text-primary-600" />
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
