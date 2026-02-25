/* ═══════════════════════════════════════════════
   Birthday Card — script.js
   ═══════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   🎵 MUSIC SETTINGS — change your song here

   Option A: Use your own audio file (MP3, OGG, WAV, etc.)
     1. Put your song file in the same folder as index.html
     2. Set SONG_FILE to the filename, e.g. "song.mp3"
     3. Set USE_AUDIO_FILE = true

   Option B: Keep the built-in synthesized piano melody
     Set USE_AUDIO_FILE = false  (default)
───────────────────────────────────────────────────────── */
const USE_AUDIO_FILE = true;     // ← change to true if using your own file
const SONG_FILE      = "song.mp3"; // ← put your filename here
const SONG_VOLUME    = 0.5;        // ← 0.0 (silent) to 1.0 (full)

/* ─────────────────────────────────────────────────────────
   📸 YOUR PHOTOS — list your image filenames here
   Put images in a folder called "photos/" next to index.html
   Supported: jpg, jpeg, png, gif, webp
───────────────────────────────────────────────────────── */
const MY_PHOTOS = [
  "photo1.jpg",
  "photo2.jpg",
  "photo3.jpg",
  // Add more lines here ↑ — or remove lines you don't need
];

/* ═══════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════ */
let cardOpen     = false;
let photos       = [];
let currentSlide = 0;
let slideInterval = null;
let musicPlaying  = false;
let audioCtx      = null;
let bgAudio       = null;

/* ═══════════════════════════════════════════════
   CANVAS SETUP
   ═══════════════════════════════════════════════ */
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ═══════════════════════════════════════════════
   OPEN CARD
   ═══════════════════════════════════════════════ */
function openCard() {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('card-area').classList.add('visible');
  document.getElementById('glitter-container').classList.add('active');
  document.getElementById('music-btn').classList.add('show');
  cardOpen = true;

  spawnGlitter();
  startMusic();
  initSlideshow();

  // Reset and replay click hint animation
  const hint = document.getElementById('click-hint');
  setTimeout(() => {
    hint.style.animation = 'none';
    void hint.offsetWidth;
    hint.style.animation = 'hint-fade 5s ease forwards';
  }, 200);

  // Welcome fireworks burst
  burstFirework(W / 2, H / 3);
  setTimeout(() => burstFirework(W / 4, H / 2), 600);
  setTimeout(() => burstFirework(W * 0.75, H / 2.5), 1100);
}

/* ═══════════════════════════════════════════════
   MUSIC
   ═══════════════════════════════════════════════ */

// Built-in synthesized melody notes [frequency Hz, duration seconds]
const notes = [
  [523.25,0.5],[587.33,0.5],[659.26,0.5],[698.46,0.5],
  [783.99,0.5],[880,0.5],[987.77,0.5],[1046.5,0.5],
  [987.77,0.5],[880,0.5],[783.99,0.5],[698.46,0.5],
  [659.26,1],[523.25,1],
  [659.26,0.5],[783.99,0.5],[880,1],[783.99,0.5],[659.26,0.5],
  [587.33,1],[523.25,1]
];
let noteIdx   = 0;
let noteTimer = null;

function startMusic() {
  if (USE_AUDIO_FILE) {
    // ── Real audio file ──
    if (bgAudio) return;
    bgAudio        = new Audio(SONG_FILE);
    bgAudio.loop   = true;
    bgAudio.volume = SONG_VOLUME;
    bgAudio.play().catch(() => {
      // Autoplay blocked — user must tap music button manually
      document.getElementById('music-btn').classList.add('muted');
      musicPlaying = false;
    });
    musicPlaying = true;
  } else {
    // ── Synthesized melody ──
    if (audioCtx) return;
    audioCtx     = new (window.AudioContext || window.webkitAudioContext)();
    musicPlaying = true;
    playNextNote();
  }
}

