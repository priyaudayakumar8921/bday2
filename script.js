/* =========================================================
   CHACHOS' BIRTHDAY SYMPHONY - SCRIPT.JS
   Acoustic Piano Engine, Vinyl Mixtape, Awards & Audio Player
   ========================================================= */

const SITE_PASSWORD = '281004';
const passwordForm = document.getElementById('password-form');
const passwordInput = document.getElementById('site-password');
const passwordError = document.getElementById('password-error');
const passwordGate = document.getElementById('password-gate');
if (!passwordForm || !passwordInput || !passwordError || !passwordGate) {
    throw new Error('The website password gate is missing required elements.');
}
let isSiteUnlocked = false;

passwordForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (passwordInput.value !== SITE_PASSWORD) {
        passwordError.textContent = 'That password is not correct. Please try again.';
        passwordInput.value = '';
        passwordInput.focus();
        return;
    }

    isSiteUnlocked = true;
    document.body.classList.remove('site-locked');
    passwordGate.remove();
});

// 1. GSAP & LENIS SMOOTH SCROLL
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1.1,
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });

function scrollToTour() {
    lenis.scrollTo('#tour-screen', { duration: 1.2 });
}

// 2. WEB AUDIO API & PIANO SYNTHESIZER ENGINE
let audioCtx = null;
let globalMasterGain = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    if (!globalMasterGain && audioCtx) {
        globalMasterGain = audioCtx.createGain();
        globalMasterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
        globalMasterGain.connect(audioCtx.destination);
    }
    return audioCtx;
}

// Realistic warm acoustic piano synthesis
function playAcousticPianoTone(freq, duration = 1.2, velocity = 0.25, timeOffset = 0) {
    try {
        const ctx = getAudioContext();
        const startTime = ctx.currentTime + timeOffset;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2100, startTime);

        // Fundamental (sine) + Body (triangle) + Upper brilliance (sine 2nd harmonic)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, startTime);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq, startTime);

        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 2, startTime);

        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gain3 = ctx.createGain();

        // Piano envelope: sharp percussive hammer strike, decaying body
        gain1.gain.setValueAtTime(0.0001, startTime);
        gain1.gain.linearRampToValueAtTime(velocity * 0.75, startTime + 0.012);
        gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        gain2.gain.setValueAtTime(0.0001, startTime);
        gain2.gain.linearRampToValueAtTime(velocity * 0.25, startTime + 0.015);
        gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.85);

        gain3.gain.setValueAtTime(0.0001, startTime);
        gain3.gain.linearRampToValueAtTime(velocity * 0.1, startTime + 0.01);
        gain3.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.5);

        osc1.connect(gain1); gain1.connect(filter);
        osc2.connect(gain2); gain2.connect(filter);
        osc3.connect(gain3); gain3.connect(filter);

        filter.connect(globalMasterGain || ctx.destination);

        osc1.start(startTime); osc1.stop(startTime + duration);
        osc2.start(startTime); osc2.stop(startTime + duration);
        osc3.start(startTime); osc3.stop(startTime + duration);
    } catch (e) {
        console.warn('Piano tone error:', e);
    }
}

// 3. BACKGROUND MUSIC (TUM HI HO MPEG AUDIO)
const bgAudio = document.getElementById('bg-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const vinylDisc = document.getElementById('vinyl-disc');
const playerWidget = document.getElementById('music-player-widget');
const playerStatusText = document.getElementById('player-status-text');
const trackTitle = document.getElementById('track-title');
const concertGate = document.getElementById('concert-gate');

let isAudioPlaying = false;
let hasEnteredConcert = false;

function togglePlayPause() {
    getAudioContext();
    if (isAudioPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    getAudioContext();
    const playPromise = bgAudio.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            onAudioStarted();
        }).catch((err) => {
            console.log('Audio file waiting for interaction:', err);
            onAudioStarted();
        });
    } else {
        onAudioStarted();
    }
}

function onAudioStarted() {
    isAudioPlaying = true;
    document.body.classList.add('music-playing');
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    vinylDisc.classList.add('playing');
    playerWidget.classList.add('playing');
    playerStatusText.textContent = 'Playing';
    trackTitle.textContent = "Tum Hi Ho (Instrumental)";
}

function pauseAudio() {
    bgAudio.pause();
    isAudioPlaying = false;
    document.body.classList.remove('music-playing');
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    vinylDisc.classList.remove('playing');
    playerWidget.classList.remove('playing');
    playerStatusText.textContent = 'Paused';
}

playPauseBtn.onclick = togglePlayPause;
vinylDisc.onclick = togglePlayPause;

// ENTER CONCERT OVERLAY (Immediate playback on open)
function enterConcert() {
    if (hasEnteredConcert) return;
    hasEnteredConcert = true;

    getAudioContext();
    playAudio();

    lenis.scrollTo('#landing-screen', { immediate: true });

    if (concertGate) {
        concertGate.removeEventListener('wheel', onConcertGateWheel, true);
        gsap.to(concertGate, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                concertGate.classList.add('hidden');
            }
        });
    }

    // Royal sapphire & silver confetti burst
    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#38bdf8', '#60a5fa', '#e2e8f0', '#ffffff', '#1e3a8a']
    });
}

function onConcertGateWheel(event) {
    if (event.deltaY <= 0) return;
    event.preventDefault();
    enterConcert();
}

if (concertGate) {
    concertGate.addEventListener('wheel', onConcertGateWheel, { capture: true, passive: false });
}

// Auto-trigger on load or any first touch
const startEvents = ['click', 'touchstart', 'pointerdown', 'keydown'];
function onUserGesture() {
    if (!isSiteUnlocked) return;
    getAudioContext();
    if (!isAudioPlaying) {
        enterConcert();
    }
    startEvents.forEach(evt => window.removeEventListener(evt, onUserGesture));
}
startEvents.forEach(evt => window.addEventListener(evt, onUserGesture));

window.addEventListener('DOMContentLoaded', () => {
    if (!isSiteUnlocked) return;
    getAudioContext();
    playAudio();
});


const MIXTAPE_TRACKS = [
    {
        num: "TRACK 01 OF 05",
        mood: '"The Golden Voice"',
        title: "The Acoustic Soul",
        quote: "Whenever Chachos sings, every note holds a rare honesty that quietly touches the soul.",
        img: "https://i.ibb.co/W479dkJC/file-00000000740072089e5e410e05fff834.png"
    },
    {
        num: "TRACK 02 OF 05",
        mood: '"Memorable Impact"',
        title: "More Than A Senior",
        quote: "Some people leave impressions, but you left impact. In random conversations and simple smiles, you made this journey better.",
        img: "https://i.ibb.co/zh4wPNBt/IMG-20260506-113153.png"
    },
    {
        num: "TRACK 03 OF 05",
        mood: '"Quiet Calm & Strength"',
        title: "Effortless Composure",
        quote: "It's rare to meet someone whose calm presence commands so much genuine respect and admiration.",
        img: "https://i.ibb.co/RTnGmh9x/IMG-20260506-123317.png"
    },
    {
        num: "TRACK 04 OF 05",
        mood: '"Inspiring Energy"',
        title: "Effortlessly Inspiring",
        quote: "You deserve appreciation every single day for being strong, humble, and effortlessly musical.",
        img: "https://i.ibb.co/8gtq8JvL/1778063348894.png"
    },
    {
        num: "TRACK 05 OF 05",
        mood: '"Level 22 Celebration"',
        title: "The Spotlight is Yours",
        quote: "Stepping into 22 â€” bigger dreams, new stages, and timeless melodies finding their way to you!",
        img: "https://i.ibb.co/LXSRm3Hb/1778062505925.png"
    }
];

