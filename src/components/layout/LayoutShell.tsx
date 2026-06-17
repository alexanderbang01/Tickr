"use client";

import { useState, Suspense } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { PostModalHandler } from "@/components/post/PostModalHandler";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-60 pt-14 min-h-screen">{children}</div>
      <Suspense>
        <PostModalHandler />
      </Suspense>
    </>
  );
}