function playNextNote() {
  if (!musicPlaying || !audioCtx) return;
  const [freq, dur] = notes[noteIdx % notes.length];

  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur * 0.9);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + dur);

  noteIdx++;
  noteTimer = setTimeout(playNextNote, dur * 600);
}

function toggleMusic() {
  const btn = document.getElementById('music-btn');
  if (musicPlaying) {
    // Pause
    musicPlaying = false;
    if (USE_AUDIO_FILE && bgAudio) {
      bgAudio.pause();
    } else {
      clearTimeout(noteTimer);
      if (audioCtx) audioCtx.suspend();
    }
    btn.textContent = '🔇';
    btn.classList.add('muted');
  } else {
    // Resume
    musicPlaying = true;
    if (USE_AUDIO_FILE && bgAudio) {
      bgAudio.play();
    } else {
      if (audioCtx) audioCtx.resume().then(() => playNextNote());
      else startMusic();
    }
    btn.textContent = '🎵';
    btn.classList.remove('muted');
  }
}

/* ═══════════════════════════════════════════════
   GLITTER
   ═══════════════════════════════════════════════ */
function spawnGlitter() {
  const container = document.getElementById('glitter-container');
  const types     = ['gold', 'silver', 'rose', 'star'];

  for (let i = 0; i < 80; i++) {
    const el   = document.createElement('div');
    const type = types[Math.floor(Math.random() * types.length)];
    const size = (Math.random() * 8 + 4) + 'px';

    el.className    = `glitter-piece ${type}`;
    el.style.cssText = `
      --size:  ${size};
      --dur:   ${(Math.random() * 5 + 5).toFixed(2)}s;
      --delay: ${(Math.random() * 8).toFixed(2)}s;
      left:    ${Math.random() * 100}%;
      width:   ${size};
      height:  ${size};
      transform: rotate(${Math.random() * 360}deg);
    `;
    container.appendChild(el);
  }
}

/* ═══════════════════════════════════════════════
   FIREWORKS & PARTICLES
   ═══════════════════════════════════════════════ */
let particles = [];

class Particle {
  constructor(x, y, color) {
    this.x     = x;
    this.y     = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 1.5;
    this.vx    = Math.cos(angle) * speed;
    this.vy    = Math.sin(angle) * speed;
    this.alpha = 1;
    this.color = color;
    this.size  = Math.random() * 3 + 1;
    this.gravity = 0.12;
    this.decay   = Math.random() * 0.015 + 0.012;
    this.trail   = [];
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 4) this.trail.shift();
    this.vy    += this.gravity;
    this.vx    *= 0.98;
    this.x     += this.vx;
    this.y     += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    this.trail.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, this.size * (i / this.trail.length) * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace('1)', `${this.alpha * (i / this.trail.length) * 0.3})`);
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle  = this.color.replace('1)', `${this.alpha})`);
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

const palette = [
  'rgba(201,168,76,1)',
  'rgba(232,201,122,1)',
  'rgba(168,180,192,1)',
  'rgba(212,220,228,1)',
  'rgba(249,200,200,1)',
  'rgba(255,255,255,1)',
  'rgba(245,230,184,1)',
];

function burstFirework(x, y) {
  const color = palette[Math.floor(Math.random() * palette.length)];
  const count = 60 + Math.floor(Math.random() * 30);

  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
  // Extra sparkle burst
  for (let i = 0; i < 12; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      alpha: 1,
      size: Math.random() * 2 + 1,
      decay: 0.05,
      gravity: 0,
      isSparkle: true
    });
  }
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot      = (Math.PI / 2) * 3;
  const step   = Math.PI / spikes;
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
}

