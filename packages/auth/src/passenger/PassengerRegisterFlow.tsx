import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/StepIndicator';
import { StepWrapper } from '../components/StepWrapper';
import { PassengerRegisterStep1 } from './PassengerRegisterStep1';
import { PassengerRegisterStep2 } from './PassengerRegisterStep2';

interface PassengerRegisterFlowProps {
  onRegister: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<void>;
}

export function PassengerRegisterFlow({ onRegister }: PassengerRegisterFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [accountData, setAccountData] = useState({ email: '', password: '' });
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '' });

  const canNextStep1 = accountData.email.length > 0 && accountData.password.length >= 8;

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onRegister({
        ...accountData,
        ...profileData,
      });
      navigate('/');
    } catch {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <StepIndicator currentStep={step} totalSteps={2} labels={['Account', 'Profile']} />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <StepWrapper
          currentStep={1}
          totalSteps={2}
          onNext={() => setStep(2)}
          nextLabel="Continue"
          nextDisabled={!canNextStep1}
          showBack={false}
        >
          <PassengerRegisterStep1 data={accountData} onUpdate={setAccountData} />
        </StepWrapper>
      )}

      {step === 2 && (
        <StepWrapper
          currentStep={2}
          totalSteps={2}
          onBack={() => setStep(1)}
          onNext={handleSubmit}
          nextLabel={isLoading ? 'Creating Account...' : 'Get Started'}
          nextDisabled={isLoading || !profileData.firstName || !profileData.lastName || !profileData.phone}
        >
          <PassengerRegisterStep2 data={profileData} onUpdate={setProfileData} />
        </StepWrapper>
      )}
    </div>
  );
}