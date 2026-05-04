"use client";

import { useState, useEffect } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslation } from "react-i18next";
import AppModal from "@/src/shared/component/AppModal";

const LANGUAGES = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

interface LanguageSwitcherProps {
  open?: boolean;
  onClose?: () => void;
}

export default function LanguageSwitcher({ open, onClose }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      setCurrentLang(savedLang);
    }
  }, [i18n]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
    localStorage.setItem("language", langCode);
    onClose?.();
  };

  const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLang) || LANGUAGES[0];

  return (
    <AppModal
      open={open ?? false}
      onClose={onClose ?? (() => {})}
      title={currentLanguage.flag + " " + currentLanguage.name}
      headerDivider
      actions={
        <Button onClick={onClose}>
          Close
        </Button>
      }
    >
      <Box sx={{ py: 2 }}>
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === currentLang}
            sx={{
              minWidth: 200,
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ mr: 2, fontSize: 24 }}>
              {lang.flag}
            </Typography>
            <Typography variant="body1">{lang.name}</Typography>
          </MenuItem>
        ))}
      </Box>
    </AppModal>
  );
}
