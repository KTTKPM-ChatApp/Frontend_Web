import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/src/locales/en.json";
import vi from "@/src/locales/vi.json";

// Get saved language from localStorage (for client-side only)
const getSavedLanguage = () => {
  if (typeof window !== "undefined") {
    const savedLang = localStorage.getItem("language");
    if (savedLang && ["vi", "en"].includes(savedLang)) {
      return savedLang;
    }
  }
  return "vi"; // default
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    vi: {
      translation: vi
    }
  },
  lng: getSavedLanguage(),
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false
  }
});

// On client side, change language if there's a saved preference
if (typeof window !== "undefined") {
  const savedLang = localStorage.getItem("language");
  if (savedLang && ["vi", "en"].includes(savedLang) && savedLang !== i18n.language) {
    i18n.changeLanguage(savedLang);
  }
}

export default i18n;