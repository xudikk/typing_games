/* NeoCoder — barcha o'yinlar uchun umumiy yordamchi: ovoz, statistika, natija oynasi */
(function () {
  'use strict';

  const STATS_KEY = 'neo_stats_v1';
  const MUTE_KEY = 'neo_muted';

  const GAMES = {
    typing: { title: 'Tezlik testi', icon: 'fa-keyboard', url: 'index.html' },
    codedefender: { title: 'Kod Defender', icon: 'fa-shield-alt', url: 'arcade/codedefender.html' },
    fastcoder: { title: 'Fast Coder', icon: 'fa-code', url: 'arcade/fast-coder.html' },
    zombie: { title: 'Zombilardan Himoya', icon: 'fa-skull', url: 'arcade/zombie-defence.html' },
    towerwar: { title: 'Tower War', icon: 'fa-chess-rook', url: 'arcade/tower-war.html' },
    wordrain: { title: "So'z Yomg'iri", icon: 'fa-cloud-rain', url: 'arcade/wordrain.html' },
    wordtetris: { title: "So'z Tetrisi", icon: 'fa-cube', url: 'arcade/wordtetris.html' },
    warmup: { title: 'Qizib Olish', icon: 'fa-fire', url: 'arcade/warm-up.html' },
    mastercoder: { title: 'Master Django Coder', icon: 'fa-laptop-code', url: 'arcade/master_coder/index.html' },
    englishquiz: { title: 'English Quiz', icon: 'fa-award', url: 'arcade/english_quiz.html' },
    translation: { title: 'Translation game', icon: 'fa-language', url: 'arcade/translation.html' },
    codingquiz: { title: 'Coding Quiz', icon: 'fa-question', url: 'arcade/coding_quiz/index.html' },
    x0: { title: 'X va 0', icon: 'fa-hashtag', url: 'arcade/x0.html' },
    chess: { title: 'Shaxmat', icon: 'fa-chess', url: 'arcade/chess.html' },
    shashka: { title: 'Shashka', icon: 'fa-circle', url: 'arcade/shashka.html' },
    sudoku: { title: 'Sudoku', icon: 'fa-puzzle-piece', url: 'arcade/sudoku.html' },
    jumanji: { title: 'Jumanchi', icon: 'fa-dice-six', url: 'arcade/jumanji.html' },
    lessons: { title: 'Darslar', icon: 'fa-graduation-cap', url: 'lessons.html' },
    python: { title: 'Python kursi', icon: 'fa-laptop-code', url: 'python/index.html' },
  };

  /* ---------- Xavfsiz localStorage ---------- */
  function readJSON(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* xotira yo'q */ }
  }

  /* ---------- Ovoz (WebAudio — tashqi fayllarsiz) ---------- */
  let ctx = null;
  let muted = readJSON(MUTE_KEY, false);
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when, slideTo) {
    const a = ac();
    if (!a) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function noise(dur, vol) {
    const a = ac();
    if (!a) return;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource();
    const g = a.createGain();
    g.gain.value = vol || 0.15;
    s.buffer = buf;
    s.connect(g).connect(a.destination);
    s.start();
  }
  const SOUNDS = {
    ok: () => { tone(660, 0.08, 'triangle', 0.1); tone(990, 0.1, 'triangle', 0.08, 0.06); },
    key: () => tone(1200, 0.025, 'square', 0.02),
    error: () => tone(180, 0.18, 'sawtooth', 0.07, 0, 120),
    explode: () => { noise(0.3, 0.18); tone(120, 0.3, 'sine', 0.15, 0, 40); },
    hit: () => tone(240, 0.12, 'square', 0.08, 0, 90),
    skill: () => { tone(400, 0.25, 'sine', 0.1, 0, 1200); tone(800, 0.2, 'triangle', 0.05, 0.1, 1600); },
    level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'triangle', 0.09, i * 0.08)),
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.1, i * 0.11)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'sine', 0.1, i * 0.15)),
    click: () => tone(800, 0.04, 'sine', 0.06),
    move: () => tone(300, 0.06, 'triangle', 0.08, 0, 260),
  };
  const sound = {
    play(name) {
      if (muted) return;
      try { (SOUNDS[name] || SOUNDS.click)(); } catch (e) { /* audio yo'q */ }
    },
    get muted() { return muted; },
    setMuted(v) { muted = !!v; writeJSON(MUTE_KEY, muted); updateMuteBtn(); },
    toggle() { sound.setMuted(!muted); },
  };

  /* ---------- Statistika ---------- */
  function allStats() { return readJSON(STATS_KEY, {}); }
  const stats = {
    /** O'yin natijasini saqlaydi. data.score — asosiy ko'rsatkich (kattasi yaxshi). */
    record(id, data) {
      data = data || {};
      const s = allStats();
      const g = s[id] || { plays: 0, best: null, wins: 0, history: [] };
      g.plays++;
      if (data.win) g.wins = (g.wins || 0) + 1;
      const isBest = typeof data.score === 'number' && (g.best == null || data.score > g.best);
      if (isBest) g.best = data.score;
      g.last = Object.assign({ at: Date.now() }, data);
      g.history = (g.history || []).concat([g.last]).slice(-30);
      s[id] = g;
      writeJSON(STATS_KEY, s);
      return { isBest, best: g.best, plays: g.plays };
    },
    get(id) { return allStats()[id] || null; },
    best(id) { const g = allStats()[id]; return g ? g.best : null; },
    all: allStats,
    clear() { writeJSON(STATS_KEY, {}); },
    games: GAMES,
  };

  /* ---------- UI: natija oynasi va ovoz tugmasi ---------- */
  const CSS = `
  .neo-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;
    background:rgba(8,10,25,.72);backdrop-filter:blur(4px);animation:neoFade .25s ease}
  .neo-card{width:min(420px,100%);background:linear-gradient(145deg,#1e1b4b,#312e81);color:#f0f9ff;border-radius:18px;
    padding:26px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);border:1px solid rgba(165,180,252,.35);
    font-family:'Inter','Poppins',system-ui,sans-serif;animation:neoPop .35s cubic-bezier(.2,1.4,.4,1)}
  .neo-card h2{margin:0 0 6px;font-size:1.9rem;letter-spacing:.5px}
  .neo-card .neo-sub{margin:0 0 16px;color:#c7d2fe;font-size:1rem}
  .neo-card .neo-best{display:inline-block;margin-bottom:14px;padding:4px 12px;border-radius:999px;font-weight:700;font-size:.9rem;
    background:linear-gradient(90deg,#f59e0b,#facc15);color:#1e1b4b}
  .neo-rows{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:0 0 18px}
  .neo-row{background:rgba(255,255,255,.07);border-radius:12px;padding:10px 6px}
  .neo-row b{display:block;font-size:1.45rem}
  .neo-row span{font-size:.8rem;color:#a5b4fc;text-transform:uppercase;letter-spacing:.6px}
  .neo-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .neo-btn{border:0;border-radius:12px;padding:12px 20px;font-weight:700;font-size:1rem;cursor:pointer;color:#fff;
    background:linear-gradient(45deg,#4f46e5,#7c3aed);transition:transform .15s,box-shadow .15s;text-decoration:none;font-family:inherit}
  .neo-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(79,70,229,.6)}
  .neo-btn.alt{background:rgba(255,255,255,.12)}
  .neo-mute{position:fixed;right:14px;bottom:14px;z-index:9999;width:42px;height:42px;border-radius:50%;border:0;cursor:pointer;
    background:rgba(30,27,75,.85);color:#c7d2fe;font-size:18px;box-shadow:0 4px 14px rgba(0,0,0,.4)}
  .neo-mute:hover{background:#4f46e5;color:#fff}
  .nav-links .neo-active{box-shadow:0 0 0 2px #facc15 inset,0 0 14px rgba(250,204,21,.35)}
  @media (max-width:768px){
    .header{flex-wrap:wrap;gap:10px;padding:10px 12px !important}
    .header .nav-links{flex-direction:row !important;flex-wrap:wrap;gap:6px !important;width:100%;justify-content:center}
    .header .nav-btn{padding:7px 12px !important;font-size:.9rem !important;border-radius:10px}
    .header .nav-btn:hover{transform:none}
    .header .brand-text{font-size:1.4rem !important}
    .header .brand-icon{width:36px !important;height:36px !important;font-size:1.2rem !important}
  }
  @keyframes neoFade{from{opacity:0}}
  @keyframes neoPop{from{transform:scale(.85);opacity:0}}
  `;
  function injectCSS() {
    if (document.getElementById('neo-css')) return;
    const st = document.createElement('style');
    st.id = 'neo-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function rootPrefix() {
    // Sahifa arcade/ ichidami yoki chuqurroqmi — asosiy sahifalarga nisbiy yo'l
    const s = document.currentScript || document.querySelector('script[src*="assets/neo.js"]');
    const src = s ? s.getAttribute('src') : '';
    return src.replace(/assets\/neo\.js.*$/, '');
  }
  const ROOT = rootPrefix();

  /**
   * Natija oynasi.
   * opts: {title, subtitle, rows:[[label, value]], isBest, onRestart, restartText, win}
   */
  function gameOver(opts) {
    injectCSS();
    closeOverlay();
    const ov = document.createElement('div');
    ov.className = 'neo-overlay';
    ov.id = 'neoOverlay';
    const rows = (opts.rows || []).map(([l, v]) => `<div class="neo-row"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('');
    ov.innerHTML = `<div class="neo-card" role="dialog" aria-modal="true">
      <h2>${esc(opts.title || "O'yin tugadi")}</h2>
      ${opts.subtitle ? `<p class="neo-sub">${esc(opts.subtitle)}</p>` : ''}
      ${opts.isBest ? '<div class="neo-best">🏆 Yangi rekord!</div>' : ''}
      <div class="neo-rows">${rows}</div>
      <div class="neo-btns">
        <button class="neo-btn" data-r>${esc(opts.restartText || 'Qayta o\'ynash')}</button>
        <a class="neo-btn alt" href="${ROOT}games.html">Arcade</a>
      </div></div>`;
    document.body.appendChild(ov);
    const btn = ov.querySelector('[data-r]');
    btn.onclick = () => { closeOverlay(); opts.onRestart && opts.onRestart(); };
    setTimeout(() => btn.focus(), 50);
    sound.play(opts.win ? 'win' : 'lose');
  }
  function closeOverlay() {
    const o = document.getElementById('neoOverlay');
    if (o) o.remove();
  }

  let muteBtn = null;
  function updateMuteBtn() {
    if (muteBtn) {
      muteBtn.textContent = muted ? '🔇' : '🔊';
      muteBtn.title = muted ? 'Ovozni yoqish' : "Ovozni o'chirish";
    }
  }
  function addMuteButton() {
    injectCSS();
    if (muteBtn) return;
    muteBtn = document.createElement('button');
    muteBtn.className = 'neo-mute';
    muteBtn.type = 'button';
    muteBtn.onclick = e => { sound.toggle(); e.currentTarget.blur(); };
    updateMuteBtn();
    document.body.appendChild(muteBtn);
  }

  // Navigatsiyada joriy bo'limni belgilash
  function markNav() {
    injectCSS();
    const path = location.pathname.replace(/\\/g, '/');
    let section = 'games.html';
    if (/\/python\//.test(path)) section = 'lessons.html';
    else if (/\/(index\.html)?$/.test(path) && !/arcade\//.test(path)) section = 'index.html';
    else if (/lessons?\.html$|lesson\.html/.test(path)) section = 'lessons.html';
    else if (/profile\.html$/.test(path)) section = 'profile.html';
    else if (/result\.html$/.test(path)) section = 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (href === section) (a.closest('.nav-btn') || a).classList.add('neo-active');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markNav);
  else markNav();

  window.Neo = { sound, stats, gameOver, closeOverlay, addMuteButton, root: ROOT, games: GAMES };
})();
