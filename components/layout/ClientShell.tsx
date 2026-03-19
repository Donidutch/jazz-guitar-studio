"use client";

import { AudioProvider } from "@/components/audio/AudioProvider";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

function ShellInner({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <ShellInner>{children}</ShellInner>
    </AudioProvider>
  );
}