let currentMixtapeIndex = 0;

function selectMixtapeTrack(index) {
    currentMixtapeIndex = index;
    const track = MIXTAPE_TRACKS[index];
    const card = document.getElementById('polaroid-card');

    playAcousticPianoTone(523.25, 0.4, 0.15); // soft silver chime

    gsap.to(card, {
        opacity: 0,
        y: 10,
        duration: 0.25,
        onComplete: () => {
            document.getElementById('track-number-badge').textContent = track.num;
            document.getElementById('track-mood-badge').textContent = track.mood;
            document.getElementById('polaroid-title').textContent = track.title;
            document.getElementById('polaroid-quote').textContent = `"${track.quote}"`;
            document.getElementById('polaroid-img').src = track.img;

            // Update dot indicators
            const dots = document.querySelectorAll('.mixtape-dot');
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('bg-sky-400');
                    dot.classList.remove('bg-slate-600');
                } else {
                    dot.classList.remove('bg-sky-400');
                    dot.classList.add('bg-slate-600');
                }
            });

            gsap.to(card, { opacity: 1, y: 0, duration: 0.35 });
        }
    });
}

function flipMixtapeTrack() {
    const record = document.getElementById('interactive-record');
    record.classList.toggle('spinning');
    const nextIdx = (currentMixtapeIndex + 1) % MIXTAPE_TRACKS.length;
    selectMixtapeTrack(nextIdx);
    document.getElementById('record-side-label').textContent = nextIdx % 2 === 0 ? "SIDE A" : "SIDE B";
}


const NOTE_SYNONYMS = {
    'C#4': 'Db4', 'Db4': 'Db4',
    'D#4': 'Eb4', 'Eb4': 'Eb4',
    'F#4': 'Fs4', 'Fs4': 'Fs4',
    'G#4': 'Ab4', 'Ab4': 'Ab4',
    'A#4': 'Bb4', 'Bb4': 'Bb4',
    'C#5': 'Db5', 'Db5': 'Db5',
    'D#5': 'Eb5', 'Eb5': 'Eb5',
    'C4': 'C4', 'D4': 'D4', 'E4': 'E4', 'F4': 'F4', 'G4': 'G4', 'A4': 'A4', 'B4': 'B4',
    'C5': 'C5', 'D5': 'D5', 'E5': 'E5'
};

const PIANO_NOTES = {
    C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63,
    F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00,
    Bb4: 466.16, B4: 493.88, C5: 523.25, Db5: 554.37, D5: 587.33,
    Eb5: 622.25, E5: 659.25
};

const KEY_MAPPINGS = {
    'a': 'C4', 'w': 'Db4', 's': 'D4', 'e': 'Eb4', 'd': 'E4',
    'f': 'F4', 't': 'Fs4', 'g': 'G4', 'y': 'Ab4', 'h': 'A4',
    'u': 'Bb4', 'j': 'B4', 'k': 'C5', 'o': 'Db5', 'l': 'D5',
    'p': 'Eb5', ';': 'E5'
};

const NOTE_KEYBOARD_LETTER = {
    'C4': 'A', 'Db4': 'W', 'D4': 'S', 'Eb4': 'E', 'E4': 'D',
    'F4': 'F', 'Fs4': 'T', 'G4': 'G', 'Ab4': 'Y', 'A4': 'H',
    'Bb4': 'U', 'B4': 'J', 'C5': 'K', 'Db5': 'O', 'D5': 'L',
    'Eb5': 'P', 'E5': ';'
};

const NOTE_DISPLAY_NAMES = {
    'C4': 'C4',
    'Db4': 'G# / Db4',
    'D4': 'D4',
    'Eb4': 'D#4 / Eb4',
    'E4': 'E4',
    'F4': 'F4',
    'Fs4': 'F#4',
    'G4': 'G4',
    'Ab4': 'G#4 / Ab4',
    'A4': 'A4',
    'Bb4': 'A#4 / Bb4',
    'B4': 'B4',
    'C5': 'C5',
    'Db5': 'C#5 / Db5',
    'D5': 'D5',
    'Eb5': 'D#5 / Eb5',
    'E5': 'E5'
};

function canonicalNote(noteName) {
    if (!noteName) return '';
    const clean = noteName.trim();
    return NOTE_SYNONYMS[clean] || clean;
}

