import React from 'react';
import { View, Text } from 'react-native';
import { AuthEntryForm } from '../../../../../components/auth/AuthEntryForm';
import { styles } from '../../../../../components/auth/AuthEntryForm/styles';

interface InitialEmailStepProps {
  email: string;
  onUpdateEmail: (email: string) => void;
  password: string;
  onUpdatePassword: (val: string) => void;
  otp: string;
  onUpdateOtp: (val: string) => void;
  onNext: () => void;
  onSignIn: () => void;
  onGoogle?: () => void;
  onApple?: () => void;
}

export const InitialEmailStep: React.FC<InitialEmailStepProps> = ({
  email,
  onUpdateEmail,
  password,
  onUpdatePassword,
  otp,
  onUpdateOtp,
  onNext,
  onSignIn,
  onGoogle,
  onApple,
}) => {
  return (
    <AuthEntryForm
      title="Create Your CrickRoo ID"
      subtitle="Start your 2 week free trial"
      email={email}
      onUpdateEmail={onUpdateEmail}
      password={password}
      onUpdatePassword={onUpdatePassword}
      onNext={onNext}
      primaryButtonLabel="CONTINUE WITH EMAIL"
      isSignUp
      showOtp
      otp={otp}
      onUpdateOtp={onUpdateOtp}
      secondaryText="HAVE AN ACCOUNT?"
      secondaryActionText="SIGN IN"
      onSecondaryAction={onSignIn}
      onGoogle={onGoogle}
      onApple={onApple}
      footerContent={
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>
            By creating an account, you agree to our
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerLink}>Terms of Service</Text> &{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      }
    />
  );
};
