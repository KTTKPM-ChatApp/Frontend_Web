// TODO: Replace with your new phone authentication system
// Firebase phone authentication has been removed - implement your new phone auth system here

export const setupRecaptcha = async (
  containerId: string,
  onSuccess?: () => Promise<void>,
  onExpired?: () => void
) => {
  console.log('setupRecaptcha called - implement for new backend');
  return null;
};

export const resetRecaptchaCheckbox = () => {
  console.log('resetRecaptchaCheckbox called - implement for new backend');
};

export const sendOtp = async (phoneE164: string): Promise<any> => {
  console.log('sendOtp called with:', phoneE164);
  throw new Error('sendOtp not implemented - update for new backend');
};

export const verifyOtp = async (confirmation: any, otp: string) => {
  console.log('verifyOtp called with:', { confirmation, otp });
  throw new Error('verifyOtp not implemented - update for new backend');
};

export const clearRecaptcha = () => {
  console.log('clearRecaptcha called - implement for new backend');
};