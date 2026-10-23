/* PyCharm Online — Emmet uslubidagi tezkor yozish (Tab bilan kengaytirish).
   HTML:  div.card>h2{Sarlavha}+p*3   ul>li.item$*5   a:link   input:email   !   lorem20
   CSS:   m10 → margin: 10px;   df → display: flex;   c#333 → color: #333;
   Kengaytirilgandan keyin Tab keyingi bo'sh joyga (atribut qiymati, teg ichi) o'tkazadi. */
'use strict';

window.EMMET = (function () {
  const CUR = '\u0001'; // kursor to'xtash joyi belgisi

  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'cite', 'code', 'em', 'i', 'kbd', 'label', 'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'img', 'input', 'button', 'select', 'textarea', 'option', 'td', 'th', 'li', 'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'dt', 'dd', 'figcaption', 'legend', 'summary']);
  const DEFAULT_ATTRS = {
    a: { href: '' }, img: { src: '', alt: '' }, input: { type: 'text', name: '' }, label: { for: '' }, form: { action: '' },
    link: { rel: 'stylesheet', href: '' }, script: {}, iframe: { src: '' }, select: { name: '' }, textarea: { name: '', rows: '5' },
    meta: { name: '', content: '' }, video: { src: '' }, audio: { src: '' }, source: { src: '' }, option: { value: '' },
  };
  // Maxsus qisqartmalar (a:link, input:email ...)
  const ALIASES = {
    'a:link': 'a[href=https://]', 'a:mail': 'a[href=mailto:]', 'a:blank': 'a[href target=_blank rel="noopener noreferrer"]',
    'link:css': 'link[rel=stylesheet href=style.css]', 'link:favicon': 'link[rel=icon type=image/png href=favicon.png]',
    'script:src': 'script[src]', 'script:module': 'script[type=module src]', 'meta:vp': 'meta[name=viewport content="width=device-width, initial-scale=1.0"]',
    'meta:utf': 'meta[charset=UTF-8]', 'input:text': 'input[type=text name]', 'input:email': 'input[type=email name]',
    'input:password': 'input[type=password name]', 'input:number': 'input[type=number name]', 'input:checkbox': 'input:c',
    'input:c': 'input[type=checkbox name]', 'input:radio': 'input[type=radio name]', 'input:submit': 'input[type=submit value]',
    'input:file': 'input[type=file name]', 'input:date': 'input[type=date name]', 'input:hidden': 'input[type=hidden name]',
    'btn': 'button', 'btn:s': 'button[type=submit]', 'btn:r': 'button[type=reset]', 'form:post': 'form[action method=post]',
    'img:lazy': 'img[src alt loading=lazy]', 'tw:btn': 'button.px-4.py-2.rounded-lg.bg-blue-500.text-white.hover:bg-blue-600',
    'tw:card': 'div.p-6.rounded-2xl.bg-white.shadow-lg', 'tw:flex': 'div.flex.items-center.justify-between',
  };
  const TAGS = new Set(('a abbr address article aside audio b blockquote body br button canvas caption code col colgroup data datalist dd details dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q s samp script section select small source span strong style sub summary sup svg table tbody td template textarea tfoot th thead time title tr u ul var video').split(' '));
  const LOREM = 'Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat'.split(' ');
  const lorem = n => { const w = []; for (let i = 0; i < n; i++) w.push(LOREM[i % LOREM.length]); const s = w.join(' '); return s[0].toUpperCase() + s.slice(1) + '.'; };

  /* ---------------- Tahlil (parser) ---------------- */
  function parse(src) {
    let i = 0;
    const peek = () => src[i];
    const err = () => { throw new Error('Emmet: noto\'g\'ri qisqartma'); };

    function readName() {
      const m = /^[A-Za-z!][\w:!-]*/.exec(src.slice(i));
      if (!m) return '';
      i += m[0].length;
      return m[0];
    }
    function readUntil(close) {
      let depth = 0, out = '';
      i++; // ochuvchi belgini o'tkazamiz
      while (i < src.length) {
        const ch = src[i];
        if (ch === '\\' && close === '}') { out += src[i + 1] || ''; i += 2; continue; }
        if (ch === '{' && close === '}') depth++;
        if (ch === close) { if (depth === 0) { i++; return out; } depth--; }
        out += ch;
        i++;
      }
      err();
    }
    function parseAttrs(text, node) {
      const re = /([^\s=]+)(?:=("([^"]*)"|'([^']*)'|[^\s]*))?/g;
      let m;
      while ((m = re.exec(text))) {
        const val = m[3] ?? m[4] ?? (m[2] !== undefined ? m[2] : '');
        node.attrs[m[1]] = val;
      }
    }
    function parseElement() {
      if (peek() === '(') {
        i++;
        const children = parseExpr(')');
        if (peek() !== ')') err();
        i++;
        const g = { group: true, children, mult: 1 };
        parseMult(g);
        return g;
      }
      const node = { name: readName(), id: '', classes: [], attrs: {}, text: null, children: [], mult: 1 };
      if (ALIASES[node.name]) {
        // Maxsus qisqartmani ochib, qolgan qismni unga qo'shamiz
        const sub = parse(ALIASES[node.name])[0];
        Object.assign(node, sub, { children: [], mult: 1 });
      }
      for (;;) {
        const ch = peek();
        if (ch === '#') { i++; node.id = readToken(); }
        else if (ch === '.') { i++; node.classes.push(readToken()); }
        else if (ch === '[') parseAttrs(readUntil(']'), node);
        else if (ch === '{') node.text = (node.text || '') + readUntil('}');
        else break;
      }
      parseMult(node);
      if (!node.name && !node.id && !node.classes.length && node.text === null && !Object.keys(node.attrs).length) err();
      return node;
    }
    function readToken() {
      const m = /^[\w$@:%\/\-\[\]]+/.exec(src.slice(i));
      if (!m) err();
      i += m[0].length;
      return m[0];
    }
    function parseMult(node) {
      if (peek() === '*') {
        i++;
        const m = /^\d+/.exec(src.slice(i));
        node.mult = m ? Math.min(+m[0], 200) : 1;
        if (m) i += m[0].length;
      }
    }
    function parseExpr(close) {
      const root = { children: [] };
      let parent = root;
      const stack = [];
      let last = null;
      while (i < src.length && peek() !== close) {
        last = parseElement();
        parent.children.push(last);
        const op = peek();
        if (op === '>') { i++; stack.push(parent); parent = last.group ? deepestLast(last) : last; }
        else if (op === '+') { i++; }
        else if (op === '^') {
          while (peek() === '^') { i++; if (stack.length) parent = stack.pop(); }
        } else if (op === close || op === undefined) break;
        else err();
      }
      return root.children;
    }
    function deepestLast(g) {
      let n = g.children[g.children.length - 1];
      while (n && n.group) n = n.children[n.children.length - 1];
      return n || g;
    }
    const res = parseExpr(undefined);
    if (i < src.length) err();
    return res;
  }

  /* ---------------- HTML yaratish ---------------- */
  function implicitTag(parentName) {
    return { ul: 'li', ol: 'li', table: 'tr', tbody: 'tr', thead: 'tr', tfoot: 'tr', tr: 'td', select: 'option', optgroup: 'option', datalist: 'option', dl: 'dt', nav: 'a', em: 'span', p: 'span', span: 'span' }[parentName] || 'div';
  }
  const num = (s, n, total) => s.replace(/(\$+)(@-)?/g, (all, d, rev) => String(rev ? total - n + 1 : n).padStart(d.length, '0'));

  function render(nodes, parentName, indent, unit, idx = 1, total = 1) {
    let out = '';
    for (const node of nodes) {
      for (let k = 1; k <= node.mult; k++) {
        const n = node.mult > 1 ? k : idx, t = node.mult > 1 ? node.mult : total;
        if (node.group) { out += render(node.children, parentName, indent, unit, n, t); continue; }
        let name = node.name || implicitTag(parentName);
        if (/^lorem\d*$/i.test(name)) { out += indent + lorem(+(name.slice(5)) || 30) + '\n'; continue; }
        const attrs = Object.assign({}, DEFAULT_ATTRS[name] || {}, node.attrs);
        if (node.id) attrs.id = num(node.id, n, t);
        if (node.classes.length) attrs.class = node.classes.map(c => num(c, n, t)).join(' ');
        const order = ['id', 'class'].filter(a => a in attrs).concat(Object.keys(attrs).filter(a => a !== 'id' && a !== 'class'));
        const attrStr = order.map(a => ` ${a}="${attrs[a] === '' ? CUR : num(attrs[a], n, t)}"`).join('');
        if (VOID.has(name)) { out += `${indent}<${name}${attrStr}>\n`; continue; }
        const text = node.text !== null ? num(node.text, n, t) : '';
        if (!node.children.length) {
          out += `${indent}<${name}${attrStr}>${text || CUR}</${name}>\n`;
        } else {
          const inner = render(node.children, name, indent + unit, unit, n, t);
          const simpleInline = node.children.length === 1 && !node.children[0].group && node.children[0].mult === 1 && INLINE.has(node.children[0].name) && !node.children[0].children.length;
          if (simpleInline && INLINE.has(name)) out += `${indent}<${name}${attrStr}>${text}${inner.trim()}</${name}>\n`;
          else out += `${indent}<${name}${attrStr}>${text ? '\n' + indent + unit + text : ''}\n${inner}${indent}</${name}>\n`;
        }
      }
    }
    return out;
  }

  function html5(unit) {
    return `<!DOCTYPE html>
<html lang="uz">
<head>
${unit}<meta charset="UTF-8">
${unit}<meta name="viewport" content="width=device-width, initial-scale=1.0">
${unit}<title>${CUR}Hujjat</title>
</head>
<body>
${unit}${CUR}
</body>
</html>`;
  }

  function expandHtml(abbr, indent, unit) {
    if (abbr === '!' || abbr === 'html:5' || abbr === '!!!') return html5(unit).split('\n').map((l, k) => k ? indent + l : l).join('\n');
    const nodes = parse(abbr);
    let out = render(nodes, '', indent, unit).replace(/\n$/, '');
    return out.slice(indent.length); // birinchi qator chekinishi allaqachon bor
  }

  /* ---------------- CSS qisqartmalari ---------------- */
  const CSS_PROPS = {
    m: 'margin', mt: 'margin-top', mr: 'margin-right', mb: 'margin-bottom', ml: 'margin-left', mx: 'margin-inline', my: 'margin-block',
    p: 'padding', pt: 'padding-top', pr: 'padding-right', pb: 'padding-bottom', pl: 'padding-left', px: 'padding-inline', py: 'padding-block',
    w: 'width', h: 'height', mw: 'max-width', mh: 'max-height', miw: 'min-width', mih: 'min-height', fz: 'font-size', fs: 'font-size',
    fw: 'font-weight', lh: 'line-height', ls: 'letter-spacing', c: 'color', bg: 'background', bgc: 'background-color', bd: 'border', bdr: 'border-radius',
    br: 'border-radius', op: 'opacity', z: 'z-index', t: 'top', r: 'right', b: 'bottom', l: 'left', g: 'gap', ti: 'text-indent', ff: 'font-family',
    trs: 'transition', tf: 'transform', bxsh: 'box-shadow', ins: 'inset', fx: 'flex', fg: 'flex-grow', gtc: 'grid-template-columns', ar: 'aspect-ratio',
  };
  const CSS_KW = {
    df: 'display: flex;', dg: 'display: grid;', db: 'display: block;', dn: 'display: none;', dib: 'display: inline-block;', di: 'display: inline;', dif: 'display: inline-flex;',
    jcc: 'justify-content: center;', jcsb: 'justify-content: space-between;', jcsa: 'justify-content: space-around;', jcfs: 'justify-content: flex-start;', jcfe: 'justify-content: flex-end;',
    aic: 'align-items: center;', ais: 'align-items: stretch;', aifs: 'align-items: flex-start;', aife: 'align-items: flex-end;', pic: 'place-items: center;',
    fdc: 'flex-direction: column;', fdr: 'flex-direction: row;', fww: 'flex-wrap: wrap;', tac: 'text-align: center;', tar: 'text-align: right;', tal: 'text-align: left;',
    posr: 'position: relative;', posa: 'position: absolute;', posf: 'position: fixed;', poss: 'position: sticky;', cp: 'cursor: pointer;',
    ovh: 'overflow: hidden;', ova: 'overflow: auto;', fwb: 'font-weight: bold;', fwn: 'font-weight: normal;', fsi: 'font-style: italic;',
    tdn: 'text-decoration: none;', tdu: 'text-decoration: underline;', ttu: 'text-transform: uppercase;', bxsz: 'box-sizing: border-box;',
    bdn: 'border: none;', lsn: 'list-style: none;', usn: 'user-select: none;', pen: 'pointer-events: none;', wsnw: 'white-space: nowrap;', ofc: 'object-fit: cover;',
  };
  const UNITLESS = new Set(['fw', 'lh', 'op', 'z', 'fx', 'fg']);
  function expandCss(abbr) {
    if (CSS_KW[abbr]) return CSS_KW[abbr];
    const m = /^([a-z]+?)(#[0-9a-fA-F]{1,8}|-?\d*\.?\d+(?:[a-z%]+)?(?:-\d*\.?\d+[a-z%]*)*)?$/.exec(abbr);
    if (!m || !CSS_PROPS[m[1]]) return null;
    const prop = CSS_PROPS[m[1]];
    let val = m[2];
    if (!val) return `${prop}: ${CUR};`;
    if (val[0] === '#') {
      if (val.length === 2) val = '#' + val[1].repeat(6);
      else if (val.length === 3) val = '#' + val.slice(1).repeat(3);
    } else {
      val = val.split(/(?<=\d)-(?=\d)/).map(v => /[a-z%]$/i.test(v) || UNITLESS.has(m[1]) || v === '0' ? v : v + 'px').join(' ');
    }
    return `${prop}: ${val};`;
  }

  /* ---------------- Muharrir bilan ishlash ---------------- */
  let stops = [];
  function clearStops() { stops.forEach(s => s.clear()); stops = []; }
  function nextStop(cm) {
    while (stops.length) {
      const s = stops.shift();
      const pos = s.find();
      s.clear();
      if (pos) { cm.setCursor(pos); return true; }
    }
    return false;
  }
  function insert(cm, from, to, text) {
    const parts = text.split(CUR);
    const clean = parts.join('');
    cm.replaceRange(clean, from, to, '+emmet');
    clearStops();
    const base = cm.indexFromPos(from);
    let off = 0;
    const positions = [];
    for (let k = 0; k < parts.length - 1; k++) { off += parts[k].length; positions.push(cm.posFromIndex(base + off)); }
    if (positions.length) {
      cm.setCursor(positions[0]);
      stops = positions.slice(1).map(p => cm.setBookmark(p, { widget: mkStop(), insertLeft: true }));
    } else {
      cm.setCursor(cm.posFromIndex(base + clean.length));
    }
  }
  function mkStop() { const s = document.createElement('span'); s.className = 'cm-tabstop'; return s; }

  // Kursordan oldingi qisqartmani topish
  function abbrBefore(line, ch) {
    let j = ch, depth = { '[': 0, '{': 0, '(': 0 };
    while (j > 0) {
      const c = line[j - 1];
      if (c === ']') depth['[']++; else if (c === '[') { if (!depth['[']) break; depth['[']--; }
      else if (c === '}') depth['{']++; else if (c === '{') { if (!depth['{']) break; depth['{']--; }
      else if (depth['['] || depth['{']) { /* qavs ichida hamma belgi mumkin */ }
      else if (!/[\w.#>+^*$@:!()\-%\/]/.test(c)) break;
      j--;
    }
    return { start: j, text: line.slice(j, ch) };
  }

  function tryExpand(cm) {
    if (cm.somethingSelected() || cm.listSelections().length > 1) return false;
    const p = state.active || '';
    const lang = window.WEB && WEB.langOf(p);
    if (lang !== 'html' && lang !== 'css') return false;
    const cur = cm.getCursor();
    const line = cm.getLine(cur.line);
    const mode = cm.getModeAt(cur).name;
    const { start, text } = abbrBefore(line, cur.ch);
    if (!text || /^\d/.test(text)) return false;
    // Bitta oddiy so'z bo'lsa — faqat haqiqiy teg, alias yoki lorem kengaytiriladi
    const bare = /^[A-Za-z][\w-]*$/.test(text);
    const before = line.slice(0, start);
    const unit = ' '.repeat(cm.getOption('indentUnit'));
    // style="..." atributi ichida — CSS qisqartmalari (df → display: flex;)
    if (lang === 'html' && mode === 'xml' && /\bstyle\s*=\s*["'][^"']*$/i.test(before)) {
      if (!/(["';]|^)\s*$/.test(before)) return false;
      const out = expandCss(text);
      if (!out) return false;
      insert(cm, { line: cur.line, ch: start }, cur, (/[^"'\s]\s*$/.test(before) && !/;\s*$/.test(before) ? ' ' : '') + out + ' ');
      return true;
    }
    if (mode === 'css' || lang === 'css') {
      // Faqat qoida ichida (deklaratsiya joyida)
      if (!/^\s*$/.test(before) && !/[;{]\s*$/.test(before)) return false;
      const out = expandCss(text);
      if (!out) return false;
      insert(cm, { line: cur.line, ch: start }, cur, out);
      return true;
    }
    if (mode !== 'xml') return false;
    if (bare && !TAGS.has(text.toLowerCase()) && !ALIASES[text] && !/^lorem\d*$/i.test(text)) return false;
    // Teg ichida (atributlar orasida) kengaytirmaymiz
    if (before.lastIndexOf('<') > before.lastIndexOf('>')) return false;
    const tok = cm.getTokenAt(cur);
    if (tok.type && /\b(attribute|string|tag)\b/.test(tok.type) && !/^[\w.#!]/.test(text)) return false;
    try {
      const indent = (before.match(/^\s*/) || [''])[0];
      const out = expandHtml(text, before.trim() ? '' : indent, unit);
      if (!out || out === text) return false;
      insert(cm, { line: cur.line, ch: start }, cur, out);
      return true;
    } catch (e) {
      return false;
    }
  }

  let baseTab = null; // app.js'dagi oddiy chekinish
  function attach() {
    if (typeof editor === 'undefined' || !editor) return setTimeout(attach, 50);
    const keys = editor.getOption('extraKeys');
    const prevTab = keys.Tab;
    baseTab = prevTab;
    keys.Tab = cm => {
      if (stops.length && nextStop(cm)) return;
      if (tryExpand(cm)) return;
      return typeof prevTab === 'function' ? prevTab(cm) : CodeMirror.Pass;
    };
    const prevEsc = keys.Esc;
    keys.Esc = cm => {
      if (stops.length) { clearStops(); return; }
      return typeof prevEsc === 'function' ? prevEsc(cm) : CodeMirror.Pass;
    };
    editor.setOption('extraKeys', keys);
    editor.on('swapDoc', clearStops);
  }
  attach();

  return { expandHtml, expandCss, parse, insert, tryExpand, nextStop, hasStops: () => stops.length > 0, baseTab: () => baseTab, CUR };
})();
