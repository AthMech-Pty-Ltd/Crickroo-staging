export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const getPasswordValidation = (
  password: string,
): PasswordValidation => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[!@#$%^&*()\-_=+\[\]{}|;:'",.<>?/`~\\]/.test(password),
});

export const isPasswordValid = (v: PasswordValidation): boolean =>
  v.minLength &&
  v.hasUppercase &&
  v.hasLowercase &&
  v.hasNumber &&
  v.hasSpecial;