function animateCanvas() {
  ctx.clearRect(0, 0, W, H);
  particles = particles.filter(p => p.alpha > 0);

  particles.forEach(p => {
    if (p.isSparkle) {
      p.x     += p.vx;
      p.y     += p.vy;
      p.vx    *= 0.9;
      p.vy    *= 0.9;
      p.alpha -= p.decay;
      ctx.save();
      ctx.beginPath();
      drawStar(ctx, p.x, p.y, 4, p.size * 3, p.size);
      ctx.fillStyle   = `rgba(201,168,76,${p.alpha})`;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = 'rgba(201,168,76,0.8)';
      ctx.fill();
      ctx.restore();
    } else {
      p.update();
      p.draw(ctx);
    }
  });

  requestAnimationFrame(animateCanvas);
}
animateCanvas();

/* ═══════════════════════════════════════════════
   CLICK → FIREWORKS + CURSOR SPARKLE
   ═══════════════════════════════════════════════ */
document.getElementById('card-area').addEventListener('click', function (e) {
  if (e.target.closest('.slide-dot')) return; // don't fire on dot navigation
  burstFirework(e.clientX, e.clientY);
  spawnCursorSparkle(e.clientX, e.clientY);
});

function spawnCursorSparkle(x, y) {
  const el        = document.createElement('div');
  el.className    = 'cursor-sparkle';
  el.textContent  = ['✦', '✧', '★', '✨', '⋆'][Math.floor(Math.random() * 5)];
  el.style.left   = (x - 10) + 'px';
  el.style.top    = (y - 10) + 'px';
  el.style.color  = ['#C9A84C', '#E8C97A', '#A8B4C0', '#F9C8C8'][Math.floor(Math.random() * 4)];
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/* ═══════════════════════════════════════════════
   PHOTO SLIDESHOW
   ═══════════════════════════════════════════════ */
function initSlideshow() {
  photos = MY_PHOTOS.filter(p => p.trim() !== '');
  if (photos.length === 0) return; // show placeholder if none listed
  renderSlideshow();
}

function renderSlideshow() {
  const ss          = document.getElementById('slideshow');
  const nav         = document.getElementById('slide-nav');
  const badge       = document.getElementById('photo-count');
  const placeholder = document.getElementById('photo-placeholder');

  ss.innerHTML  = '';
  nav.innerHTML = '';

  photos.forEach((src, i) => {
    // Slide
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === currentSlide ? ' active' : '');
    const img = document.createElement('img');
    img.src   = src;
    img.alt   = 'Birthday photo ' + (i + 1);
    img.onerror = () => { slide.style.display = 'none'; }; // silently skip broken images
    slide.appendChild(img);
    ss.appendChild(slide);

    // Dot nav
    const dot = document.createElement('div');
    dot.className = 'slide-dot' + (i === currentSlide ? ' active' : '');
    dot.onclick   = (ev) => { ev.stopPropagation(); goToSlide(i); };
    nav.appendChild(dot);
  });

  ss.classList.add('active');
  placeholder.style.opacity       = '0';
  placeholder.style.pointerEvents = 'none';

  badge.style.display = photos.length > 1 ? 'block' : 'none';
  badge.textContent   = `${currentSlide + 1} / ${photos.length}`;

  if (slideInterval) clearInterval(slideInterval);
  if (photos.length > 1) {
    slideInterval = setInterval(() => goToSlide((currentSlide + 1) % photos.length), 3500);
  }
}

function goToSlide(idx) {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.slide-dot');

  slides[currentSlide]?.classList.remove('active');
  dots[currentSlide]?.classList.remove('active');

  currentSlide = idx;

  slides[currentSlide]?.classList.add('active');
  dots[currentSlide]?.classList.add('active');
  document.getElementById('photo-count').textContent = `${currentSlide + 1} / ${photos.length}`;
}

/* ═══════════════════════════════════════════════
   AMBIENT SPARKLE (background twinkle)
   ═══════════════════════════════════════════════ */
function ambientSparkle() {
  if (cardOpen) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 2 - 0.5,
      alpha: 0.8,
      size: Math.random() * 2 + 0.5,
      decay: 0.02,
      gravity: 0,
      isSparkle: true
    });
  }
  setTimeout(ambientSparkle, 200 + Math.random() * 300);
}
ambientSparkle();