// -------------------------------------------------------------
// 8-SONG INTERACTIVE MELODY DATABASE (With Lyric Lines & Chunks)
// -------------------------------------------------------------
const SONG_DATABASE = {
    tum_hi_ho: {
        title: "Tum Hi Ho (Aashiqui 2)",
        lines: [
            {
                lyric: "Hum tere bin ab reh nahi sakte",
                notes: [
                    { note: 'G#4', word: "Hum", d: 0.4 },
                    { note: 'G#4', word: "te-", d: 0.35 },
                    { note: 'G#4', word: "re", d: 0.35 },
                    { note: 'F#4', word: "bin", d: 0.4 },
                    { note: 'F4', word: "ab", d: 0.35 },
                    { note: 'F#4', word: "reh", d: 0.35 },
                    { note: 'G#4', word: "na-", d: 0.4 },
                    { note: 'F#4', word: "hi", d: 0.4 },
                    { note: 'F4', word: "sak-", d: 0.4 },
                    { note: 'D#4', word: "te", d: 0.85 }
                ]
            },
            {
                lyric: "Tere bina kya wajood mera",
                notes: [
                    { note: 'C#4', word: "Te-", d: 0.4 },
                    { note: 'D#4', word: "re", d: 0.35 },
                    { note: 'F4', word: "bi-", d: 0.4 },
                    { note: 'F#4', word: "na", d: 0.4 },
                    { note: 'F4', word: "kya", d: 0.4 },
                    { note: 'D#4', word: "wa-", d: 0.4 },
                    { note: 'C#4', word: "jood", d: 0.4 },
                    { note: 'C4', word: "me-ra", d: 0.95 }
                ]
            },
            {
                lyric: "Kyunki tum hi ho",
                notes: [
                    { note: 'F4', word: "Kyun-", d: 0.4 },
                    { note: 'F#4', word: "ki", d: 0.35 },
                    { note: 'G#4', word: "tum", d: 0.65 },
                    { note: 'G#4', word: "hi", d: 0.45 },
                    { note: 'F#4', word: "ho", d: 0.85 }
                ]
            },
            {
                lyric: "Ab tum hi ho",
                notes: [
                    { note: 'F#4', word: "Ab", d: 0.4 },
                    { note: 'G#4', word: "tum", d: 0.45 },
                    { note: 'A#4', word: "hi", d: 0.65 },
                    { note: 'A#4', word: "ho", d: 0.9 }
                ]
            },
            {
                lyric: "Zindagi ab tum hi ho",
                notes: [
                    { note: 'G#4', word: "Zin-", d: 0.4 },
                    { note: 'F#4', word: "da-", d: 0.35 },
                    { note: 'F4', word: "gi", d: 0.35 },
                    { note: 'D#4', word: "ab", d: 0.4 },
                    { note: 'F4', word: "tum", d: 0.4 },
                    { note: 'F#4', word: "hi", d: 0.45 },
                    { note: 'F4', word: "ho", d: 0.4 },
                    { note: 'D#4', word: "~", d: 0.4 },
                    { note: 'C#4', word: "~", d: 1.4 }
                ]
            }
        ]
    },
    birthday: {
        title: "Happy Birthday (Chachos)",
        lines: [
            {
                lyric: "Hap-py Birth-day to you",
                notes: [
                    { note: 'C4', word: "Hap-", d: 0.35 },
                    { note: 'C4', word: "py", d: 0.35 },
                    { note: 'D4', word: "Birth-", d: 0.65 },
                    { note: 'C4', word: "day", d: 0.65 },
                    { note: 'F4', word: "to", d: 0.75 },
                    { note: 'E4', word: "you", d: 1.1 }
                ]
            },
            {
                lyric: "Hap-py Birth-day to you",
                notes: [
                    { note: 'C4', word: "Hap-", d: 0.35 },
                    { note: 'C4', word: "py", d: 0.35 },
                    { note: 'D4', word: "Birth-", d: 0.65 },
                    { note: 'C4', word: "day", d: 0.65 },
                    { note: 'G4', word: "to", d: 0.75 },
                    { note: 'F4', word: "you", d: 1.1 }
                ]
            },
            {
                lyric: "Hap-py Birth-day dear Chachos",
                notes: [
                    { note: 'C4', word: "Hap-", d: 0.35 },
                    { note: 'C4', word: "py", d: 0.35 },
                    { note: 'C5', word: "Birth-", d: 0.7 },
                    { note: 'A4', word: "day", d: 0.7 },
                    { note: 'F4', word: "dear", d: 0.7 },
                    { note: 'E4', word: "Cha-", d: 0.7 },
                    { note: 'D4', word: "chos!", d: 1.2 }
                ]
            },
            {
                lyric: "Hap-py Birth-day to you",
                notes: [
                    { note: 'Bb4', word: "Hap-", d: 0.35 },
                    { note: 'Bb4', word: "py", d: 0.35 },
                    { note: 'A4', word: "Birth-", d: 0.65 },
                    { note: 'F4', word: "day", d: 0.65 },
                    { note: 'G4', word: "to", d: 0.85 },
                    { note: 'F4', word: "you!", d: 1.4 }
                ]
            }
        ]
    },
    samjhawan: {
        title: "Samjhawan (Humpty Sharma Ki Dulhania)",
        lines: [
            {
                lyric: "Main tenu samjhawan ki",
                notes: [
                    { note: 'F4', word: "Main", d: 0.35 },
                    { note: 'G4', word: "te-", d: 0.35 },
                    { note: 'G#4', word: "nu", d: 0.45 },
                    { note: 'A#4', word: "sam-", d: 0.45 },
                    { note: 'C5', word: "jha-", d: 0.75 },
                    { note: 'A#4', word: "wan", d: 0.4 },
                    { note: 'G#4', word: "ki", d: 0.85 }
                ]
            },
            {
                lyric: "Na tere bina lagda jee",
                notes: [
                    { note: 'F4', word: "Na", d: 0.35 },
                    { note: 'G4', word: "te-", d: 0.35 },
                    { note: 'G#4', word: "re", d: 0.45 },
                    { note: 'A#4', word: "bi-", d: 0.4 },
                    { note: 'G#4', word: "na", d: 0.4 },
                    { note: 'G4', word: "lag-", d: 0.45 },
                    { note: 'F4', word: "da jee", d: 1.1 }
                ]
            },
            {
                lyric: "Tu ki jaane pyaar mera",
                notes: [
                    { note: 'F4', word: "Tu", d: 0.35 },
                    { note: 'G4', word: "ki", d: 0.35 },
                    { note: 'G#4', word: "jaa-", d: 0.45 },
                    { note: 'A#4', word: "ne", d: 0.45 },
                    { note: 'C5', word: "pyaar", d: 0.75 },
                    { note: 'A#4', word: "me-", d: 0.4 },
                    { note: 'G#4', word: "ra", d: 0.85 }
                ]
            },
            {
                lyric: "Main karun intezar tera",
                notes: [
                    { note: 'F4', word: "Main", d: 0.35 },
                    { note: 'G4', word: "ka-", d: 0.35 },
                    { note: 'G#4', word: "run", d: 0.45 },
                    { note: 'A#4', word: "in-", d: 0.4 },
                    { note: 'G#4', word: "te-", d: 0.4 },
                    { note: 'G4', word: "zaar", d: 0.45 },
                    { note: 'F4', word: "te-ra", d: 1.3 }
                ]
            }
        ]
    },
    kesariya: {
        title: "Kesariya (BrahmÄstra)",
        lines: [
            {
                lyric: "Kesariya tera ishq hai piya",
                notes: [
                    { note: 'G4', word: "Ke-", d: 0.35 },
                    { note: 'A4', word: "sa-", d: 0.35 },
                    { note: 'C5', word: "ri-", d: 0.45 },
                    { note: 'D5', word: "ya", d: 0.65 },
                    { note: 'C5', word: "te-", d: 0.45 },
                    { note: 'A4', word: "ra", d: 0.4 },
                    { note: 'G4', word: "ishq", d: 0.4 },
                    { note: 'E4', word: "hai", d: 0.45 },
                    { note: 'G4', word: "pi-ya", d: 0.9 }
                ]
            },
            {
                lyric: "Rang jaaun jo main haath lagaun",
                notes: [
                    { note: 'G4', word: "Rang", d: 0.35 },
                    { note: 'A4', word: "jaa-", d: 0.35 },
                    { note: 'C5', word: "un", d: 0.45 },
                    { note: 'D5', word: "jo", d: 0.65 },
                    { note: 'C5', word: "main", d: 0.45 },
                    { note: 'A4', word: "haath", d: 0.4 },
                    { note: 'G4', word: "la-", d: 0.4 },
                    { note: 'A4', word: "ga-", d: 0.4 },
                    { note: 'G4', word: "~", d: 0.45 },
                    { note: 'E4', word: "un", d: 1.1 }
                ]
            },
            {
                lyric: "Din beete saara teri fikr mein",
                notes: [
                    { note: 'G4', word: "Din", d: 0.35 },
                    { note: 'A4', word: "bee-", d: 0.35 },
                    { note: 'C5', word: "te", d: 0.45 },
                    { note: 'D5', word: "saa-", d: 0.65 },
                    { note: 'C5', word: "ra", d: 0.45 },
                    { note: 'A4', word: "te-", d: 0.4 },
                    { note: 'G4', word: "ri", d: 0.4 },
                    { note: 'E4', word: "fikr", d: 0.45 },
                    { note: 'G4', word: "mein", d: 0.9 }
                ]
            },
            {
                lyric: "Rain saari teri khair manaun",
                notes: [
                    { note: 'G4', word: "Rain", d: 0.35 },
                    { note: 'A4', word: "saa-", d: 0.35 },
                    { note: 'C5', word: "ri", d: 0.45 },
                    { note: 'D5', word: "te-", d: 0.65 },
                    { note: 'C5', word: "ri", d: 0.45 },
                    { note: 'A4', word: "khair", d: 0.4 },
                    { note: 'G4', word: "ma-", d: 0.45 },
                    { note: 'A4', word: "na-", d: 0.45 },
                    { note: 'G4', word: "un", d: 1.3 }
                ]
            }
        ]
    },
    apna_bana_le: {
        title: "Apna Bana Le (Bhediya)",
        lines: [
            {
                lyric: "Apna bana le piya",
                notes: [
                    { note: 'E4', word: "Ap-", d: 0.35 },
                    { note: 'G4', word: "na", d: 0.35 },
                    { note: 'A4', word: "ba-", d: 0.45 },
                    { note: 'B4', word: "na", d: 0.65 },
                    { note: 'A4', word: "le", d: 0.4 },
                    { note: 'G4', word: "pi-", d: 0.4 },
                    { note: 'A4', word: "ya", d: 0.9 }
                ]
            },
            {
                lyric: "Apna bana le piya",
                notes: [
                    { note: 'E4', word: "Ap-", d: 0.35 },
                    { note: 'G4', word: "na", d: 0.35 },
                    { note: 'A4', word: "ba-", d: 0.45 },
                    { note: 'C5', word: "na", d: 0.65 },
                    { note: 'B4', word: "le", d: 0.4 },
                    { note: 'A4', word: "pi-", d: 0.4 },
                    { note: 'G4', word: "ya", d: 0.9 }
                ]
            },
            {
                lyric: "Dil ke nagar mein",
                notes: [
                    { note: 'E4', word: "Dil", d: 0.35 },
                    { note: 'G4', word: "ke", d: 0.35 },
                    { note: 'A4', word: "na-", d: 0.45 },
                    { note: 'B4', word: "gar", d: 0.6 },
                    { note: 'A4', word: "mein", d: 0.7 }
                ]
            },
            {
                lyric: "Shehar tu basa le piya",
                notes: [
                    { note: 'G4', word: "She-", d: 0.35 },
                    { note: 'A4', word: "har", d: 0.35 },
                    { note: 'C5', word: "tu", d: 0.45 },
                    { note: 'B4', word: "ba-", d: 0.4 },
                    { note: 'A4', word: "sa", d: 0.4 },
                    { note: 'G4', word: "le", d: 0.4 },
                    { note: 'A4', word: "pi-ya", d: 1.3 }
                ]
            }
        ]
    },
    agar_tum_saath_ho: {
        title: "Agar Tum Saath Ho (Tamasha)",
        lines: [
            {
                lyric: "Pal bhar thehar jaao",
                notes: [
                    { note: 'E4', word: "Pal", d: 0.35 },
                    { note: 'F#4', word: "bhar", d: 0.35 },
                    { note: 'G4', word: "the-", d: 0.4 },
                    { note: 'A4', word: "har", d: 0.6 },
                    { note: 'G4', word: "jaa-", d: 0.4 },
                    { note: 'F#4', word: "o", d: 0.4 },
                    { note: 'E4', word: "~", d: 0.8 }
                ]
            },
            {
                lyric: "Dil ye sambhal jaaye",
                notes: [
                    { note: 'E4', word: "Dil", d: 0.35 },
                    { note: 'F#4', word: "ye", d: 0.35 },
                    { note: 'G4', word: "sam-", d: 0.4 },
                    { note: 'A4', word: "bhal", d: 0.5 },
                    { note: 'B4', word: "jaa-", d: 0.6 },
                    { note: 'A4', word: "ye", d: 0.4 },
                    { note: 'G4', word: "~", d: 0.85 }
                ]
            },
            {
                lyric: "Kaise tumhe roka karun",
                notes: [
                    { note: 'G4', word: "Kai-", d: 0.35 },
                    { note: 'A4', word: "se", d: 0.35 },
                    { note: 'B4', word: "tum-", d: 0.4 },
                    { note: 'C5', word: "he", d: 0.55 },
                    { note: 'B4', word: "ro-", d: 0.4 },
                    { note: 'A4', word: "ka", d: 0.4 },
                    { note: 'G4', word: "ka-", d: 0.4 },
                    { note: 'F#4', word: "run", d: 0.8 }
                ]
            },
            {
                lyric: "Meri taraf aata",
                notes: [
                    { note: 'E4', word: "Me-", d: 0.35 },
                    { note: 'F#4', word: "ri", d: 0.35 },
                    { note: 'G4', word: "ta-", d: 0.4 },
                    { note: 'A4', word: "raf", d: 0.5 },
                    { note: 'G4', word: "aa-", d: 0.4 },
                    { note: 'F#4', word: "ta", d: 0.8 }
                ]
            },
            {
                lyric: "Har gham phisal jaaye",
                notes: [
                    { note: 'E4', word: "Har", d: 0.35 },
                    { note: 'F#4', word: "gham", d: 0.35 },
                    { note: 'G4', word: "phi-", d: 0.4 },
                    { note: 'A4', word: "sal", d: 0.5 },
                    { note: 'B4', word: "jaa-", d: 0.6 },
                    { note: 'A4', word: "ye", d: 0.45 },
                    { note: 'G4', word: "~", d: 1.3 }
                ]
            }
        ]
    },
    aararo: {
        title: "Aararo (Aararo Soulful Lullaby)",
        lines: [
            {
                lyric: "Aa-ra-ro aa-ri-ra-ro",
                notes: [
                    { note: 'E4', word: "Aa-", d: 0.45 },
                    { note: 'G4', word: "ra-", d: 0.45 },
                    { note: 'A4', word: "ro", d: 0.65 },
                    { note: 'B4', word: "aa-", d: 0.45 },
                    { note: 'A4', word: "ri-", d: 0.45 },
                    { note: 'G4', word: "ra-", d: 0.45 },
                    { note: 'E4', word: "ro", d: 0.9 }
                ]
            },
            {
                lyric: "Kanne en kanmaniye",
                notes: [
                    { note: 'G4', word: "Kan-", d: 0.4 },
                    { note: 'A4', word: "ne", d: 0.4 },
                    { note: 'B4', word: "en", d: 0.5 },
                    { note: 'D5', word: "kan-", d: 0.65 },
                    { note: 'B4', word: "ma-", d: 0.45 },
                    { note: 'A4', word: "ni-ye", d: 0.9 }
                ]
            },
            {
                lyric: "Aa-ra-ro aa-ri-ra-ro",
                notes: [
                    { note: 'E4', word: "Aa-", d: 0.45 },
                    { note: 'G4', word: "ra-", d: 0.45 },
                    { note: 'A4', word: "ro", d: 0.65 },
                    { note: 'B4', word: "aa-", d: 0.45 },
                    { note: 'A4', word: "ri-", d: 0.45 },
                    { note: 'G4', word: "ra-", d: 0.45 },
                    { note: 'E4', word: "ro", d: 0.9 }
                ]
            },
            {
                lyric: "Kannurangu ponmayile",
                notes: [
                    { note: 'G4', word: "Kan-", d: 0.4 },
                    { note: 'A4', word: "nu-", d: 0.4 },
                    { note: 'B4', word: "ran-", d: 0.45 },
                    { note: 'A4', word: "gu", d: 0.4 },
                    { note: 'G4', word: "pon-", d: 0.4 },
                    { note: 'E4', word: "ma-", d: 0.4 },
                    { note: 'D4', word: "yi-", d: 0.4 },
                    { note: 'E4', word: "le", d: 1.4 }
                ]
            }
        ]
    },
    vaarayo: {
        title: "Vaarayo Vaarayo (Aadhavan)",
        lines: [
            {
                lyric: "Vaarayo vaarayo",
                notes: [
                    { note: 'C4', word: "Vaa-", d: 0.4 },
                    { note: 'D4', word: "ra-", d: 0.4 },
                    { note: 'E4', word: "yo", d: 0.6 },
                    { note: 'G4', word: "vaa-", d: 0.4 },
                    { note: 'E4', word: "ra-", d: 0.4 },
                    { note: 'D4', word: "yo", d: 0.8 }
                ]
            },
            {
                lyric: "Kaadhal kolla",
                notes: [
                    { note: 'C4', word: "Kaa-", d: 0.4 },
                    { note: 'D4', word: "dhal", d: 0.4 },
                    { note: 'E4', word: "kol-", d: 0.6 },
                    { note: 'G4', word: "la", d: 0.9 }
                ]
            },
            {
                lyric: "Poovodu pesadha",
                notes: [
                    { note: 'G4', word: "Poo-", d: 0.38 },
                    { note: 'A4', word: "vo-", d: 0.38 },
                    { note: 'C5', word: "du", d: 0.45 },
                    { note: 'B4', word: "pe-", d: 0.45 },
                    { note: 'A4', word: "sa-", d: 0.4 },
                    { note: 'G4', word: "dha", d: 0.85 }
                ]
            },
            {
                lyric: "Kaatrodu thoodhu solla",
                notes: [
                    { note: 'E4', word: "Kaat-", d: 0.38 },
                    { note: 'G4', word: "ro-", d: 0.38 },
                    { note: 'A4', word: "du", d: 0.45 },
                    { note: 'G4', word: "thoo-", d: 0.4 },
                    { note: 'E4', word: "dhu", d: 0.4 },
                    { note: 'D4', word: "sol-", d: 0.4 },
                    { note: 'C4', word: "la", d: 1.4 }
                ]
            }
        ]
    }
};

