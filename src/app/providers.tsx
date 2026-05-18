"use client";

import "@/src/common/i18n/i18n";
import LanguageProvider from "@/src/common/context/LanguageContext";
import EmotionRegistry from "./EmotionRegistry";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </EmotionRegistry>
  );
}