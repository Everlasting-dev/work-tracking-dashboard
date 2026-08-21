import { QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, createTheme } from "@mantine/core";
import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { LiveSyncProvider } from "@/app/LiveSyncProvider";
import { queryClient } from "@/lib/queryClient";
import { SessionProvider } from "@/lib/session";

const theme = createTheme({
  primaryColor: "green",
  defaultRadius: "sm",
  fontFamily: "Inter, Geist, system-ui, -apple-system, sans-serif",
  headings: {
    fontFamily: "Inter, Geist, system-ui, -apple-system, sans-serif",
    fontWeight: "700",
  },
  colors: {
    orbit: [
      "#f2fbf3",
      "#dff3e2",
      "#bddfc4",
      "#96c8a1",
      "#75b684",
      "#5faa70",
      "#529f64",
      "#438a53",
      "#377347",
      "#2c5e3a",
    ],
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <SessionProvider>
          <LiveSyncProvider>{children}</LiveSyncProvider>
          <Toaster theme="dark" position="bottom-right" toastOptions={{ className: "border border-border bg-surface text-text" }} />
        </SessionProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