// Flatten song lines into sequential note list with reference to line index
Object.keys(SONG_DATABASE).forEach(k => {
    const song = SONG_DATABASE[k];
    song.allNotes = [];
    song.lines.forEach((line, lineIdx) => {
        line.notes.forEach((item, noteInLineIdx) => {
            song.allNotes.push({
                note: item.note,
                canonical: canonicalNote(item.note),
                word: item.word,
                d: item.d,
                lineIdx: lineIdx,
                lineLyric: line.lyric,
                noteInLineIdx: noteInLineIdx
            });
        });
    });
});

// Interactive Guide State
let currentActiveSongKey = 'tum_hi_ho';
let currentGuideStep = 0;
let streakCount = 0;
let isGuideMode = true;
let isAutoDemoPlaying = false;
let autoDemoTimeoutIds = [];

function getActiveSong() {
    return SONG_DATABASE[currentActiveSongKey] || SONG_DATABASE['tum_hi_ho'];
}

// Visual key flash
function flashKeyVisual(canonical, isTargetHit = false) {
    const keyEl = document.querySelector(`.piano-key[data-note="${canonical}"]`);
    if (keyEl) {
        keyEl.classList.add('active-key');
        setTimeout(() => keyEl.classList.remove('active-key'), 180);
    }
}

