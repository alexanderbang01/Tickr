import { LayoutShell } from "@/components/layout/LayoutShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app">
      <LayoutShell>{children}</LayoutShell>
    </div>
  );
}
