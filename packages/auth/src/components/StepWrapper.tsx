import { ChevronLeft } from 'lucide-react';

interface StepWrapperProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export function StepWrapper({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextLabel = 'Next',
  nextDisabled = false,
  showBack = true,
}: StepWrapperProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="flex-1">{children}</div>

      <div className="flex items-center gap-3 pt-6">
        {showBack && currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="h-12 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25"
        >
          {isLastStep ? 'Submit' : nextLabel}
        </button>
      </div>
    </div>
  );
}