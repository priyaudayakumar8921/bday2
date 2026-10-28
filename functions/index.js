'use strict';

/**
 * functions/index.js
 * Firebase Cloud Functions — Birthday Message Push Bot
 *
 * Exports:
 *   scheduledBirthdayMessages — Runs every 30 min, sends birthday push (8 AM–10 PM IST)
 *   sendTestNotification      — HTTP endpoint for admin testing (POST with secret)
 *   getSubscriberInfo         — HTTP endpoint for admin dashboard (POST with secret)
 *
 * Deploy:
 *   firebase deploy --only functions
 *
 * Set admin secret before deploying (keeps it out of source code):
 *   firebase functions:config:set admin.secret="your-secret-here"
 * Then re-deploy.  Fallback value is used if not set.
 */

const { onSchedule }   = require('firebase-functions/v2/scheduler');
const functions        = require('firebase-functions');          // v1 — for predictable HTTP URLs
const { logger }       = require('firebase-functions');
const admin            = require('firebase-admin');

/* ─── Configuration ──────────────────────────────────────────────────────────
   DATABASE_URL: update this to your actual Realtime Database URL after you
   create it in Firebase Console → Realtime Database.
   It looks like:
     https://birthday-message-bot-default-rtdb.asia-southeast1.firebasedatabase.app
   ────────────────────────────────────────────────────────────────────────── */
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'https://birthday-message-bot-default-rtdb.asia-southeast1.firebasedatabase.app';

/* ─── Admin secret ────────────────────────────────────────────────────────────
   Used to protect the test + info HTTP endpoints.
   Set with:  firebase functions:config:set admin.secret="choose-something-personal"
   If not set, the fallback below is used (fine for a private birthday project).
   ────────────────────────────────────────────────────────────────────────── */
function getAdminSecret() {
  try {
    return functions.config().admin?.secret || 'bdaybot-pria-admin-2026';
  } catch {
    return 'bdaybot-pria-admin-2026';
  }
}

/* ─── Init ─────────────────────────────────────────────────────────────────── */
admin.initializeApp({ databaseURL: DATABASE_URL });
const db = admin.database();

/* ─── IST helper ────────────────────────────────────────────────────────────── */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+05:30

function nowInIST() {
  return new Date(Date.now() + IST_OFFSET_MS);
}

/* ─── Birthday messages ──────────────────────────────────────────────────────
   Keep in sync with the messages array in bot-config.js on the frontend.
   ────────────────────────────────────────────────────────────────────────── */
const BIRTHDAY_MESSAGES = [
  "Hey Chachos! 🎂 Just a tiny reminder that today is YOUR day and you deserve every bit of happiness coming your way! ✨",
  "Someone is thinking of you and wishing you the most beautiful birthday ever, Chachos! 💙 Hope your day feels as special as you are.",
  "A little birthday message for the person who makes every moment brighter just by being there. Happy birthday, Chachos! 🌟",
  "Chachos! 🎉 May this year bring you bigger stages, brighter lights, and every dream you've been quietly wishing for. You've got this! 🎶",
  "Not just today, but every single day — you deserve to feel celebrated, loved, and incredibly special. Happy birthday! 💫 — Pria_u",
  "Here's to 22 years of being absolutely wonderful, Chachos! 🥂 The world is a lovelier place because you're in it.",
  "Wishing you a day filled with unexpected joy, warm hugs, and all the things that make your heart smile the most. 🎈 Happy birthday!",
  "Chachos, your voice doesn't just fill a room — it fills hearts. Keep singing, keep shining, and never stop being you. 🎤✨ Happy birthday!",
  "Every once in a while someone comes into your life and makes it infinitely better. You're that person for so many people, Chachos. 💙 Happy birthday!",
  "On your special day, just want you to know: you are kind, you are talented, and you are so deeply appreciated. 🌸 Have the most magical birthday!",
  "Sending you a little burst of birthday love across the miles, Chachos! 💌 Hope it makes you smile at least once today. 😊",
  "Another year of you being effortlessly amazing — and honestly, we're all here for it. 🎂 Happy birthday, Chachos! Keep dazzling us!",
  "You have this rare ability to make ordinary moments feel extraordinary. That's a gift, Chachos, and the world needs more of it. 🌠 Happy birthday!",
  "This is your gentle birthday reminder that you are loved more than you probably realize. 💙 Enjoy every second of today, Chachos! 🎉",
  "Chachos! 🎂 May your day be as beautiful, warm, and full of life as you make every room you walk into. Happiest of birthdays!",
  "Here's to new adventures, deeper friendships, sweeter music, and a year that's even more wonderful than the last. 🥳 Happy birthday!",
  "Today the universe is celebrating too — because someone as special as you only comes along once. 🌌 Happy birthday, Chachos! 💙",
  "Last but never least: you are loved, you are enough, and you deserve every good thing heading your way. 🎂✨ From Pria_u, with all the love — happy birthday, Chachos! 💙"
];

/* ─── Core: load all valid FCM tokens ───────────────────────────────────────── */
async function loadTokens() {
  const snap = await db.ref('subscriptions').once('value');
  const data = snap.val();
  if (!data) return [];
  return Object.values(data)
    .map(v => (typeof v === 'object' ? v.token : v))
    .filter(t => typeof t === 'string' && t.length > 10);
}

