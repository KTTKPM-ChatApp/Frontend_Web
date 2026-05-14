"use client";

import "@/src/common/i18n/i18n";
import LanguageProvider from "@/src/common/context/LanguageContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}