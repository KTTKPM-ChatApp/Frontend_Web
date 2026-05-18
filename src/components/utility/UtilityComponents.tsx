// UTILITY COMPONENTS - UI ONLY (No Logic/Handlers)
// ==============================================

// LANGUAGE SWITCHER COMPONENT
// ===========================
import { Box, Button, Menu, MenuItem, Typography, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CloseIcon from "@mui/icons-material/Close";

const LANGUAGES = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

interface LanguageSwitcherProps {
  open?: boolean;
  onClose?: () => void;
}

// LanguageSwitcher Component UI Structure
export const LanguageSwitcherUI = {
  // Modal version
  modal: (
    <Dialog open={true} onClose={() => {}} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6">🇻🇳 Tiếng Việt</Typography>
        </Box>
        <IconButton onClick={() => {}} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => {}}
              selected={lang.code === "vi"}
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
      </DialogContent>
    </Dialog>
  ),

  // Dropdown version
  dropdown: (
    <Box>
      <Button
        variant="text"
        startIcon={<LanguageIcon />}
        onClick={() => {}}
        sx={{ textTransform: "none" }}
      >
        🇻🇳 Tiếng Việt
      </Button>

      <Menu
        open={true}
        onClose={() => {}}
        anchorEl={null}
        PaperProps={{
          sx: {
            minWidth: 200,
          },
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => {}}
            selected={lang.code === "vi"}
          >
            <Typography variant="body2" sx={{ mr: 2, fontSize: 20 }}>
              {lang.flag}
            </Typography>
            <Typography variant="body2">{lang.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  ),

  // Compact button version
  compact: (
    <Button
      variant="outlined"
      size="small"
      startIcon={<LanguageIcon />}
      onClick={() => {}}
      sx={{ textTransform: "none" }}
    >
      🇻🇳
    </Button>
  ),

  // Icon only version
  iconOnly: (
    <IconButton onClick={() => {}} size="small">
      <LanguageIcon />
    </IconButton>
  )
};

// TYPING INDICATOR COMPONENT
// ==========================
import React, { useState, useEffect } from "react";

interface TypingIndicatorProps {
  text: string;
}

// TypingIndicator Component UI Structure
export const TypingIndicatorUI = {
  // Standard typing indicator
  standard: (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "8px 16px" }}>
      <div style={{
        background: "linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))",
        padding: "10px 16px",
        borderRadius: "16px",
        borderBottomLeftRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        border: "1px solid rgb(219 234 254)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "rgb(29 78 216)", margin: 0 }}>
            Someone is typing
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "4px" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "rgb(59 130 246)",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  animation: 'typingBounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                  WebkitAnimation: 'typingBounce 1.4s ease-in-out infinite',
                  WebkitAnimationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  ),

  // Minimal typing indicator
  minimal: (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "8px 16px" }}>
      <span style={{ fontSize: "12px", color: "#6b7280" }}>typing</span>
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "#9ca3af",
              animation: 'typingBounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  ),

  // Dark mode typing indicator
  darkMode: (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "8px 16px" }}>
      <div style={{
        background: "linear-gradient(to bottom right, rgb(31 41 55), rgb(55 65 81))",
        padding: "10px 16px",
        borderRadius: "16px",
        borderBottomLeftRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
        border: "1px solid rgb(75 85 99)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "rgb(147 197 253)", margin: 0 }}>
            Someone is typing
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "4px" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "rgb(96 165 250)",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.2)",
                  animation: 'typingBounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  ),

  // Custom text typing indicator
  customText: (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "8px 16px" }}>
      <div style={{
        background: "linear-gradient(to bottom right, rgb(239 246 255), rgb(224 231 255))",
        padding: "10px 16px",
        borderRadius: "16px",
        borderBottomLeftRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        border: "1px solid rgb(219 234 254)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "rgb(29 78 216)", margin: 0 }}>
            John is typing...
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "4px" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "rgb(59 130 246)",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  animation: 'typingBounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
};
