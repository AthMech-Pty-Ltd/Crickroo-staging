import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import {
  EnvelopeSimpleIcon,
  LockSimpleIcon,
  EyeIcon,
} from 'phosphor-react-native';
import { BaseAuthLayout } from '../BaseAuthLayout';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { SocialButtonGroup } from '../SocialButtonGroup';
import {
  validateEmail,
  getPasswordValidation,
  isPasswordValid,
} from '../../../utils/validation';
import { authService } from '../../../services/auth.service';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface AuthEntryFormProps {
  title: string;
  subtitle: string;

  email: string;
  onUpdateEmail: (email: string) => void;

  password: string;
  onUpdatePassword: (val: string) => void;

  onNext: () => void;
  primaryButtonLabel: string;
  isLoading?: boolean;

  secondaryText: string;
  secondaryActionText: string;
  onSecondaryAction: () => void;

  onGoogle?: () => void;
  onApple?: () => void;
  showApple?: boolean;

  footerContent?: React.ReactNode;

  // Sign-up extras
  showOtp?: boolean;
  otp?: string;
  onUpdateOtp?: (val: string) => void;
  onResendOtp?: () => void;
  isSignUp?: boolean;

  // Sign-in extras
  showForgot?: boolean;
  onForgotPassword?: () => void;
}

const VALIDATION_RULES: {
  key: keyof ReturnType<typeof getPasswordValidation>;
  label: string;
}[] = [
  { key: 'minLength', label: 'At least 8 characters' },
  { key: 'hasUppercase', label: 'One uppercase letter (A–Z)' },
  { key: 'hasLowercase', label: 'One lowercase letter (a–z)' },
  { key: 'hasNumber', label: 'One number (0–9)' },
  { key: 'hasSpecial', label: 'One special character (!@#$…)' },
];

type OtpStatus = 'idle' | 'verifying' | 'success' | 'error';

