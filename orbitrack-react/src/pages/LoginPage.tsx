import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, ShieldCheck, UserRound, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelBody } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { useExecutiveSession } from "@/lib/useExecutiveSession";

export function LoginPage() {
  const { login, loading } = useExecutiveSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setWarning("");
    const result = await login(username, password);
    if (!result.ok) setError(result.error);
    else if (result.warning) setWarning(result.warning);
  };

  return (
    <div className="min-h-full bg-bg text-text grid place-items-center p-4">
      <div className="w-full max-w-[920px] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-4 items-stretch">
        <div className="hidden lg:flex border border-border bg-surface rounded-[var(--radius-md)] p-5 flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-text text-bg grid place-items-center text-[14px] font-bold">E</div>
            <div>
              <h1>Executive Black</h1>
              <p className="m-0 mt-2 text-text-muted max-w-[360px]">Welcome back. Sign in to continue.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            <div className="border border-border bg-raised rounded-[var(--radius-sm)] p-2">
              <div className="flex items-center gap-2 text-text-secondary">
                <Wifi size={13} />
                Live
              </div>
            </div>
            <div className="border border-border bg-raised rounded-[var(--radius-sm)] p-2">
              <div className="flex items-center gap-2 text-text-secondary">
                <ShieldCheck size={13} />
                Secure
              </div>
            </div>
            <div className="border border-border bg-raised rounded-[var(--radius-sm)] p-2">
              <div className="flex items-center gap-2 text-text-secondary">
                <UserRound size={13} />
                Synced
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="lg:hidden space-y-2">
            <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-text text-bg grid place-items-center text-[14px] font-bold">E</div>
            <div>
              <h1>Executive Black</h1>
              <p className="m-0 mt-1 text-text-muted">Welcome back. Sign in to continue.</p>
            </div>
          </div>

          <Panel className="rounded-[var(--radius-md)]">
            <PanelBody className="p-4">
              <form className="space-y-3" onSubmit={submit}>
                <div className="space-y-1">
                  <label htmlFor="login-username" className="text-text-muted text-[12px]">
                    Username or email
                  </label>
                  <div className="relative">
                    <UserRound size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="login-username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="username"
                      autoFocus
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="login-password" className="text-text-muted text-[12px]">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="login-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pl-8 pr-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-0.5 top-0.5"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="border border-danger/40 bg-danger/10 rounded-[var(--radius-sm)] p-2 text-danger flex gap-2">
                    <LockKeyhole size={14} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {warning && (
                  <div className="border border-warn/40 bg-warn/10 rounded-[var(--radius-sm)] p-2 text-warn flex gap-2">
                    <StatusDot tone="warn" className="mt-1.5" />
                    <span>{warning}</span>
                  </div>
                )}

                <Button variant="default" size="md" className="w-full" disabled={loading}>
                  {loading ? <Wifi size={14} className="animate-pulse" /> : <LogIn size={14} />}
                  {loading ? "Signing in" : "Sign in"}
                </Button>
              </form>
            </PanelBody>
          </Panel>

          <div className="text-[12px] text-text-muted text-center">Use the same account you use in Orbitrack.</div>
        </div>
      </div>
    </div>
  );
}
