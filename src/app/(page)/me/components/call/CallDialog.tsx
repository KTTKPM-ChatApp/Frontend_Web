"use client";

import { useCallStore } from "@/src/common/store/useCallStore";
import CallDialog1vs1 from "./CallDialog1vs1";
import CallDialogGroup from "./CallDialogGroup";

export default function CallDialog() {
  const type = useCallStore((s) => s.type);
  const status = useCallStore((s) => s.status);

  if (status === "idle") return null;

  if (type === "GROUP") return <CallDialogGroup />;

  return <CallDialog1vs1 />;
}
