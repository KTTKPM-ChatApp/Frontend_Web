import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/src/locales/en.json";
import vi from "@/src/locales/vi.json";

const defaultLanguage = "vi";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    vi: {
      translation: vi
    }
  },
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  }
});

if (typeof window !== "undefined") {
  const savedLang = localStorage.getItem("language");
  if (savedLang && ["vi", "en"].includes(savedLang)) {
    i18n.changeLanguage(savedLang);
  }
}

export default i18n;
