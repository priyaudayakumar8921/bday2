/**
 * hourly-wishes.js
 * Timed Birthday Wishes Vault
 * Automatically unlocks wishes throughout the day based on time
 * with a live ticking countdown timer to the next surprise!
 */

(function () {
  'use strict';

  // 33 Birthday Messages for Aswini
  const TIMED_WISHES = [
    { id: 1,  time: "08:00 AM", sender: "Anonymous", message: "Happy Birthday, Aswini! 🥳❤️" },
    { id: 2,  time: "08:30 AM", sender: "Adru",      message: "Happy Birthday to my favourite human everrr! 🥹❤️🫂 Life is so much more beautiful with you in it, and I hope this world gives you all the happiness and love you deserve. No matter where life takes us, you'll always have me. Love you endlessly, chunnniiiii 🧿❤️✨" },
    { id: 3,  time: "09:00 AM", sender: "Anonymous", message: "Hey Aswini! 🎂✨ Hope you're having an amazing birthday!" },
    { id: 4,  time: "09:30 AM", sender: "Arise",      message: "Happy birthday Choss...may your pockets never go empty 🙏🥳" },
    { id: 5,  time: "10:00 AM", sender: "Anonymous", message: "Happy Birthday, Aswini! May all your wishes come true! 🥳💖" },
    { id: 6,  time: "10:30 AM", sender: "Pria_u",    message: "Happy Birthday Aswini Chechi! 😂😍🤩♥️🥰🫂🫂 Wishing you a fantastic day and a wonderful year ahead! senior aanenkilum enne oru friend ne pole consider cheytu and also support cheyyane big thanks chechi! 😘🫂♥️ Enjoy your day to the fullest! 🥳✨\nAlways adipoli aayit erikkatte 😘🥰🤩😘🫂" },
    { id: 7,  time: "11:00 AM", sender: "Anonymous", message: "Aswini, hope your day is filled with happiness, laughter, and lots of cake! 🎂😂" },
    { id: 8,  time: "11:30 AM", sender: "Adru",      message: "Haloooo Chunnoooo\nHappy Birthdayy diiii🤩🤩🔥🔥🥳🥳\nElla santhoshavum anugrahavum sampathum nerunnu..petenn nee take money aavatte🤣🤩🔥🤞🏼😎\nEnn snehapoorvam drunnoo😘❤️" },
    { id: 9,  time: "12:00 PM", sender: "Adru",      message: "Happy Birthday to my favourite human everrr! 🥹❤️🫂 Life is so much more beautiful with you in it, and I hope this world gives you all the happiness and love you deserve. No matter where life takes us, you'll always have me. Love you endlessly, chunnniiiii 🧿❤️✨" },
    { id: 10, time: "12:30 PM", sender: "Arise",      message: "Happy Birthday, Aswini! 🥳 May your life be full of happiness, success, and of course, lots of money! 😂💸 Have a fantastic year ahead!" },
    { id: 11, time: "01:00 PM", sender: "Anonymous", message: "Aswini, wishing you a beautiful year filled with new opportunities and happy memories! ✨" },
    { id: 12, time: "01:30 PM", sender: "Pria_u",    message: "Happy Birthday, Aswini Chechi! 🥳❤️ Iniyum orupaadu nalla opportunities kittatte, life-il nalla reethiyil munneraan pattatte! Keep smiling and stay awesome, chechi! ✨" },
    { id: 13, time: "02:00 PM", sender: "Anonymous", message: "Aswini, have you had your birthday cake yet? 👀🍰" },
    { id: 14, time: "02:30 PM", sender: "Adru",      message: "Aswiniiiii, happy birthday diiii! 🥹❤️ I hope this year gives you so many beautiful moments, unexpected happiness, and everything you've been wishing for. Stay happy always, my girl! 🧿✨" },
    { id: 15, time: "03:00 PM", sender: "Anonymous", message: "Just a little birthday surprise for you, Aswini! Hope this makes you smile! ❤️" },
    { id: 16, time: "03:30 PM", sender: "Arise",      message: "Aswini, wishing you good health, great memories, and plenty of reasons to smile this year! Happy Birthday! 🎂✨" },
    { id: 17, time: "04:00 PM", sender: "Anonymous", message: "Aswini, may this year bring you lots of success, good health, and happiness! 🌸" },
    { id: 18, time: "04:30 PM", sender: "Pria_u",    message: "Aswini Chechi, wishing you lots of happiness and success in everything you do! 🫂❤️ Enjoy your special day and always stay happy. Happy Birthday! 🥳" },
    { id: 19, time: "05:00 PM", sender: "Anonymous", message: "Hey Aswini! Quick birthday check-in. Hope you're enjoying your special day! 🥳" },
    { id: 20, time: "05:30 PM", sender: "Adru",      message: "Happy Birthday, my favourite person! 🥹❤️ Life wouldn't be the same without all our memories and madness. I hope we keep making a million more together. Love you endlessly! 🫂❤️✨" },
    { id: 21, time: "06:00 PM", sender: "Anonymous", message: "Aswini, birthday rule number one: Extra cake is always allowed today! 😂🍰" },
    { id: 22, time: "06:30 PM", sender: "Anonymous", message: "Happy Birthday, Aswini! Keep smiling and shining wherever you go! ✨❤️" },
    { id: 23, time: "07:00 PM", sender: "Anonymous", message: "Aswini, the birthday celebrations aren't over yet! Enjoy the rest of your day! 🎉" },
    { id: 24, time: "07:30 PM", sender: "Anonymous", message: "One more birthday wish for you, Aswini! Hope today gives you a reason to smile! 💖" },
    { id: 25, time: "08:00 PM", sender: "Anonymous", message: "Aswini, wishing you plenty of happy moments and wonderful surprises this year! 🎁✨" },
    { id: 26, time: "08:30 PM", sender: "Anonymous", message: "Happy Birthday, Aswini! May the coming year be even better than the last! 🥳" },
    { id: 27, time: "09:00 PM", sender: "Anonymous", message: "Aswini, don't forget to take lots of pictures today. Birthday memories are special! 📸❤️" },
    { id: 28, time: "09:30 PM", sender: "Anonymous", message: "Hey Aswini! Sending you another little dose of birthday happiness! 🎂💖" },
    { id: 29, time: "10:00 PM", sender: "Anonymous", message: "Aswini, hope you've been spoiled with love, gifts, and good food today! 😂🎁" },
    { id: 30, time: "10:30 PM", sender: "Anonymous", message: "Happy Birthday once again, Aswini! Keep making beautiful memories! ✨" },
    { id: 31, time: "11:00 PM", sender: "Anonymous", message: "Aswini, it's your birthday, so leave all the worries aside and enjoy yourself! 🥳❤️" },
    { id: 32, time: "11:30 PM", sender: "Anonymous", message: "Aswini, hope your birthday has been as wonderful as you deserve! 🌷❤️" },
    { id: 33, time: "11:59 PM", sender: "Anonymous", message: "Before your birthday ends, one last wish for you, Aswini: may this year bring you beautiful things! 🌙✨" }
  ];

  function getISTDate() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (5.5 * 3600000));
  }

  // Converts "02:30 PM" to minutes from 00:00
  function parseTimeToMinutes(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  let nextWishMinutesTarget = null;
  let lastUnlockedCount = -1;

  function renderVault() {
    const container = document.getElementById('hourly-wishes-grid');
    const unlockedText = document.getElementById('vault-unlocked-text');
    if (!container) return;

    const ist = getISTDate();
    const currentMinutes = ist.getHours() * 60 + ist.getMinutes();

    let unlockedCount = 0;
    nextWishMinutesTarget = null;

    // Find unlocked count & next target
    TIMED_WISHES.forEach((wish) => {
      const wishMinutes = parseTimeToMinutes(wish.time);
      if (currentMinutes >= wishMinutes) {
        unlockedCount++;
      } else if (nextWishMinutesTarget === null) {
        nextWishMinutesTarget = wishMinutes;
      }
    });

    if (unlockedText) {
      unlockedText.textContent = `${unlockedCount} of ${TIMED_WISHES.length} Unlocked`;
    }

    // Only rebuild DOM grid when a new card unlocks
    if (unlockedCount !== lastUnlockedCount) {
      lastUnlockedCount = unlockedCount;
      container.innerHTML = '';

      TIMED_WISHES.forEach((wish) => {
        const wishMinutes = parseTimeToMinutes(wish.time);
        const isUnlocked = currentMinutes >= wishMinutes;

        const card = document.createElement('div');
        card.className = `wish-vault-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}`;

        if (isUnlocked) {
          card.innerHTML = `
            <div class="wish-card-header">
              <span class="wish-sender-badge">${wish.sender !== 'Anonymous' ? '💌 ' + wish.sender : '🎁 Secret Wish'}</span>
              <span class="wish-time-badge">${wish.time}</span>
            </div>
            <p class="wish-message-body">${wish.message.replace(/\n/g, '<br>')}</p>
          `;
        } else {
          card.innerHTML = `
            <div class="wish-locked-content">
              <div class="wish-lock-icon">🔒</div>
              <span class="wish-lock-time">Unlocks at ${wish.time}</span>
              <p class="wish-lock-hint">A little surprise is waiting for you...</p>
            </div>
          `;
        }

        container.appendChild(card);
      });
    }

    updateCountdown();
  }

  function updateCountdown() {
    const clockEl = document.getElementById('vault-countdown-clock');
    const timerContainer = document.getElementById('vault-next-timer');
    if (!clockEl) return;

    if (nextWishMinutesTarget === null) {
      if (timerContainer) {
        timerContainer.innerHTML = '<span>🎉 All 33 wishes unlocked!</span>';
      }
      return;
    }

    const ist = getISTDate();
    const currentSecondsTotal = ist.getHours() * 3600 + ist.getMinutes() * 60 + ist.getSeconds();
    const targetSecondsTotal = nextWishMinutesTarget * 60;

    let diffSeconds = targetSecondsTotal - currentSecondsTotal;

    if (diffSeconds <= 0) {
      renderVault(); // Unlock!
      return;
    }

    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    clockEl.textContent = `${formattedMins}m ${formattedSecs}s`;
  }

  // Setup on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderVault();
      setInterval(updateCountdown, 1000);
      setInterval(renderVault, 30000);
    });
  } else {
    renderVault();
    setInterval(updateCountdown, 1000);
    setInterval(renderVault, 30000);
  }
})();
