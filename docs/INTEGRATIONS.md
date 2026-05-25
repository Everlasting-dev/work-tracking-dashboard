# Integrations guide

## Discord (already built in)

WorkTracker uses **Discord incoming webhooks** — one-way posts from the app into Discord channels. There is no Discord bot or OAuth yet.

### What works today

| Feature | Where |
|--------|--------|
| **#general channel** | Admin → Discord Integrations → paste webhook URL |
| **Per-project channel** | Same section, one card per project |
| **Chat page** (`#/chat`) | Send messages to the active channel’s webhook |
| **Auto notifications** | Task assigned, task marked done → posts to project webhook (falls back to #general) |
| **@mentions** | Add each user’s **Discord ID** in Admin → Edit User (numeric snowflake) |

### Setup steps

1. In Discord: **Server Settings → Integrations → Webhooks → New Webhook**
2. Pick the channel (e.g. `#general` or `#bullet-renovation`)
3. **Copy webhook URL** (starts with `https://discord.com/api/webhooks/...`)
4. In WorkTracker: sign in as **admin** → **Admin** (or **Admin Dashboard** integrations section)
5. Paste URL under **#general** and/or the project card → **Save**
6. Click **Send test ping** to verify
7. Optional: paste a **channel link** (`https://discord.com/channels/SERVER_ID/CHANNEL_ID`) for “Open in Discord” shortcuts
8. Open **Chat** in the sidebar and send a test message

### Team member Discord IDs

For assignment pings like `@jawad`:

1. Discord → **User Settings → Advanced → Developer Mode** → On  
2. Right-click the user → **Copy User ID**  
3. WorkTracker → **Admin** → **Edit** that user → **Discord ID** → Save  

### Limits

- Webhook URLs are **secrets** — anyone with the URL can post to that channel. Only admins can edit them in the app.
- Messages are sent from the **browser** (GitHub Pages). Some networks block `fetch` to Discord; if sends fail, try another network or we can add a small server proxy later.
- Discord does **not** push messages back into WorkTracker (no true two-way sync without a bot).

### Optional next steps (not implemented)

- Discord **bot** + OAuth for reading channel history in-app  
- **Supabase Edge Function** proxy so webhooks are not called directly from the browser (more reliable, hides URLs from DevTools)

---

## Claude / AI (not built yet)

You should **not** put an Anthropic API key in `config.js` on GitHub Pages — it would be public. Use a **backend proxy**.

### Recommended architecture

```
Browser (WorkTracker)
    → POST /api/ai  (your server)
        → Anthropic API (key only on server)
        → optional: read project context from Supabase (service role)
```

Hosting options:

| Option | Effort | Good for |
|--------|--------|----------|
| **Supabase Edge Function** | Medium | Same project as DB, no extra host |
| **Cloudflare Worker** | Low | Fast global, cheap |
| **Vercel serverless** | Low | If you already use Vercel |

### Sensible features to add first

1. **“Summarize project”** — send project name, notes, task list → short status paragraph  
2. **“Suggest next tasks”** — based on open tasks and milestones  
3. **“Draft update note”** — fill the project updates field from a prompt  
4. **Side panel chat** — optional `#/assistant` with conversation scoped to current project  

### Data to send Claude (privacy)

- Project title, notes, task titles/statuses (no passwords)  
- Do **not** send webhook URLs, master recovery key, or full user emails unless required  

### Implementation checklist (when you’re ready)

1. Create Anthropic API key at [console.anthropic.com](https://console.anthropic.com)  
2. Add Edge Function / Worker with `ANTHROPIC_API_KEY` secret  
3. Add UI button “Ask Claude” on project page → calls your endpoint  
4. Rate-limit per user (e.g. 20 requests/day) in the function  
5. Log usage in `wt_activity_log` as `ai_request`  

If you want this in the repo next, say which host you prefer (Supabase Edge vs Cloudflare) and which feature (#1 summarize is the smallest win).