export const AuthEntryForm: React.FC<AuthEntryFormProps> = ({
  title,
  subtitle,
  email,
  onUpdateEmail,
  password,
  onUpdatePassword,
  onNext,
  primaryButtonLabel,
  isLoading,
  secondaryText,
  secondaryActionText,
  onSecondaryAction,
  onGoogle = () => {},
  onApple = () => {},
  // Apple Sign-In is iOS-only (native appleAuth API); hidden on Android by default.
  showApple = Platform.OS === 'ios',
  footerContent,
  showOtp = false,
  otp = '',
  onUpdateOtp,
  onResendOtp,
  isSignUp = false,
  showForgot = false,
  onForgotPassword,
}) => {
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle');
  const [emailVerified, setEmailVerified] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  const digits = otp.padEnd(4, '').split('').slice(0, 4);

  const trimmedEmail = email.trim();
  const emailValid = validateEmail(trimmedEmail);
  const validation = getPasswordValidation(password);
  const passwordValid = isSignUp
    ? isPasswordValid(validation)
    : password.trim().length > 0;
  const confirmMatch =
    confirmPassword === password && confirmPassword.length > 0;

  const handleEmailContinue = async () => {
    setSubmitAttempted(true);
    if (!isSignUp && (!emailValid || !passwordValid)) return;

    if (showOtp) {
      try {
        setCheckingEmail(true);
        setEmailError(undefined);
        await authService.sendOtp(email);
        setOtpVisible(true);
        setResendCooldown(30);
      } catch (err: any) {
        const code = err?.response?.data?.error?.code;
        if (code === 'email_already_exists') {
          setEmailError('An account with this email already exists');
        } else {
          setEmailError('Unable to send OTP. Please try again.');
        }
      } finally {
        setCheckingEmail(false);
      }
    } else {
      onNext();
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    try {
      setOtpStatus('verifying');
      await authService.verifyOtp(email, otpValue);
      setOtpStatus('success');
      setEmailVerified(true);
    } catch {
      setOtpStatus('error');
      setEmailVerified(false);
    }
  };

  const handleEditEmail = () => {
    setOtpVisible(false);
    setOtpStatus('idle');
    setEmailVerified(false);
    onUpdateOtp?.('');
  };

  const handleResendOtp = async () => {
    setOtpStatus('idle');
    setEmailVerified(false);
    onUpdateOtp?.('');
    try {
      await authService.sendOtp(email);
      setResendCooldown(30);
    } catch {
      // silently ignore — user can try again
    }
    onResendOtp?.();
  };

  const handleDigitChange = async (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newOtp = newDigits.join('').replace(/\s/g, '');
    onUpdateOtp?.(newOtp);
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.length === 4) {
      await handleVerifyOtp(newOtp);
    } else if (otpStatus !== 'idle') {
      setOtpStatus('idle');
      setEmailVerified(false);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (otpStatus !== 'idle') {
        setOtpStatus('idle');
        setEmailVerified(false);
      }
      if (!digits[index]?.trim() && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onUpdateOtp?.(newDigits.join('').replace(/\s/g, ''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const otpBoxStyle = (i: number) => {
    if (otpStatus === 'success') return [styles.otpBox, styles.otpBoxSuccess];
    if (otpStatus === 'error' && digits[i]?.trim())
      return [styles.otpBox, styles.otpBoxError];
    return [styles.otpBox];
  };

  const isOtpComplete = otp.replace(/\s/g, '').length === 4;
  const emailValidationError =
    submitAttempted && !emailValid ? 'Enter a valid email address' : undefined;
  const passwordValidationError =
    submitAttempted && !isSignUp && !passwordValid
      ? 'Enter your password'
      : undefined;

  const isPrimaryDisabled = otpVisible
    ? !emailVerified || !passwordValid || !confirmMatch
    : isSignUp
    ? !emailValid
    : false;

  return (
    <BaseAuthLayout title={title} subtitle={subtitle} headerHeightRatio={0.22}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Email */}
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={val => {
              setEmailError(undefined);
              onUpdateEmail(val);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!otpVisible}
            status={emailError || emailValidationError ? 'error' : 'default'}
            errorText={emailError ?? emailValidationError}
            leftIcon={
              <EnvelopeSimpleIcon size={20} color={colors.neutrals[40]} />
            }
          />

          {/* Password — sign-in only (sign-up shows it after OTP) */}
          {!isSignUp && (
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={onUpdatePassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              status={passwordValidationError ? 'error' : 'default'}
              errorText={passwordValidationError}
              leftIcon={
                <LockSimpleIcon size={20} color={colors.neutrals[40]} />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={
                    showPassword ? styles.eyeIconVisible : styles.eyeIconHidden
                  }
                >
                  <EyeIcon size={20} color={colors.neutrals[40]} />
                </TouchableOpacity>
              }
            />
          )}

          {/* Forgot password (sign-in only) */}
          {showForgot && (
            <TouchableOpacity
              onPress={onForgotPassword}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* OTP section */}
          {otpVisible && (
            <>
              {/* Info line with email + Edit Email */}
              <Text style={styles.otpInfoText}>
                {'A 4-digit OTP was sent to your email\n'}
                <Text style={styles.otpInfoEmail}>{email} </Text>
                <Text style={styles.editEmailText} onPress={handleEditEmail}>
                  Edit Email
                </Text>
              </Text>

              <View>
                <Text style={styles.otpLabel}>Verify OTP</Text>
                <View style={styles.otpRow}>
                  {[0, 1, 2, 3].map(i => (
                    <TextInput
                      key={i}
                      ref={ref => {
                        inputRefs.current[i] = ref;
                      }}
                      style={otpBoxStyle(i)}
                      value={digits[i]?.trim() || ''}
                      onChangeText={text => handleDigitChange(text, i)}
                      onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(nativeEvent.key, i)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      placeholder="–"
                      placeholderTextColor={colors.neutrals[40]}
                      selectionColor={colors.primary.main}
                      editable={
                        otpStatus !== 'verifying' && otpStatus !== 'success'
                      }
                    />
                  ))}
                </View>

                {/* Status line */}
                {isOtpComplete && otpStatus === 'success' && (
                  <Text style={styles.otpStatusSuccess}>Email Verified</Text>
                )}
                {isOtpComplete && otpStatus === 'error' && (
                  <Text style={styles.otpStatusError}>
                    Please enter valid OTP
                  </Text>
                )}

                {/* Resend — hidden once verified */}
                {otpStatus !== 'success' &&
                  (resendCooldown > 0 ? (
                    <Text style={styles.resendCooldown}>
                      Resend OTP in {resendCooldown}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.resendContainer}
                      onPress={handleResendOtp}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* Password (sign-up phase 2) — read-only until email verified */}
              <Input
                label="Set Password"
                placeholder="••••••••"
                value={password}
                onChangeText={onUpdatePassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={emailVerified}
                leftIcon={
                  <LockSimpleIcon size={20} color={colors.neutrals[40]} />
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(v => !v)}
                    style={
                      showPassword
                        ? styles.eyeIconVisible
                        : styles.eyeIconHidden
                    }
                  >
                    <EyeIcon size={20} color={colors.neutrals[40]} />
                  </TouchableOpacity>
                }
              />

              {/* Password validation rules */}
              {password.length > 0 && emailVerified && (
                <View style={styles.validationContainer}>
                  {VALIDATION_RULES.map(rule => (
                    <View key={rule.key} style={styles.validationRow}>
                      <View
                        style={[
                          styles.validationDot,
                          validation[rule.key] && styles.validationDotMet,
                        ]}
                      />
                      <Text
                        style={[
                          styles.validationText,
                          validation[rule.key] && styles.validationTextMet,
                        ]}
                      >
                        {rule.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Confirm password — read-only until email verified */}
              <Input
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={emailVerified}
                status={
                  !emailVerified || confirmPassword.length === 0
                    ? 'default'
                    : confirmMatch
                    ? 'success'
                    : 'error'
                }
                errorText={
                  emailVerified && confirmPassword.length > 0 && !confirmMatch
                    ? 'Passwords do not match'
                    : undefined
                }
                leftIcon={
                  <LockSimpleIcon size={20} color={colors.neutrals[40]} />
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(v => !v)}
                    style={
                      showConfirmPassword
                        ? styles.eyeIconVisible
                        : styles.eyeIconHidden
                    }
                  >
                    <EyeIcon size={20} color={colors.neutrals[40]} />
                  </TouchableOpacity>
                }
              />
            </>
          )}

          {/* Primary button */}
          <Button
            label={otpVisible ? 'CONTINUE' : primaryButtonLabel}
            onPress={otpVisible ? onNext : handleEmailContinue}
            variant="primary"
            style={styles.button}
            disabled={isPrimaryDisabled || checkingEmail}
            loading={isLoading || checkingEmail}
          />

          {/* OR + Social (hidden once OTP step is active) */}
          {!otpVisible && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>
              <SocialButtonGroup
                onGoogle={onGoogle}
                onApple={onApple}
                showApple={showApple}
              />
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={onSecondaryAction}
          style={styles.secondaryActionCard}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryActionText}>
            {secondaryText}{' '}
            <Text style={styles.primaryText}>{secondaryActionText}</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.termsWrapper}>{footerContent}</View>
      </ScrollView>
    </BaseAuthLayout>
  );
};
