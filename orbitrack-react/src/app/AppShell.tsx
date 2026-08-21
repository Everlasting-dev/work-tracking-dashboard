import { lazy, Suspense, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useExecutiveSession } from "@/lib/useExecutiveSession";

const AdminCommandPalette = lazy(() => import("@/components/command/AdminCommandPalette").then((module) => ({ default: module.AdminCommandPalette })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })));

function ShellLoading({ label }: { label: string }) {
  return (
    <div className="h-full grid place-items-center bg-bg text-text-muted">
      <div className="space-y-2 text-center">
        <div className="h-8 w-8 rounded-[var(--radius-sm)] border border-border bg-surface mx-auto animate-pulse" />
        <div>{label}</div>
      </div>
    </div>
  );
}

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false);
  const { session, loading } = useExecutiveSession();

  useHotkeys("ctrl+k, meta+k", () => setCommandOpen(true), { preventDefault: true, enableOnFormTags: true });

  if (loading) {
    return <ShellLoading label="Opening Executive Black" />;
  }

  if (!session) {
    return (
      <Suspense fallback={<ShellLoading label="Opening sign in" />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <div className="flex h-full bg-bg text-text">
      <Sidebar />
      <div className="flex-1 min-w-0 h-full flex flex-col">
        <TopBar onOpenCommand={() => setCommandOpen(true)} />
        <main className="flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
      {commandOpen && (
        <Suspense fallback={null}>
          <AdminCommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </Suspense>
      )}
    </div>
  );
}
