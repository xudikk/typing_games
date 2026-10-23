/* PyCharm Online — PyCharm uslubidagi muharrir mexanikalari:
   Ctrl+F / Ctrl+R qidirish-almashtirish paneli, Alt bilan ko'p kursor va ustun tanlash,
   Ctrl+bosish / Ctrl+B ta'rifga o'tish, navigatsiya tarixi, faylga o'tish, barcha fayllarda qidirish va h.k. */
'use strict';

window.KEYS = (function () {
  const q = s => document.querySelector(s);
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /* ===================== Qidirish / almashtirish paneli ===================== */
  const bar = q('#findBar');
  const fIn = q('#findInput'), rIn = q('#replaceInput');
  const opt = { case: false, word: false, regex: false };
  let overlay = null;
  let matches = [];

  function buildQuery() {
    const text = fIn.value;
    if (!text) return null;
    let src = opt.regex ? text : escRe(text);
    if (opt.word) src = `\\b${src}\\b`;
    try { return new RegExp(src, opt.case ? 'g' : 'gi'); } catch (e) { return 'bad'; }
  }

  function collect() {
    matches = [];
    const re = buildQuery();
    fIn.classList.toggle('bad', re === 'bad');
    if (!re || re === 'bad') return;
    const doc = editor.getDoc();
    doc.eachLine(lh => {
      const ln = doc.getLineNumber(lh);
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(lh.text)) && matches.length < 20000) {
        if (!m[0].length) { re.lastIndex++; continue; }
        matches.push({ from: { line: ln, ch: m.index }, to: { line: ln, ch: m.index + m[0].length }, m });
      }
    });
  }

  function highlight() {
    if (overlay) editor.removeOverlay(overlay);
    overlay = null;
    const re = buildQuery();
    if (re && re !== 'bad') {
      overlay = {
        token(stream) {
          re.lastIndex = stream.pos;
          const m = re.exec(stream.string);
          if (m && m.index === stream.pos && m[0].length) { stream.pos += m[0].length; return 'pc-match'; }
          if (m && m[0].length) stream.pos = m.index; else stream.skipToEnd();
          return null;
        },
      };
      editor.addOverlay(overlay, { opaque: false });
    }
  }

  function currentIndex() {
    const c = editor.getCursor('from');
    return matches.findIndex(x => x.from.line === c.line && x.from.ch === c.ch);
  }
  function updateCount() {
    const i = currentIndex();
    const cnt = q('#findCount');
    if (!fIn.value) cnt.textContent = '';
    else if (!matches.length) cnt.textContent = '0 natija';
    else cnt.textContent = `${i >= 0 ? i + 1 : '?'}/${matches.length}`;
    cnt.classList.toggle('none', !!fIn.value && !matches.length);
  }
  function refresh() { collect(); highlight(); updateCount(); }

  function go(dir) {
    if (!matches.length) return refresh();
    const c = editor.getCursor(dir > 0 ? 'to' : 'from');
    let target;
    if (dir > 0) target = matches.find(x => x.from.line > c.line || (x.from.line === c.line && x.from.ch >= c.ch)) || matches[0];
    else target = [...matches].reverse().find(x => x.to.line < c.line || (x.to.line === c.line && x.to.ch <= c.ch)) || matches[matches.length - 1];
    editor.setSelection(target.from, target.to);
    editor.scrollIntoView({ from: target.from, to: target.to }, 80);
    updateCount();
  }

  function expandRepl(rep, m) {
    if (!opt.regex) return rep;
    return rep.replace(/\$(\$|&|\d{1,2})/g, (all, g) => g === '$' ? '$' : g === '&' ? m[0] : (m[+g] ?? ''));
  }
  function replaceOne() {
    if (!matches.length) return refresh();
    const i = currentIndex();
    if (i < 0) return go(1);
    const x = matches[i];
    editor.replaceRange(expandRepl(rIn.value, x.m), x.from, x.to, '+replace');
    refresh();
    go(1);
  }
  function replaceAll() {
    collect();
    if (!matches.length) return;
    const n = matches.length;
    editor.operation(() => {
      for (let i = matches.length - 1; i >= 0; i--) {
        const x = matches[i];
        editor.replaceRange(expandRepl(rIn.value, x.m), x.from, x.to, '+replace');
      }
    });
    refresh();
    toast(`🔁 ${n} ta moslik almashtirildi`, 'success');
  }
  function selectAll() {
    collect();
    if (!matches.length) return;
    editor.setSelections(matches.map(x => ({ anchor: x.from, head: x.to })), 0);
    closeFind();
    editor.focus();
    status(`${matches.length} ta moslik tanlandi — endi bir vaqtda tahrirlash mumkin`);
  }

  function openFind(withReplace) {
    if (!state.active) return;
    bar.classList.add('show');
    bar.classList.toggle('with-replace', !!withReplace);
    const sel = editor.getSelection();
    if (sel && !sel.includes('\n')) fIn.value = sel;
    refresh();
    (withReplace && fIn.value ? rIn : fIn).focus();
    (withReplace && fIn.value ? rIn : fIn).select();
  }
  function closeFind() {
    bar.classList.remove('show');
    if (overlay) editor.removeOverlay(overlay);
    overlay = null;
    editor.focus();
  }
  function toggle(name) {
    opt[name] = !opt[name];
    q(`[data-fopt="${name}"]`).classList.toggle('on', opt[name]);
    refresh();
  }

  fIn.addEventListener('input', () => { refresh(); if (matches.length && currentIndex() < 0) go(1); });
  fIn.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.altKey) { e.preventDefault(); selectAll(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? -1 : 1); }
    else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
    else if (e.key === 'Tab' && bar.classList.contains('with-replace')) { e.preventDefault(); rIn.focus(); }
  });
  rIn.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.altKey)) { e.preventDefault(); replaceAll(); }
    else if (e.key === 'Enter') { e.preventDefault(); replaceOne(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
    else if (e.key === 'Tab') { e.preventDefault(); fIn.focus(); }
  });
  bar.addEventListener('keydown', e => {
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'c') { e.preventDefault(); toggle('case'); }
    if (k === 'w') { e.preventDefault(); toggle('word'); }
    if (k === 'x') { e.preventDefault(); toggle('regex'); }
    if (k === 'a' && bar.classList.contains('with-replace')) { e.preventDefault(); replaceAll(); }
  });
  q('[data-fopt="case"]').onclick = () => toggle('case');
  q('[data-fopt="word"]').onclick = () => toggle('word');
  q('[data-fopt="regex"]').onclick = () => toggle('regex');
  q('#findPrev').onclick = () => go(-1);
  q('#findNext').onclick = () => go(1);
  q('#findAll').onclick = selectAll;
  q('#findClose').onclick = closeFind;
  q('#findToggleReplace').onclick = () => { bar.classList.toggle('with-replace'); rIn.focus(); };
  q('#replaceOne').onclick = replaceOne;
  q('#replaceAll').onclick = replaceAll;

  /* ===================== Ko'p kursor va tanlash ===================== */
  function wordUnder(cm, pos, extra = '') {
    const line = cm.getLine(pos.line) || '';
    const re = new RegExp(`[\\w$${escRe(extra)}]`);
    let a = pos.ch, b = pos.ch;
    while (a > 0 && re.test(line[a - 1])) a--;
    while (b < line.length && re.test(line[b])) b++;
    if (a === b) return null;
    return { text: line.slice(a, b), from: { line: pos.line, ch: a }, to: { line: pos.line, ch: b } };
  }

  // Alt+J — keyingi moslikni tanlovga qo'shish; Shift+Alt+J — oxirgisini olib tashlash; Ctrl+Alt+Shift+J — hammasi
  function selectNextOccurrence(cm) {
    const sels = cm.listSelections();
    const last = sels[sels.length - 1];
    if (last.empty()) {
      const w = wordUnder(cm, last.head);
      if (w) cm.setSelections(sels.slice(0, -1).concat([{ anchor: w.from, head: w.to }]), sels.length - 1);
      return;
    }
    const text = cm.getRange(last.from(), last.to());
    let cur = cm.getSearchCursor(text, last.to(), { caseFold: false });
    if (!cur.findNext()) { cur = cm.getSearchCursor(text, { line: 0, ch: 0 }); cur.findNext(); }
    const from = cur.from(), to = cur.to();
    if (sels.some(s => CodeMirror.cmpPos(s.from(), from) === 0)) return status('Barcha mosliklar tanlangan');
    cm.addSelection(from, to);
    cm.scrollIntoView({ from, to }, 60);
  }
  function unselectLast(cm) {
    const sels = cm.listSelections();
    if (sels.length > 1) cm.setSelections(sels.slice(0, -1), sels.length - 2);
  }
  function selectAllOccurrences(cm) {
    let sel = cm.getSelection();
    if (!sel) { const w = wordUnder(cm, cm.getCursor()); if (!w) return; sel = w.text; }
    const ranges = [];
    const cur = cm.getSearchCursor(sel, { line: 0, ch: 0 }, { caseFold: false });
    while (cur.findNext()) ranges.push({ anchor: cur.from(), head: cur.to() });
    if (ranges.length) cm.setSelections(ranges, 0);
    status(`${ranges.length} ta moslik tanlandi`);
  }
  // Ctrl+Alt+↑/↓ — yuqori/pastki qatorga kursor qo'shish
  function addCaret(cm, dir) {
    const sels = cm.listSelections();
    const edge = dir < 0 ? sels[0].head : sels[sels.length - 1].head;
    const ln = edge.line + dir;
    if (ln < 0 || ln >= cm.lineCount()) return;
    cm.addSelection({ line: ln, ch: Math.min(edge.ch, cm.getLine(ln).length) });
  }
  // Alt+Shift+→ — tanlovni bosqichma-bosqich kengaytirish, Alt+Shift+← — qisqartirish
  // (Ctrl+W ni Chrome tabni yopish uchun band qilgan)
  let expandStack = [];
  function expandSelection(cm) {
    const s = cm.listSelections()[0];
    const from = s.from(), to = s.to();
    let next = null;
    if (s.empty()) {
      const w = wordUnder(cm, s.head);
      if (w) next = w;
    }
    if (!next) {
      const line = cm.getLine(from.line);
      const lead = line.match(/^\s*/)[0].length;
      const trimmedEnd = line.replace(/\s+$/, '').length;
      // Qavs yoki qo'shtirnoq ichidagi matn
      const text = cm.getValue();
      const idxA = cm.indexFromPos(from), idxB = cm.indexFromPos(to);
      const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
      let best = null;
      for (const [o, c] of Object.entries(pairs)) {
        let a = idxA - 1, depth = 0;
        for (; a >= 0; a--) {
          if (text[a] === c && o !== c && a < idxA - 1) depth++;
          else if (text[a] === o) { if (depth === 0) break; depth--; }
          if (text[a] === '\n' && (o === '"' || o === "'")) { a = -1; break; }
        }
        if (a < 0) continue;
        let b = idxB;
        depth = 0;
        for (; b < text.length; b++) {
          if (text[b] === o && o !== c) depth++;
          else if (text[b] === c) { if (depth === 0) break; depth--; }
        }
        if (b >= text.length) continue;
        const inner = [a + 1, b];
        const range = inner[0] === idxA && inner[1] === idxB ? [a, b + 1] : inner;
        if (range[0] <= idxA && range[1] >= idxB && !(range[0] === idxA && range[1] === idxB)) {
          if (!best || range[1] - range[0] < best[1] - best[0]) best = range;
        }
      }
      if (best) next = { from: cm.posFromIndex(best[0]), to: cm.posFromIndex(best[1]) };
      else if (from.line === to.line && (from.ch > lead || to.ch < trimmedEnd)) next = { from: { line: from.line, ch: lead }, to: { line: from.line, ch: trimmedEnd } };
      else next = { from: { line: 0, ch: 0 }, to: { line: cm.lastLine(), ch: cm.getLine(cm.lastLine()).length } };
    }
    expandStack.push({ anchor: s.anchor, head: s.head });
    cm.setSelection(next.from, next.to);
  }
  function shrinkSelection(cm) {
    const prev = expandStack.pop();
    if (prev) cm.setSelection(prev.anchor, prev.head);
  }
  function toggleCase(cm) {
    const sels = cm.getSelections();
    if (!sels.some(Boolean)) return;
    const upper = sels.join('') === sels.join('').toUpperCase();
    cm.replaceSelections(sels.map(t => upper ? t.toLowerCase() : t.toUpperCase()), 'around');
  }
  function joinLines(cm) {
    const c = cm.getCursor();
    if (c.line >= cm.lastLine()) return;
    const a = cm.getLine(c.line).replace(/\s+$/, ''), b = cm.getLine(c.line + 1).replace(/^\s+/, '');
    cm.replaceRange(a + (b ? ' ' : '') + b, { line: c.line, ch: 0 }, { line: c.line + 1, ch: cm.getLine(c.line + 1).length });
    cm.setCursor({ line: c.line, ch: a.length });
  }

  /* ===================== Ta'rifga o'tish (Ctrl+bosish / Ctrl+B) ===================== */
  const navBack = [], navFwd = [];
  function here() { return state.active ? { path: state.active, pos: editor.getCursor() } : null; }
  function pushNav() {
    const h = here();
    if (h) { navBack.push(h); if (navBack.length > 60) navBack.shift(); navFwd.length = 0; }
  }
  function jump(path, line, ch, len) {
    pushNav();
    openFile(path);
    const from = { line: Math.max(0, line), ch: ch || 0 };
    const to = len ? { line: from.line, ch: from.ch + len } : from;
    editor.setSelection(from, to);
    editor.scrollIntoView({ from, to }, 120);
    const mk = editor.markText({ line: from.line, ch: 0 }, { line: from.line, ch: editor.getLine(from.line).length }, { className: 'cm-flash' });
    setTimeout(() => mk.clear(), 900);
  }
  function navGo(fromStack, toStack) {
    const t = fromStack.pop();
    if (!t || !(t.path in state.files)) return;
    const h = here();
    if (h) toStack.push(h);
    openFile(t.path);
    editor.setCursor(t.pos);
    editor.scrollIntoView(t.pos, 120);
  }

  const langOf = p => isPy(p) ? 'py' : (WEB.langOf(p) || 'txt');
  function defPatterns(w, lang) {
    const W = escRe(w);
    if (lang === 'py') return [
      [new RegExp(`^\\s*(async\\s+)?def\\s+(${W})\\b`), 2], [new RegExp(`^\\s*class\\s+(${W})\\b`), 1],
      [new RegExp(`^\\s*(${W})\\s*(:[^=]+)?=(?!=)`), 1], [new RegExp(`^\\s*(${W})\\s*,.*=(?!=)`), 1],
    ];
    if (lang === 'js' || lang === 'html') return [
      [new RegExp(`function\\s*\\*?\\s+(${W})\\b`), 1], [new RegExp(`\\bclass\\s+(${W})\\b`), 1],
      [new RegExp(`\\b(?:const|let|var)\\s+(${W})\\b`), 1], [new RegExp(`^\\s*(${W})\\s*\\(.*\\)\\s*\\{`), 1],
      [new RegExp(`\\b(${W})\\s*[:=]\\s*(?:async\\s*)?(?:function|\\([^)]*\\)\\s*=>|\\w+\\s*=>)`), 1],
    ];
    if (lang === 'sql') return [[new RegExp(`create\\s+(?:temp\\s+)?(?:table|view|index)\\s+(?:if\\s+not\\s+exists\\s+)?["\`\\[]?(${W})\\b`, 'i'), 1]];
    return [];
  }
  function searchDefs(w, lang, files) {
    const res = [];
    for (const p of files) {
      const lines = (docs[p] ? docs[p].getValue() : state.files[p]).split('\n');
      const pats = defPatterns(w, lang === 'html' && WEB.langOf(p) === 'js' ? 'js' : langOf(p) === 'html' ? 'js' : langOf(p));
      lines.forEach((t, i) => {
        for (const [re, g] of pats) {
          const m = t.match(re);
          if (m) { res.push({ path: p, line: i, ch: m.index + m[0].indexOf(m[g]), len: w.length, text: t.trim() }); break; }
        }
      });
    }
    return res;
  }

  // Ctrl bosilganda kursor ostidagi ism / fayl yo'li
  function targetAt(cm, pos) {
    const line = cm.getLine(pos.line) || '';
    // Qo'shtirnoq ichidagi fayl yo'li: href="style.css", src='app.js', import "./x.js"
    const strRe = /(["'])([^"']+)\1/g;
    let m;
    while ((m = strRe.exec(line))) {
      if (pos.ch > m.index && pos.ch < m.index + m[0].length) {
        const val = m[2];
        const p = resolvePath(val);
        if (p) return { kind: 'file', path: p, from: { line: pos.line, ch: m.index + 1 }, to: { line: pos.line, ch: m.index + 1 + val.length } };
      }
    }
    const lang = langOf(state.active || '');
    const w = wordUnder(cm, pos, lang === 'html' || lang === 'css' ? '-' : '');
    return w ? Object.assign({ kind: 'word' }, w) : null;
  }
  function resolvePath(val) {
    if (!val || /^(https?:)?\/\//.test(val)) return null;
    const base = dirName(state.active || '');
    const clean = val.split(/[?#]/)[0];
    const cands = [clean, clean + '.js', clean + '.py', clean.replace(/\./g, '/') + '.py'];
    for (const c of cands) {
      const parts = (c.startsWith('/') ? [] : base ? base.split('/') : []);
      for (const seg of c.replace(/^\//, '').split('/')) { if (seg === '..') parts.pop(); else if (seg && seg !== '.') parts.push(seg); }
      const p = parts.join('/');
      if (p in state.files && p !== state.active) return p;
    }
    return null;
  }

  async function gotoDefinition(pos) {
    if (!state.active) return;
    pos = pos || editor.getCursor();
    const t = targetAt(editor, pos);
    if (!t) return;
    if (t.kind === 'file') return jump(t.path, 0, 0);
    const w = t.text;
    const lang = langOf(state.active);
    // Python: modul nomi (import utils) — faylni ochamiz
    if (lang === 'py') {
      const modFile = Object.keys(state.files).find(p => p === w + '.py' || p.endsWith('/' + w + '.py') || p === w.replace(/\./g, '/') + '/__init__.py');
      const lineText = editor.getLine(pos.line);
      if (modFile && new RegExp(`\\b(import|from)\\s+[\\w.,\\s]*\\b${escRe(w)}\\b`).test(lineText)) return jump(modFile, 0, 0);
      // Jedi bilan aniq ta'rif (import qilingan modullarni ham kuzatadi)
      if (jediReady) {
        try {
          syncFS();
          ensureGotoPy();
          const res = JSON.parse(py.globals.get('_pc_goto')(editor.getValue(), pos.line + 1, pos.ch, state.active));
          const local = res.filter(r => r.path);
          if (local.length) {
            const r = local[0];
            if (r.path === state.active && r.line - 1 === pos.line) { /* o'zida turibmiz — qidiruvga o'tamiz */ }
            else return jump(r.path, r.line - 1, r.col, w.length);
          } else if (res.length && res[0].doc) {
            return showDoc(res[0].name, res[0].doc, pos);
          }
        } catch (e) { /* zaxira usulga o'tamiz */ }
      }
    }
    // HTML/CSS: class va id bog'lanishi
    if (lang === 'html' || lang === 'css') {
      const line = editor.getLine(pos.line);
      const files = Object.keys(state.files);
      if (lang === 'html') {
        const inClass = /\bclass\s*=\s*["'][^"']*$/.test(line.slice(0, t.from.ch));
        const inId = /\bid\s*=\s*["']\s*$/.test(line.slice(0, t.from.ch));
        if (inClass || inId) {
          const sel = (inClass ? '\\.' : '#') + escRe(w) + '(?![\\w-])';
          const hits = grep(new RegExp(sel), files.filter(f => WEB.langOf(f) === 'css' || WEB.langOf(f) === 'html'), true);
          if (hits.length) return pickOrJump(hits, w);
          return status(`"${w}" uchun CSS qoidasi topilmadi${inClass ? ' (Tailwind klassi bo\'lishi mumkin)' : ''}`);
        }
      } else {
        const before = line.slice(0, t.from.ch);
        const isCls = before.endsWith('.'), isId = before.endsWith('#');
        if (isCls || isId) {
          const re = isCls ? new RegExp(`class\\s*=\\s*["'][^"']*\\b${escRe(w)}\\b`) : new RegExp(`id\\s*=\\s*["']${escRe(w)}["']`);
          const hits = grep(re, files.filter(f => WEB.langOf(f) === 'html'), false, w);
          if (hits.length) return pickOrJump(hits, w);
        }
      }
    }
    // JS: getElementById('x') / querySelector('#x') → HTML'dagi element
    const line = editor.getLine(pos.line);
    if (lang === 'js' && /getElementById\(\s*["'][\w-]*$|querySelector(All)?\(\s*["'][^"']*#?[\w-]*$/.test(line.slice(0, t.to.ch))) {
      const hits = grep(new RegExp(`id\\s*=\\s*["']${escRe(w)}["']`), Object.keys(state.files).filter(f => WEB.langOf(f) === 'html'), false, w);
      if (hits.length) return pickOrJump(hits, w);
    }
    // Umumiy: shu fayl, so'ng shu tildagi fayllar, so'ng hammasi
    const sameLang = Object.keys(state.files).filter(p => p !== state.active && (langOf(p) === lang || (lang === 'html' && WEB.langOf(p) === 'js') || (lang === 'js' && WEB.langOf(p) === 'html')));
    let defs = searchDefs(w, lang, [state.active]).filter(d => d.line !== pos.line);
    if (!defs.length) defs = searchDefs(w, lang, sameLang);
    if (defs.length) return pickOrJump(defs, w);
    status(`"${w}" ta'rifi topilmadi`);
    editor.getWrapperElement().classList.add('shake');
    setTimeout(() => editor.getWrapperElement().classList.remove('shake'), 300);
  }
  function grep(re, files, wholeLine, word) {
    const out = [];
    for (const p of files) {
      (docs[p] ? docs[p].getValue() : state.files[p]).split('\n').forEach((t, i) => {
        const m = t.match(re);
        if (m) {
          const at = word ? t.indexOf(word, m.index) : m.index;
          out.push({ path: p, line: i, ch: Math.max(0, at), len: word ? word.length : m[0].length, text: t.trim() });
        }
      });
    }
    return out;
  }
  function pickOrJump(list, w) {
    if (list.length === 1) return jump(list[0].path, list[0].line, list[0].ch, list[0].len);
    picker({
      title: `"${w}" — ${list.length} ta ta'rif`,
      items: list.map(d => ({ label: d.text, detail: `${d.path}:${d.line + 1}`, value: d })),
      onPick: d => jump(d.path, d.line, d.ch, d.len),
    });
  }

  // Jedi orqali aniq "goto" (faqat Python)
  let gotoPyReady = false;
  function ensureGotoPy() {
    if (gotoPyReady) return;
    py.runPython(String.raw`
def _pc_goto(src, line, col, rel):
    import jedi, json, os
    try:
        s = jedi.Interpreter(src, [{}], path=os.path.join(ROOT, rel))
    except TypeError:
        s = jedi.Interpreter(src, [{}])
    out = []
    for d in s.goto(line, col, follow_imports=True):
        mp = str(d.module_path) if d.module_path else ''
        rel_path = os.path.relpath(mp, ROOT).replace(os.sep, '/') if mp.startswith(ROOT) else ''
        doc = ''
        try:
            doc = d.docstring()[:2000]
        except Exception:
            pass
        out.append({'path': rel_path, 'line': d.line or 1, 'col': d.column or 0, 'name': d.name, 'type': d.type, 'doc': doc})
    return json.dumps(out)

def _pc_doc(src, line, col, rel):
    import jedi, json, os
    try:
        s = jedi.Interpreter(src, [{}], path=os.path.join(ROOT, rel))
    except TypeError:
        s = jedi.Interpreter(src, [{}])
    for d in (s.help(line, col) or s.infer(line, col)):
        try:
            return json.dumps({'name': d.name, 'type': d.type, 'doc': d.docstring()[:3000]})
        except Exception:
            pass
    return json.dumps(None)
`);
    gotoPyReady = true;
  }

  // Ctrl+Q — tezkor hujjat (docstring)
  const docPop = q('#docPop');
  function showDoc(name, doc, pos) {
    const c = editor.cursorCoords(pos || editor.getCursor(), 'window');
    docPop.innerHTML = `<b>${esc(name)}</b><pre>${esc(doc || 'Hujjat yo\'q')}</pre>`;
    docPop.style.left = Math.min(c.left, innerWidth - 460) + 'px';
    docPop.style.top = (c.bottom + 6) + 'px';
    docPop.classList.add('show');
  }
  function quickDoc() {
    if (!state.active || !isPy(state.active)) return status('Tezkor hujjat Python fayllarida ishlaydi');
    if (!jediReady) return status('Jedi hali yuklanmoqda...');
    try {
      syncFS();
      ensureGotoPy();
      const pos = editor.getCursor();
      const r = JSON.parse(py.globals.get('_pc_doc')(editor.getValue(), pos.line + 1, pos.ch, state.active));
      if (r) showDoc(`${r.name} (${r.type})`, r.doc, pos);
      else status('Hujjat topilmadi');
    } catch (e) { status('Hujjat topilmadi'); }
  }
  document.addEventListener('mousedown', e => { if (!e.target.closest('#docPop')) docPop.classList.remove('show'); });

  /* ===================== Tanlash oynasi (faylga o'tish, so'nggi fayllar) ===================== */
  const pk = q('#picker'), pkIn = q('#pickerInput'), pkList = q('#pickerList');
  let pkItems = [], pkShown = [], pkSel = 0, pkOnPick = null;
  function fuzzy(qs, s) {
    if (!qs) return 1;
    qs = qs.toLowerCase(); s = s.toLowerCase();
    let i = 0, score = 0, prev = -2;
    for (let j = 0; j < s.length && i < qs.length; j++) {
      if (s[j] === qs[i]) { score += j === prev + 1 ? 3 : 1; if (j === 0 || '/_.-'.includes(s[j - 1])) score += 2; prev = j; i++; }
    }
    return i === qs.length ? score : 0;
  }
  function renderPicker() {
    const qs = pkIn.value.trim();
    pkShown = pkItems.map(it => ({ it, s: fuzzy(qs, it.label + ' ' + (it.detail || '')) })).filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s).slice(0, 60).map(x => x.it);
    if (!qs) pkShown = pkItems.slice(0, 60);
    pkSel = Math.min(pkSel, Math.max(0, pkShown.length - 1));
    pkList.innerHTML = pkShown.map((it, i) => `<li class="${i === pkSel ? 'sel' : ''}" data-i="${i}">${it.icon || ''}<span>${esc(it.label)}</span><small>${esc(it.detail || '')}</small></li>`).join('')
      || '<li class="empty">Hech narsa topilmadi</li>';
    const sel = pkList.querySelector('.sel');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }
  function picker({ title, items, onPick, placeholder }) {
    pkItems = items; pkOnPick = onPick; pkSel = 0;
    q('#pickerTitle').textContent = title;
    pkIn.placeholder = placeholder || 'Yozing...';
    pkIn.value = '';
    pk.classList.add('show');
    renderPicker();
    setTimeout(() => pkIn.focus(), 0);
  }
  function closePicker() { pk.classList.remove('show'); editor.focus(); }
  function choose(i) {
    const it = pkShown[i];
    closePicker();
    if (it && pkOnPick) pkOnPick(it.value);
  }
  pkIn.addEventListener('input', () => { pkSel = 0; renderPicker(); });
  pkIn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); pkSel = Math.min(pkShown.length - 1, pkSel + 1); renderPicker(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pkSel = Math.max(0, pkSel - 1); renderPicker(); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(pkSel); }
    else if (e.key === 'Escape') { e.preventDefault(); closePicker(); }
  });
  pkList.addEventListener('mousedown', e => { const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); choose(+li.dataset.i); } });
  pk.addEventListener('mousedown', e => { if (e.target === pk) closePicker(); });

  let recent = [];
  function touchRecent(p) { recent = [p].concat(recent.filter(x => x !== p)).slice(0, 30); }
  function gotoFile() {
    picker({
      title: 'Faylga o\'tish', placeholder: 'Fayl nomi (masalan: utl → utils.py)',
      items: Object.keys(state.files).sort().map(p => ({ label: baseName(p), detail: p, icon: fileIcon(p), value: p })),
      onPick: p => { pushNav(); openFile(p); },
    });
  }
  function recentFiles() {
    const list = recent.filter(p => p in state.files);
    picker({
      title: "So'nggi fayllar", placeholder: 'Filtrlash...',
      items: list.slice(state.active === list[0] ? 1 : 0).concat(list[0] === state.active ? [list[0]] : []).map(p => ({ label: baseName(p), detail: p, icon: fileIcon(p), value: p })),
      onPick: p => { pushNav(); openFile(p); },
    });
  }
  function gotoSymbol() {
    // Ctrl+F12 — joriy fayldagi funksiya/klasslar ro'yxati
    if (!state.active) return;
    const lang = langOf(state.active);
    const re = lang === 'py' ? /^\s*(?:async\s+)?(def|class)\s+(\w+)/ : lang === 'js' || lang === 'html' ? /(?:function\s+(\w+)|class\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\(|function))/ : lang === 'css' ? /^\s*([^{@][^{]*)\{/ : lang === 'sql' ? /create\s+(?:table|view|index)\s+(?:if\s+not\s+exists\s+)?(\w+)/i : null;
    if (!re) return;
    const items = [];
    editor.getValue().split('\n').forEach((t, i) => {
      const m = t.match(re);
      if (m) {
        const name = (m[2] && lang === 'py' ? m[2] : m.slice(1).find(Boolean) || '').trim();
        if (name) items.push({ label: name, detail: `${m[1] === 'class' ? 'klass' : ''} ${i + 1}-qator`, value: { line: i, ch: Math.max(0, t.indexOf(name)), len: name.length } });
      }
    });
    picker({ title: 'Fayl tuzilishi', placeholder: 'Funksiya yoki klass...', items, onPick: v => jump(state.active, v.line, v.ch, v.len) });
  }

  /* ===================== Tablar orasida o'tish va Switcher ===================== */
  // Alt+← / Alt+→ — oldingi/keyingi tab (PyCharm'dagidek)
  function switchTab(dir) {
    const tabs = state.open;
    if (tabs.length < 2) return;
    const i = tabs.indexOf(state.active);
    openFile(tabs[(i + dir + tabs.length) % tabs.length]);
  }
  // Switcher: Ctrl+Tab (brauzer ruxsat bersa) yoki Alt+` — modifikatorni bosib turib qayta bosish, qo'yib yuborilganda ochiladi
  let switcherMod = null;
  function switcherStep(dir, mod) {
    const list = recent.filter(p => p in state.files);
    for (const p of state.open) if (!list.includes(p)) list.push(p);
    if (list.length < 2) return;
    if (!pk.classList.contains('show') || !pk.classList.contains('switcher')) {
      switcherMod = mod;
      pk.classList.add('switcher');
      picker({
        title: `Switcher — ${mod === 'Control' ? 'Ctrl' : 'Alt'}ni qo'yib yuboring`,
        items: list.map(p => ({ label: baseName(p), detail: p, icon: fileIcon(p), value: p })),
        onPick: p => { pushNav(); openFile(p); },
      });
      pkSel = dir > 0 ? 1 : list.length - 1;
    } else {
      pkSel = (pkSel + dir + pkShown.length) % pkShown.length;
    }
    renderPicker();
    pkIn.blur();
  }
  document.addEventListener('keyup', e => {
    if (switcherMod && e.key === switcherMod && pk.classList.contains('switcher')) {
      switcherMod = null;
      pk.classList.remove('switcher');
      choose(pkSel);
    }
  }, true);
  pk.addEventListener('mousedown', () => { switcherMod = null; pk.classList.remove('switcher'); });

  /* ===================== Barcha fayllarda qidirish (Ctrl+Shift+F) ===================== */
  const sIn = q('#searchAllInput'), sRep = q('#searchAllReplace');
  const sOpt = { case: false, word: false, regex: false };
  function searchRe() {
    const t = sIn.value;
    if (!t) return null;
    let src = sOpt.regex ? t : escRe(t);
    if (sOpt.word) src = `\\b${src}\\b`;
    try { return new RegExp(src, sOpt.case ? 'g' : 'gi'); } catch (e) { return 'bad'; }
  }
  function runSearchAll() {
    const re = searchRe();
    const out = q('#searchResults');
    sIn.classList.toggle('bad', re === 'bad');
    if (!re || re === 'bad') { out.innerHTML = ''; q('#searchSummary').textContent = ''; return; }
    let total = 0, filesHit = 0, html = '';
    for (const p of Object.keys(state.files).sort()) {
      const lines = (docs[p] ? docs[p].getValue() : state.files[p]).split('\n');
      let rows = '';
      lines.forEach((t, i) => {
        re.lastIndex = 0;
        let m, first = null, n = 0;
        let marked = '';
        let last = 0;
        while ((m = re.exec(t)) && n < 50) {
          if (!m[0].length) { re.lastIndex++; continue; }
          if (!first) first = m;
          marked += esc(t.slice(last, m.index)) + `<mark>${esc(m[0])}</mark>`;
          last = m.index + m[0].length;
          n++;
        }
        if (n) {
          total += n;
          marked += esc(t.slice(last));
          rows += `<li data-p="${esc(p)}" data-l="${i}" data-c="${first.index}" data-n="${first[0].length}"><span class="ln">${i + 1}</span><code>${marked.trim().slice(0, 400)}</code></li>`;
        }
      });
      if (rows) { filesHit++; html += `<li class="sf">${fileIcon(p)} ${esc(p)}</li>${rows}`; }
    }
    out.innerHTML = html || '<li class="empty">Hech narsa topilmadi</li>';
    q('#searchSummary').textContent = total ? `${total} ta moslik · ${filesHit} ta fayl` : '';
  }
  function openSearchAll() {
    showBottom('search');
    const sel = editor.getSelection();
    if (sel && !sel.includes('\n')) sIn.value = sel;
    runSearchAll();
    setTimeout(() => { sIn.focus(); sIn.select(); }, 0);
  }
  // Find Usages uchun: so'zni butun so'z rejimida barcha fayllardan qidirish
  function searchFor(text, opts = {}) {
    showBottom('search');
    sIn.value = text;
    for (const k of ['case', 'word', 'regex']) {
      sOpt[k] = !!opts[k];
      const b = document.querySelector(`[data-sopt="${k}"]`);
      if (b) b.classList.toggle('on', sOpt[k]);
    }
    runSearchAll();
  }
  async function replaceInFiles() {
    const re = searchRe();
    if (!re || re === 'bad') return;
    let n = 0;
    const changed = {};
    for (const p of Object.keys(state.files)) {
      const src = docs[p] ? docs[p].getValue() : state.files[p];
      const out = src.replace(re, (...a) => { n++; return sOpt.regex ? sRep.value.replace(/\$(\d)/g, (_, g) => a[+g] ?? '') : sRep.value; });
      if (out !== src) changed[p] = out;
    }
    if (!n) return;
    const ok = await modal({ title: 'Fayllarda almashtirish', body: `<b>${n}</b> ta moslik <b>${Object.keys(changed).length}</b> ta faylda almashtirilsinmi?`, okText: 'Almashtirish' });
    if (!ok) return;
    for (const [p, c] of Object.entries(changed)) { state.files[p] = c; if (docs[p]) docs[p].setValue(c); }
    persist(); syncFS();
    runSearchAll();
    toast(`🔁 ${n} ta moslik almashtirildi`, 'success');
  }
  let searchTimer;
  sIn.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearchAll, 200); });
  sIn.addEventListener('keydown', e => { if (e.key === 'Enter') runSearchAll(); });
  sRep.addEventListener('keydown', e => { if (e.key === 'Enter') replaceInFiles(); });
  q('#searchReplaceBtn').onclick = replaceInFiles;
  document.querySelectorAll('[data-sopt]').forEach(b => b.onclick = () => {
    sOpt[b.dataset.sopt] = !sOpt[b.dataset.sopt];
    b.classList.toggle('on', sOpt[b.dataset.sopt]);
    runSearchAll();
  });
  q('#searchResults').addEventListener('click', e => {
    const li = e.target.closest('li[data-p]');
    if (li) jump(li.dataset.p, +li.dataset.l, +li.dataset.c, +li.dataset.n);
  });

  /* ===================== Xatolar orasida (F2) ===================== */
  function nextProblem(dir) {
    const list = (problems[state.active] || []).slice().sort((a, b) => a.line - b.line || a.col - b.col);
    if (!list.length) return status('Bu faylda muammo yo\'q ✔');
    const c = editor.getCursor();
    const after = dir > 0 ? list.find(p => p.line - 1 > c.line || (p.line - 1 === c.line && p.col > c.ch)) || list[0]
      : [...list].reverse().find(p => p.line - 1 < c.line || (p.line - 1 === c.line && p.col < c.ch)) || list[list.length - 1];
    const pos = { line: after.line - 1, ch: after.col };
    editor.setCursor(pos);
    editor.scrollIntoView(pos, 100);
    status(after.msg);
  }

  /* ===================== Muharrirga ulash ===================== */
  let hoverMark = null;
  function clearHover() { if (hoverMark) { hoverMark.clear(); hoverMark = null; } editor && editor.getWrapperElement().classList.remove('ctrl-hover'); }
  function attach() {
    if (typeof editor === 'undefined' || !editor) return setTimeout(attach, 50);
    // Alt+bosish — kursor qo'shish, Alt+sudrash — ustun (to'rtburchak) tanlash
    editor.setOption('configureMouse', (cm, repeat, e) => {
      if (e.altKey) return { unit: 'rectangle', addNew: true };
      return {};
    });
    editor.setOption('highlightSelectionMatches', { minChars: 2, showToken: /[\w$]/, annotateScrollbar: false, delay: 150 });
    editor.on('mousedown', (cm, e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.button === 0) {
        e.preventDefault();
        const pos = cm.coordsChar({ left: e.clientX, top: e.clientY }, 'window');
        cm.setCursor(pos);
        clearHover();
        gotoDefinition(pos);
      }
    });
    const wrap = editor.getWrapperElement();
    wrap.addEventListener('mousemove', e => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return clearHover();
      const pos = editor.coordsChar({ left: e.clientX, top: e.clientY }, 'window');
      const t = targetAt(editor, pos);
      if (hoverMark) hoverMark.clear();
      hoverMark = t ? editor.markText(t.from, t.to, { className: 'cm-goto' }) : null;
      wrap.classList.toggle('ctrl-hover', !!t);
    });
    wrap.addEventListener('mouseleave', clearHover);
    document.addEventListener('keyup', e => { if (e.key === 'Control' || e.key === 'Meta') clearHover(); });
    editor.on('change', () => { if (bar.classList.contains('show')) { collect(); updateCount(); } });
    editor.on('cursorActivity', () => { if (bar.classList.contains('show')) updateCount(); });

    const k = editor.getOption('extraKeys');
    Object.assign(k, {
      'Alt-J': selectNextOccurrence,
      'Shift-Alt-J': unselectLast,
      'Ctrl-Alt-Shift-J': selectAllOccurrences,
      'Ctrl-Alt-Up': cm => addCaret(cm, -1),
      'Ctrl-Alt-Down': cm => addCaret(cm, 1),
      'Alt-Shift-Right': expandSelection,
      'Alt-Shift-Left': shrinkSelection,
      'Ctrl-Shift-U': toggleCase,
      'Ctrl-Shift-J': joinLines,
      'Ctrl-B': () => gotoDefinition(),
      'Ctrl-Q': quickDoc,
      'Ctrl-Shift-Up': 'swapLineUp',
      'Ctrl-Shift-Down': 'swapLineDown',
      'F2': () => nextProblem(1),
      'Shift-F2': () => nextProblem(-1),
      'F3': () => { if (!fIn.value) openFind(false); else { refresh(); go(1); } },
      'Shift-F3': () => { refresh(); go(-1); },
      'Esc': cm => {
        if (bar.classList.contains('show')) return closeFind();
        if (cm.listSelections().length > 1) cm.setSelection(cm.getCursor('head'));
        else return CodeMirror.Pass;
      },
    });
    editor.setOption('extraKeys', k);
  }
  attach();

  // Global qisqartmalar (fokus muharrirda bo'lmasa ham ishlaydi)
  let lastShift = 0, otherKey = false;
  document.addEventListener('keydown', e => {
    if (typeof editor === 'undefined' || !editor) return;
    const ctrl = e.ctrlKey || e.metaKey;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (e.key !== 'Shift') otherKey = true;
    const hit = (cond, fn) => { if (cond) { e.preventDefault(); e.stopPropagation(); fn(); return true; } return false; };
    hit(ctrl && e.key === 'Tab', () => switcherStep(e.shiftKey ? -1 : 1, 'Control')) ||
    hit(e.altKey && !ctrl && (e.code === 'Backquote'), () => switcherStep(e.shiftKey ? -1 : 1, 'Alt')) ||
    hit(e.altKey && !ctrl && !e.shiftKey && e.key === 'ArrowLeft', () => switchTab(-1)) ||
    hit(e.altKey && !ctrl && !e.shiftKey && e.key === 'ArrowRight', () => switchTab(1)) ||
    hit(ctrl && e.shiftKey && key === 'f', openSearchAll) ||
    hit(ctrl && e.shiftKey && key === 'r', () => { openSearchAll(); setTimeout(() => sRep.focus(), 10); }) ||
    hit(ctrl && !e.shiftKey && !e.altKey && key === 'p', gotoFile) ||
    hit(ctrl && !e.shiftKey && key === 'e', recentFiles) ||
    hit(ctrl && key === 'F12', gotoSymbol) ||
    hit(ctrl && e.altKey && e.key === 'ArrowLeft', () => navGo(navBack, navFwd)) ||
    hit(ctrl && e.altKey && e.key === 'ArrowRight', () => navGo(navFwd, navBack)) ||
    hit(ctrl && !e.shiftKey && !e.altKey && key === 'f' && !editor.hasFocus(), () => openFind(false)) ||
    hit(ctrl && !e.shiftKey && !e.altKey && key === 'r' && !editor.hasFocus() && document.activeElement !== fIn && document.activeElement !== rIn, () => openFind(true));
  }, true);
  // Ikki marta Shift — hamma joyda qidirish (faylga o'tish)
  document.addEventListener('keydown', e => { if (e.key === 'Shift' && !e.repeat) otherKey = false; });
  document.addEventListener('keyup', e => {
    if (e.key !== 'Shift' || otherKey) return;
    const now = performance.now();
    if (now - lastShift < 380) { lastShift = 0; gotoFile(); }
    else lastShift = now;
  });

  /* ===================== Qisqartmalar ro'yxati ===================== */
  actions.shortcuts = () => modal({
    title: 'Klaviatura qisqartmalari (PyCharm uslubi)', cancel: false,
    body: `<div class="sc-grid">${[
      ['Ishga tushirish', [['Joriy/tanlangan faylni ishga tushirish', 'Shift+F10'], ['Joriy faylni ishga tushirish', 'Ctrl+Shift+F10'], ['Testlar', 'Ctrl+Shift+T'], ['Terminal', 'Alt+F12']]],
      ['Navigatsiya', [["Ta'rifga o'tish", 'Ctrl+bosish / Ctrl+B'], ['Oldingi / keyingi tab', 'Alt+← / Alt+→'], ['Switcher (tablar)', 'Alt+` (Ctrl+Tab)'], ['Ortga / oldinga', 'Ctrl+Alt+← / →'], ["Faylga o'tish", 'Ctrl+P / Shift Shift'], ["So'nggi fayllar", 'Ctrl+E'], ['Fayl tuzilishi', 'Ctrl+F12'], ["Qatorga o'tish", 'Ctrl+G'], ['Keyingi / oldingi xato', 'F2 / Shift+F2'], ['Tezkor hujjat', 'Ctrl+Q']]],
      ['Qidirish', [['Faylda qidirish', 'Ctrl+F'], ['Almashtirish', 'Ctrl+R'], ['Keyingi / oldingi', 'Enter / Shift+Enter, F3'], ['Barcha mosliklarni tanlash', 'Alt+Enter (qidiruvda)'], ['Hammasini almashtirish', 'Ctrl+Enter / Alt+A'], ['Katta-kichik harf / so\'z / regex', 'Alt+C / Alt+W / Alt+X'], ['Barcha fayllarda qidirish', 'Ctrl+Shift+F'], ['Fayllarda almashtirish', 'Ctrl+Shift+R']]],
      ["Ko'p kursor va tanlash", [['Kursor qo\'shish', 'Alt+bosish'], ['Ustun bo\'yicha tanlash', 'Alt+sudrash'], ['Yuqori / pastga kursor', 'Ctrl+Alt+↑ / ↓'], ['Keyingi moslikni tanlash', 'Alt+J'], ['Oxirgisini bekor qilish', 'Shift+Alt+J'], ['Hamma mosliklarni tanlash', 'Ctrl+Alt+Shift+J'], ['Tanlovni kengaytirish / qisqartirish', 'Alt+Shift+→ / ←'], ['Bitta kursorga qaytish', 'Esc']]],
      ['Tahrirlash', [['Emmet: teg / CSS kengaytirish', 'Tab (div.card>p*3, !, m10)'], ['Emmet: keyingi bo\'sh joy', 'Tab'], ['Avtoto\'ldirish', 'Ctrl+Space'], ['Izohga olish', 'Ctrl+/'], ['Qatorni nusxalash', 'Ctrl+D'], ['Qatorni o\'chirish', 'Ctrl+Y'], ['Qatorni ko\'chirish', 'Alt+Shift+↑/↓, Ctrl+Shift+↑/↓'], ['Qatorlarni birlashtirish', 'Ctrl+Shift+J'], ['Katta/kichik harf', 'Ctrl+Shift+U'], ['Formatlash', 'Ctrl+Alt+L'], ['Saqlash', 'Ctrl+S']]],
      ['Kod (Refactor)', [['Nomini o\'zgartirish (Rename)', 'Shift+F6'], ['Foydalanilgan joylar (Find Usages)', 'Alt+F7'], ['Live Templates', 'Tab / Ctrl+J'], ["O'rab olish (Surround With)", 'Ctrl+Alt+T'], ['Blok izoh', 'Ctrl+Shift+/'], ['Rang tanlash / pipetka', 'Ctrl+Alt+C yoki rang namunasini bosing']]],
      ['Oyna', [['Sozlamalar', 'Ctrl+Alt+S'], ['Loyiha paneli', 'Alt+1'], ['Pastki panel', 'Alt+4'], ['Yangi fayl', 'Alt+Insert'], ['Tabni yopish', 'Ctrl+F4 / Alt+W'], ['Shrift o\'lchami', 'Ctrl+= / Ctrl+- / Ctrl+0']]],
    ].map(([g, rows]) => `<div><h5>${g}</h5><table>${rows.map(([a, b]) => `<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`).join('')}</table></div>`).join('')}</div>`,
  });

  // Menyu bandlari
  Object.assign(actions, {
    newHtml: () => newFile(null, 'html'),
    newCss: () => newFile(null, 'css'),
    newJs: () => newFile(null, 'js'),
    newSql: () => newFile(null, 'sql'),
    webSample: () => WEB.createWebSample(),
    gotoDef: () => gotoDefinition(),
    navBack: () => navGo(navBack, navFwd),
    navFwd: () => navGo(navFwd, navBack),
    prevTab: () => switchTab(-1), nextTab: () => switchTab(1),
    gotoFile, recent: recentFiles, symbols: gotoSymbol, searchAll: openSearchAll,
    selNext: () => { selectNextOccurrence(editor); editor.focus(); },
    selAll: () => { selectAllOccurrences(editor); editor.focus(); },
    caseToggle: () => { toggleCase(editor); editor.focus(); },
  });

  return { openFind, closeFind, gotoDefinition, gotoFile, recentFiles, openSearchAll, searchFor, touchRecent, picker, wordUnder: (cm, pos, extra) => wordUnder(cm, pos, extra) };
})();
