/**
 * bot-config.js
 * Birthday Message Bot — Configuration File
 */

window.BOT_CONFIG = {

  // ─── Firebase Project Configuration ───────────────────────────────────────
  firebase: {
    apiKey:            "AIzaSyCegx4wZJy1xXFy7Z5gacVo1AoxcqpG_AM",
    authDomain:        "birthday-message-bot.firebaseapp.com",
    projectId:         "birthday-message-bot",
    storageBucket:     "birthday-message-bot.firebasestorage.app",
    messagingSenderId: "849039903031",
    appId:             "1:849039903031:web:a2863b96f571a31aa772b2",
    measurementId:     "G-E4VGG884WS",
    databaseURL:       "https://birthday-message-bot-default-rtdb.asia-southeast1.firebasedatabase.app"
  },

  // ─── VAPID Public Key ──────────────────────────────────────────────────────
  vapidKey: "BB5Z3t5xTfjtiFFU0fMevbvTcwxcsX1LuPKakmvs59NTaZC1J3mIQcqx7s9kzbwHcuw6dnR9T3vE_pMYyVuJA8U",

  // ─── Recipient ─────────────────────────────────────────────────────────────
  recipientName: "Aswini",

  // ─── Schedule Settings ─────────────────────────────────────────────────────
  schedule: {
    startHour:       8,    // 8:00 AM IST
    endHour:         23,   // 11:00 PM IST
    intervalMinutes: 30
  },

  // ─── Custom Birthday Messages (33 wishes) ──────────────────────────────────
  messages: [
    // 1 — Anonymous
    { message: "Happy Birthday, Aswini! 🥳❤️", sender: "Anonymous" },

    // 2 — Adru
    { message: "Happy Birthday to my favourite human everrr! 🥹❤️🫂 Life is so much more beautiful with you in it, and I hope this world gives you all the happiness and love you deserve. No matter where life takes us, you'll always have me. Love you endlessly, chunnniiiii 🧿❤️✨", sender: "Adru" },

    // 3 — Anonymous
    { message: "Hey Aswini! 🎂✨ Hope you're having an amazing birthday!", sender: "Anonymous" },

    // 4 — Arise
    { message: "Happy birthday Choss...may your pockets never go empty 🙏🥳", sender: "Arise" },

    // 5 — Anonymous
    { message: "Happy Birthday, Aswini! May all your wishes come true! 🥳💖", sender: "Anonymous" },

    // 6 — Pria_u
    { message: "Happy Birthday Aswini Chechi! 😂😍🤩♥️🥰🫂🫂 Wishing you a fantastic day and a wonderful year ahead! senior aanenkilum enne oru friend ne pole consider cheytu and also support cheyyane big thanks chechi! 😘🫂♥️ Enjoy your day to the fullest! 🥳✨\nAlways adipoli aayit erikkatte 😘🥰🤩😘🫂", sender: "Pria_u" },

    // 7 — Anonymous
    { message: "Aswini, hope your day is filled with happiness, laughter, and lots of cake! 🎂😂", sender: "Anonymous" },

    // 8 — Adru
    { message: "Haloooo Chunnoooo\nHappy Birthdayy diiii🤩🤩🔥🔥🥳🥳\nElla santhoshavum anugrahavum sampathum nerunnu..petenn nee take money aavatte🤣🤩🔥🤞🏼😎\nEnn snehapoorvam drunnoo😘❤️", sender: "Adru" },

    // 9 — Anonymous
    { message: "Birthday reminder, Aswini: Today is your special day! Enjoy every moment! 🎉❤️", sender: "Anonymous" },

    // 10 — Arise
    { message: "Happy Birthday, Aswini! 🥳 May your life be full of happiness, success, and of course, lots of money! 😂💸 Have a fantastic year ahead!", sender: "Arise" },

    // 11 — Anonymous
    { message: "Aswini, wishing you a beautiful year filled with new opportunities and happy memories! ✨", sender: "Anonymous" },

    // 12 — Pria_u
    { message: "Happy Birthday, Aswini Chechi! 🥳❤️ Iniyum orupaadu nalla opportunities kittatte, life-il nalla reethiyil munneraan pattatte! Keep smiling and stay awesome, chechi! ✨", sender: "Pria_u" },

    // 13 — Anonymous
    { message: "Aswini, have you had your birthday cake yet? 👀🍰", sender: "Anonymous" },

    // 14 — Adru
    { message: "Aswiniiiii, happy birthday diiii! 🥹❤️ I hope this year gives you so many beautiful moments, unexpected happiness, and everything you've been wishing for. Stay happy always, my girl! 🧿✨", sender: "Adru" },

    // 15 — Anonymous
    { message: "Just a little birthday surprise for you, Aswini! Hope this makes you smile! ❤️", sender: "Anonymous" },

    // 16 — Arise
    { message: "Aswini, wishing you good health, great memories, and plenty of reasons to smile this year! Happy Birthday! 🎂✨", sender: "Arise" },

    // 17 — Anonymous
    { message: "Aswini, may this year bring you lots of success, good health, and happiness! 🌸", sender: "Anonymous" },

    // 18 — Pria_u
    { message: "Aswini Chechi, wishing you lots of happiness and success in everything you do! 🫂❤️ Enjoy your special day and always stay happy. Happy Birthday! 🥳", sender: "Pria_u" },

    // 19 — Anonymous
    { message: "Hey Aswini! Quick birthday check-in. Hope you're enjoying your special day! 🥳", sender: "Anonymous" },

    // 20 — Adru
    { message: "Happy Birthday, my favourite person! 🥹❤️ Life wouldn't be the same without all our memories and madness. I hope we keep making a million more together. Love you endlessly! 🫂❤️✨", sender: "Adru" },

    // 21 — Anonymous
    { message: "Aswini, birthday rule number one: Extra cake is always allowed today! 😂🍰", sender: "Anonymous" },

    // 22 — Anonymous
    { message: "Happy Birthday, Aswini! Keep smiling and shining wherever you go! ✨❤️", sender: "Anonymous" },

    // 23 — Anonymous
    { message: "Aswini, the birthday celebrations aren't over yet! Enjoy the rest of your day! 🎉", sender: "Anonymous" },

    // 24 — Anonymous
    { message: "One more birthday wish for you, Aswini! Hope today gives you a reason to smile! 💖", sender: "Anonymous" },

    // 25 — Anonymous
    { message: "Aswini, wishing you plenty of happy moments and wonderful surprises this year! 🎁✨", sender: "Anonymous" },

    // 26 — Anonymous
    { message: "Happy Birthday, Aswini! May the coming year be even better than the last! 🥳", sender: "Anonymous" },

    // 27 — Anonymous
    { message: "Aswini, don't forget to take lots of pictures today. Birthday memories are special! 📸❤️", sender: "Anonymous" },

    // 28 — Anonymous
    { message: "Hey Aswini! Sending you another little dose of birthday happiness! 🎂💖", sender: "Anonymous" },

    // 29 — Anonymous
    { message: "Aswini, hope you've been spoiled with love, gifts, and good food today! 😂🎁", sender: "Anonymous" },

    // 30 — Anonymous
    { message: "Happy Birthday once again, Aswini! Keep making beautiful memories! ✨", sender: "Anonymous" },

    // 31 — Anonymous
    { message: "Aswini, it's your birthday, so leave all the worries aside and enjoy yourself! 🥳❤️", sender: "Anonymous" },

    // 32 — Anonymous
    { message: "Aswini, hope your birthday has been as wonderful as you deserve! 🌷❤️", sender: "Anonymous" },

    // 33 — Anonymous — final birthday wish
    { message: "Before your birthday ends, one last wish for you, Aswini: may this year bring you beautiful things! 🌙✨", sender: "Anonymous" }
  ]
};
