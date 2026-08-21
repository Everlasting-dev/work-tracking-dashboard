import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";

function RouteLoadingFallback({ label = "Executive Black" }: { label?: string }) {
  return (
    <div className="h-full min-h-[320px] grid place-items-center bg-bg text-text">
      <div className="w-[320px] max-w-[calc(100vw-32px)] rounded-[var(--radius-lg)] border border-border/70 bg-surface/70 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-accent text-bg grid place-items-center text-[13px] font-bold">E</div>
          <div className="min-w-0">
            <div className="font-semibold truncate">Opening {label}</div>
            <div className="text-[12px] text-text-muted">Preparing the workspace</div>
          </div>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-hover">
          <div className="h-full w-1/2 rounded-full bg-accent motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}

class RouteErrorBoundary extends Component<
  { children: ReactNode; label: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Route failed to load: ${this.props.label}`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full min-h-[320px] grid place-items-center bg-bg p-4 text-text">
          <div className="max-w-md rounded-[var(--radius-lg)] border border-border/70 bg-surface/80 p-5">
            <h1 className="text-[18px]">Could not open {this.props.label}</h1>
            <p className="m-0 mt-2 text-text-secondary">
              The route chunk failed to load. Try refreshing the app; your data was not changed.
            </p>
            <pre className="mt-4 max-h-32 overflow-auto rounded-[var(--radius-sm)] bg-raised p-3 text-[12px] text-text-muted">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function LazyRouteBoundary({ label, children }: { label: string; children: ReactNode }) {
  return (
    <RouteErrorBoundary label={label}>
      <Suspense fallback={<RouteLoadingFallback label={label} />}>{children}</Suspense>
    </RouteErrorBoundary>
  );
}
