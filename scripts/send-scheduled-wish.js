/**
 * scripts/send-scheduled-wish.js
 * 
 * Free background sender powered by GitHub Actions & Firebase Spark Plan.
 * No Firebase Blaze plan or paid Cloud Functions needed!
 */

const admin = require('firebase-admin');

// 1. Initialize Firebase Admin using Service Account from GitHub Secrets / Environment
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ ERROR: FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
  console.error("❌ ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e.message);
  process.exit(1);
}

const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "https://birthday-message-bot-default-rtdb.asia-southeast1.firebasedatabase.app";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DATABASE_URL
});

const db = admin.database();

// 2. Birthday Messages List
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

async function run() {
  console.log("🚀 Starting birthday wish sender via GitHub Actions...");

  // Check IST time (UTC + 5:30)
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (5.5 * 3600000));
  const currentHour = istTime.getHours();
  console.log(`🕒 Current IST Time: ${istTime.toLocaleTimeString('en-US', { hour12: true })} (Hour: ${currentHour})`);

  // Allow manual run regardless of hour if triggered with FORCE_SEND=true
  if (process.env.FORCE_SEND !== 'true' && (currentHour < 8 || currentHour >= 22)) {
    console.log("🌙 Outside 8:00 AM - 10:00 PM IST window. Skipping scheduled message.");
    process.exit(0);
  }

  // Fetch subscriber tokens from Realtime Database
  console.log("📥 Fetching tokens from Realtime Database...");
  const snapshot = await db.ref('subscriptions').once('value');
  const subs = snapshot.val();

  if (!subs) {
    console.log("ℹ️ No subscribers found in database yet. Once Chachos clicks 'Unlock Your Little Surprises', token will appear.");
    process.exit(0);
  }

  const tokens = Object.values(subs)
    .map(s => (typeof s === 'object' ? s.token : s))
    .filter(t => typeof t === 'string' && t.length > 10);

  if (tokens.length === 0) {
    console.log("ℹ️ No valid tokens found.");
    process.exit(0);
  }

  console.log(`📱 Found ${tokens.length} subscriber token(s).`);

  // Determine which message to send
  const botStateRef = db.ref('botState/lastMessageIndex');
  const stateSnap = await botStateRef.once('value');
  const lastIndex = stateSnap.val() ?? -1;
  const nextIndex = (lastIndex + 1) % BIRTHDAY_MESSAGES.length;
  const messageToSend = BIRTHDAY_MESSAGES[nextIndex];

  console.log(`✉️ Sending message #${nextIndex + 1}: "${messageToSend}"`);

  // Send multicast notification
  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokens,
    notification: {
      title: '🎂 Birthday Wish ✨',
      body: messageToSend
    },
    webpush: {
      notification: {
        title: '🎂 Birthday Wish ✨',
        body: messageToSend,
        icon: '/images/WhatsApp%20Image%202026-10-27%20at%2011.43.57%20PM.jpeg',
        badge: '/images/WhatsApp%20Image%202026-10-27%20at%2011.43.57%20PM.jpeg',
        tag: 'birthday-wish',
        renotify: true
      }
    }
  });

  console.log(`✅ Success: ${response.successCount}, Failed: ${response.failureCount}`);

  // Update last index
  await botStateRef.set(nextIndex);

  // Clean up expired/invalid tokens
  const tokensToRemove = [];
  response.responses.forEach((resp, idx) => {
    if (!resp.success) {
      const errCode = resp.error?.code;
      if (errCode === 'messaging/invalid-registration-token' || 
          errCode === 'messaging/registration-token-not-registered') {
        tokensToRemove.push(tokens[idx]);
      }
    }
  });

  if (tokensToRemove.length > 0) {
    console.log(`🧹 Removing ${tokensToRemove.length} expired token(s)...`);
    const updates = {};
    tokensToRemove.forEach(t => {
      const safeKey = t.replace(/[.#$[\]/]/g, '_').slice(0, 60);
      updates[`subscriptions/${safeKey}`] = null;
    });
    await db.ref().update(updates);
  }

  // Log delivery
  await db.ref(`deliveryLog/${Date.now()}`).set({
    type: 'github-actions-schedule',
    message: messageToSend,
    sent: response.successCount,
    failed: response.failureCount,
    time: istTime.toString()
  });

  console.log("🎉 Complete! Notification dispatched.");
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});

