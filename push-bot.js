/**
 * push-bot.js
 * Hidden Birthday Message Bot — Push Notification Logic
 *
 * Invisible to the recipient. The ONLY user-facing interaction is:
 *   → The "Unlock Your Little Surprises" button (in the website)
 *   → The browser's own native notification permission dialog
 *
 * No modals, banners, chat bubbles, or bot avatars.
 * Debug info is printed to browser DevTools console only.
 *
 * Requires (loaded before this script):
 *   ✓ firebase-app-compat.js
 *   ✓ firebase-messaging-compat.js
 *   ✓ firebase-database-compat.js
 *   ✓ bot-config.js  →  sets window.BOT_CONFIG
 */

(function () {
  'use strict';

  /* ─── Constants ─────────────────────────────────────────────────────────── */
  const LS_TOKEN_KEY = 'bdaybot_fcm_token';
  const SW_PATH      = '/firebase-messaging-sw.js';
  const LOG          = '[BdayBot]';

  /* ─── Tiny helpers ──────────────────────────────────────────────────────── */
  const log  = (...a) => console.log(LOG,  ...a);
  const warn = (...a) => console.warn(LOG, ...a);
  const err  = (...a) => console.error(LOG,...a);
  const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

  /* ─── Environment check ─────────────────────────────────────────────────── */
  function isSupported() {
    if (!('serviceWorker' in navigator)) { warn('No ServiceWorker support.');   return false; }
    if (!('Notification'  in window))    { warn('No Notification API support.'); return false; }
    if (!window.BOT_CONFIG)              { warn('BOT_CONFIG not loaded.');        return false; }
    if (!window.firebase)                { warn('Firebase SDK not loaded.');      return false; }
    return true;
  }

  /* ─── Firebase setup ────────────────────────────────────────────────────── */
  let _messaging = null;

  function initFirebase() {
    if (!isSupported()) return null;
    const cfg = window.BOT_CONFIG.firebase;
    if (!firebase.apps.length) {
      firebase.initializeApp(cfg);
      log('Firebase initialised (project:', cfg.projectId, ')');
    } else {
      log('Firebase already initialised — reusing app.');
    }
    try {
      _messaging = firebase.messaging();
      log('Messaging instance ready.');
    } catch (e) {
      err('firebase.messaging() failed:', e.message);
    }
    return _messaging;
  }

  /* ─── Service Worker ────────────────────────────────────────────────────── */
  let _swReg = null;

  async function registerSW() {
    try {
      _swReg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
      log('Service Worker registered. Scope:', _swReg.scope);
      return _swReg;
    } catch (e) {
      err('Service Worker registration failed:', e.message);
      return null;
    }
  }

  /* ─── FCM token ─────────────────────────────────────────────────────────── */
  async function getFCMToken() {
    if (!_messaging || !_swReg) { err('Not ready to get token.'); return null; }
    try {
      const token = await _messaging.getToken({
        vapidKey: window.BOT_CONFIG.vapidKey,
        serviceWorkerRegistration: _swReg
      });
      if (token) {
        lsSet(LS_TOKEN_KEY, token);
        log('FCM token:', token.slice(0, 24) + '…');
        return token;
      }
      warn('getToken() returned null — push may not be supported on this browser/OS.');
      return null;
    } catch (e) {
      err('getToken() failed:', e.message);
      return null;
    }
  }

  /* ─── Save token to Realtime Database ──────────────────────────────────── */
  async function saveToken(token) {
    const dbURL = window.BOT_CONFIG.firebase.databaseURL;
    if (!dbURL || dbURL === 'PASTE_YOUR_DATABASE_URL_HERE') {
      warn('databaseURL not set in bot-config.js — token stored in localStorage only.');
      warn('The Cloud Function cannot send notifications until you configure the DB.');
      return false;
    }
    try {
      const db     = firebase.database();
      const safeKey = token.replace(/[.#$[\]/]/g, '_').slice(0, 60);
      await db.ref(`subscriptions/${safeKey}`).set({
        token,
        subscribedAt: Date.now(),
        userAgent:    navigator.userAgent.slice(0, 150)
      });
      log('Token saved to Realtime Database ✓');
      return true;
    } catch (e) {
      err('Could not save token to database:', e.message);
      warn('Ensure Firebase Realtime Database is created and databaseURL is correct.');
      return false;
    }
  }

  /* ─── Foreground message handler ────────────────────────────────────────── */
  function setupForegroundHandler() {
    if (!_messaging) return;
    _messaging.onMessage(payload => {
      log('Foreground push received:', payload);
      if (Notification.permission !== 'granted') return;
      const title = payload.notification?.title || '🎂 Birthday Wish ✨';
      const body  = payload.notification?.body  || 'Sending you birthday love! 💙';
      // Use the SW to show it so it looks identical to background notifications
      if (_swReg) {
        _swReg.showNotification(title, {
          body,
          icon: '/images/WhatsApp%20Image%202026-10-27%20at%2011.43.57%20PM.jpeg',
          tag:  'birthday-wish-fg',
          data: { url: location.origin }
        });
      } else {
        new Notification(title, { body });
      }
    });
  }

  /* ─── UI state controller ───────────────────────────────────────────────── */
  // States: 'invite' | 'loading' | 'success' | 'blocked'
  function setUI(state) {
    const invite  = document.getElementById('surprise-invite-card');
    const success = document.getElementById('surprise-success-card');
    const blocked = document.getElementById('surprise-blocked-card');
    const btn     = document.getElementById('unlock-surprises-btn');
    if (!invite) return; // Section not in DOM yet

    [invite, success, blocked].forEach(el => el && el.classList.add('hidden'));

    if (state === 'invite') {
      invite.classList.remove('hidden');
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>🎁</span> Unlock Your Little Surprises'; }
    } else if (state === 'loading') {
      invite.classList.remove('hidden');
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="animate-spin inline-block">✨</span> Just a moment…'; }
    } else if (state === 'success') {
      success.classList.remove('hidden');
    } else if (state === 'blocked') {
      blocked.classList.remove('hidden');
    }
  }

  /* ─── Permission + subscribe flow (called by button) ───────────────────── */
  async function triggerBotPermission() {
    log('Permission flow started (user-initiated).');

    if (!('Notification' in window)) {
      alert('This device or browser does not support Web Push Notifications.\nPlease open this site on Google Chrome on Android or a laptop.');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      alert('Service Worker is not supported on this browser.');
      return;
    }

    // If permission was previously denied
    if (Notification.permission === 'denied') {
      alert('Notifications are blocked in your browser settings. Please click the tune/lock icon in the URL bar and allow notifications.');
      setUI('blocked');
      return;
    }

    setUI('loading');

    try {
      // 1. Request native browser notification permission
      const permission = await Notification.requestPermission();
      log('Permission result:', permission);

      if (permission !== 'granted') {
        alert('Notification permission was not granted. Please choose Allow to get birthday surprises!');
        setUI('invite');
        return;
      }

      // 2. Ensure Service Worker is registered
      if (!_swReg) {
        _swReg = await registerSW();
      }

      // 3. Ensure Firebase messaging is ready
      if (!_messaging) {
        initFirebase();
      }

      // 4. Retrieve FCM Token
      const token = await getFCMToken();
      if (token) {
        const saved = await saveToken(token);
        if (saved) {
          setUI('success');
          alert('🎉 Awesome! You have unlocked your birthday surprises! Wishes will reach your device throughout the day. 💙✨');
        } else {
          setUI('success');
          log('Token saved locally.');
        }
      } else {
        alert('Could not generate push token. Please check network connection and try again.');
        setUI('invite');
      }
    } catch (e) {
      err('Error during triggerBotPermission:', e);
      alert('Error requesting permission: ' + e.message);
      setUI('invite');
    }
  }

  /* ─── Silent init (on page load) ───────────────────────────────────────── */
  async function initPushBot() {
    log('Initialising (silent)…');
    if (!isSupported()) return;

    // Register SW eagerly so it's ready the moment the button is clicked
    await registerSW();
    initFirebase();
    setupForegroundHandler();

    // If already subscribed, refresh token silently and hide the button
    if (Notification.permission === 'granted' && lsGet(LS_TOKEN_KEY)) {
      log('Already subscribed — refreshing token silently.');
      const token = await getFCMToken();
      if (token) {
        await saveToken(token);
        setUI('success'); // Hide invite button; show success card
      }
      return;
    }

    // Otherwise, wait for the user to tap the button
    log('Ready — waiting for "Unlock Your Little Surprises" button tap.');
    setUI('invite');
  }

  /* ─── Public API ────────────────────────────────────────────────────────── */
  window.initBdayBot          = initPushBot;
  window.triggerBotPermission = triggerBotPermission;

  /* ─── Auto-start ────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPushBot);
  } else {
    initPushBot();
  }

})();
