import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/StepIndicator';
import { StepWrapper } from '../components/StepWrapper';
import { DriverRegisterStep1 } from './DriverRegisterStep1';
import { DriverRegisterStep2 } from './DriverRegisterStep2';
import { DriverRegisterStep3 } from './DriverRegisterStep3';
import { DriverRegisterStep4 } from './DriverRegisterStep4';

interface DriverRegisterFlowProps {
  onRegister: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    plateNumber: string;
    vehicleModel: string;
    vehicleColor: string;
  }) => Promise<void>;
  onUploadDocuments?: (driverId: string, files: { idImage: File; licenseImage: File; orcrImage: File }) => Promise<void>;
}

export function DriverRegisterFlow({ onRegister }: DriverRegisterFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [personalData, setPersonalData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
  });
  const [vehicleData, setVehicleData] = useState({
    plateNumber: '', vehicleModel: '', vehicleColor: '',
  });
  const [documents, setDocuments] = useState<{
    idImage: File | null; licenseImage: File | null; orcrImage: File | null;
  }>({ idImage: null, licenseImage: null, orcrImage: null });

  const canNextStep2 = personalData.firstName && personalData.lastName && personalData.email && personalData.phone && personalData.password.length >= 8;
  const canNextStep3 = vehicleData.plateNumber && vehicleData.vehicleModel && vehicleData.vehicleColor;
  const canSubmit = documents.idImage && documents.licenseImage && documents.orcrImage;

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onRegister({ ...personalData, ...vehicleData });
      navigate('/verification');
    } catch {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const labels = ['Confirm', 'Personal', 'Vehicle', 'Documents'];

  return (
    <div>
      <StepIndicator currentStep={step} totalSteps={4} labels={labels} />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <DriverRegisterStep1 onConfirm={() => setStep(2)} />
      )}

      {step === 2 && (
        <StepWrapper
          currentStep={2}
          totalSteps={4}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          nextLabel="Continue"
          nextDisabled={!canNextStep2}
        >
          <DriverRegisterStep2 data={personalData} onUpdate={setPersonalData} />
        </StepWrapper>
      )}

      {step === 3 && (
        <StepWrapper
          currentStep={3}
          totalSteps={4}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          nextLabel="Continue"
          nextDisabled={!canNextStep3}
        >
          <DriverRegisterStep3 data={vehicleData} onUpdate={setVehicleData} />
        </StepWrapper>
      )}

      {step === 4 && (
        <StepWrapper
          currentStep={4}
          totalSteps={4}
          onBack={() => setStep(3)}
          onNext={handleSubmit}
          nextLabel={isLoading ? 'Submitting...' : 'Submit Application'}
          nextDisabled={isLoading || !canSubmit}
        >
          <DriverRegisterStep4
            documents={documents}
            onDocumentsUpdate={setDocuments}
            personalData={personalData}
            vehicleData={vehicleData}
          />
        </StepWrapper>
      )}
    </div>
  );
}