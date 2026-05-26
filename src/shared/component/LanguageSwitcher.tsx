"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemText,
  Radio,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useLanguageContext } from "@/src/common/context/LanguageContext";
import i18n from "@/src/common/i18n/i18n";

const LanguageItem = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  margin: "4px 0",
  padding: "12px 16px",
  justifyContent: "flex-start",
  textTransform: "none",
  backgroundColor: "transparent",
  border: "1px solid #E5E7EB",
  "&:hover": {
    backgroundColor: "#F8FAFC",
    borderColor: "#D1D5DB",
  },
}));

interface LanguageSwitcherProps {
  open: boolean;
  onClose: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { changeLanguage: contextChangeLanguage } = useLanguageContext();
  const [selectedLanguage, setSelectedLanguage] = React.useState(i18n.language);

  const languages = [
    { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
    { code: "en", name: "English", nativeName: "English" },
  ];

  React.useEffect(() => {
    setSelectedLanguage(i18n.language);
  }, [open]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleConfirm = () => {
    if (selectedLanguage !== i18n.language) {
      contextChangeLanguage(selectedLanguage);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
        {t("COMMON.LANGUAGE")}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 1 }}>
          {languages.map((language) => (
            <LanguageItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              variant={selectedLanguage === language.code ? "contained" : "outlined"}
              color={selectedLanguage === language.code ? "primary" : "inherit"}
              sx={{
                backgroundColor: selectedLanguage === language.code ? "#E5F1FF" : "transparent",
                borderColor: selectedLanguage === language.code ? "#005AE0" : "#E5E7EB",
                "&:hover": {
                  backgroundColor: selectedLanguage === language.code ? "#E5F1FF" : "#F8FAFC",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {language.nativeName}
                </Typography>
                <Typography variant="body2" color="#64748B">
                  {language.name}
                </Typography>
              </Box>
              {selectedLanguage === language.code && (
                <Radio
                  checked={true}
                  sx={{ ml: 2 }}
                  color="primary"
                />
              )}
            </LanguageItem>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          {t("COMMON.BACK")}
        </Button>
        <Button onClick={handleConfirm} variant="contained">
          {t("COMMON.CONFIRM")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LanguageSwitcher;
