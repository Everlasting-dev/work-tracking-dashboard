export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 shrink-0 border-b border-border px-4 flex items-center">
        <h1 className="text-[15px] font-semibold">{title}</h1>
      </div>
      <div className="flex-1 grid place-items-center text-center">
        <div className="space-y-1">
          <p className="text-text-secondary">{title} — coming in the redesign</p>
          <p className="text-text-muted text-xs">This screen is part of the Octane rewrite roadmap.</p>
        </div>
      </div>
    </div>
  );
}
