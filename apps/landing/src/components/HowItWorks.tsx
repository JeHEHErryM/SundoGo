import { MapPin, Route, CreditCard } from 'lucide-react';

const steps = [
  { icon: MapPin, number: '1', title: 'Book', description: 'Enter your pickup location and destination on the map.' },
  { icon: Route, number: '2', title: 'Ride', description: 'A verified driver picks you up and takes you to your destination.' },
  { icon: CreditCard, number: '3', title: 'Pay', description: 'Pay with cash or digital payment. Simple and transparent.' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-lg mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">How It Works</h2>
          <p className="mt-3 text-slate-500">Three simple steps to your destination</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-10 relative">
          <div className="hidden sm:block absolute top-12 left-[16.67%] right-[16.67%] h-0.5 bg-primary-200" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="w-24 h-24 mx-auto mb-5 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center relative z-10">
                <step.icon size={32} className="text-primary-600" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-7 h-7 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-20">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
