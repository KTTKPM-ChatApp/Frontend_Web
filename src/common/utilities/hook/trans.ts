import { useTranslation } from 'react-i18next';

export const useTrans = () => {
  const { t, ready } = useTranslation();

  return (key: string, options?: Record<string, unknown>) => {
    try {
      // Return key if translation is not ready
      if (!ready) {
        return key;
      }

      const result = t(key, options);
      return result === key ? key : result;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  };
};
