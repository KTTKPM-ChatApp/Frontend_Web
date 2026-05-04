import { useTranslation } from 'react-i18next';

export const useTrans = (): ((key: string, options?: Record<string, any>) => string) => {
  const { t, ready } = useTranslation();

  return (key: string, options?: Record<string, any>): string => {
    try {
      // Return key if translation is not ready
      if (!ready) {
        return key;
      }

      const result = options ? t(key, options) : t(key);
      // Ensure we always return a string
      if (typeof result === 'string') {
        return result;
      }
      // If result is an object (from interpolation), convert to string
      return String(result);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  };
};
