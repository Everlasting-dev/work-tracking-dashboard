// Supabase Edge Function — generate-report
// Deploy: supabase functions deploy generate-report
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY secret not set on this Edge Function.');

    const data = await req.json();

    const prompt = buildPrompt(data);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Anthropic API error ${response.status}`);
    }

    const result = await response.json();
    const html = result.content?.[0]?.text ?? '';

    return new Response(JSON.stringify({ html }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});

function buildPrompt(data: Record<string, unknown>): string {
  return `You are a professional business analyst. Generate a complete, beautiful, standalone HTML report for the following WorkTracker data.

REPORT DATA (JSON):
${JSON.stringify(data, null, 2)}

Requirements:
1. Return ONLY a complete <!DOCTYPE html> document — no markdown fences, no explanation.
2. Include all CSS inline in a <style> tag. Use a refined printable progress-brief layout:
   warm paper background (#fcfcfa), ink text (#181b22), thin separators (#e9e7e0), accent #2f5d7c, soft accent panels #eaf1f6.
   Use Space Grotesk-style display typography if available through CSS font-family fallback, and Inter/system-ui for body text.
3. Structure:
   a) Header bar — report title, month, generated timestamp
   b) Executive Summary — 2–3 sentence narrative
   c) KPI tiles row — Ongoing / Started / Completed / Users (with big numbers, subtle icons)
   d) Status breakdown doughnut/bar chart using Chart.js (load from https://cdn.jsdelivr.net/npm/chart.js)
   e) Department performance horizontal bar chart
   f) Project table — Name, Owner, Dept, Status, Progress bar (HTML/CSS only), Tasks done/total
   g) Team contributions section — per-person cards showing projects owned and tasks completed
4. Charts: use Chart.js canvas elements. Initialize them in a <script> at the bottom.
5. Progress bars: pure CSS (a div with a colored fill width = progress%).
6. Color-code statuses: active=green, completed=indigo, on-hold=amber, archived=gray.
7. The report must look polished enough to share with executives — no Lorem ipsum.
8. Make it fully self-contained (no external CSS, all fonts from system stack).`;
}
