/**
 * scripts/send-scheduled-wish.js
 * 
 * Free background sender powered by GitHub Actions & Firebase Spark Plan.
 * Sends personalized birthday wishes for Aswini!
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

// 2. Custom Birthday Messages for Aswini (33 messages with senders)
const BIRTHDAY_MESSAGES = [
  // 1 — Anonymous
  {
    message: "Happy Birthday, Aswini! 🥳❤️",
    sender: "Anonymous"
  },
  // 2 — Adru
  {
    message: "Happy Birthday to my favourite human everrr! 🥹❤️🫂 Life is so much more beautiful with you in it, and I hope this world gives you all the happiness and love you deserve. No matter where life takes us, you'll always have me. Love you endlessly, chunnniiiii 🧿❤️✨",
    sender: "Adru"
  },
  // 3 — Anonymous
  {
    message: "Hey Aswini! 🎂✨ Hope you're having an amazing birthday!",
    sender: "Anonymous"
  },
  // 4 — Arise
  {
    message: "Happy birthday Choss...may your pockets never go empty 🙏🥳",
    sender: "Arise"
  },
  // 5 — Anonymous
  {
    message: "Happy Birthday, Aswini! May all your wishes come true! 🥳💖",
    sender: "Anonymous"
  },
  // 6 — Pria_u
  {
    message: "Happy Birthday Aswini Chechi! 😂😍🤩♥️🥰🫂🫂 Wishing you a fantastic day and a wonderful year ahead! senior aanenkilum enne oru friend ne pole consider cheytu and also support cheyyane big thanks chechi! 😘🫂♥️ Enjoy your day to the fullest! 🥳✨\nAlways adipoli aayit erikkatte 😘🥰🤩😘🫂",
    sender: "Pria_u"
  },
  // 7 — Anonymous
  {
    message: "Aswini, hope your day is filled with happiness, laughter, and lots of cake! 🎂😂",
    sender: "Anonymous"
  },
  // 8 — Adru
  {
    message: "Haloooo Chunnoooo\nHappy Birthdayy diiii🤩🤩🔥🔥🥳🥳\nElla santhoshavum anugrahavum sampathum nerunnu..petenn nee take money aavatte🤣🤩🔥🤞🏼😎\nEnn snehapoorvam drunnoo😘❤️",
    sender: "Adru"
  },
  // 9 — Anonymous
  {
    message: "Birthday reminder, Aswini: Today is your special day! Enjoy every moment! 🎉❤️",
    sender: "Anonymous"
  },
  // 10 — Arise
  {
    message: "Happy Birthday, Aswini! 🥳 May your life be full of happiness, success, and of course, lots of money! 😂💸 Have a fantastic year ahead!",
    sender: "Arise"
  },
  // 11 — Anonymous
  {
    message: "Aswini, wishing you a beautiful year filled with new opportunities and happy memories! ✨",
    sender: "Anonymous"
  },
  // 12 — Pria_u
  {
    message: "Happy Birthday, Aswini Chechi! 🥳❤️ Iniyum orupaadu nalla opportunities kittatte, life-il nalla reethiyil munneraan pattatte! Keep smiling and stay awesome, chechi! ✨",
    sender: "Pria_u"
  },
  // 13 — Anonymous
  {
    message: "Aswini, have you had your birthday cake yet? 👀🍰",
    sender: "Anonymous"
  },
  // 14 — Adru
  {
    message: "Aswiniiiii, happy birthday diiii! 🥹❤️ I hope this year gives you so many beautiful moments, unexpected happiness, and everything you've been wishing for. Stay happy always, my girl! 🧿✨",
    sender: "Adru"
  },
  // 15 — Anonymous
  {
    message: "Just a little birthday surprise for you, Aswini! Hope this makes you smile! ❤️",
    sender: "Anonymous"
  },
  // 16 — Arise
  {
    message: "Aswini, wishing you good health, great memories, and plenty of reasons to smile this year! Happy Birthday! 🎂✨",
    sender: "Arise"
  },
  // 17 — Anonymous
  {
    message: "Aswini, may this year bring you lots of success, good health, and happiness! 🌸",
    sender: "Anonymous"
  },
  // 18 — Pria_u
  {
    message: "Aswini Chechi, wishing you lots of happiness and success in everything you do! 🫂❤️ Enjoy your special day and always stay happy. Happy Birthday! 🥳",
    sender: "Pria_u"
  },
  // 19 — Anonymous
  {
    message: "Hey Aswini! Quick birthday check-in. Hope you're enjoying your special day! 🥳",
    sender: "Anonymous"
  },
  // 20 — Adru
  {
    message: "Happy Birthday, my favourite person! 🥹❤️ Life wouldn't be the same without all our memories and madness. I hope we keep making a million more together. Love you endlessly! 🫂❤️✨",
    sender: "Adru"
  },
  // 21 — Anonymous
  {
    message: "Aswini, birthday rule number one: Extra cake is always allowed today! 😂🍰",
    sender: "Anonymous"
  },
  // 22 — Anonymous
  {
    message: "Happy Birthday, Aswini! Keep smiling and shining wherever you go! ✨❤️",
    sender: "Anonymous"
  },
  // 23 — Anonymous
  {
    message: "Aswini, the birthday celebrations aren't over yet! Enjoy the rest of your day! 🎉",
    sender: "Anonymous"
  },
  // 24 — Anonymous
  {
    message: "One more birthday wish for you, Aswini! Hope today gives you a reason to smile! 💖",
    sender: "Anonymous"
  },
  // 25 — Anonymous
  {
    message: "Aswini, wishing you plenty of happy moments and wonderful surprises this year! 🎁✨",
    sender: "Anonymous"
  },
  // 26 — Anonymous
  {
    message: "Happy Birthday, Aswini! May the coming year be even better than the last! 🥳",
    sender: "Anonymous"
  },
  // 27 — Anonymous
  {
    message: "Aswini, don't forget to take lots of pictures today. Birthday memories are special! 📸❤️",
    sender: "Anonymous"
  },
  // 28 — Anonymous
  {
    message: "Hey Aswini! Sending you another little dose of birthday happiness! 🎂💖",
    sender: "Anonymous"
  },
  // 29 — Anonymous
  {
    message: "Aswini, hope you've been spoiled with love, gifts, and good food today! 😂🎁",
    sender: "Anonymous"
  },
  // 30 — Anonymous
  {
    message: "Happy Birthday once again, Aswini! Keep making beautiful memories! ✨",
    sender: "Anonymous"
  },
  // 31 — Anonymous
  {
    message: "Aswini, it's your birthday, so leave all the worries aside and enjoy yourself! 🥳❤️",
    sender: "Anonymous"
  },
  // 32 — Anonymous
  {
    message: "Aswini, hope your birthday has been as wonderful as you deserve! 🌷❤️",
    sender: "Anonymous"
  },
  // 33 — Anonymous — final birthday wish
  {
    message: "Before your birthday ends, one last wish for you, Aswini: may this year bring you beautiful things! 🌙✨",
    sender: "Anonymous"
  }
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
  if (process.env.FORCE_SEND !== 'true' && (currentHour < 8 || currentHour >= 23)) {
    console.log("🌙 Outside sending window (8:00 AM - 11:00 PM IST). Skipping scheduled message.");
    process.exit(0);
  }

  // Fetch subscriber tokens from Realtime Database
  console.log("📥 Fetching tokens from Realtime Database...");
  const snapshot = await db.ref('subscriptions').once('value');
  const subs = snapshot.val();

  if (!subs) {
    console.log("ℹ️ No subscribers found in database yet. Once Aswini clicks 'Unlock Your Little Surprises', token will appear.");
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
  const item = BIRTHDAY_MESSAGES[nextIndex];

  // Notification title reflects sender if not anonymous
  const notifTitle = item.sender && item.sender !== 'Anonymous' 
    ? `🎂 Birthday Wish from ${item.sender} ✨` 
    : `🎂 Birthday Surprise ✨`;

  console.log(`✉️ Sending message #${nextIndex + 1} (${item.sender}): "${item.message.slice(0, 50)}..."`);

  // Send multicast notification
  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokens,
    notification: {
      title: notifTitle,
      body: item.message
    },
    webpush: {
      notification: {
        title: notifTitle,
        body: item.message,
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
    sender: item.sender,
    message: item.message,
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
