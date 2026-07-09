import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  EnvelopeSimpleIcon,
  LockSimpleIcon,
  EyeIcon,
} from 'phosphor-react-native';
import { BaseAuthLayout } from '../../../components/auth/BaseAuthLayout';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import {
  validateEmail,
  getPasswordValidation,
  isPasswordValid,
} from '../../../utils/validation';
import { authService } from '../../../services/auth.service';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface ResetEmailScreenProps {
  onBack: () => void;
  onDone: () => void;
}

type OtpStatus = 'idle' | 'verifying' | 'success' | 'error';

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

export const ResetEmailScreen: React.FC<ResetEmailScreenProps> = ({
  onBack,
  onDone,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle');
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);
  const digits = otp.padEnd(4, '').split('').slice(0, 4);

  const validation = getPasswordValidation(password);
  const passwordValid = isPasswordValid(validation);
  const confirmMatch =
    confirmPassword === password && confirmPassword.length > 0;
  const isOtpComplete = otp.replace(/\s/g, '').length === 4;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleContinue = async () => {
    try {
      setSending(true);
      setEmailError(undefined);
      await authService.forgotPassword({ email });
      setOtpVisible(true);
      setResendCooldown(30);
    } catch (err: any) {
      const detail = err?.response?.data?.error?.details?.[0]?.message;
      setEmailError(detail ?? 'Unable to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    try {
      setOtpStatus('verifying');
      await authService.verifyResetOtp(email, otpValue);
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
    setOtp('');
  };

  const handleResendOtp = async () => {
    setOtpStatus('idle');
    setEmailVerified(false);
    setOtp('');
    try {
      await authService.forgotPassword({ email });
      setResendCooldown(30);
    } catch {
      // silently ignore
    }
  };

  const handleDigitChange = async (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newOtp = newDigits.join('').replace(/\s/g, '');
    setOtp(newOtp);
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
        setOtp(newDigits.join('').replace(/\s/g, ''));
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

  const handleReset = async () => {
    try {
      setResetting(true);
      await authService.resetPassword({ email, otp, new_password: password });
      onDone();
    } catch (err: any) {
      const detail = err?.response?.data?.error?.details?.[0]?.message;
      setEmailError(detail ?? 'Failed to reset password. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const isPrimaryDisabled = otpVisible
    ? !emailVerified || !passwordValid || !confirmMatch
    : !validateEmail(email);

  return (
    <BaseAuthLayout
      title="Reset Password"
      subtitle="We'll send you an OTP on your email"
      onBack={onBack}
    >
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
              setEmail(val);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!otpVisible}
            status={emailError ? 'error' : 'default'}
            errorText={emailError}
            leftIcon={
              <EnvelopeSimpleIcon size={20} color={colors.neutrals[40]} />
            }
          />

          {/* OTP section */}
          {otpVisible && (
            <>
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

                {isOtpComplete && otpStatus === 'success' && (
                  <Text style={styles.otpStatusSuccess}>Email Verified</Text>
                )}
                {isOtpComplete && otpStatus === 'error' && (
                  <Text style={styles.otpStatusError}>
                    Please enter valid OTP
                  </Text>
                )}

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

              {/* New Password — locked until OTP verified */}
              <Input
                label="New Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
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

              {/* Confirm Password — locked until OTP verified */}
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

          <Button
            label="CONTINUE"
            onPress={otpVisible ? handleReset : handleContinue}
            variant="primary"
            style={styles.button}
            disabled={isPrimaryDisabled || sending || resetting}
            loading={sending || resetting}
          />
        </View>
      </ScrollView>
    </BaseAuthLayout>
  );
};
