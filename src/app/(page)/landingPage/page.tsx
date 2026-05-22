"use client";

import dynamic from "next/dynamic";

const LandingPageView = dynamic(() => import("./LandingPageView"), { ssr: false });

export default function LandingPage() {
  return <LandingPageView />;
}