// Press piano key (called by user click, keyboard listener, or auto-demo)
function pressPianoKey(noteInput, isAutoCall = false) {
    // CRITICAL REQUIREMENT: Automatically pause background song when playing piano
    if (!isAutoCall && isAudioPlaying) {
        pauseAudio();
    }

    const song = getActiveSong();
    const currentTarget = song ? song.allNotes[currentGuideStep] : null;

    let targetCanonical = currentTarget ? currentTarget.canonical : canonicalNote(noteInput);

    // If user is in Magic Tiles mode:
    // If they press the glowing key OR any piano key, play the melody note and advance!
    if (isGuideMode && !isAutoCall && currentTarget) {
        const inputCanonical = canonicalNote(noteInput);
        const isExactKey = (inputCanonical === currentTarget.canonical);

        if (isExactKey) {
            streakCount++;
        } else {
            // Friendly encourage to follow the light
            streakCount = Math.max(1, streakCount);
        }

        // Always play the melody note so the song sounds perfect and flows naturally!
        const targetFreq = PIANO_NOTES[currentTarget.canonical];
        if (targetFreq) {
            playAcousticPianoTone(targetFreq, 1.2, 0.32);
        }
        flashKeyVisual(currentTarget.canonical, true);

        // Advance to next note in the song
        currentGuideStep++;

        if (currentGuideStep >= song.allNotes.length) {
            finishInteractiveSong();
        } else {
            updateGuideUI();
        }
        return;
    }

    // Default piano key sound (for free play or auto-demo)
    const canonical = canonicalNote(noteInput);
    const freq = PIANO_NOTES[canonical];
    if (freq) {
        playAcousticPianoTone(freq, 1.2, 0.28);
        flashKeyVisual(canonical);
    }
}

// Physical keyboard listener
window.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    if (KEY_MAPPINGS[key]) {
        pressPianoKey(KEY_MAPPINGS[key]);
    }
});

// Update the interactive guide UI (Highlighting next key & teleprompter)
function updateGuideUI() {
    const song = getActiveSong();
    if (!song || song.allNotes.length === 0) return;

    if (currentGuideStep >= song.allNotes.length) {
        currentGuideStep = 0;
    }

    const currentItem = song.allNotes[currentGuideStep];
    const canonical = currentItem.canonical;

    // Remove guide highlight & pointer from all keys
    document.querySelectorAll('.piano-key').forEach(k => {
        k.classList.remove('guide-target-key');
        const oldPointer = k.querySelector('.key-pointer-arrow');
        if (oldPointer) oldPointer.remove();
    });

    // Highlight the target piano key (Bright Magic Tile light)
    const targetKeyEl = document.querySelector(`.piano-key[data-note="${canonical}"]`);
    if (targetKeyEl) {
        targetKeyEl.classList.add('guide-target-key');

        const shortcutLetter = NOTE_KEYBOARD_LETTER[canonical] || '';
        const pointer = document.createElement('div');
        pointer.className = 'key-pointer-arrow';
        pointer.innerHTML = `ðŸ‘‡ TAP [${shortcutLetter}]`;
        targetKeyEl.appendChild(pointer);
    }

    // Teleprompter Updates (Clean, friendly, zero music jargon clutter)
    const titleEl = document.getElementById('tutor-song-title');
    const badgeEl = document.getElementById('tutor-progress-badge');
    const streakEl = document.getElementById('tutor-streak-badge');
    const lyricLineEl = document.getElementById('tutor-lyric-line');
    const wordEl = document.getElementById('target-lyric-word');
    const shortcutEl = document.getElementById('target-key-shortcut');
    const progressBar = document.getElementById('tutor-progress-bar');
    const chipsContainer = document.getElementById('melody-chips-container');

    if (titleEl) titleEl.textContent = song.title;
    if (badgeEl) badgeEl.textContent = `${currentGuideStep + 1} / ${song.allNotes.length}`;
    if (streakEl) streakEl.textContent = `ðŸ”¥ Streak: ${streakCount}`;
    if (lyricLineEl) lyricLineEl.textContent = `"${currentItem.lineLyric}"`;
    if (wordEl) wordEl.textContent = `"${currentItem.word}"`;
    if (shortcutEl) shortcutEl.textContent = NOTE_KEYBOARD_LETTER[canonical] || '';

    const percent = Math.round(((currentGuideStep + 1) / song.allNotes.length) * 100);
    if (progressBar) progressBar.style.width = `${Math.max(5, percent)}%`;

    // Render clean melody word chips for the current line
    if (chipsContainer) {
        const line = song.lines[currentItem.lineIdx];
        if (line) {
            chipsContainer.innerHTML = '';
            line.notes.forEach((n, idx) => {
                const chip = document.createElement('span');
                const isCurrent = (idx === currentItem.noteInLineIdx);
                const isPassed = (idx < currentItem.noteInLineIdx);

                chip.className = `tracker-note-chip px-2.5 py-1 rounded-lg text-xs font-serif transition-all ${
                    isCurrent
                        ? 'chip-active bg-amber-400 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-110 border-2 border-white'
                        : isPassed
                            ? 'chip-passed bg-slate-900/40 text-slate-500 border border-slate-800'
                            : 'bg-sky-950/40 text-sky-200 border border-sky-400/20'
                }`;
                chip.textContent = n.word;
                chipsContainer.appendChild(chip);
            });
        }
    }
}

