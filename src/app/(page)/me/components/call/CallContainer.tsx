"use client";

import { useCallStore } from "@/src/common/store/useCallStore";
import IncomingCallScreen from "./IncomingCallScreen";
import CallingScreen from "./CallingScreen";
import ActiveCallScreen from "./ActiveCallScreen";

export default function CallContainer() {
  const screen = useCallStore((s) => s.screen);

  if (screen === "idle" || screen === "ended") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "#000",
      }}
    >
      {screen === "incoming" && <IncomingCallScreen />}
      {screen === "calling" && <CallingScreen />}
      {(screen === "connecting" || screen === "active") && <ActiveCallScreen />}
    </div>
  );
}
