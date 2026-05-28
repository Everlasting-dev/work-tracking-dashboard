// WorkTracker Discord Bot
// Mirrors Discord channel messages into wt_discord_messages so the app can show them.
//
// Setup:
//   1. Copy .env.example to .env and fill in your values
//   2. npm install
//   3. node index.js  (or deploy to Railway / Render free tier)
//
// Discord dev portal: https://discord.com/developers/applications
//   - Enable "Message Content Intent" under Bot → Privileged Gateway Intents
//   - Grant the bot "Send Messages" + "Read Message History" + "View Channel" permissions

const { Client, GatewayIntentBits, Events } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // service role — needed to bypass RLS for inserts
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Map Discord channel names / IDs to WorkTracker channel IDs.
// Add entries here for any channel you want mirrored.
// Keys can be channel names (lowercase) or Discord channel IDs.
const CHANNEL_MAP = Object.fromEntries(
  (process.env.CHANNEL_MAP || 'general=general').split(',').map(pair => {
    const [discord, app] = pair.trim().split('=');
    return [discord.trim(), (app || discord).trim()];
  })
);

function resolveAppChannelId(channel) {
  const byId   = CHANNEL_MAP[channel.id];
  if (byId) return byId;
  const byName = CHANNEL_MAP[channel.name?.toLowerCase()];
  if (byName) return byName;
  return null;
}

client.on(Events.MessageCreate, async (message) => {
  // Ignore bots (including ourselves) to avoid echo loops
  if (message.author.bot) return;

  const appChannelId = resolveAppChannelId(message.channel);
  if (!appChannelId) return;   // channel not in map — skip

  const { error } = await supabase.from('wt_discord_messages').insert({
    channel_id:          appChannelId,
    discord_message_id:  message.id,
    author_id:           message.author.id,
    author_username:     message.author.username,
    author_display_name: message.member?.displayName || message.author.globalName || message.author.username,
    author_avatar:       message.author.displayAvatarURL({ size: 64, extension: 'webp' }),
    content:             message.content,
    created_at:          message.createdAt.toISOString(),
  });

  if (error) {
    // Duplicate message (unique constraint) is expected on reconnect — ignore it
    if (!error.message?.includes('duplicate') && !error.code?.includes('23505')) {
      console.error('[Bot] Failed to store message:', error.message);
    }
  } else {
    console.log(`[Bot] #${message.channel.name} → ${appChannelId} | ${message.author.username}: ${message.content.slice(0, 60)}`);
  }
});

client.once(Events.ClientReady, (c) => {
  console.log(`[Bot] Ready as ${c.user.tag}`);
  console.log(`[Bot] Watching channels: ${Object.keys(CHANNEL_MAP).join(', ')}`);
});

client.on(Events.ShardError, (err) => {
  console.error('[Bot] WebSocket error:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('[Bot] Unhandled rejection:', err);
});

client.login(process.env.DISCORD_BOT_TOKEN);