// Render full sheet notes accordion for currently selected song
function renderSongSheetAccordion(songKey) {
    const container = document.getElementById('full-song-sheet-content');
    if (!container) return;

    const song = SONG_DATABASE[songKey];
    if (!song) return;

    let html = '';
    song.lines.forEach((line, idx) => {
        const notesStr = line.notes.map(n => `<span class="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-400/30 text-sky-300 font-bold font-mono">${n.note}</span>`).join(' - ');
        html += `
            <div class="p-2.5 rounded-xl bg-slate-900/60 border border-sky-400/20 hover:border-sky-300 transition cursor-pointer" onclick="jumpToSongLine(${idx})">
                <div class="flex items-center justify-between text-xs font-bold text-sky-200 mb-1">
                    <span>${idx + 1}. ${line.lyric}</span>
                    <span class="text-[10px] text-sky-400 font-mono-music hover:underline">Practice Line âž”</span>
                </div>
                <div class="text-[11px] text-slate-400 flex flex-wrap gap-1 items-center mt-1">
                    ${notesStr}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function jumpToSongLine(lineIdx) {
    const song = getActiveSong();
    let step = 0;
    for (let i = 0; i < song.allNotes.length; i++) {
        if (song.allNotes[i].lineIdx === lineIdx) {
            step = i;
            break;
        }
    }
    currentGuideStep = step;
    startInteractiveGuide();
}

// Celebration when song is finished
function finishInteractiveSong() {
    const song = getActiveSong();

    // Remove guide highlight & pointer
    document.querySelectorAll('.piano-key').forEach(k => {
        k.classList.remove('guide-target-key');
        const pointer = k.querySelector('.key-pointer-arrow');
        if (pointer) pointer.remove();
    });

    const targetBanner = document.getElementById('tutor-target-banner');
    if (targetBanner) {
        targetBanner.innerHTML = `
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left py-2">
                <span class="text-4xl animate-bounce">ðŸ†</span>
                <div>
                    <h4 class="text-base font-black cinzel text-amber-300 tracking-wider">ðŸŒŸ 100% PERFECT MAESTRO! ðŸŒŸ</h4>
                    <p class="text-xs text-sky-200 font-light">Chachos, you played all of "${song.title}" flawlessly!</p>
                </div>
                <button onclick="resetActiveMelody()" class="mt-2 sm:mt-0 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs cinzel uppercase tracking-wider hover:scale-105 active:scale-95 transition shadow-lg">
                    Play Again ðŸ”
                </button>
            </div>
        `;
    }

    // Play triumphant celebration chord
    const triumphChord = [523.25, 659.25, 783.99, 1046.50];
    triumphChord.forEach((f, i) => playAcousticPianoTone(f, 1.8, 0.35, i * 0.12));

    // Starlight sapphire & silver confetti
    confetti({
        particleCount: 180,
        spread: 95,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#60a5fa', '#facc15', '#ffffff', '#ffd700']
    });
}

// Switch songs from dropdown (CRITICAL: Pause background audio immediately!)
function onSongDropdownChange(songKey) {
    pauseAudio(); // STOP background Tum Hi Ho song immediately!
    stopAutoDemo();
    currentActiveSongKey = songKey;
    currentGuideStep = 0;
    streakCount = 0;
    renderSongSheetAccordion(songKey);
    startInteractiveGuide();
}

// Start Interactive Guided Mode
function startInteractiveGuide() {
    pauseAudio(); // Ensure background audio is paused when playing
    stopAutoDemo();
    isGuideMode = true;

    const guideBtn = document.getElementById('guide-mode-btn');
    const autoBtn = document.getElementById('auto-demo-btn');

    if (guideBtn) {
        guideBtn.className = "flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-slate-950 font-black text-xs cinzel uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5";
    }
    if (autoBtn) {
        autoBtn.className = "flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sky-950/70 border border-sky-400/40 text-sky-200 font-bold text-xs cinzel uppercase tracking-wider hover:bg-sky-900/60 transition shadow flex items-center justify-center gap-1.5";
        const autoText = document.getElementById('auto-demo-text');
        if (autoText) autoText.textContent = "Listen Demo";
    }

    updateGuideUI();
}

// Reset the currently selected melody back to note 1
function resetActiveMelody() {
    stopAutoDemo();
    currentGuideStep = 0;
    streakCount = 0;

    // Restore target banner structure if replaced by finish message
    const targetBanner = document.getElementById('tutor-target-banner');
    if (targetBanner && !targetBanner.querySelector('#target-lyric-word')) {
        targetBanner.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-xs text-slate-300 font-medium">ðŸ‘‰ Tap Glowing Key for:</span>
                <span id="target-lyric-word" class="text-2xl font-black text-amber-300 font-serif italic drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">"~"</span>
            </div>
            <div class="flex items-center gap-2 text-xs font-mono-music text-sky-300">
                <span>Key: <kbd id="target-key-shortcut" class="px-2 py-0.5 rounded bg-sky-400 text-slate-950 font-black shadow text-xs">A</kbd></span>
                <span id="target-note-badge" class="hidden">C4</span>
            </div>
        `;
    }

    startInteractiveGuide();
}

// Stop Auto-Demo playback
function stopAutoDemo() {
    autoDemoTimeoutIds.forEach(id => clearTimeout(id));
    autoDemoTimeoutIds = [];
    isAutoDemoPlaying = false;

    const autoText = document.getElementById('auto-demo-text');
    const autoIcon = document.getElementById('auto-demo-icon');
    if (autoText) autoText.textContent = "Listen Demo";
    if (autoIcon) autoIcon.textContent = "â–¶";

    document.querySelectorAll('.piano-key').forEach(k => k.classList.remove('active-key'));
}

// Toggle Auto-Demo
function toggleAutoDemo() {
    if (isAutoDemoPlaying) {
        stopAutoDemo();
        startInteractiveGuide();
    } else {
        playAutoDemo();
    }
}

// Play song automatically with tempo, illuminating keys sequentially
function playAutoDemo() {
    pauseAudio(); // STOP background Tum Hi Ho song immediately!
    stopAutoDemo();
    isGuideMode = false;
    isAutoDemoPlaying = true;

    const song = getActiveSong();
    if (!song || song.allNotes.length === 0) return;

    // Remove guide pointer during auto-demo
    document.querySelectorAll('.piano-key').forEach(k => {
        k.classList.remove('guide-target-key');
        const pointer = k.querySelector('.key-pointer-arrow');
        if (pointer) pointer.remove();
    });

    const autoText = document.getElementById('auto-demo-text');
    const autoIcon = document.getElementById('auto-demo-icon');
    if (autoText) autoText.textContent = "Stop Demo";
    if (autoIcon) autoIcon.textContent = "â¹";

    let t = 0;
    song.allNotes.forEach((item, idx) => {
        const id = setTimeout(() => {
            if (!isAutoDemoPlaying) return;

            // Trigger note and highlight
            pressPianoKey(item.note, true);
            currentGuideStep = idx;

            // Update teleprompter
            const lyricLineEl = document.getElementById('tutor-lyric-line');
            const wordEl = document.getElementById('target-lyric-word');
            const badgeEl = document.getElementById('tutor-progress-badge');
            const progressBar = document.getElementById('tutor-progress-bar');

            if (lyricLineEl) lyricLineEl.textContent = `"${item.lineLyric}"`;
            if (wordEl) wordEl.textContent = `"${item.word}"`;
            if (badgeEl) badgeEl.textContent = `${idx + 1} / ${song.allNotes.length}`;
            if (progressBar) progressBar.style.width = `${Math.round(((idx + 1) / song.allNotes.length) * 100)}%`;

            // Highlight corresponding key in auto mode
            const targetKeyEl = document.querySelector(`.piano-key[data-note="${item.canonical}"]`);
            if (targetKeyEl) {
                targetKeyEl.classList.add('guide-target-key');
                setTimeout(() => targetKeyEl.classList.remove('guide-target-key'), (item.d * 900));
            }
        }, t * 1000);
        autoDemoTimeoutIds.push(id);
        t += item.d;
    });

    // When auto demo finishes
    const endId = setTimeout(() => {
        stopAutoDemo();
        finishInteractiveSong();
    }, t * 1000);
    autoDemoTimeoutIds.push(endId);
}



function toggleDedication(cardEl, cardId) {
    // Play warm melodic chord
    const chords = [
        [523.25, 659.25, 783.99], // C major
        [440.00, 554.37, 659.25], // A major
        [392.00, 493.88, 587.33]  // G major
    ];
    const chord = chords[(cardId - 1) % chords.length];
    chord.forEach((freq, idx) => {
        playAcousticPianoTone(freq, 1.2, 0.22, idx * 0.08);
    });

    // Pop animation
    gsap.fromTo(cardEl, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });

    confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#e2e8f0', '#60a5fa']
    });
}


