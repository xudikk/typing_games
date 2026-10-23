/* PyCharm Online — ranglar: muharrirda rang namunalari (swatch), rang tanlash oynasi, palitralar va pipetka.
   Qo'llab-quvvatlanadi: #rgb #rrggbb #rrggbbaa, rgb()/rgba(), hsl()/hsla(), CSS rang nomlari va Tailwind klasslari (bg-sky-500). */
'use strict';

window.COLORS = (function () {
  /* ================= Tailwind palitrasi (v3) ================= */
  const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const TWP = {
    slate: 'f8fafc f1f5f9 e2e8f0 cbd5e1 94a3b8 64748b 475569 334155 1e293b 0f172a 020617',
    gray: 'f9fafb f3f4f6 e5e7eb d1d5db 9ca3af 6b7280 4b5563 374151 1f2937 111827 030712',
    zinc: 'fafafa f4f4f5 e4e4e7 d4d4d8 a1a1aa 71717a 52525b 3f3f46 27272a 18181b 09090b',
    neutral: 'fafafa f5f5f5 e5e5e5 d4d4d4 a3a3a3 737373 525252 404040 262626 171717 0a0a0a',
    stone: 'fafaf9 f5f5f4 e7e5e4 d6d3d1 a8a29e 78716c 57534e 44403c 292524 1c1917 0c0a09',
    red: 'fef2f2 fee2e2 fecaca fca5a5 f87171 ef4444 dc2626 b91c1c 991b1b 7f1d1d 450a0a',
    orange: 'fff7ed ffedd5 fed7aa fdba74 fb923c f97316 ea580c c2410c 9a3412 7c2d12 431407',
    amber: 'fffbeb fef3c7 fde68a fcd34d fbbf24 f59e0b d97706 b45309 92400e 78350f 451a03',
    yellow: 'fefce8 fef9c3 fef08a fde047 facc15 eab308 ca8a04 a16207 854d0e 713f12 422006',
    lime: 'f7fee7 ecfccb d9f99d bef264 a3e635 84cc16 65a30d 4d7c0f 3f6212 365314 1a2e05',
    green: 'f0fdf4 dcfce7 bbf7d0 86efac 4ade80 22c55e 16a34a 15803d 166534 14532d 052e16',
    emerald: 'ecfdf5 d1fae5 a7f3d0 6ee7b7 34d399 10b981 059669 047857 065f46 064e3b 022c22',
    teal: 'f0fdfa ccfbf1 99f6e4 5eead4 2dd4bf 14b8a6 0d9488 0f766e 115e59 134e4a 042f2e',
    cyan: 'ecfeff cffafe a5f3fc 67e8f9 22d3ee 06b6d4 0891b2 0e7490 155e75 164e63 083344',
    sky: 'f0f9ff e0f2fe bae6fd 7dd3fc 38bdf8 0ea5e9 0284c7 0369a1 075985 0c4a6e 082f49',
    blue: 'eff6ff dbeafe bfdbfe 93c5fd 60a5fa 3b82f6 2563eb 1d4ed8 1e40af 1e3a8a 172554',
    indigo: 'eef2ff e0e7ff c7d2fe a5b4fc 818cf8 6366f1 4f46e5 4338ca 3730a3 312e81 1e1b4b',
    violet: 'f5f3ff ede9fe ddd6fe c4b5fd a78bfa 8b5cf6 7c3aed 6d28d9 5b21b6 4c1d95 2e1065',
    purple: 'faf5ff f3e8ff e9d5ff d8b4fe c084fc a855f7 9333ea 7e22ce 6b21a8 581c87 3b0764',
    fuchsia: 'fdf4ff fae8ff f5d0fe f0abfc e879f9 d946ef c026d3 a21caf 86198f 701a75 4a044e',
    pink: 'fdf2f8 fce7f3 fbcfe8 f9a8d4 f472b6 ec4899 db2777 be185d 9d174d 831843 500724',
    rose: 'fff1f2 ffe4e6 fecdd3 fda4af fb7185 f43f5e e11d48 be123c 9f1239 881337 4c0519',
  };
  const TW = {};
  for (const [name, list] of Object.entries(TWP)) list.split(' ').forEach((h, i) => { TW[`${name}-${SHADES[i]}`] = '#' + h; });
  TW.white = '#ffffff'; TW.black = '#000000';
  const TW_NAMES = Object.keys(TWP).join('|');
  const TW_PREFIX = 'bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|shadow|outline|decoration|accent|caret|divide|placeholder';
  const TW_RE = new RegExp(`(?<![\\w-])((?:[\\w-]+:)*)(${TW_PREFIX})-((?:${TW_NAMES})-(?:${SHADES.join('|')})|white|black)(?:\\/(\\d{1,3}))?(?![\\w-])`, 'g');

  // CSS rang nomlari (eng ko'p ishlatiladiganlari)
  const NAMED = {
    black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
    pink: '#ffc0cb', brown: '#a52a2a', gray: '#808080', grey: '#808080', silver: '#c0c0c0', gold: '#ffd700', navy: '#000080', teal: '#008080',
    maroon: '#800000', olive: '#808000', lime: '#00ff00', aqua: '#00ffff', cyan: '#00ffff', magenta: '#ff00ff', fuchsia: '#ff00ff', indigo: '#4b0082',
    violet: '#ee82ee', coral: '#ff7f50', crimson: '#dc143c', tomato: '#ff6347', salmon: '#fa8072', khaki: '#f0e68c', tan: '#d2b48c',
    beige: '#f5f5dc', ivory: '#fffff0', lavender: '#e6e6fa', turquoise: '#40e0d0', skyblue: '#87ceeb', steelblue: '#4682b4', royalblue: '#4169e1',
    dodgerblue: '#1e90ff', deepskyblue: '#00bfff', lightblue: '#add8e6', darkblue: '#00008b', forestgreen: '#228b22', seagreen: '#2e8b57',
    limegreen: '#32cd32', darkgreen: '#006400', lightgreen: '#90ee90', orchid: '#da70d6', plum: '#dda0dd', chocolate: '#d2691e', sienna: '#a0522d',
    darkred: '#8b0000', firebrick: '#b22222', hotpink: '#ff69b4', deeppink: '#ff1493', lightgray: '#d3d3d3', darkgray: '#a9a9a9', dimgray: '#696969',
    whitesmoke: '#f5f5f5', gainsboro: '#dcdcdc', slategray: '#708090', midnightblue: '#191970', rebeccapurple: '#663399', darkorange: '#ff8c00',
  };
  const NAMED_RE = new RegExp(`(?<![\\w#.-])(${Object.keys(NAMED).sort((a, b) => b.length - a.length).join('|')})(?![\\w-])`, 'gi');
  const FN_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?)\(\s*[\d.%+-]+(?:deg)?\s*[,\s]\s*[\d.%+-]+\s*[,\s]\s*[\d.%+-]+\s*(?:[,/]\s*[\d.%]+\s*)?\)/g;

  /* ================= Rang hisob-kitoblari ================= */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function parse(str) {
    str = str.trim().toLowerCase();
    if (NAMED[str]) str = NAMED[str];
    let m;
    if ((m = /^#([0-9a-f]{3,8})$/.exec(str))) {
      let h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
      if (h.length !== 6 && h.length !== 8) return null;
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1, fmt: 'hex' };
    }
    if ((m = /^(rgba?|hsla?)\((.*)\)$/.exec(str))) {
      const parts = m[2].split(/[\s,/]+/).filter(Boolean);
      const num = (v, max) => v.endsWith('%') ? parseFloat(v) / 100 * max : parseFloat(v);
      const a = parts[3] !== undefined ? num(parts[3], 1) : 1;
      if (m[1].startsWith('rgb')) return { r: clamp(num(parts[0], 255), 0, 255), g: clamp(num(parts[1], 255), 0, 255), b: clamp(num(parts[2], 255), 0, 255), a: clamp(a, 0, 1), fmt: 'rgb' };
      const rgb = hslToRgb(parseFloat(parts[0]), parseFloat(parts[1]) / 100, parseFloat(parts[2]) / 100);
      return Object.assign(rgb, { a: clamp(a, 0, 1), fmt: 'hsl' });
    }
    return null;
  }
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  }
  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return { h, s, l };
  }
  function rgbToHsv({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) h = (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
    return { h, s: max ? d / max : 0, v: max };
  }
  function hsvToRgb(h, s, v) {
    const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
  }
  const hex2 = n => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  function toHex(c) { return '#' + hex2(c.r) + hex2(c.g) + hex2(c.b) + (c.a < 1 ? hex2(c.a * 255) : ''); }
  function format(c, fmt) {
    const a = Math.round(c.a * 100) / 100;
    if (fmt === 'rgb') return a < 1 ? `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a})` : `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
    if (fmt === 'hsl') {
      const { h, s, l } = rgbToHsl(c);
      return a < 1 ? `hsla(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a})` : `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    }
    return toHex(c);
  }
  const css = c => `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a})`;
  function nearestTw(c) {
    let best = null, bd = Infinity;
    for (const [k, h] of Object.entries(TW)) {
      const t = parse(h), d = (t.r - c.r) ** 2 + (t.g - c.g) ** 2 + (t.b - c.b) ** 2;
      if (d < bd) { bd = d; best = k; }
    }
    return best;
  }

  /* ================= Muharrirdagi namunalar ================= */
  let items = [];   // {mark, widget, kind:'css'|'tw', ...}
  let scanTimer = null;
  const enabled = () => !(state.settings && state.settings.colorSwatches === false);

  function clearAll() {
    items.forEach(it => { it.mark.clear(); it.bm.clear(); });
    items = [];
  }
  function contextOk(cm, lang, ln, ch, line) {
    // HTML'da: <style> ichida, style="..." ichida yoki atribut qiymatida (fill="#f00")
    if (lang !== 'html') return true;
    const mode = cm.getModeAt({ line: ln, ch: ch + 1 }).name;
    if (mode === 'css' || mode === 'javascript') return true;
    const before = line.slice(0, ch);
    return /\b[\w-]+\s*=\s*["'][^"']*$/.test(before);
  }
  function scan() {
    if (typeof editor === 'undefined' || !editor) return;
    clearAll();
    const p = state.active || '';
    const lang = window.WEB && WEB.langOf(p);
    if (!enabled() || !lang || lang === 'sql' || lang === 'json') return;
    const doc = editor.getDoc();
    if (doc.lineCount() > 4000) return;
    editor.operation(() => {
      doc.eachLine(lh => {
        const ln = doc.getLineNumber(lh);
        const line = lh.text;
        if (line.length > 2000) return;
        const found = [];
        FN_RE.lastIndex = 0;
        let m;
        while ((m = FN_RE.exec(line))) found.push({ ch: m.index, len: m[0].length, text: m[0], kind: 'css' });
        // CSS rang nomlari — faqat CSS kontekstida (xususiyat qiymati sifatida)
        if (lang === 'css' || lang === 'html') {
          NAMED_RE.lastIndex = 0;
          while ((m = NAMED_RE.exec(line))) {
            const before = line.slice(0, m.index);
            if (!/:\s*[^;{}]*$/.test(before)) continue;
            const mode = editor.getModeAt({ line: ln, ch: m.index + 1 }).name;
            if (lang === 'html' && mode !== 'css' && !/\bstyle\s*=\s*["'][^"']*$/i.test(before)) continue;
            const tok = editor.getTokenAt({ line: ln, ch: m.index + 1 });
            if (tok.type && /comment|string/.test(tok.type)) continue;
            found.push({ ch: m.index, len: m[0].length, text: m[0], kind: 'css' });
          }
        }
        // Tailwind klasslari — class="..." ichida
        if (lang === 'html' || lang === 'js') {
          TW_RE.lastIndex = 0;
          while ((m = TW_RE.exec(line))) {
            if (!/\bclass(Name)?\s*=\s*["'`][^"'`]*$/.test(line.slice(0, m.index)) && lang === 'html') continue;
            const start = m.index + m[1].length;
            found.push({ ch: start, len: m[0].length - m[1].length, text: m[0].slice(m[1].length), kind: 'tw', prefix: m[2], color: m[3], alpha: m[4] });
          }
        }
        for (const f of found) {
          if (f.kind === 'css' && !contextOk(editor, lang, ln, f.ch, line)) continue;
          const c = f.kind === 'tw' ? Object.assign(parse(TW[f.color]), { a: f.alpha ? +f.alpha / 100 : 1 }) : parse(f.text);
          if (!c) continue;
          const from = { line: ln, ch: f.ch }, to = { line: ln, ch: f.ch + f.len };
          const w = document.createElement('span');
          w.className = 'cm-color-swatch' + (f.kind === 'tw' ? ' tw' : '');
          w.title = f.kind === 'tw' ? `${f.text} = ${TW[f.color]} — bosing: palitradan tanlash` : `${f.text} — bosing: rang tanlash`;
          w.innerHTML = `<i style="background:${css(c)}"></i>`;
          // inclusive — rang matni almashtirilganda belgi saqlanib qoladi (jonli tahrir uchun)
          const mark = editor.markText(from, to, { className: 'cm-color-text', inclusiveLeft: true, inclusiveRight: true, clearWhenEmpty: false });
          const bm = editor.setBookmark(from, { widget: w, insertLeft: true, handleMouseEvents: false });
          const it = { mark, bm, w, kind: f.kind, prefix: f.prefix, alpha: f.alpha, fmt: c.fmt || 'hex' };
          w.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); openFor(it, w); });
          items.push(it);
        }
      });
    });
  }
  function scanSoon(d = 250) { clearTimeout(scanTimer); scanTimer = setTimeout(scan, d); }

  /* ================= Rang tanlash oynasi ================= */
  const pop = document.createElement('div');
  pop.className = 'color-pop';
  pop.innerHTML = `
    <div class="cp-head"><span id="cpTitle">Rang tanlash</span><button class="cp-x" data-cp="close" title="Yopish (Esc)">×</button></div>
    <div class="cp-sv" id="cpSv"><div class="cp-sv-white"></div><div class="cp-sv-black"></div><div class="cp-thumb" id="cpThumb"></div></div>
    <div class="cp-row">
      <button class="cp-eye" data-cp="eye" title="Pipetka — ekrandagi istalgan joydan rang olish"><i class="fa-solid fa-eye-dropper"></i></button>
      <div class="cp-sliders">
        <input type="range" id="cpHue" min="0" max="360" step="1" class="cp-hue" aria-label="Rang tusi">
        <input type="range" id="cpAlpha" min="0" max="100" step="1" class="cp-alpha" aria-label="Shaffoflik">
      </div>
      <div class="cp-preview"><i id="cpOld" title="Eski rang"></i><i id="cpNew" title="Yangi rang"></i></div>
    </div>
    <div class="cp-row cp-inputs">
      <select id="cpFmt" aria-label="Format"><option value="hex">HEX</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select>
      <input id="cpText" spellcheck="false" autocomplete="off" aria-label="Rang qiymati">
    </div>
    <div class="cp-tabs"><button class="on" data-tab="tw">Tailwind</button><button data-tab="recent">So'nggi</button><button data-tab="named">CSS nomlari</button></div>
    <div class="cp-pal" id="cpPal"></div>
    <div class="cp-foot"><span id="cpHint"></span><button data-cp="cancel">Bekor qilish</button><button class="ok" data-cp="ok">OK</button></div>`;
  document.body.appendChild(pop);
  const $p = s => pop.querySelector(s);
  let cur = null;          // joriy rang {r,g,b,a}
  let hsv = { h: 0, s: 0, v: 0 };
  let target = null;       // tahrirlanayotgan namuna yoki kursor joyi
  let original = null;     // bekor qilish uchun asl matn
  let fmt = 'hex';
  let palTab = 'tw';
  const RECENT_KEY = 'pycharm_recent_colors';
  const getRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; } };
  function pushRecent(hex) {
    const r = [hex].concat(getRecent().filter(x => x !== hex)).slice(0, 24);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(r)); } catch (e) { /* e'tiborsiz */ }
  }

  function renderPicker(skipText) {
    const hueRgb = hsvToRgb(hsv.h, 1, 1);
    $p('#cpSv').style.background = `rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b})`;
    $p('#cpThumb').style.left = (hsv.s * 100) + '%';
    $p('#cpThumb').style.top = ((1 - hsv.v) * 100) + '%';
    $p('#cpHue').value = hsv.h;
    $p('#cpAlpha').value = Math.round(cur.a * 100);
    $p('#cpAlpha').style.setProperty('--c', `rgb(${cur.r}, ${cur.g}, ${cur.b})`);
    $p('#cpNew').style.background = css(cur);
    $p('#cpFmt').value = fmt;
    if (!skipText) $p('#cpText').value = target && target.kind === 'tw' ? twValue() : format(cur, fmt);
    $p('#cpText').classList.remove('bad');
  }
  function renderPalette() {
    pop.querySelectorAll('.cp-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === palTab));
    const pal = $p('#cpPal');
    if (palTab === 'tw') {
      pal.className = 'cp-pal tw';
      pal.innerHTML = Object.keys(TWP).map(n => `<div class="cp-tw-row"><span>${n}</span>${SHADES.map(s => `<i data-tw="${n}-${s}" data-hex="${TW[n + '-' + s]}" style="background:${TW[n + '-' + s]}" title="${n}-${s}  ${TW[n + '-' + s]}"></i>`).join('')}</div>`).join('');
    } else if (palTab === 'recent') {
      const r = getRecent();
      pal.className = 'cp-pal grid';
      pal.innerHTML = r.length ? r.map(h => `<i data-hex="${h}" style="background:${h}" title="${h}"></i>`).join('') : '<p>Hali rang tanlanmagan</p>';
    } else {
      pal.className = 'cp-pal grid';
      pal.innerHTML = Object.entries(NAMED).filter(([n], i, a) => a.findIndex(x => x[1] === NAMED[n]) === i).map(([n, h]) => `<i data-hex="${h}" data-name="${n}" style="background:${h}" title="${n}  ${h}"></i>`).join('');
    }
    const sel = target && target.kind === 'tw' ? pal.querySelector(`[data-tw="${twColorNow}"]`) : null;
    if (sel) sel.classList.add('sel');
  }
  let twColorNow = null;
  function twValue() {
    if (twColorNow) return `${target.prefix}-${twColorNow}${cur.a < 1 ? '/' + Math.round(cur.a * 100) : ''}`;
    return `${target.prefix}-[${toHex(cur)}]`;
  }

  // Tanlangan rangni muharrirga yozish (jonli)
  function applyToEditor() {
    if (!target) return;
    const text = target.kind === 'tw' ? twValue() : format(cur, fmt);
    if (target.kind === 'insert') {
      const r = target.range.find();
      if (!r) return;
      editor.replaceRange(text, r.from, r.to, '+color');
      return;
    }
    const r = target.mark.find();
    if (!r) return;
    if (editor.getRange(r.from, r.to) !== text) editor.replaceRange(text, r.from, r.to, '+color');
  }
  function setColor(c, opts = {}) {
    cur = { r: c.r, g: c.g, b: c.b, a: c.a ?? cur.a };
    if (!opts.keepHsv) hsv = rgbToHsv(cur);
    if (!opts.keepTw) twColorNow = null;
    renderPicker(opts.skipText);
    if (opts.paletteRefresh) renderPalette();
    applyToEditor();
  }

  function openAt(anchorEl, coords) {
    pop.classList.add('show');
    const r = anchorEl ? anchorEl.getBoundingClientRect() : coords;
    const w = 300, h = pop.offsetHeight || 470;
    let left = Math.min(innerWidth - w - 10, Math.max(10, r.left));
    let top = r.bottom + 6;
    if (top + h > innerHeight - 10) top = Math.max(10, r.top - h - 6);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function openFor(it, el) {
    const r = it.mark.find();
    if (!r) return;
    const text = editor.getRange(r.from, r.to);
    // Belgilarni yangilashni to'xtatamiz, aks holda jonli tahrirda belgi yo'qoladi
    clearTimeout(scanTimer);
    target = it;
    original = { from: r.from, text };
    if (it.kind === 'tw') {
      const m = new RegExp(`^(${TW_PREFIX})-(.+?)(?:\\/(\\d+))?$`).exec(text);
      twColorNow = m ? m[2] : null;
      const c = parse(TW[twColorNow] || '#000');
      cur = Object.assign(c, { a: m && m[3] ? +m[3] / 100 : 1 });
      fmt = 'hex';
      palTab = 'tw';
      $p('#cpTitle').textContent = `Tailwind: ${it.prefix}-…`;
      $p('#cpHint').textContent = "Palitradan tanlang yoki ixtiyoriy rang — bg-[#…]";
    } else {
      cur = parse(text);
      fmt = cur.fmt || 'hex';
      twColorNow = null;
      $p('#cpTitle').textContent = 'Rang tanlash';
      $p('#cpHint').textContent = NAMED[text.toLowerCase()] ? `"${text}" rangini o'zgartirish` : '';
    }
    hsv = rgbToHsv(cur);
    $p('#cpOld').style.background = css(cur);
    renderPicker();
    renderPalette();
    openAt(el);
  }
  // Ctrl+Alt+C — kursor ostidagi rangni tahrirlash yoki yangi rang qo'shish
  function pickAtCursor() {
    if (!state.active) return;
    const pos = editor.getCursor();
    const hit = items.find(it => {
      const r = it.mark.find();
      return r && r.from.line === pos.line && r.from.ch <= pos.ch && r.to.ch >= pos.ch;
    });
    if (hit) return openFor(hit, hit.w);
    const from = editor.getCursor('from'), to = editor.getCursor('to');
    const sel = editor.getRange(from, to);
    const c = parse(sel) || { r: 59, g: 130, b: 246, a: 1 };
    clearTimeout(scanTimer);
    const range = editor.markText(from, to, { inclusiveLeft: true, inclusiveRight: true, clearWhenEmpty: false });
    target = { kind: 'insert', range };
    original = { from, text: sel };
    cur = Object.assign({}, c, { a: c.a ?? 1 });
    fmt = c.fmt || 'hex';
    twColorNow = null;
    hsv = rgbToHsv(cur);
    $p('#cpTitle').textContent = sel ? 'Rangni almashtirish' : 'Rang qo\'shish';
    $p('#cpHint').textContent = '';
    $p('#cpOld').style.background = css(cur);
    renderPicker();
    renderPalette();
    const cc = editor.cursorCoords(from, 'window');
    openAt(null, { left: cc.left, top: cc.top, bottom: cc.bottom });
    applyToEditor();
  }

  function close(commit) {
    if (!pop.classList.contains('show')) return;
    pop.classList.remove('show');
    if (target) {
      if (commit) pushRecent(toHex(cur));
      else if (original) {
        // Bekor qilish — asl matnni qaytaramiz
        const r = target.kind === 'insert' ? target.range.find() : target.mark.find();
        if (r) editor.replaceRange(original.text, r.from, r.to, '+color');
      }
      if (target.kind === 'insert') target.range.clear();
    }
    target = null;
    original = null;
    editor.focus();
    scanSoon(50);
  }

  // SV maydonida sudrash
  const sv = $p('#cpSv');
  function svAt(e) {
    const r = sv.getBoundingClientRect();
    hsv.s = clamp((e.clientX - r.left) / r.width, 0, 1);
    hsv.v = clamp(1 - (e.clientY - r.top) / r.height, 0, 1);
    setColor(Object.assign(hsvToRgb(hsv.h, hsv.s, hsv.v), { a: cur.a }), { keepHsv: true });
  }
  sv.addEventListener('pointerdown', e => {
    sv.setPointerCapture(e.pointerId);
    svAt(e);
    const move = ev => svAt(ev);
    const up = () => { sv.removeEventListener('pointermove', move); sv.removeEventListener('pointerup', up); };
    sv.addEventListener('pointermove', move);
    sv.addEventListener('pointerup', up);
  });
  $p('#cpHue').addEventListener('input', e => {
    hsv.h = +e.target.value;
    setColor(Object.assign(hsvToRgb(hsv.h, hsv.s, hsv.v), { a: cur.a }), { keepHsv: true });
  });
  $p('#cpAlpha').addEventListener('input', e => setColor(Object.assign({}, cur, { a: +e.target.value / 100 }), { keepHsv: true, keepTw: true }));
  $p('#cpFmt').addEventListener('change', e => { fmt = e.target.value; if (target && target.kind === 'tw') twColorNow = null; renderPicker(); applyToEditor(); });
  $p('#cpText').addEventListener('input', e => {
    const v = e.target.value.trim();
    const twm = /^(?:[\w-]+-)?((?:[a-z]+)-\d{2,3}|white|black)(?:\/(\d+))?$/.exec(v);
    const c = parse(v) || (twm && TW[twm[1]] ? Object.assign(parse(TW[twm[1]]), { a: twm[2] ? +twm[2] / 100 : 1 }) : null);
    if (!c) { e.target.classList.add('bad'); return; }
    if (twm && TW[twm[1]] && target && target.kind === 'tw') { twColorNow = twm[1]; setColor(c, { skipText: true, keepTw: true, paletteRefresh: true }); }
    else setColor(c, { skipText: true });
  });
  $p('#cpText').addEventListener('keydown', e => { if (e.key === 'Enter') close(true); });
  pop.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); } });
  pop.querySelector('.cp-tabs').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    palTab = b.dataset.tab;
    renderPalette();
  });
  $p('#cpPal').addEventListener('click', e => {
    const i = e.target.closest('i[data-hex]');
    if (!i) return;
    const c = parse(i.dataset.hex);
    if (target && target.kind === 'tw' && i.dataset.tw) {
      twColorNow = i.dataset.tw;
      setColor(Object.assign(c, { a: cur.a }), { keepTw: true, paletteRefresh: true });
    } else {
      setColor(Object.assign(c, { a: cur.a }), { paletteRefresh: palTab === 'tw' });
    }
  });
  $p('#cpPal').addEventListener('dblclick', e => { if (e.target.closest('i[data-hex]')) close(true); });
  pop.addEventListener('click', async e => {
    const b = e.target.closest('[data-cp]');
    if (!b) return;
    const act = b.dataset.cp;
    if (act === 'ok') close(true);
    else if (act === 'cancel' || act === 'close') close(false);
    else if (act === 'eye') eyeDropper();
  });
  document.addEventListener('mousedown', e => {
    if (pop.classList.contains('show') && !pop.contains(e.target) && !e.target.closest('.cm-color-swatch')) close(true);
  }, true);

  // Pipetka (EyeDropper API — Chrome / Edge)
  async function eyeDropper() {
    if (!('EyeDropper' in window)) {
      toast("Pipetka bu brauzerda ishlamaydi. Chrome yoki Edge'dan foydalaning.", 'error');
      return;
    }
    try {
      pop.classList.add('picking');
      const res = await new window.EyeDropper().open();
      const c = parse(res.sRGBHex);
      if (c) {
        if (target && target.kind === 'tw') twColorNow = TW_EXACT(res.sRGBHex);
        setColor(Object.assign(c, { a: cur.a }), { keepTw: !!(target && target.kind === 'tw' && twColorNow), paletteRefresh: true });
        status(`Pipetka: ${res.sRGBHex}${target && target.kind === 'tw' && !twColorNow ? ` (eng yaqin Tailwind: ${nearestTw(c)})` : ''}`);
      }
    } catch (e) { /* foydalanuvchi bekor qildi */ }
    pop.classList.remove('picking');
  }
  const TW_EXACT = hex => Object.keys(TW).find(k => TW[k] === hex.toLowerCase()) || null;

  /* ================= Ulash ================= */
  function attach() {
    if (typeof editor === 'undefined' || !editor) return setTimeout(attach, 50);
    editor.on('change', (cm, ch) => { if (!pop.classList.contains('show')) scanSoon(); });
    editor.on('swapDoc', () => { close(true); scanSoon(10); });
    const keys = editor.getOption('extraKeys');
    keys['Ctrl-Alt-C'] = pickAtCursor;
    editor.setOption('extraKeys', keys);
    scanSoon(100);
  }
  attach();
  Object.assign(actions, { colorPicker: () => pickAtCursor() });

  return { parse, format, scan: scanSoon, pickAtCursor, TW, nearestTw };
})();
