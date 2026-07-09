import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Linking } from 'react-native';
import axios from 'axios';
import { useRegistration } from '../../../hooks/useRegistration';
import { InitialEmailStep } from './steps/InitialEmailStep';
import { SelectRole } from './steps/SelectRole';
import { Step1Profile } from './steps/Step1Profile';
import { Step3Permissions } from './steps/Step3Permissions';
import { PolicyConsentSheet } from '../../../components/common/PolicyConsentSheet';
import { ChoosePlanSheet } from '../../../components/subscription/ChoosePlanSheet';
import {
  authService,
  UnsupportedRoleError,
} from '../../../services/auth.service';
import { onboardingService } from '../../../services/onboarding.service';
import { policyService } from '../../../services/policy.service';
import { BillingInterval, planService } from '../../../services/plan.service';
import { RegistrationData } from '../../../types';
import { PersonalProfileRequest } from '../../../types/onboarding';

interface RegistrationFlowProps {
  onComplete: () => void;
  onSignIn: () => void;
  onGoogle?: () => void;
  onApple?: () => void;
  initialStep?: number;
}

// Map internal step index (2–3) to display step number (1–2)
const toDisplayStep = (s: number) => Math.max(1, s - 1);

const getDialCode = (countryCode: string) =>
  countryCode.startsWith('+')
    ? countryCode
    : countryCode.match(/\((\+\d+)\)/)?.[1] ?? '';

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onComplete,
  onSignIn,
  onGoogle,
  onApple,
  initialStep = 0,
}) => {
  const {
    currentStep: step,
    registrationData: data,
    nextStep,
    prevStep,
    updateFields: setData,
    resetRegistration,
  } = useRegistration(4, initialStep);

  const [loading, setLoading] = React.useState(false);
  const [showPolicySheet, setShowPolicySheet] = React.useState(false);
  const [acceptingPolicy, setAcceptingPolicy] = React.useState(false);
  const [showChoosePlanSheet, setShowChoosePlanSheet] = React.useState(false);
  const [planActionLoading, setPlanActionLoading] = React.useState(false);

  // ─── two-phase step transition state ──────────────────────────────────────
  const [uiStep, setUiStep] = useState(step >= 2 ? toDisplayStep(step) : 1);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (step >= 2) setUiStep(toDisplayStep(step));
  }, [step]);

  React.useEffect(() => {
    if (initialStep === 0) resetRegistration();
  }, [resetRegistration, initialStep]);

  // Steps that should return directly to sign-in instead of another registration step.
  const SIGN_IN_BACK_STEPS = [2];

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (SIGN_IN_BACK_STEPS.includes(step)) {
        onSignIn();
        return true;
      }
      if (step > 0) {
        prevStep();
      } else {
        onSignIn();
      }
      return true;
    });
    return () => handler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, prevStep, onSignIn]);

  const advanceStep = (doNext: () => void) => {
    setUiStep(prev => prev + 1);
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      doNext();
    }, 380);
  };

  const handleError = (error: any) => {
    let message = 'An error occurred. Please try again.';
    if (error instanceof UnsupportedRoleError) {
      message = error.message;
    } else if (axios.isAxiosError(error)) {
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') message = detail;
      else if (Array.isArray(detail)) message = detail[0].msg;
    }
    Alert.alert('Error', message);
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await authService.register({
        email: data.email.trim().toLowerCase(),
        password: data.password || '',
        role: data.role,
      });
      nextStep();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalProfileNext = async () => {
    try {
      setLoading(true);
      const profilePayload: PersonalProfileRequest = {
        name: data.name,
        dob: data.dob,
      };
      if (data.role === 'coach') {
        const dialCode = getDialCode(data.countryCode);
        profilePayload.academy_name = data.academyName.trim();
        profilePayload.phone = `${dialCode}${data.phoneNumber.trim()}`;
      }
      await onboardingService.updatePersonalProfile(profilePayload);

      advanceStep(nextStep);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionsNext = async () => {
    try {
      setLoading(true);
      await onboardingService.completeOnboarding();
      setShowPolicySheet(true);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPolicy = async () => {
    try {
      setAcceptingPolicy(true);
      await policyService.accept();
      setShowPolicySheet(false);

      const plan = await planService.getUserPlan();
      if (plan.plan_source === 'academy' || plan.plan === 'premium') {
        finishRegistration();
        return;
      }

      setShowChoosePlanSheet(true);
    } catch (error) {
      handleError(error);
    } finally {
      setAcceptingPolicy(false);
    }
  };

  const finishRegistration = () => {
    setShowChoosePlanSheet(false);
    onComplete();
  };

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Unable to open link', 'Please try again later.');
      return;
    }
    await Linking.openURL(url);
  };

  const handlePlanPurchase = async (billingInterval: BillingInterval) => {
    try {
      setPlanActionLoading(true);
      const result = await planService.purchasePlan(billingInterval);
      await openUrl(result.checkout_url);
      finishRegistration();
    } catch (error) {
      handleError(error);
    } finally {
      setPlanActionLoading(false);
    }
  };

  const handleContactTeam = async () => {
    try {
      await openUrl('https://www.crickroo.com/#contact');
    } catch {
      Alert.alert('Unable to open link', 'Please visit our website to contact the team.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <InitialEmailStep
            email={data.email}
            onUpdateEmail={(val: string) => setData({ ...data, email: val })}
            password={data.password || ''}
            onUpdatePassword={(val: string) =>
              setData({ ...data, password: val })
            }
            otp={data.otp || ''}
            onUpdateOtp={(val: string) => setData({ ...data, otp: val })}
            onNext={nextStep}
            onSignIn={onSignIn}
            onGoogle={onGoogle}
            onApple={onApple}
          />
        );
      case 1:
        return (
          <SelectRole
            role={data.role}
            onUpdateRole={(role: 'player' | 'coach') =>
              setData({ ...data, role })
            }
            onNext={handleRegister}
            onBack={prevStep}
            buttonLabel="REGISTER"
            isLoading={loading}
          />
        );
      case 2:
        return (
          <Step1Profile
            data={data}
            onUpdate={(fields: Partial<RegistrationData>) => setData(fields)}
            onNext={handlePersonalProfileNext}
            onBack={onSignIn}
            isLoading={loading}
            stepDisplay={uiStep}
            isExiting={isExiting}
          />
        );
      case 3:
        return (
          <Step3Permissions
            onAllowCamera={() =>
              setData({
                ...data,
                permissions: { ...data.permissions, camera: true },
              })
            }
            onAllowLocation={() =>
              setData({
                ...data,
                permissions: { ...data.permissions, location: true },
              })
            }
            onNext={handlePermissionsNext}
            onBack={prevStep}
            isLoading={loading}
            stepDisplay={uiStep}
            isExiting={isExiting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderStep()}
      <PolicyConsentSheet
        isVisible={showPolicySheet}
        isLoading={acceptingPolicy}
        onAccept={handleAcceptPolicy}
      />

      <ChoosePlanSheet
        isVisible={showChoosePlanSheet}
        selectedRole={data.role}
        isLoading={planActionLoading}
        onContinueTrial={finishRegistration}
        onPurchase={handlePlanPurchase}
        onContactTeam={handleContactTeam}
        onClose={finishRegistration}
      />
    </>
  );
};