let candlesBlown = false;

function blowCandles() {
    if (candlesBlown) return;
    candlesBlown = true;

    const flamesRow = document.getElementById('candle-flames-row');
    const smokeRow = document.getElementById('candle-smoke-row');
    const blowBtn = document.getElementById('blow-candles-btn');
    const stageMsg = document.getElementById('stage-message');
    const statusTitle = document.getElementById('cake-status-title');
    const statusDesc = document.getElementById('cake-status-desc');

    // Hide flames, show smoke puff
    if (flamesRow) flamesRow.classList.add('hidden');
    if (smokeRow) smokeRow.classList.remove('hidden');

    // Acoustic celebratory chime
    playAcousticPianoTone(523.25, 0.3, 0.3, 0);
    playAcousticPianoTone(659.25, 0.4, 0.3, 0.15);
    playAcousticPianoTone(783.99, 0.6, 0.35, 0.3);
    playAcousticPianoTone(1046.50, 1.4, 0.4, 0.45);

    // Update status text
    if (statusTitle) {
        statusTitle.textContent = "âœ¨ WISH SENT TO THE STARS! âœ¨";
        statusTitle.classList.add('glow-silver');
    }
    if (statusDesc) {
        statusDesc.textContent = "The candles are blown! May your 22nd year be filled with bigger stages, soulful music, and triumph.";
    }

    // Hide blow button and reveal surprise buttons
    if (blowBtn) {
        gsap.to(blowBtn, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            onComplete: () => {
                blowBtn.classList.add('hidden');
                if (stageMsg) {
                    stageMsg.classList.remove('hidden');
                    gsap.fromTo(stageMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" });
                }
            }
        });
    }

    // Big fireworks & confetti shower
    confetti({
        particleCount: 250,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#60a5fa', '#e2e8f0', '#ffffff', '#2563eb', '#fbbf24']
    });

    setTimeout(() => {
        if (smokeRow) smokeRow.classList.add('hidden');
    }, 2500);
}

// 8. PERSONAL MESSAGE MODAL (To Chachos from ~Pria_u)
function openPersonalMessage() {
    const overlay = document.getElementById('msg-overlay');
    overlay.classList.remove('hidden');
    gsap.set(overlay.querySelector('div'), { scale: 0.85, opacity: 0 });
    gsap.to(overlay.querySelector('div'), { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.6)" });
}

function closePersonalMessage() {
    const overlay = document.getElementById('msg-overlay');
    gsap.to(overlay.querySelector('div'), {
        scale: 0.85,
        opacity: 0,
        duration: 0.25,
        onComplete: () => overlay.classList.add('hidden')
    });
}

// 9. FLOATING STARLIGHT PARTICLES & PARALLAX
function initStarlightParticles() {
    const container = document.getElementById('stars-layer');
    if (!container) return;

    for (let i = 0; i < 45; i++) {
        const star = document.createElement('div');
        star.className = 'floating-particle';
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.background = Math.random() > 0.4 ? '#38bdf8' : '#e2e8f0';
        star.style.boxShadow = '0 0 8px ' + (Math.random() > 0.4 ? '#38bdf8' : '#ffffff');
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 9 + 6) + 's';
        star.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(star);
    }
}

function setupParallax() {
    gsap.to("#layer-stars", {
        scrollTrigger: { trigger: "#landing-screen", start: "top top", end: "bottom top", scrub: 1.5 },
        y: -160,
        force3D: true
    });

    gsap.to("#main-title, #main-subtitle, #scroll-indicator", {
        scrollTrigger: { trigger: "#landing-screen", start: "top top", end: "40% top", scrub: true },
        opacity: 0,
        scale: 0.9,
        y: -40,
        force3D: true
    });
}

// 30-piece birthday photo puzzle
const PUZZLE_COLUMNS = 5;
const PUZZLE_ROWS = 6;
const PUZZLE_PIECE_COUNT = PUZZLE_COLUMNS * PUZZLE_ROWS;
const PUZZLE_IMAGE = 'images/IMG_20261027_225431.png';
let birthdayPuzzleOrder = [];
let selectedPuzzleSlot = null;
let birthdayPuzzleMoves = 0;

function renderBirthdayPuzzle() {
    const board = document.getElementById('birthday-puzzle-board');
    const progress = document.getElementById('puzzle-progress');
    if (!board || !progress) return;

    board.replaceChildren();
    let correctCount = 0;
    birthdayPuzzleOrder.forEach((pieceNumber, slotNumber) => {
        const piece = document.createElement('button');
        const pieceColumn = pieceNumber % PUZZLE_COLUMNS;
        const pieceRow = Math.floor(pieceNumber / PUZZLE_COLUMNS);
        const isCorrect = pieceNumber === slotNumber;

        piece.type = 'button';
        piece.className = `birthday-puzzle-piece${isCorrect ? ' is-correct' : ''}${slotNumber === selectedPuzzleSlot ? ' is-selected' : ''}`;
        piece.draggable = true;
        piece.dataset.slot = String(slotNumber);
        piece.dataset.piece = String(pieceNumber);
        piece.style.backgroundImage = `url("${PUZZLE_IMAGE}")`;
        piece.style.backgroundSize = `${PUZZLE_COLUMNS * 100}% ${PUZZLE_ROWS * 100}%`;
        piece.style.backgroundPosition = `${pieceColumn / (PUZZLE_COLUMNS - 1) * 100}% ${pieceRow / (PUZZLE_ROWS - 1) * 100}%`;
        piece.setAttribute('aria-label', `Puzzle piece ${pieceNumber + 1} of ${PUZZLE_PIECE_COUNT}, currently in position ${slotNumber + 1}`);
        piece.setAttribute('aria-pressed', String(slotNumber === selectedPuzzleSlot));
        board.appendChild(piece);

        if (isCorrect) correctCount++;
    });

    progress.textContent = `${correctCount} of ${PUZZLE_PIECE_COUNT} pieces in place · ${birthdayPuzzleMoves} moves`;
    board.classList.toggle('is-solved', correctCount === PUZZLE_PIECE_COUNT);
}

function swapBirthdayPuzzleSlots(firstSlot, secondSlot) {
    if (firstSlot === secondSlot || firstSlot < 0 || secondSlot < 0) return;

    [birthdayPuzzleOrder[firstSlot], birthdayPuzzleOrder[secondSlot]] =
        [birthdayPuzzleOrder[secondSlot], birthdayPuzzleOrder[firstSlot]];
    birthdayPuzzleMoves++;
    selectedPuzzleSlot = null;
    renderBirthdayPuzzle();

    const status = document.getElementById('puzzle-status');
    const isSolved = birthdayPuzzleOrder.every((piece, index) => piece === index);
    if (status) {
        status.textContent = isSolved
            ? 'Puzzle complete! What a lovely picture. 🎉'
            : 'Select a piece, then select where it belongs.';
    }

    if (isSolved) {
        confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.65 },
            colors: ['#38bdf8', '#60a5fa', '#e2e8f0', '#facc15']
        });
    }
}

