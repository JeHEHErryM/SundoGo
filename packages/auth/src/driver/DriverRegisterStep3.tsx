import { Car, Palette, Hash } from 'lucide-react';

interface Props {
  data: { plateNumber: string; vehicleModel: string; vehicleColor: string };
  onUpdate: (data: { plateNumber: string; vehicleModel: string; vehicleColor: string }) => void;
}

export function DriverRegisterStep3({ data, onUpdate }: Props) {
  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Vehicle Information</h2>
        <p className="text-sm text-slate-500 mt-1">Tell us about your tricycle</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Plate Number</label>
        <div className="relative">
          <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            value={data.plateNumber}
            onChange={(e) => handleChange('plateNumber', e.target.value.toUpperCase())}
            placeholder="ABC 1234"
            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors uppercase"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle Model / Make</label>
        <div className="relative">
          <Car size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            value={data.vehicleModel}
            onChange={(e) => handleChange('vehicleModel', e.target.value)}
            placeholder="e.g. Honda TMX, Kawasaki CT100"
            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle Color</label>
        <div className="relative">
          <Palette size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            required
            value={data.vehicleColor}
            onChange={(e) => handleChange('vehicleColor', e.target.value)}
            placeholder="e.g. Red, Blue, Black"
            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          Make sure your vehicle information matches your OR/CR document. This will be verified during the approval process.
        </p>
      </div>
    </div>
  );
}