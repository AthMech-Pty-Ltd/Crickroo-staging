import { useState } from 'react';
import { useAuthContext } from '../store/AuthContext';
import { RegistrationData } from '../types';

export const useRegistration = (
  totalSteps: number,
  initialStep: number = 0,
) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const { registrationData, updateRegistrationFields, resetRegistration } =
    useAuthContext();

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateFields = (fields: Partial<RegistrationData>) => {
    updateRegistrationFields(fields);
  };

  return {
    currentStep,
    registrationData,
    nextStep,
    prevStep,
    updateFields,
    resetRegistration,
    setStep: setCurrentStep,
  };
};