function shuffleBirthdayPuzzle() {
    birthdayPuzzleOrder = Array.from({ length: PUZZLE_PIECE_COUNT }, (_, index) => index);
    for (let index = birthdayPuzzleOrder.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [birthdayPuzzleOrder[index], birthdayPuzzleOrder[randomIndex]] =
            [birthdayPuzzleOrder[randomIndex], birthdayPuzzleOrder[index]];
    }

    if (birthdayPuzzleOrder.every((piece, index) => piece === index)) {
        [birthdayPuzzleOrder[0], birthdayPuzzleOrder[1]] = [birthdayPuzzleOrder[1], birthdayPuzzleOrder[0]];
    }

    birthdayPuzzleMoves = 0;
    selectedPuzzleSlot = null;
    renderBirthdayPuzzle();
    const status = document.getElementById('puzzle-status');
    if (status) status.textContent = 'Select a piece, then select where it belongs.';
}

function initBirthdayPuzzle() {
    const board = document.getElementById('birthday-puzzle-board');
    const shuffleButton = document.getElementById('puzzle-shuffle-btn');
    const acceptButton = document.getElementById('accept-birthday-challenge');
    const challengeIntro = document.getElementById('birthday-challenge-intro');
    const puzzleContent = document.getElementById('birthday-puzzle-content');
    if (!board || !shuffleButton || !acceptButton || !challengeIntro || !puzzleContent) return;

    shuffleButton.addEventListener('click', shuffleBirthdayPuzzle);
    acceptButton.addEventListener('click', () => {
        challengeIntro.classList.add('hidden');
        puzzleContent.classList.remove('hidden');
        window.requestAnimationFrame(() => {
            lenis.scrollTo(board, {
                duration: 1,
                offset: -Math.max(0, window.innerHeight * 0.18)
            });
            board.focus({ preventScroll: true });
        });
    });

    board.addEventListener('click', (event) => {
        const piece = event.target.closest('.birthday-puzzle-piece');
        if (!piece) return;

        const slot = Number(piece.dataset.slot);
        if (selectedPuzzleSlot === null) {
            selectedPuzzleSlot = slot;
            renderBirthdayPuzzle();
            const status = document.getElementById('puzzle-status');
            if (status) status.textContent = 'Piece selected. Choose the piece to swap with it.';
        } else if (selectedPuzzleSlot === slot) {
            selectedPuzzleSlot = null;
            renderBirthdayPuzzle();
            const status = document.getElementById('puzzle-status');
            if (status) status.textContent = 'Selection cleared. Select a piece to move.';
        } else {
            swapBirthdayPuzzleSlots(selectedPuzzleSlot, slot);
        }
    });

    board.addEventListener('dragstart', (event) => {
        const piece = event.target.closest('.birthday-puzzle-piece');
        if (!piece || !event.dataTransfer) return;
        event.dataTransfer.setData('text/plain', piece.dataset.slot);
        event.dataTransfer.effectAllowed = 'move';
    });

    board.addEventListener('dragover', (event) => {
        if (event.target.closest('.birthday-puzzle-piece')) event.preventDefault();
    });

    board.addEventListener('drop', (event) => {
        const targetPiece = event.target.closest('.birthday-puzzle-piece');
        if (!targetPiece || !event.dataTransfer) return;
        event.preventDefault();
        const sourceSlot = Number(event.dataTransfer.getData('text/plain'));
        const targetSlot = Number(targetPiece.dataset.slot);
        swapBirthdayPuzzleSlots(sourceSlot, targetSlot);
    });

    shuffleBirthdayPuzzle();
}

function initSecretNote() {
    const giftBox = document.getElementById('secret-gift-box');
    const boxStack = document.getElementById('secret-box-stack');
    const prompt = document.getElementById('secret-box-prompt');
    const message = document.getElementById('secret-message');
    if (!giftBox || !boxStack || !prompt || !message) return;

    let currentBox = 1;
    let isOpening = false;

    giftBox.addEventListener('click', () => {
        if (isOpening) return;
        const activeLayer = boxStack.querySelector('.secret-gift-layer.is-active');
        if (!activeLayer) return;

        isOpening = true;
        giftBox.disabled = true;
        activeLayer.classList.add('is-opening');
        prompt.textContent = 'A little surprise is opening...';

        window.setTimeout(() => {
            if (currentBox === 5) {
                giftBox.classList.add('hidden');
                prompt.textContent = 'You found all three birthday notes!';
                message.classList.remove('hidden');
                message.classList.add('secret-message-revealed');
                confetti({
                    particleCount: 90,
                    spread: 70,
                    origin: { y: 0.7 },
                    colors: ['#38bdf8', '#60a5fa', '#fef08a', '#ffffff']
                });
                return;
            }

            currentBox++;
            activeLayer.classList.remove('is-active', 'is-opening');
            activeLayer.classList.add('is-open');

            const nextLayer = document.createElement('span');
            const scale = [1, 0.76, 0.58, 0.44, 0.33][currentBox - 1];
            const bottom = [8, 18, 30, 42, 52][currentBox - 1];
            nextLayer.className = 'secret-gift-layer is-active';
            nextLayer.style.setProperty('--box-scale', String(scale));
            nextLayer.style.setProperty('--box-bottom', `${bottom}px`);

            const lid = document.createElement('span');
            lid.className = 'secret-gift-lid';
            const body = document.createElement('span');
            body.className = 'secret-gift-body';
            const ribbon = document.createElement('span');
            ribbon.className = 'secret-gift-ribbon';
            body.appendChild(ribbon);
            nextLayer.append(lid, body);
            boxStack.appendChild(nextLayer);

            prompt.textContent = 'There is another little surprise inside. Tap to open it.';
            giftBox.disabled = false;
            isOpening = false;
        }, 500);
    });
}

// Title easter egg chime
document.getElementById('main-title').addEventListener('click', () => {
    playAcousticPianoTone(523.25, 0.4, 0.2);
    confetti({ particleCount: 30, spread: 45 });
});

// INITIALIZE ON LOAD
window.onload = () => {
    initStarlightParticles();
    setupParallax();
    initBirthdayPuzzle();
    initSecretNote();
    renderSongSheetAccordion(currentActiveSongKey);
    startInteractiveGuide();
};


// ─── TOP-LEFT NAVIGATION MENU CONTROLLER ────────────────────────────────────
(function initNavMenu() {
    const toggleBtn = document.getElementById('nav-menu-toggle');
    const dropdown = document.getElementById('nav-menu-dropdown');
    const barsIcon = document.getElementById('menu-icon-bars');
    const closeIcon = document.getElementById('menu-icon-close');
    const navLinks = document.querySelectorAll('.nav-item-link');

    if (!toggleBtn || !dropdown) return;

    function openMenu() {
        dropdown.classList.remove('hidden');
        barsIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        dropdown.classList.add('hidden');
        barsIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains('hidden');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Smooth scroll using Lenis when a link is clicked
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            closeMenu();
            if (window.lenis && typeof window.lenis.scrollTo === 'function') {
                window.lenis.scrollTo(targetId, { duration: 1.4, offset: -20 });
            } else {
                const targetEl = document.querySelector(targetId);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
})();
