"use client";

import { Box, Button, Grid, MenuItem, Select, Stack, Tab, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { TabList, TabPanel } from "@mui/lab";

/* ===== Layout ===== */
export const Page = styled(Stack)({
    minHeight: "100vh",
    backgroundColor: "#E8F3FF",
});

export const Content = styled(Stack)({
    width: "100%",
    maxWidth: 580,
    margin: "32px auto",
    alignItems: "center",
    padding: "0 16px",
});

export const LogoWrap = styled(Box)({
    display: "flex",
    justifyContent: "center",
});

export const Subtitle = styled(Typography)({
    textAlign: "center",
    color: "#333333",
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.4,
    whiteSpace: "pre-line",
});

export const Card = styled(Box)({
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    minHeight: "clamp(520px, 70vh, 620px)",
});

export const TabContainer = styled(Box)({
    display: "flex",
    flexDirection: "column",
    flex: 1,
});

export const CardHeader = styled(Box)({
    display: "flex",
    justifyContent: "center",
    borderBottom: "1px solid #EEF2F7",
});

/* ===== Tabs ===== */
export const Tabs = styled(TabList)({
    minHeight: 52,
    "& .MuiTabs-flexContainer": {
        justifyContent: "center",
        gap: 12,
    },
    "& .MuiTabs-indicator": {
        backgroundColor: "#0573ff",
        height: 3,
        borderRadius: 3,
    },
});

export const TabItem = styled(Tab)({
    textTransform: "none",
    fontWeight: 700,
    fontSize: 16,
    minHeight: 52,
    padding: "0 12px",
    color: "#111827",
    "&.Mui-selected": {
        color: "#0573ff",
    },
});

export const Panel = styled(TabPanel)({
    flex: 1,
    padding: "24px 24px 28px",
    display: "flex",
    flexDirection: "column",
});

export const PrefixSelect = styled(Select)({
    width: "fit-content",
    fontSize: 14,

    "& .MuiOutlinedInput-root": {
        padding: 0,
        display: "flex",
        alignItems: "center",
        transition: "background-color 0.2s ease",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },

    "& .MuiOutlinedInput-root:hover": { backgroundColor: "#E8F0FE" },
    "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#E8F0FE" },

    "& .MuiInputBase-input": { padding: "8px" },
    "& .MuiOutlinedInput-input": { padding: "8px" },

    "& .MuiSelect-select": {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "8px 24px 8px 8px",
    },
    "& .MuiSelect-icon": { right: 8 },
});

export const CountryItem = styled(MenuItem)({
    padding: "8px 16px",
});

export const CountryRow = styled(Box)({
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
});

export const CountryName = styled(Typography)({
    fontSize: 14,
    color: "#111827",
});

export const CountryDial = styled(Typography)({
    color: "#6B7280",
});

export const AuthTextField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        height: "100%",
        padding: 0,
        fontSize: 14,
        borderRadius: 10,
        backgroundColor: "transparent",
    },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },

    "& .MuiInputBase-input": { padding: "0px" },
    "& .MuiOutlinedInput-input": { padding: "8px" },

    /* ===== Autofill fix ===== */
    "& input:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px #fff inset",
        WebkitTextFillColor: "#111827",
        caretColor: "#111827",
        transition: "background-color 9999s ease-out 0s",
    },


});

export const GridPswFrm = styled(Grid)({
    alignItems: "stretch",
    borderBottom: "1px solid #E0E0E0",
});


export const GridIcon = styled(Grid)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

export const LoginButton = styled(Button)({
    backgroundColor: "#0190f3",
    color: "#fff",
    height: 40,
    borderRadius: 24,
    textTransform: "none",
    fontWeight: 600,
    fontSize: 16,
    boxShadow: "none",

    "&:hover": { backgroundColor: "#007fe0", boxShadow: "none" },
    "&:active": { backgroundColor: "#006fcc" },
    "&:disabled": { backgroundColor: "#bcdcff", color: "#fff" },
});

export const Forgot = styled(Typography)({
    fontSize: 14,
    display: "flex",
    justifyContent: "center",
    color: "#A7A7A7",
    fontWeight: 600,
    cursor: "pointer",
    userSelect: "none",
    "&:hover": { textDecoration: "underline" },
});

export const ToRegisPage = styled(Forgot)({
    color: "#006fcc",
});
export const AuthHeader = styled(Typography)({
    fontSize: 18,
    fontWeight: 700,
    color: "#0573ff",
    padding: "14px 0",
    textAlign: "center",
});

/* ===== Menu props xài chung ===== */
export const countryMenuProps = {
    anchorOrigin: { vertical: "bottom", horizontal: "left" } as const,
    transformOrigin: { vertical: "top", horizontal: "left" } as const,
    disablePortal: true,
    PaperProps: {
        sx: {
            mt: 1,
            maxHeight: 360,
            borderRadius: "12px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        },
    },
};
export const StyledGenderSelect = styled(Select)(({ theme }) => ({
    height: 42,
    borderRadius: 10,
    backgroundColor: "#fff",

    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#E5E7EB",
    },

    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#90CAF9",
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#1976D2",
        borderWidth: 1.5,
    },

    "& .MuiSelect-select": {
        padding: "10px 12px",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
    },

    "& .MuiSelect-icon": {
        color: "#9CA3AF",
    },
}));
export const StyledGenderItem = styled(MenuItem)({
    fontSize: 14,
    padding: "10px 14px",
    borderRadius: 8,
    margin: "4px 8px",

    "&.Mui-selected": {
        backgroundColor: "#E3F2FD",
        color: "#1976D2",
        fontWeight: 600,
    },

    "&.Mui-selected:hover": {
        backgroundColor: "#BBDEFB",
    },
});

export const HelperTextAuth = styled(Typography)(({ theme }) => ({
    fontSize: "11px",
    lineHeight: 1.2,
    color: theme.palette.error.main, 
    marginTop: "8px",
}));
