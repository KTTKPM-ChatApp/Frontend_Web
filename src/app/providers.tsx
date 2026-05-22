"use client";

import { useEffect } from "react";
import "@/src/common/i18n/i18n";
import LanguageProvider from "@/src/common/context/LanguageContext";
import EmotionRegistry from "./EmotionRegistry";
import { useAuthStore } from "@/src/common/store/useAuthStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 > Date.now()) return;
    } catch {}
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUserId");
    useAuthStore.getState().resetAuth();
  }, []);

  return (
    <EmotionRegistry>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </EmotionRegistry>
  );
}