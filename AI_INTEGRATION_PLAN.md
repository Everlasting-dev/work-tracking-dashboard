# AI Integration Plan — WorkTracker

> Status: **Planned** · Last updated: 2026-06-03

---

## Current State

The "AI Report" button on the Reports page already:
1. Compiles a structured JSON payload (project data, task counts, department breakdown, user breakdown) for the selected month.
2. POSTs it to a Supabase Edge Function at `{supabaseUrl}/functions/v1/generate-report`.
3. Expects `{ html: "..." }` back and renders it in an iframe modal.

The edge function does **not yet exist** in `supabase/` — that is the first thing to build.

---

## Phase 1 — Complete the AI Monthly Report (Edge Function)

### File to create: `supabase/functions/generate-report/index.ts`

```typescript
import Anthropic from "npm:@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  const payload = await req.json();
  const { month, summary, projects, departmentBreakdown, userBreakdown } = payload;

  const prompt = `You are a project management analyst. Generate a polished, professional monthly report for ${month}.

DATA:
${JSON.stringify({ summary, projects, departmentBreakdown, userBreakdown }, null, 2)}

Write a complete, self-contained HTML page with:
- Inline CSS (dark-on-white, clean sans-serif, similar to a Notion export)
- An executive summary paragraph (3–5 sentences, highlight wins and risks)
- A stats overview (ongoing, started, completed counts)
- A projects table with status, owner, department, progress %, overdue tasks
- A department breakdown section
- A people section showing who carried the most load
- A risks/attention section if any projects are >7 days overdue or stalled at 0%

Return ONLY the raw HTML — no markdown fences, no commentary.`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const html = (message.content[0] as { text: string }).text;

  return new Response(JSON.stringify({ html }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
```

### Environment variable to set in Supabase dashboard:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### Deploy command:
```bash
supabase functions deploy generate-report
```

---

## Phase 2 — Smart Task Summaries on Project Detail

**Where:** Project detail page, below the hero section.  
**Trigger:** "Summarize" button (admin/owner only).  
**What it does:** Sends all tasks (title, status, priority, due date, assignee) to Claude and gets back a 2–3 sentence plain-English health summary.

### New edge function: `supabase/functions/summarize-project/index.ts`

Prompt template:
```
You are a project manager assistant. Given these tasks for project "{name}", write a 2–3 sentence plain-English status summary that:
- States how far along the project is
- Calls out any overdue or high-priority items that need attention
- Notes if the project looks on track or at risk

Tasks: {tasksJson}

Return ONLY the summary text, no headers, no markdown.
```

**UI integration in `app.js`:**  
Inside `renderProjectDetail()`, add a small "✦ Summarize" ghost button in the hero actions. On click, call the edge function, then inject the result into a `.project-ai-summary` div beneath the hero with a subtle indigo-left-border style card.

---

## Phase 3 — Natural Language Task Search

**Where:** Global tasks page (`#/tasks`), alongside the existing filter bar.  
**Trigger:** A search input with a ✦ icon prefix; user types a natural language query like "show me overdue high-priority tasks assigned to Ahmed".  
**What it does:** Sends the query + all task metadata (client-side only, no edge function needed) to Claude with a prompt that returns a filtered list of task IDs.

Since this runs against the already-loaded task list, it can use the **Anthropic JS SDK directly in the browser** (gated behind an admin-set API key stored in localStorage for local mode, or via an edge function proxy in cloud mode).

Prompt template:
```
You are a task filter engine. Given a natural language query and a list of tasks (as JSON), return a JSON array of task IDs that match the query. Return ONLY valid JSON — an array of numbers.

Query: "{query}"
Tasks: {tasksJson}
```

---

## Phase 4 — Meeting Notes → Tasks (Bulk Import)

**Where:** New "Import from Notes" button in the project task tab toolbar.  
**What it does:** Opens a textarea modal. User pastes meeting notes or a bullet list. Claude extracts structured tasks (title, priority, suggested assignee by name, suggested due date).  
**Returns:** A preview list of tasks the user can review, check/uncheck, then bulk-create.

### Edge function: `supabase/functions/extract-tasks/index.ts`

Prompt template:
```
Extract actionable tasks from the following meeting notes. For each task, return:
- title (string, concise imperative like "Update the shipping manifest")
- priority: "low" | "medium" | "high" | "urgent"
- assignee_hint: person's name mentioned near the task, or null
- due_hint: relative date mentioned ("next Friday", "end of month"), or null

Return a valid JSON array of objects. Return ONLY JSON, no other text.

Notes:
{notes}
```

---

## Phase 5 — Predictive Overdue Alerts (Scheduled)

**Where:** Supabase cron job (pg_cron) or a scheduled Edge Function.  
**Trigger:** Runs nightly at 08:00 UTC.  
**What it does:** Fetches all open tasks with due dates, sends them to Claude, and asks it to flag which tasks are at risk of being late based on pattern (assigned but 0% progress, overdue by >3 days, etc.). Creates in-app notifications for the owners.

### Cron setup in `supabase/schema.sql`:
```sql
select cron.schedule(
  'nightly-overdue-check',
  '0 8 * * *',
  $$select net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/check-overdue',
    headers := '{"Authorization": "Bearer " || current_setting("app.service_role_key")}'
  )$$
);
```

---

## Implementation Priority

| Phase | Feature | Effort | Impact |
|-------|---------|--------|--------|
| 1 | Monthly AI Report (edge fn) | Low — ~50 lines | High — already wired in UI |
| 2 | Project summarize button | Medium | High — visible per-project |
| 3 | NL task search | Medium | Medium |
| 4 | Meeting notes → tasks | High | High |
| 5 | Nightly overdue alerts | High | Medium |

**Start with Phase 1** — the frontend is already complete, the edge function just needs to be written and deployed.

---

## Cost Estimate (Claude claude-opus-4-8)

| Feature | Avg tokens/call | Calls/month (est.) | Monthly cost |
|---------|----------------|-------------------|--------------|
| AI Report | ~3,000 in / ~2,500 out | 20 | ~$1.60 |
| Project summaries | ~800 in / ~200 out | 50 | ~$0.30 |
| NL search | ~2,000 in / ~100 out | 100 | ~$1.00 |
| Meeting import | ~1,500 in / ~500 out | 30 | ~$0.45 |
| **Total** | | | **~$3.35/mo** |

Costs based on Anthropic pricing as of June 2026. Switch to `claude-haiku-4-5-20251001` for search/summaries to cut cost by ~85% with minimal quality loss.
