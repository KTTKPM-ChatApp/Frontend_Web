"use client";

import { useEffect } from "react";
import "@/src/common/i18n/i18n";
import LanguageProvider from "@/src/common/context/LanguageContext";
import EmotionRegistry from "./EmotionRegistry";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="colored"
        />
      </LanguageProvider>
    </EmotionRegistry>
  );
}
