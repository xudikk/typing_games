/* PyCharm Online — PyCharm'dagi qo'shimcha imkoniyatlar:
   Rename (Shift+F6), Find Usages (Alt+F7), Live Templates (Tab / Ctrl+J), Surround With (Ctrl+Alt+T),
   TODO oynasi, breadcrumbs, chekinish chiziqlari, blok izoh (Ctrl+Shift+/), Settings (Ctrl+Alt+S). */
'use strict';

window.EXTRAS = (function () {
  const q = s => document.querySelector(s);
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const langOf = p => isPy(p) ? 'py' : (WEB.langOf(p) || 'txt');
  const S = () => (state.settings = Object.assign({ wrap: false, guides: true, colorSwatches: true, autoPopup: true, emmet: true, templates: true, whitespace: false }, state.settings || {}));

  /* ===================== Rename (Shift+F6) ===================== */
  async function rename() {
    if (!state.active) return;
    const pos = editor.getCursor();
    const lang = langOf(state.active);
    const w = KEYS.wordUnder(editor, pos, lang === 'css' || lang === 'html' ? '-' : '');
    if (!w) return status("Kursor ostida nom yo'q");
    const old = w.text;
    const re = new RegExp(`(?<![\\w$${lang === 'css' || lang === 'html' ? '-' : ''}])${escRe(old)}(?![\\w$${lang === 'css' || lang === 'html' ? '-' : ''}])`, 'g');
    const countIn = t => (t.match(re) || []).length;
    const here = countIn(editor.getValue());
    let elsewhere = 0;
    for (const p of Object.keys(state.files)) if (p !== state.active) elsewhere += countIn(docs[p] ? docs[p].getValue() : state.files[p]);
    const name = await modal({
      title: `Nomini o'zgartirish: ${old}`,
      body: `Shu faylda <b>${here}</b> ta${elsewhere ? `, boshqa fayllarda <b>${elsewhere}</b> ta` : ''} uchraydi.
        <label class="rn-opt"><input type="checkbox" id="rnAll" ${elsewhere && lang === 'py' ? 'checked' : ''} ${elsewhere ? '' : 'disabled'}> Butun loyihada o'zgartirish</label>
        <label class="rn-opt"><input type="checkbox" id="rnSkip" checked> Izoh va satrlarni o'tkazib yuborish (joriy faylda)</label>`,
      input: old,
    });
    if (!name || name === old) return;
    if (!/^[A-Za-z_$][\w$-]*$/.test(name)) return toast("Noto'g'ri nom", 'error');
    const all = q('#rnAll') && q('#rnAll').checked;
    const skip = q('#rnSkip') && q('#rnSkip').checked;
    let n = 0;
    // Joriy fayl: tokenlar bo'yicha (izoh/satrlar ichini tashlab ketish mumkin)
    editor.operation(() => {
      const doc = editor.getDoc();
      for (let ln = doc.lastLine(); ln >= 0; ln--) {
        const t = doc.getLine(ln);
        const hits = [];
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(t))) hits.push(m.index);
        for (let k = hits.length - 1; k >= 0; k--) {
          const ch = hits[k];
          if (skip) {
            const tok = editor.getTokenAt({ line: ln, ch: ch + 1 });
            if (tok.type && /comment|string/.test(tok.type) && !(lang === 'html' && /string/.test(tok.type))) continue;
          }
          doc.replaceRange(name, { line: ln, ch }, { line: ln, ch: ch + old.length }, '+rename');
          n++;
        }
      }
    });
    if (all) {
      for (const p of Object.keys(state.files)) {
        if (p === state.active) continue;
        const src = docs[p] ? docs[p].getValue() : state.files[p];
        const out = src.replace(re, () => { n++; return name; });
        if (out !== src) { state.files[p] = out; if (docs[p]) docs[p].setValue(out); }
      }
    }
    persist(); syncFS();
    toast(`✏️ <b>${esc(old)}</b> → <b>${esc(name)}</b>: ${n} ta joyda o'zgartirildi`, 'success');
  }

  /* ===================== Find Usages (Alt+F7) ===================== */
  function findUsages() {
    if (!state.active) return;
    const lang = langOf(state.active);
    const w = KEYS.wordUnder(editor, editor.getCursor(), lang === 'css' || lang === 'html' ? '-' : '');
    if (!w) return status("Kursor ostida nom yo'q");
    KEYS.searchFor(w.text, { word: true, case: true });
  }

  /* ===================== Live Templates ===================== */
  const C = '\u0001';
  const TEMPLATES = {
    py: {
      main: ['if __name__ == "__main__"', `if __name__ == "__main__":\n    ${C}main()`],
      def: ['Funksiya', `def ${C}nom(${C}):\n    ${C}pass`],
      cls: ['Klass', `class ${C}Nom:\n    def __init__(self${C}):\n        ${C}pass`],
      init: ['__init__ metodi', `def __init__(self${C}):\n    ${C}pass`],
      for: ['for sikli', `for ${C}x in ${C}royxat:\n    ${C}pass`],
      fori: ['for i in range', `for i in range(${C}10):\n    ${C}pass`],
      iter: ['enumerate bilan sikl', `for i, ${C}x in enumerate(${C}royxat):\n    ${C}pass`],
      while: ['while sikli', `while ${C}True:\n    ${C}pass`],
      ifm: ['if / else', `if ${C}shart:\n    ${C}pass\nelse:\n    ${C}pass`],
      try: ['try / except', `try:\n    ${C}pass\nexcept ${C}Exception as e:\n    ${C}print(e)`],
      with: ['with open', `with open("${C}fayl.txt", encoding="utf-8") as f:\n    ${C}data = f.read()`],
      prop: ['@property', `@property\ndef ${C}nom(self):\n    return self._${C}nom`],
      lc: ['List comprehension', `[${C}x for x in ${C}royxat if ${C}x]`],
      dc: ['Dict comprehension', `{${C}k: ${C}v for ${C}k, v in ${C}lugat.items()}`],
      pr: ['print(f"...")', `print(f"${C}")`],
      test: ['unittest TestCase', `class Test${C}Nom(unittest.TestCase):\n    def test_${C}birinchi(self):\n        self.assertEqual(${C}, ${C})`],
      lam: ['lambda', `lambda ${C}x: ${C}`],
    },
    js: {
      log: ['console.log', `console.log(${C});`],
      fn: ['function', `function ${C}nom(${C}) {\n  ${C}\n}`],
      afn: ['async function', `async function ${C}nom(${C}) {\n  ${C}\n}`],
      af: ['Arrow funksiya', `const ${C}nom = (${C}) => {\n  ${C}\n};`],
      for: ['for sikli', `for (let i = 0; i < ${C}arr.length; i++) {\n  ${C}\n}`],
      forof: ['for...of', `for (const ${C}x of ${C}arr) {\n  ${C}\n}`],
      forin: ['for...in', `for (const ${C}k in ${C}obj) {\n  ${C}\n}`],
      if: ['if', `if (${C}) {\n  ${C}\n}`],
      ife: ['if / else', `if (${C}) {\n  ${C}\n} else {\n  ${C}\n}`],
      tryc: ['try / catch', `try {\n  ${C}\n} catch (e) {\n  console.error(e);\n}`],
      qs: ['querySelector', `document.querySelector('${C}')`],
      ael: ['addEventListener', `${C}el.addEventListener('${C}click', (e) => {\n  ${C}\n});`],
      fetchj: ['fetch + JSON', `const res = await fetch('${C}url');\nconst data = await res.json();\n${C}`],
      cls: ['class', `class ${C}Nom {\n  constructor(${C}) {\n    ${C}\n  }\n}`],
      imp: ['import', `import { ${C} } from '${C}';`],
      tmo: ['setTimeout', `setTimeout(() => {\n  ${C}\n}, ${C}1000);`],
      iife: ['IIFE', `(function () {\n  ${C}\n})();`],
    },
    css: {
      media: ['@media', `@media (max-width: ${C}768px) {\n  ${C}\n}`],
      flexc: ['Flex markaz', `display: flex;\nalign-items: center;\njustify-content: center;${C}`],
      grid: ['Grid ustunlar', `display: grid;\ngrid-template-columns: repeat(${C}3, 1fr);\ngap: ${C}16px;`],
      kf: ['@keyframes', `@keyframes ${C}nom {\n  from { ${C} }\n  to { ${C} }\n}`],
      root: [':root o\'zgaruvchilar', `:root {\n  --${C}asosiy: ${C}#3b82f6;\n}`],
      tr: ['transition', `transition: ${C}all .3s ease;`],
    },
    sql: {
      sel: ['SELECT', `SELECT ${C}*\nFROM ${C}jadval\nWHERE ${C};`],
      ins: ['INSERT', `INSERT INTO ${C}jadval (${C}) VALUES (${C});`],
      upd: ['UPDATE', `UPDATE ${C}jadval SET ${C} WHERE ${C};`],
      del: ['DELETE', `DELETE FROM ${C}jadval WHERE ${C};`],
      ct: ['CREATE TABLE', `CREATE TABLE IF NOT EXISTS ${C}jadval (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  ${C}nom TEXT NOT NULL\n);`],
      join: ['JOIN', `SELECT ${C}*\nFROM ${C}a\nJOIN ${C}b ON a.id = b.${C}a_id;`],
      grp: ['GROUP BY', `SELECT ${C}ustun, COUNT(*) AS soni\nFROM ${C}jadval\nGROUP BY ${C}ustun;`],
    },
    html: {
      script: ['<script>', `<script>\n  ${C}\n</script>`],
      style: ['<style>', `<style>\n  ${C}\n</style>`],
    },
  };
  // Cheklangan "placeholder" so'zlar: birinchi to'xtash joyida ism tanlab qo'yiladi
  function templateFor(lang) {
    if (lang === 'html') {
      // HTML ichida: kursor <script> yoki <style> ichida bo'lsa — JS/CSS shablonlari
      const m = editor.getModeAt(editor.getCursor()).name;
      if (m === 'javascript') return TEMPLATES.js;
      if (m === 'css') return TEMPLATES.css;
      return TEMPLATES.html;
    }
    return TEMPLATES[lang] || null;
  }
  function insertTemplate(cm, from, to, body) {
    const line = cm.getLine(from.line);
    const indent = (line.match(/^\s*/) || [''])[0];
    const text = body.split('\n').map((l, i) => i ? indent + l : l).join('\n');
    // C belgisidan keyingi standart so'zni tanlangan holda qoldirish uchun EMMET.insert ishlatiladi
    EMMET.insert(cm, from, to, text);
    // Birinchi to'xtash joyidagi so'zni tanlab qo'yamiz (yozilganda almashadi)
    const c = cm.getCursor();
    const after = cm.getLine(c.line).slice(c.ch).match(/^[\w.]+/);
    if (after && /^(nom|Nom|x|royxat|shart|arr|obj|jadval|ustun|url|fayl|el|k|v|lugat|True|main|birinchi|data|a|b|e|a_id|asosiy|10|1000|768px|3|16px|#3b82f6)$/.test(after[0])) {
      cm.setSelection(c, { line: c.line, ch: c.ch + after[0].length });
    }
  }
  function tryTemplate(cm) {
    if (!S().templates || cm.somethingSelected() || cm.listSelections().length > 1 || !state.active) return false;
    const set = templateFor(langOf(state.active));
    if (!set) return false;
    const cur = cm.getCursor();
    const before = cm.getLine(cur.line).slice(0, cur.ch);
    const m = before.match(/(?:^|[^\w$.])([a-z][\w]*)$/i);
    if (!m || !set[m[1]]) return false;
    const tok = cm.getTokenAt(cur);
    if (tok.type && /string|comment/.test(tok.type)) return false;
    insertTemplate(cm, { line: cur.line, ch: cur.ch - m[1].length }, cur, set[m[1]][1]);
    return true;
  }
  function templatesPopup() {
    if (!state.active) return;
    const set = templateFor(langOf(state.active));
    if (!set) return status("Bu fayl turi uchun shablonlar yo'q");
    KEYS.picker({
      title: 'Live Templates — qisqartmani yozib Tab bosing yoki shu yerdan tanlang',
      items: Object.entries(set).map(([k, [desc]]) => ({ label: k, detail: desc, value: k })),
      onPick: k => {
        const c = editor.getCursor();
        insertTemplate(editor, c, c, set[k][1]);
        editor.focus();
      },
    });
  }

  /* ===================== Surround With (Ctrl+Alt+T) ===================== */
  function surround() {
    if (!state.active) return;
    const lang = langOf(state.active);
    const mode = lang === 'html' ? editor.getModeAt(editor.getCursor()).name : '';
    let from = editor.getCursor('from'), to = editor.getCursor('to');
    if (!editor.somethingSelected()) {
      from = { line: from.line, ch: 0 };
      to = { line: from.line, ch: editor.getLine(from.line).length };
    } else if (from.ch !== 0 || to.ch !== 0) {
      // Qatorlarni to'liq olamiz
      from = { line: from.line, ch: 0 };
      if (to.ch === 0 && to.line > from.line) to = { line: to.line - 1, ch: editor.getLine(to.line - 1).length };
      else to = { line: to.line, ch: editor.getLine(to.line).length };
    } else if (to.line > from.line) {
      to = { line: to.line - 1, ch: editor.getLine(to.line - 1).length };
    }
    const text = editor.getRange(from, to);
    const lines = text.split('\n');
    const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length));
    const base = ' '.repeat(isFinite(indent) ? indent : 0);
    const unit = ' '.repeat(editor.getOption('indentUnit'));
    const body = lines.map(l => (l.trim() ? unit + l : l)).join('\n');
    const opts = lang === 'py' ? [
      ['if', `${base}if ${C}shart:\n${body}`], ['if / else', `${base}if ${C}shart:\n${body}\n${base}else:\n${base}${unit}pass`],
      ['for', `${base}for ${C}x in ${C}royxat:\n${body}`], ['while', `${base}while ${C}True:\n${body}`],
      ['try / except', `${base}try:\n${body}\n${base}except ${C}Exception as e:\n${base}${unit}print(e)`], ['with', `${base}with ${C}open("fayl.txt") as f:\n${body}`],
      ['def (funksiya)', `${base}def ${C}nom():\n${body}`],
    ] : (lang === 'js' || mode === 'javascript') ? [
      ['if', `${base}if (${C}) {\n${body}\n${base}}`], ['try / catch', `${base}try {\n${body}\n${base}} catch (e) {\n${base}${unit}console.error(e);\n${base}}`],
      ['for...of', `${base}for (const ${C}x of ${C}arr) {\n${body}\n${base}}`], ['function', `${base}function ${C}nom() {\n${body}\n${base}}`],
      ['{ } blok', `${base}{\n${body}\n${base}}`], ['setTimeout', `${base}setTimeout(() => {\n${body}\n${base}}, ${C}1000);`],
    ] : (lang === 'css' || mode === 'css') ? [
      ['@media', `${base}@media (max-width: ${C}768px) {\n${body}\n${base}}`], ['selektor { }', `${base}${C}.klass {\n${body}\n${base}}`],
    ] : lang === 'html' ? ['div', 'section', 'main', 'header', 'footer', 'nav', 'article', 'span', 'p', 'a', 'ul', 'li', 'button', 'form', 'label'].map(t => [`<${t}>`, `${base}<${t}${C}>\n${body}\n${base}</${t}>`])
      .concat([['<!-- izoh -->', `${base}<!--\n${body}\n${base}-->`]]) : [];
    if (!opts.length) return status("Bu fayl turi uchun 'Surround With' yo'q");
    KEYS.picker({
      title: 'Surround With — tanlangan kodni o\'rab olish',
      items: opts.map(([label, tpl], i) => ({ label, detail: String(i + 1), value: tpl })),
      onPick: tpl => {
        EMMET.insert(editor, from, to, tpl);
        editor.focus();
      },
    });
  }

  /* ===================== TODO oynasi ===================== */
  const tab = document.createElement('button');
  tab.className = 'btab';
  tab.dataset.tab = 'todo';
  tab.innerHTML = '<i class="fa-solid fa-list-check"></i> TODO <span class="count" id="todoCount"></span>';
  q('.bottom-tabs .spacer').before(tab);
  const pane = document.createElement('div');
  pane.className = 'bpane';
  pane.dataset.pane = 'todo';
  pane.innerHTML = '<ul class="search-results" id="todoList"></ul>';
  q('#bottomPanel').appendChild(pane);
  tab.addEventListener('click', () => { showBottom('todo'); scanTodo(); });
  const TODO_RE = /(?:#|\/\/|\/\*|<!--|--)\s*(TODO|FIXME|XXX|HACK|NOTE)\b[:\s]*(.*?)(?:\*\/|-->)?$/i;
  function scanTodo() {
    let html = '', total = 0;
    for (const p of Object.keys(state.files).sort()) {
      const rows = [];
      (docs[p] ? docs[p].getValue() : state.files[p]).split('\n').forEach((t, i) => {
        const m = t.match(TODO_RE);
        if (m) rows.push(`<li data-p="${esc(p)}" data-l="${i}" data-c="${Math.max(0, t.search(TODO_RE))}" data-n="${m[1].length}"><span class="ln">${i + 1}</span><code><b class="todo-${m[1].toLowerCase()}">${esc(m[1].toUpperCase())}</b> ${esc(m[2].trim())}</code></li>`);
      });
      if (rows.length) { total += rows.length; html += `<li class="sf">${fileIcon(p)} ${esc(p)}</li>${rows.join('')}`; }
    }
    q('#todoList').innerHTML = html || '<li class="empty">TODO topilmadi. Izohga <code># TODO: ...</code> yoki <code>// TODO</code> yozing.</li>';
    q('#todoCount').textContent = total || '';
  }
  q('#todoList').addEventListener('click', e => {
    const li = e.target.closest('li[data-p]');
    if (!li) return;
    openFile(li.dataset.p, +li.dataset.l + 1);
  });

  /* ===================== Breadcrumbs (fayl › klass › funksiya) ===================== */
  function crumbs() {
    if (!state.active) return;
    const lang = langOf(state.active);
    const c = editor.getCursor();
    const parts = [];
    if (lang === 'py') {
      let indent = Infinity;
      for (let ln = c.line; ln >= 0 && indent > 0; ln--) {
        const t = editor.getLine(ln);
        if (!t.trim()) continue;
        const ind = t.match(/^\s*/)[0].length;
        if (ind < indent || ln === c.line) {
          const m = t.match(/^\s*(?:async\s+)?(def|class)\s+(\w+)/);
          if (m && (ind < indent || ln === c.line)) parts.unshift(m[1] === 'class' ? `🅲 ${m[2]}` : `ƒ ${m[2]}()`);
          if (ind < indent) indent = ind;
        }
      }
    } else if (lang === 'html') {
      const text = editor.getRange({ line: 0, ch: 0 }, c);
      const stack = [];
      const re = /<\/?([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
      let m;
      while ((m = re.exec(text))) {
        const name = m[1].toLowerCase();
        if (m[0][1] === '/') { const i = stack.map(s => s.n).lastIndexOf(name); if (i >= 0) stack.length = i; }
        else if (!m[3] && !/^(br|img|input|meta|link|hr|source|area|col|wbr)$/.test(name)) {
          const id = /\bid=["']([^"']+)/.exec(m[2]), cls = /\bclass=["']([^"'\s]+)/.exec(m[2]);
          stack.push({ n: name, label: name + (id ? '#' + id[1] : cls ? '.' + cls[1] : '') });
        }
      }
      parts.push(...stack.slice(-5).map(s => s.label));
    } else if (lang === 'js') {
      for (let ln = c.line; ln >= 0; ln--) {
        const m = editor.getLine(ln).match(/(?:function\s+(\w+)|class\s+(\w+)|(\w+)\s*\([^)]*\)\s*\{|(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\()/);
        if (m) { parts.unshift((m[2] ? '🅲 ' : 'ƒ ') + (m[1] || m[2] || m[3] || m[4])); break; }
      }
    } else if (lang === 'css') {
      for (let ln = c.line; ln >= 0; ln--) {
        const m = editor.getLine(ln).match(/^\s*([^{}@][^{}]*)\{/);
        if (m) { parts.push(m[1].trim()); break; }
        if (/\}/.test(editor.getLine(ln)) && ln !== c.line) break;
      }
    }
    q('#crumbFile').innerHTML = esc(state.active) + parts.map(p => ` <span class="sep">›</span> <span class="crumb">${esc(p)}</span>`).join('');
  }

  /* ===================== Chekinish chiziqlari ===================== */
  // Har bir chekinish bo'lagi (indentUnit ta probel) chap chetida chiziq bilan chiziladi
  const guideOverlay = {
    token(stream) {
      const unit = editor.getOption('indentUnit');
      const lead = stream.string.slice(0, stream.pos);
      if (/^ *$/.test(lead) && stream.string.substr(stream.pos, unit) === ' '.repeat(unit) && stream.string.length > stream.pos + unit) {
        stream.pos += unit;
        return 'indent-guide';
      }
      stream.skipToEnd();
      return null;
    },
  };
  let guidesOn = false;
  function applySettings() {
    const s = S();
    editor.setOption('lineWrapping', !!s.wrap);
    if (s.guides && !guidesOn) { editor.addOverlay(guideOverlay); guidesOn = true; }
    if (!s.guides && guidesOn) { editor.removeOverlay(guideOverlay); guidesOn = false; }
    if (window.COLORS) COLORS.scan();
  }

  /* ===================== Settings (Ctrl+Alt+S) ===================== */
  async function settings() {
    const s = S();
    const row = (k, label, hint) => `<label class="set-row"><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''}><span><b>${label}</b><small>${hint}</small></span></label>`;
    const ok = await modal({
      title: '⚙ Sozlamalar',
      okText: 'Saqlash',
      body: `<div class="set-list">
        ${row('wrap', "Qatorni o'rash (word wrap)", 'Uzun qatorlar ekranga sig\'adigan qilib o\'raladi')}
        ${row('guides', 'Chekinish chiziqlari', 'Bloklar chekinishini vertikal chiziqlar bilan ko\'rsatish')}
        ${row('colorSwatches', 'Rang namunalari', 'CSS/HTML ranglari yonida rangli kvadrat va palitra')}
        ${row('autoPopup', "Avtoto'ldirish oynasi", "Yozish paytida tavsiyalar o'zi chiqsin")}
        ${row('emmet', 'Emmet (Tab)', 'HTML/CSS qisqartmalarini Tab bilan kengaytirish')}
        ${row('templates', 'Live Templates (Tab)', 'main, def, for, log kabi shablonlar')}
        <label class="set-row"><span><b>Shrift o'lchami</b><small>Muharrir shrifti (px)</small></span><input type="number" min="10" max="28" id="setFont" value="${state.fontSize || 14}"></label>
      </div>`,
    });
    if (!ok) return;
    document.querySelectorAll('[data-set]').forEach(i => { s[i.dataset.set] = i.checked; });
    const f = +q('#setFont').value;
    if (f) setFont(f);
    applySettings();
    persist();
    toast('⚙ Sozlamalar saqlandi', 'success');
  }

  /* ===================== Blok izoh (Ctrl+Shift+/) ===================== */
  function blockComment(cm) {
    const from = cm.getCursor('from'), to = cm.getCursor('to');
    const mode = cm.getModeAt(from);
    // Python kabi blok izohi yo'q tillarda qator izohidan foydalanamiz
    if (!cm.somethingSelected() || !mode.blockCommentStart) return cm.toggleComment({ indent: true });
    if (!cm.uncomment(from, to)) cm.blockComment(from, to, { fullLines: false });
  }

  /* ===================== Ulash ===================== */
  function attach() {
    if (typeof editor === 'undefined' || !editor || !window.EMMET || !window.KEYS || !EMMET.baseTab()) return setTimeout(attach, 60);
    const keys = editor.getOption('extraKeys');
    const indentTab = EMMET.baseTab();
    // Tab tartibi: Emmet to'xtash joyi → Emmet kengaytirish → Live Template → oddiy chekinish
    keys.Tab = cm => {
      if (EMMET.hasStops() && EMMET.nextStop(cm)) return;
      if (S().emmet !== false && EMMET.tryExpand(cm)) return;
      if (tryTemplate(cm)) return;
      return typeof indentTab === 'function' ? indentTab(cm) : CodeMirror.Pass;
    };
    Object.assign(keys, {
      'Shift-F6': () => rename(),
      'Alt-F7': findUsages,
      'Ctrl-J': templatesPopup,
      'Ctrl-Alt-T': surround,
      'Ctrl-Shift-/': blockComment,
      'Cmd-Alt-/': blockComment,
    });
    // Modifikatorlar tartibini (Shift-Cmd-Ctrl-Alt) CodeMirror talabiga moslaymiz —
    // aks holda 'Ctrl-Alt-Shift-J' kabi nomlar haqiqiy klaviaturada ishlamaydi
    editor.setOption('extraKeys', CodeMirror.normalizeKeyMap(keys));
    editor.on('cursorActivity', () => { clearTimeout(crumbTimer); crumbTimer = setTimeout(crumbs, 120); });
    editor.on('swapDoc', () => setTimeout(crumbs, 0));
    applySettings();
    setTimeout(scanTodo, 500);
    editor.on('change', () => { clearTimeout(todoTimer); todoTimer = setTimeout(() => { if (pane.classList.contains('active')) scanTodo(); }, 800); });
  }
  let crumbTimer, todoTimer;
  attach();

  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.altKey && e.key.toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); settings(); }
  }, true);

  Object.assign(actions, {
    rename: () => rename(), usages: findUsages, liveTemplates: templatesPopup, surround, settings, todo: () => { showBottom('todo'); scanTodo(); },
    blockComment: () => blockComment(editor), toggleWrap: () => { S().wrap = !S().wrap; applySettings(); persist(); },
  });
  return { rename, findUsages, tryTemplate, surround, settings, scanTodo, TEMPLATES };
})();
