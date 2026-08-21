import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Command, FolderKanban, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";

const STEPS = [
  { title: "Confirm secure sign-in", detail: "Use Supabase Auth-backed accounts before inviting public users.", icon: ShieldCheck },
  { title: "Create the first project", detail: "Add owners, tasks, files, and a simple report cadence.", icon: FolderKanban },
  { title: "Invite the team", detail: "Assign roles and verify project visibility before sharing data.", icon: Users },
  { title: "Learn command search", detail: "Use Ctrl+K to jump to records and actions without leaving the keyboard.", icon: Command },
];

export function OnboardingPage() {
  return (
    <div className="orbit-page">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] uppercase tracking-[0.18em] text-text-muted">First-run setup</div>
          <h1 className="mt-2">Set Up Orbitrack</h1>
          <p className="m-0 mt-1 max-w-[680px] text-text-muted">
            A short operational checklist for a clean, secure workspace before public rollout.
          </p>
        </div>
        <Button asChild variant="default">
          <Link to={"/projects" as never}>
            Open projects
            <ArrowRight size={14} />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <Panel key={step.title}>
              <PanelHeader>
                <Icon size={15} />
                <PanelTitle>{step.title}</PanelTitle>
                <div className="flex-1" />
                <span className="text-[12px] text-text-muted tabular-nums">0{index + 1}</span>
              </PanelHeader>
              <PanelBody className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 text-ok" />
                <p className="m-0 text-text-secondary">{step.detail}</p>
              </PanelBody>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
