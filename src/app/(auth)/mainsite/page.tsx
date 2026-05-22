"use client";

import dynamic from "next/dynamic";

const MainSiteView = dynamic(() => import("./MainSiteView"), { ssr: false });

export default function MainSitePage() {
  return <MainSiteView />;
}
