import { type LucideIcon } from "lucide-react";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";

interface ModulePageProps {
  title: string;
  group: string;
  icon: LucideIcon;
  priority: "Foundation" | "Operations" | "Reliability" | "Control" | "Advanced";
  rows: string[];
}

const PRIORITY_TONE: Record<ModulePageProps["priority"], "info" | "ok" | "warn" | "neutral"> = {
  Foundation: "info",
  Operations: "ok",
  Reliability: "warn",
  Control: "neutral",
  Advanced: "neutral",
};

export function ModulePage({ title, group, icon: Icon, priority, rows }: ModulePageProps) {
  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <h1>{title}</h1>
          <div className="text-text-muted text-[12px]">{group}</div>
        </div>
        <div className="flex-1" />
        <div className="h-7 px-2 border border-border bg-surface flex items-center gap-2 text-text-secondary">
          <StatusDot tone={PRIORITY_TONE[priority]} />
          <span>{priority}</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-3">
        <Panel>
          <PanelHeader>
            <PanelTitle>Operations Table</PanelTitle>
          </PanelHeader>
          <PanelBody className="p-0">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="h-8 px-3 text-left text-text-muted font-medium">Surface</th>
                  <th className="h-8 px-3 text-left text-text-muted font-medium">Status</th>
                  <th className="h-8 px-3 text-left text-text-muted font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row} className="border-b border-border last:border-b-0 hover:bg-hover">
                    <td className="h-10 px-3 text-text">{row}</td>
                    <td className="h-10 px-3 text-text-secondary">Mapped</td>
                    <td className="h-10 px-3 text-text-muted">Available</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader>
            <PanelTitle>Inspector</PanelTitle>
          </PanelHeader>
          <PanelBody className="space-y-3">
            <div className="flex items-center gap-2 text-text-secondary">
              <StatusDot tone={PRIORITY_TONE[priority]} />
              <span>{title}</span>
            </div>
            <div className="text-text-muted text-[12px] leading-5">
              This module is mapped into routing, permissions, command search, and the admin layout.
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
