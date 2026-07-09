import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AuthEntryForm } from '../../../components/auth/AuthEntryForm';
import { styles } from '../../../components/auth/AuthEntryForm/styles';

interface SignInScreenProps {
  onContinue: (email: string, password: string) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onGoogle?: () => void;
  onApple?: () => void;
  showApple?: boolean;
  isLoading?: boolean;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onContinue,
  onSignUp,
  onForgotPassword,
  onGoogle,
  onApple,
  showApple,
  isLoading,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthEntryForm
      title="Welcome Back to CrickRoo"
      subtitle="Continue your cricket journey"
      email={email}
      onUpdateEmail={setEmail}
      password={password}
      onUpdatePassword={setPassword}
      onNext={() => onContinue(email.trim(), password)}
      primaryButtonLabel="SIGN IN"
      isLoading={isLoading}
      secondaryText="NEW HERE?"
      secondaryActionText="CREATE AN ACCOUNT"
      onSecondaryAction={onSignUp}
      onGoogle={onGoogle}
      onApple={onApple}
      showApple={showApple}
      showForgot
      onForgotPassword={onForgotPassword}
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