/* ─── Core: remove invalid tokens after a multicast ─────────────────────────── */
async function pruneInvalidTokens(tokens, responses) {
  const BAD = new Set([
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered',
    'messaging/invalid-argument'
  ]);
  const toRemove = [];
  responses.forEach((r, i) => {
    if (!r.success && BAD.has(r.error?.code)) toRemove.push(tokens[i]);
  });
  if (!toRemove.length) return;
  const updates = {};
  for (const t of toRemove) {
    updates[`subscriptions/${t.replace(/[.#$[\]/]/g, '_').slice(0, 60)}`] = null;
  }
  await db.ref().update(updates);
  logger.info(`Pruned ${toRemove.length} invalid token(s).`);
}

/* ─── Core: send to all subscribers ──────────────────────────────────────────── */
async function broadcast(title, body) {
  const tokens = await loadTokens();
  if (!tokens.length) {
    logger.info('No subscribers. Nothing sent.');
    return { sent: 0, failed: 0, total: 0 };
  }

  logger.info(`Broadcasting to ${tokens.length} subscriber(s)…`);

  const result = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: {
      notification: {
        title, body,
        icon:  '/images/WhatsApp%20Image%202026-10-27%20at%2011.43.57%20PM.jpeg',
        badge: '/images/WhatsApp%20Image%202026-10-27%20at%2011.43.57%20PM.jpeg',
        tag:   'birthday-wish',
        renotify: true
      }
    }
  });

  await pruneInvalidTokens(tokens, result.responses);

  return {
    sent:   result.successCount,
    failed: result.failureCount,
    total:  tokens.length
  };
}

/* ─── CORS helper (for HTTP endpoints) ──────────────────────────────────────── */
function setCORS(res) {
  res.set('Access-Control-Allow-Origin',  '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT 1: Scheduled birthday messages — every 30 minutes, 8 AM–10 PM IST
   ═══════════════════════════════════════════════════════════════════════════ */
exports.scheduledBirthdayMessages = onSchedule(
  {
    schedule:  'every 30 minutes',
    timeZone:  'Asia/Kolkata',
    region:    'us-central1'
  },
  async () => {
    const ist     = nowInIST();
    const istHour = ist.getUTCHours();   // after adding offset, getUTCHours = local IST hour
    const istStr  = ist.toISOString().replace('T', ' ').slice(0, 16) + ' IST';

    if (istHour < 8 || istHour >= 22) {
      logger.info(`Outside 8 AM–10 PM window (IST ${istHour}:xx). Skipping.`);
      return;
    }

    // Cycle through messages
    const idxSnap = await db.ref('botState/lastMessageIndex').once('value');
    let idx = ((idxSnap.val() ?? -1) + 1) % BIRTHDAY_MESSAGES.length;
    await db.ref('botState/lastMessageIndex').set(idx);

    const body = BIRTHDAY_MESSAGES[idx];
    logger.info(`[${istStr}] Sending msg #${idx + 1}: "${body.slice(0, 60)}…"`);

    const stats = await broadcast('🎂 Birthday Wish ✨', body);

    await db.ref(`deliveryLog/${Date.now()}`).set({
      type:    'scheduled',
      msgIdx:  idx,
      message: body.slice(0, 120),
      time:    istStr,
      ...stats
    });

    logger.info('Done:', stats);
  }
);

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT 2: Test notification endpoint (HTTP POST — admin only)
   URL: https://us-central1-birthday-message-bot.cloudfunctions.net/sendTestNotification
   Body: { "secret": "bdaybot-pria-admin-2026", "message": "optional custom text" }
   ═══════════════════════════════════════════════════════════════════════════ */
exports.sendTestNotification = functions.https.onRequest(async (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'POST only' }); return; }

  const { secret, message } = req.body || {};

  if (!secret || secret !== getAdminSecret()) {
    res.status(401).json({ error: 'Invalid admin secret.' });
    return;
  }

  const body = message ||
    '🎂 Test! Hey Chachos — the birthday surprise system is working perfectly! 💙✨ (This is just a test.)';

  try {
    const stats = await broadcast('🎂 Birthday Bot Test ✨', body);
    await db.ref(`deliveryLog/test_${Date.now()}`).set({
      type:    'test',
      message: body.slice(0, 120),
      time:    nowInIST().toISOString(),
      ...stats
    });
    res.status(200).json({ success: true, ...stats });
  } catch (e) {
    logger.error('sendTestNotification error:', e);
    res.status(500).json({ error: e.message });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT 3: Subscriber info endpoint (HTTP POST — admin only)
   URL: https://us-central1-birthday-message-bot.cloudfunctions.net/getSubscriberInfo
   Body: { "secret": "bdaybot-pria-admin-2026" }
   ═══════════════════════════════════════════════════════════════════════════ */
exports.getSubscriberInfo = functions.https.onRequest(async (req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'POST only' }); return; }

  const { secret } = req.body || {};
  if (!secret || secret !== getAdminSecret()) {
    res.status(401).json({ error: 'Invalid admin secret.' });
    return;
  }

  try {
    const [subsSnap, logSnap] = await Promise.all([
      db.ref('subscriptions').once('value'),
      db.ref('deliveryLog').orderByKey().limitToLast(10).once('value')
    ]);

    const subs = subsSnap.val() || {};
    const logs = logSnap.val() || {};

    res.status(200).json({
      subscriberCount:  Object.keys(subs).length,
      subscribers:      Object.values(subs).map(s => ({
        subscribedAt: s.subscribedAt ? new Date(s.subscribedAt).toISOString() : 'unknown',
        device: (s.userAgent || '').split(' ').slice(0, 3).join(' ')
      })),
      recentDeliveries: Object.entries(logs)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 10)
        .map(([, v]) => v)
    });
  } catch (e) {
    logger.error('getSubscriberInfo error:', e);
    res.status(500).json({ error: e.message });
  }
});
