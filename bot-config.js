/**
 * bot-config.js
 * Birthday Message Bot — Configuration File
 *
 * ✏️  EDIT THIS FILE to customize the bot without touching any website code.
 *
 * REMAINING TODO (one step after you create Realtime Database):
 *   → Replace "PASTE_YOUR_DATABASE_URL_HERE" with your actual databaseURL.
 *   → Firebase Console → Realtime Database → copy the URL shown at the top.
 *
 * All other values are already configured with your real Firebase project.
 */

window.BOT_CONFIG = {

  // ─── Firebase Project Configuration ───────────────────────────────────────
  // Real credentials for project: birthday-message-bot
  firebase: {
    apiKey:            "AIzaSyCegx4wZJy1xXFy7Z5gacVo1AoxcqpG_AM",
    authDomain:        "birthday-message-bot.firebaseapp.com",
    projectId:         "birthday-message-bot",
    storageBucket:     "birthday-message-bot.firebasestorage.app",
    messagingSenderId: "849039903031",
    appId:             "1:849039903031:web:a2863b96f571a31aa772b2",
    measurementId:     "G-E4VGG884WS",
    // ⚠️ Fill this in AFTER creating Realtime Database in Firebase Console.
    // It will look like:
    //   https://birthday-message-bot-default-rtdb.asia-southeast1.firebasedatabase.app
    databaseURL: "https://birthday-message-bot-default-rtdb.asia-southeast1.firebasedatabase.app"
  },

  // ─── VAPID Public Key ──────────────────────────────────────────────────────
  // Your Web Push certificate public key from Firebase Console →
  // Project Settings → Cloud Messaging → Web configuration → Key pair
  vapidKey: "BB5Z3t5xTfjtiFFU0fMevbvTcwxcsX1LuPKakmvs59NTaZC1J3mIQcqx7s9kzbwHcuw6dnR9T3vE_pMYyVuJA8U",

  // ─── Recipient & Sender ────────────────────────────────────────────────────
  recipientName: "Chachos",
  senderName:    "Pria_u",

  // ─── Schedule Settings ─────────────────────────────────────────────────────
  // Messages are sent between startHour and endHour (24-hour, IST) every intervalMinutes.
  schedule: {
    startHour:       8,    // 8:00 AM IST — earliest message of the day
    endHour:         22,   // 10:00 PM IST — latest message of the day
    intervalMinutes: 30    // Send a message every 30 minutes within the window
  },

  // ─── Birthday Messages ─────────────────────────────────────────────────────
  // 18 unique, warm, personal messages for Chachos from Pria_u.
  // The bot cycles through these in order, then loops back to the beginning.
  messages: [
    // 01
    "Hey Chachos! 🎂 Just a tiny reminder that today is YOUR day and you deserve every bit of happiness coming your way! ✨",

    // 02
    "Someone is thinking of you and wishing you the most beautiful birthday ever, Chachos! 💙 Hope your day feels as special as you are.",

    // 03
    "A little birthday message for the person who makes every moment brighter just by being there. Happy birthday, Chachos! 🌟",

    // 04
    "Chachos! 🎉 May this year bring you bigger stages, brighter lights, and every dream you've been quietly wishing for. You've got this! 🎶",

    // 05
    "Not just today, but every single day — you deserve to feel celebrated, loved, and incredibly special. Happy birthday! 💫 — Pria_u",

    // 06
    "Here's to 22 years of being absolutely wonderful, Chachos! 🥂 The world is a lovelier place because you're in it.",

    // 07
    "Wishing you a day filled with unexpected joy, warm hugs, and all the things that make your heart smile the most. 🎈 Happy birthday!",

    // 08
    "Chachos, your voice doesn't just fill a room — it fills hearts. Keep singing, keep shining, and never stop being you. 🎤✨ Happy birthday!",

    // 09
    "Every once in a while someone comes into your life and makes it infinitely better. You're that person for so many people, Chachos. 💙 Happy birthday!",

    // 10
    "On your special day, just want you to know: you are kind, you are talented, and you are so deeply appreciated. 🌸 Have the most magical birthday!",

    // 11
    "Sending you a little burst of birthday love across the miles, Chachos! 💌 Hope it makes you smile at least once today. 😊",

    // 12
    "Another year of you being effortlessly amazing — and honestly, we're all here for it. 🎂 Happy birthday, Chachos! Keep dazzling us!",

    // 13
    "You have this rare ability to make ordinary moments feel extraordinary. That's a gift, Chachos, and the world needs more of it. 🌠 Happy birthday!",

    // 14
    "This is your gentle birthday reminder that you are loved more than you probably realize. 💙 Enjoy every second of today, Chachos! 🎉",

    // 15
    "Chachos! 🎂 May your day be as beautiful, warm, and full of life as you make every room you walk into. Happiest of birthdays!",

    // 16
    "Here's to new adventures, deeper friendships, sweeter music, and a year that's even more wonderful than the last. 🥳 Happy birthday!",

    // 17
    "Today the universe is celebrating too — because someone as special as you only comes along once. 🌌 Happy birthday, Chachos! 💙",

    // 18
    "Last but never least: you are loved, you are enough, and you deserve every good thing heading your way. 🎂✨ From Pria_u, with all the love — happy birthday, Chachos! 💙"
  ]
};
