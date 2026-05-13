# Personal Job and Research Tracking System Plan

## Recommendation

Build this as a personal work operating system, not just a to-do list. The core idea should be:

`Project/Research Item -> Milestones -> Tasks/Experiments -> Updates/Evidence -> Auto Progress`

That gives you one place to track:

- normal execution work
- ongoing research
- ideas that are not yet fully defined
- milestone-based progress that updates automatically

## What Similar Tools Do Well

The best products all use the same backbone, with slightly different emphasis:

- Asana connects goals/projects to tasks and can update goal progress automatically from linked work. It also separates `progress` from `health/status`, which is a good pattern for you.
- Linear uses fixed cycles and a target progress line, which is useful if you want momentum tracking instead of only "done/not done."
- Notion's relation + rollup model is a strong proof that relational links between tasks and projects are enough to compute useful progress.
- Vikunja supports manual task progress, checklists, relations, and multiple views; that shows manual override is still important even when automation exists.
- Leantime treats milestones as dated bundles of tasks and adds a "blueprint" layer for why a project exists, which is especially relevant for research projects.
- OpenProject combines boards with Gantt/timeline planning, which is useful once projects become date-driven.

## Research Conclusion

Your best version is a hybrid of those ideas:

- `Asana/Notion` style structure
- `Linear` style momentum/cadence
- `Leantime` style project-purpose and research framing
- `OpenProject` style timeline view only when needed

For a solo system, the mistake to avoid is building too much PM overhead. The system should optimize for:

- fast capture
- clear next action
- visible milestone progress
- lightweight weekly review
- room for messy research notes

## Proposed Product Model

Use 5 main objects:

- `Workspace Item`
  A top-level thing you are tracking: job search, client work, product build, research topic, learning track.
- `Milestone`
  A meaningful checkpoint: proposal drafted, literature review complete, MVP shipped, 10 applications sent.
- `Task`
  Concrete actionable work. Can belong to a milestone or directly to a workspace item.
- `Update`
  Short log entry: what changed today, blockers, next step, confidence, links.
- `Evidence`
  Files, links, notes, papers, screenshots, references, outcomes.

Add these key fields:

- Title
- Type: `task`, `project`, `research`, `job-search`, `idea`
- Status: `backlog`, `active`, `blocked`, `waiting`, `done`, `archived`
- Priority
- Due date
- Effort
- Weight
- Progress %
- Confidence/health
- Tags
- Related items
- Last updated at

## How Progress Should Work

Use a weighted roll-up model:

- Task progress:
  `0/25/50/75/100` or checklist-based completion
- Milestone progress:
  weighted average of child tasks
- Project progress:
  weighted average of milestone progress
- Research project progress:
  mix of milestone completion + evidence count + recent updates

Recommended rule set:

- If a task has checklist items, progress comes from checklist completion.
- If not, progress is manual.
- Milestone completes only when all required child tasks are done.
- Project `health` is separate from project `progress`.
- Health becomes `at risk` if due date is near and progress slope is too low.
- Health becomes `stale` if no update in 7 days.

That separation is important: a project can be `60% complete` but still `off track`.

## Views You Should Have in V1

- Dashboard: active items, overdue tasks, blocked work, stale projects
- Projects view: all work grouped by top-level item
- Research view: hypotheses, notes, evidence, next experiment
- Milestones view: due soon, on track, at risk, done
- Weekly review view: what moved, what stalled, what to pick next
- Timeline view: optional, only for major projects

## Working MVP Plan

Phase 1 should be intentionally small:

1. Quick capture  
   Add a task, research item, or project in under 10 seconds.
2. Project pages  
   Each project shows purpose, milestones, tasks, notes, and latest updates.
3. Auto progress  
   Milestones and project bars update from child items.
4. Review loop  
   A weekly review screen highlights stale, blocked, and overdue work.
5. Research support  
   Let research items store questions, findings, links, and next experiments.

## Technical Implementation Plan

Recommended stack for a custom build:

- Frontend: `Next.js`
- Backend/database: `Supabase + Postgres`
- Auth: Supabase Auth
- UI: simple component library, clean dashboard-first UX
- Charts: lightweight progress and trend charts
- Scheduling/automation: cron jobs for stale-item checks and reminders

Why this stack:

- fast to ship
- relational data fits perfectly
- easy to host
- easy to extend later with AI summaries or email capture

## Database Shape

Core tables:

- `items`
- `milestones`
- `tasks`
- `updates`
- `evidence`
- `tags`
- `item_relations`

Important derived fields:

- `computed_progress`
- `health_status`
- `staleness_score`
- `next_due_date`

## Research Proposal

### Objective

Design and validate a personal work-tracking system that unifies tasks, research projects, and milestone-driven progress into one lightweight dashboard.

### Problem

Most tools are either too simple for research work or too heavy for solo personal use.

### Hypothesis

A hybrid system with relational work items, milestone rollups, and lightweight update logs will improve clarity, consistency, and follow-through.

### Research Questions

- Which progress model feels most truthful for solo work?
- How much structure can be added before capture becomes annoying?
- What is the minimum review ritual needed to keep the system alive?
- How should research progress be measured when output is uncertain?

### Method

- Benchmark existing systems
- Build MVP
- Use it personally for 2-3 weeks
- Track friction points
- Refine data model and views based on actual use

### Success Metrics

- Daily capture time under 2 minutes
- Weekly review under 15 minutes
- At least 80% of active work linked to a milestone or next step
- No active project goes stale unnoticed for more than 7 days

## Execution Game Plan

### Week 1

- finalize scope
- define schema
- design screens
- decide progress rules

### Week 2

- build core CRUD for projects, milestones, tasks, updates
- implement auto-progress rollups

### Week 3

- add dashboard, filters, health/staleness logic
- add research-specific fields and evidence logging

### Week 4

- add weekly review workflow
- polish UX
- test with real personal data
- refine based on actual behavior

## Best Way To Move Forward

Recommended order:

1. confirm the product model
2. confirm the data model
3. build the MVP custom app
4. use it on your own work for 2 weeks
5. then add AI summaries, reminders, and analytics if needed

## Sources

- Asana milestones and progress: <https://asana.com/resources/project-milestones>
- Asana automatic goal progress: <https://help.asana.com/s/article/progress-status-and-connecting-work-to-goals?language=en_US>
- Linear cycles: <https://linear.app/docs/use-cycles>
- Linear cycle graph: <https://linear.app/docs/cycle-graph>
- Notion relations and rollups: <https://www.notion.com/help/relations-and-rollups>
- Vikunja tasks/progress: <https://vikunja.io/help/tasks/>
- Leantime milestones and blueprints: <https://leantime.io/>
- OpenProject planning and boards: <https://www.openproject.org/>
