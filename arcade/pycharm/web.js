/* PyCharm Online — veb tillar (HTML, CSS, JavaScript, Tailwind, JSON) va SQL.
   Har bir til o'z ishga tushirgichida bajariladi:
   - HTML/CSS/JS sahifalar — izolyatsiyalangan (sandbox) Preview oynasida;
   - alohida .js fayl — yashirin sandbox iframe'da, konsol natijasi Run paneliga;
   - .sql — SQLite (Pyodide) da, natijalar jadval ko'rinishida.
   Python kodi bilan hech biri aralashmaydi. */
'use strict';

window.WEB = (function () {
  const EXT = { html: 'html', htm: 'html', css: 'css', js: 'js', mjs: 'js', json: 'json', sql: 'sql' };
  const langOf = p => EXT[(p.split('.').pop() || '').toLowerCase()] || null;
  const runnable = p => ['html', 'js', 'sql'].includes(langOf(p));
  const ICONS = {
    html: '<i class="ico html fa-brands fa-html5"></i>',
    css: '<i class="ico css fa-brands fa-css3-alt"></i>',
    js: '<i class="ico js fa-brands fa-js"></i>',
    json: '<i class="ico json fa-solid fa-code"></i>',
    sql: '<i class="ico sql fa-solid fa-database"></i>',
  };
  const MODES = { html: 'htmlmixed', css: 'css', js: 'javascript', json: { name: 'javascript', json: true }, sql: 'text/x-sqlite' };

  /* ================= Shablonlar ================= */
  function template(path) {
    const lang = langOf(path);
    const name = baseName(path).replace(/\.\w+$/, '');
    if (lang === 'html') return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <!-- Tailwind CSS (kerak bo'lmasa, o'chirib tashlang) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
  <main class="text-center space-y-4">
    <h1 class="text-4xl font-bold text-sky-400">Salom, dunyo!</h1>
    <p class="text-slate-400">Bu sahifa PyCharm Online'da yaratildi.</p>
    <button id="btn" class="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 font-semibold">Bosing</button>
    <p id="natija"></p>
  </main>
  <script src="app.js"></script>
</body>
</html>
`;
    if (lang === 'css') return `/* ${name}.css */
:root {
  --asosiy: #38bdf8;
}

body {
  font-family: system-ui, sans-serif;
}

h1 {
  letter-spacing: .5px;
}
`;
    if (lang === 'js') return `// ${name}.js
const btn = document.getElementById('btn');
let soni = 0;

if (btn) {
  btn.addEventListener('click', () => {
    soni++;
    document.getElementById('natija').textContent = \`Tugma \${soni} marta bosildi\`;
    console.log('bosildi:', soni);
  });
} else {
  // Alohida ishga tushirilganda (Shift+F10) natija Run paneliga chiqadi
  const sonlar = [5, 3, 8, 1];
  console.log('Saralangan:', [...sonlar].sort((a, b) => a - b));
  console.log('Yig\\'indi:', sonlar.reduce((a, b) => a + b, 0));
}
`;
    if (lang === 'sql') return `-- ${name}.sql — SQLite. Ishga tushirish: Shift+F10
-- Baza fayli: database.db (Python'dan ham sqlite3.connect("database.db") bilan ochiladi)

CREATE TABLE IF NOT EXISTS talabalar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ism TEXT NOT NULL,
  kurs INTEGER,
  ball REAL
);

DELETE FROM talabalar;
INSERT INTO talabalar (ism, kurs, ball) VALUES
  ('Ali', 2, 87.5),
  ('Gulnoza', 3, 94),
  ('Sardor', 2, 71),
  ('Laylo', 1, 88);

SELECT ism, kurs, ball FROM talabalar WHERE ball >= 80 ORDER BY ball DESC;

SELECT kurs, COUNT(*) AS soni, ROUND(AVG(ball), 1) AS ortacha
FROM talabalar GROUP BY kurs;
`;
    if (lang === 'json') return '{\n  "nom": "loyiha",\n  "versiya": 1\n}\n';
    return '';
  }

  // Namuna veb-loyiha (Fayl menyusidan)
  function createWebSample() {
    const files = {
      'web/index.html': template('web/index.html'),
      'web/style.css': template('web/style.css'),
      'web/app.js': template('web/app.js'),
      'sql/namuna.sql': template('sql/namuna.sql'),
    };
    for (const [p, c] of Object.entries(files)) if (!(p in state.files)) state.files[p] = c;
    state.expanded.web = state.expanded.sql = true;
    persist(); syncFS();
    openFile('web/index.html');
    toast('🌐 <b>web/</b> va <b>sql/</b> namuna fayllari yaratildi. Shift+F10 — ishga tushirish', 'success');
  }

  /* ================= Fayllar orasidagi yo'llar ================= */
  function content(p) { return docs[p] ? docs[p].getValue() : state.files[p]; }
  const isExternal = u => /^(https?:)?\/\/|^data:|^blob:|^mailto:|^#|^javascript:/i.test(u || '');
  function resolve(base, rel) {
    rel = rel.split(/[?#]/)[0];
    if (rel.startsWith('/')) rel = rel.slice(1), base = '';
    const parts = (base ? base.split('/') : []);
    for (const seg of rel.split('/')) {
      if (seg === '..') parts.pop();
      else if (seg && seg !== '.') parts.push(seg);
    }
    return parts.join('/');
  }
  function htmlFor(p) {
    const dir = dirName(p);
    const htmls = Object.keys(state.files).filter(f => langOf(f) === 'html');
    return htmls.find(f => f === (dir ? dir + '/' : '') + 'index.html') || htmls.find(f => dirName(f) === dir) || htmls[0] || null;
  }

  /* ================= Sandbox ko'prigi (konsol + havolalar) ================= */
  const BRIDGE = `<script>(function(){
  var send=function(t,a){try{parent.postMessage({__pc:1,type:t,args:a},'*')}catch(e){}};
  var fmt=function(v){try{if(typeof v==='string')return v;if(v instanceof Error)return v.name+': '+v.message;if(typeof v==='function')return v.toString().slice(0,120);if(v instanceof Node)return '<'+v.nodeName.toLowerCase()+'>';var r=function(k,x){return typeof x==='bigint'?x+'n':x};var s=JSON.stringify(v,r);return s&&s.length>90?JSON.stringify(v,r,2):s}catch(e){return String(v)}};
  ['log','info','warn','error','debug','table'].forEach(function(k){var o=console[k];console[k]=function(){var a=[].slice.call(arguments);send(k,a.map(fmt));try{o&&o.apply(console,a)}catch(e){}}});
  window.addEventListener('error',function(e){send('error',[(e.message||'Xato')+(e.lineno?' (qator '+e.lineno+')':'')])});
  window.addEventListener('unhandledrejection',function(e){send('error',['Uncaught (in promise) '+fmt(e.reason)])});
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href');
    if(/^#/.test(h)||/^javascript:/i.test(h))return;e.preventDefault();
    if(/^(https?:)?\\/\\//i.test(h)){window.open(h,'_blank');return}send('nav',[h])},true);
  document.addEventListener('submit',function(e){var f=e.target;var act=f.getAttribute('action');if(!act||!/^(https?:)?\\/\\//.test(act)){e.preventDefault();var d={};new FormData(f).forEach(function(v,k){d[k]=v});send('info',['Forma yuborildi: '+JSON.stringify(d)])}},true);
  window.__pcDone=function(){send('done',[])};
})();<\/script>`;

  function inlineAssets(html, base) {
    // <link rel="stylesheet" href="style.css"> → <style>...</style>
    html = html.replace(/<link\b[^>]*>/gi, tag => {
      if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return tag;
      const m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!m || isExternal(m[1])) return tag;
      const p = resolve(base, m[1]);
      if (!(p in state.files)) return `<!-- topilmadi: ${m[1]} -->`;
      return `<style data-file="${p}">\n${content(p).replace(/<\/style/gi, '<\\/style')}\n</style>`;
    });
    // <script src="app.js"></script> → <script>...</script>
    html = html.replace(/<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (all, a, src, b) => {
      if (isExternal(src)) return all;
      const p = resolve(base, src);
      if (!(p in state.files)) return `<script>console.error('Fayl topilmadi: ${src.replace(/'/g, '')}')<\/script>`;
      const code = content(p).replace(/<\/script/gi, '<\\/script');
      return `<script${a}${b} data-file="${p}">\n${code}\n<\/script>`;
    });
    return html;
  }
  function withBridge(html) {
    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + BRIDGE);
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m => m + '<head>' + BRIDGE + '</head>');
    return BRIDGE + html;
  }

  /* ================= Preview oynasi ================= */
  let previewPath = null;
  let previewTimer = null;
  const pv = () => document.getElementById('preview');
  const frame = () => document.getElementById('previewFrame');

  function openPreview(path, con = runCon) {
    previewPath = path;
    pv().classList.add('show');
    document.getElementById('resizePreview').style.display = '';
    document.getElementById('previewAddr').textContent = path;
    con.clear();
    con.write(`🌐 ${path} — Preview (sandbox) da ochildi. Konsol xabarlari shu yerda.\n`, 'meta');
    renderPreview();
    editor.refresh();
  }
  function renderPreview() {
    if (!previewPath || !(previewPath in state.files)) return;
    const html = withBridge(inlineAssets(content(previewPath), dirName(previewPath)));
    frame().srcdoc = html;
  }
  function closePreview() {
    previewPath = null;
    pv().classList.remove('show');
    document.getElementById('resizePreview').style.display = 'none';
    frame().srcdoc = '';
    editor.refresh();
  }
  // Fayl o'zgarsa — preview avtomatik yangilanadi (HTML/CSS/JS)
  function liveReload() {
    if (!previewPath || !document.getElementById('liveReload').checked) return;
    const lang = langOf(state.active || '');
    if (!['html', 'css', 'js'].includes(lang)) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 450);
  }

  /* ================= Alohida JavaScript fayl ================= */
  let jsFrame = null;
  function runJs(path, con) {
    if (!jsFrame) {
      jsFrame = document.createElement('iframe');
      jsFrame.setAttribute('sandbox', 'allow-scripts allow-modals');
      jsFrame.style.display = 'none';
      jsFrame.title = 'JavaScript sandbox';
      document.body.appendChild(jsFrame);
    }
    if (con === runCon) { showBottom('run'); runCon.clear(); }
    con.write(`node ${path}  (brauzer sandbox)\n`, 'meta');
    const code = content(path).replace(/<\/script/gi, '<\\/script');
    const isModule = /^\s*(import|export)\s/m.test(code);
    jsRunStart = performance.now();
    jsCon = con;
    jsFrame.srcdoc = `<!DOCTYPE html><html><head>${BRIDGE}</head><body>
<script${isModule ? ' type="module"' : ''}>\n${code}\n<\/script>
<script${isModule ? ' type="module"' : ''}>window.__pcDone()<\/script></body></html>`;
  }
  let jsCon = null, jsRunStart = 0;

  // Sandbox'dan kelgan xabarlar
  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || !d.__pc) return;
    const fromPreview = frame() && e.source === frame().contentWindow;
    const fromJs = jsFrame && e.source === jsFrame.contentWindow;
    if (!fromPreview && !fromJs) return;
    const con = fromJs ? (jsCon || runCon) : runCon;
    if (d.type === 'done') {
      con.write(`\nProcess finished with exit code 0  (${((performance.now() - jsRunStart) / 1000).toFixed(2)}s)\n`, 'meta');
      return;
    }
    if (d.type === 'nav' && fromPreview) {
      const p = resolve(dirName(previewPath), d.args[0]);
      if (p in state.files && langOf(p) === 'html') { previewPath = p; document.getElementById('previewAddr').textContent = p; renderPreview(); }
      else con.write(`Sahifa topilmadi: ${d.args[0]}\n`, 'warn');
      return;
    }
    // Tailwind CDN'ning "production" ogohlantirishi o'quv muhitida ortiqcha
    if (/cdn\.tailwindcss\.com should not be used in production/.test(d.args.join(' '))) return;
    const cls = d.type === 'error' ? 'err' : d.type === 'warn' ? 'warn' : '';
    const prefix = fromPreview ? '[preview] ' : '';
    con.write(prefix + d.args.join(' ') + '\n', cls);
    con.flush();
    if (d.type === 'error' && fromPreview) document.querySelector('.btab[data-tab="run"]').classList.add('blink');
  });

  /* ================= SQL (SQLite, Pyodide orqali) ================= */
  const SQL_PY = String.raw`
import sqlite3, json, os

def _pc_sql(script, dbname):
    os.chdir(ROOT)
    con = sqlite3.connect(dbname)
    out = []
    buf = ''
    for line in script.splitlines(True):
        buf += line
        if sqlite3.complete_statement(buf):
            stmt = buf.strip()
            buf = ''
            if not stmt or all(l.strip().startswith('--') or not l.strip() for l in stmt.splitlines()):
                continue
            try:
                cur = con.execute(stmt)
                if cur.description:
                    rows = cur.fetchmany(501)
                    out.append({'sql': stmt, 'cols': [c[0] for c in cur.description], 'rows': [list(r) for r in rows[:500]], 'more': len(rows) > 500})
                else:
                    out.append({'sql': stmt, 'count': cur.rowcount})
            except Exception as e:
                out.append({'sql': stmt, 'error': f'{type(e).__name__}: {e}'})
                break
    if buf.strip() and not all(l.strip().startswith('--') or not l.strip() for l in buf.splitlines()):
        out.append({'sql': buf.strip(), 'error': "Ifoda tugallanmagan — oxiriga ; qo'ying"})
    con.commit()
    con.close()
    return json.dumps(out, default=str)

def _pc_sql_schema(dbname):
    os.chdir(ROOT)
    if not os.path.exists(dbname):
        return '{}'
    con = sqlite3.connect(dbname)
    res = {}
    for (t,) in con.execute("select name from sqlite_master where type in ('table','view') and name not like 'sqlite_%'"):
        res[t] = [r[1] for r in con.execute(f'pragma table_info("{t}")')]
    con.close()
    return json.dumps(res)

def _pc_db_files():
    return json.dumps([f for f in os.listdir(ROOT) if f.endswith(('.db', '.sqlite', '.sqlite3'))])
`;
  let sqlReady = null;
  function ensureSql() {
    if (!sqlReady) {
      sqlReady = (async () => {
        await py.loadPackage('sqlite3', { messageCallback: () => {} });
        py.runPython(SQL_PY);
      })();
      sqlReady.catch(() => { sqlReady = null; });
    }
    return sqlReady;
  }
  const dbNameFor = sql => ((sql.match(/^\s*--\s*db:\s*([\w.-]+)/im) || [])[1]) || 'database.db';

  async function runSql(path, con) {
    if (!await ensureReady() || running) return;
    if (con === runCon) { showBottom('run'); runCon.clear(); }
    const sql = content(path);
    const db = dbNameFor(sql);
    con.write(`sqlite3 ${db} < ${path}\n`, 'meta');
    setRunning(true);
    const t0 = performance.now();
    try {
      await ensureSql();
      syncFS();
      const res = JSON.parse(py.globals.get('_pc_sql')(sql, db));
      renderSqlResults(res, con);
      const err = res.some(r => r.error);
      con.write(`\n${err ? 'Xato bilan tugadi' : 'Bajarildi'} · ${res.length} ta ifoda · ${((performance.now() - t0) / 1000).toFixed(2)}s\n`, err ? 'err' : 'meta');
      await saveDbs();
      schemaCache = null;
    } catch (e) {
      con.write(String(e) + '\n', 'err');
    }
    setRunning(false);
  }
  function renderSqlResults(res, con) {
    for (const r of res) {
      const short = r.sql.replace(/\s+/g, ' ').slice(0, 110) + (r.sql.length > 110 ? '…' : '');
      con.write(`\n› ${short}\n`, 'cmd');
      if (r.error) { con.write(r.error + '\n', 'err'); continue; }
      if (r.cols) {
        const wrap = document.createElement('div');
        wrap.className = 'sql-table-wrap';
        wrap.innerHTML = `<table class="sql-table"><thead><tr>${r.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${r.rows.map(row => `<tr>${row.map(v => `<td class="${v === null ? 'null' : typeof v === 'number' ? 'num' : ''}">${v === null ? 'NULL' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        con.el.appendChild(wrap);
        con.write(`${r.rows.length}${r.more ? '+' : ''} ta qator\n`, 'meta');
      } else {
        con.write(`OK${r.count >= 0 ? ` — ${r.count} ta qator o'zgardi` : ''}\n`, 'ok');
      }
    }
    con.el.scrollTop = con.el.scrollHeight;
  }

  // .db fayllar xotirada (Pyodide FS) — IndexedDB'ga saqlab qo'yamiz
  async function saveDbs() {
    if (!pyReady) return;
    try {
      await ensureSql();
      const names = JSON.parse(py.globals.get('_pc_db_files')());
      const data = {};
      for (const n of names) data[n] = py.FS.readFile(ROOT + '/' + n);
      await idbSet('dbfiles', data);
    } catch (e) { /* e'tiborsiz */ }
  }
  async function restoreDbs() {
    try {
      const data = await idbGet('dbfiles');
      if (!data) return;
      for (const [n, bytes] of Object.entries(data)) py.FS.writeFile(ROOT + '/' + n, bytes);
    } catch (e) { /* e'tiborsiz */ }
  }

  /* ================= Avtoto'ldirish ================= */
  let schemaCache = null;
  async function loadSchema(db) {
    if (!pyReady) return {};
    try { await ensureSql(); schemaCache = JSON.parse(py.globals.get('_pc_sql_schema')(db)); } catch (e) { schemaCache = {}; }
    return schemaCache;
  }

  // Tailwind klasslari ro'yxati (eng ko'p ishlatiladiganlari)
  const TW = (() => {
    const out = new Set(('flex inline-flex grid inline-grid block inline-block inline hidden contents container relative absolute fixed sticky static ' +
      'items-start items-center items-end items-stretch items-baseline justify-start justify-center justify-end justify-between justify-around justify-evenly ' +
      'flex-row flex-col flex-wrap flex-nowrap flex-1 flex-auto flex-none grow shrink-0 self-center self-start self-end place-items-center content-center ' +
      'grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5 grid-cols-6 grid-cols-12 col-span-2 col-span-3 col-span-full ' +
      'font-thin font-light font-normal font-medium font-semibold font-bold font-extrabold font-black italic underline line-through no-underline uppercase lowercase capitalize ' +
      'text-left text-center text-right text-justify truncate break-words whitespace-nowrap leading-none leading-tight leading-snug leading-normal leading-relaxed tracking-tight tracking-wide ' +
      'text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl text-5xl text-6xl text-7xl ' +
      'rounded rounded-none rounded-sm rounded-md rounded-lg rounded-xl rounded-2xl rounded-3xl rounded-full border border-0 border-2 border-4 border-t border-b border-l border-r border-dashed border-dotted ' +
      'shadow shadow-sm shadow-md shadow-lg shadow-xl shadow-2xl shadow-inner shadow-none ring ring-1 ring-2 ring-4 ring-offset-2 outline-none ' +
      'opacity-0 opacity-25 opacity-50 opacity-75 opacity-100 overflow-hidden overflow-auto overflow-x-auto overflow-y-auto object-cover object-contain ' +
      'transition transition-all transition-colors duration-150 duration-200 duration-300 duration-500 ease-in ease-out ease-in-out transform scale-95 scale-105 scale-110 rotate-45 rotate-90 -rotate-45 ' +
      'cursor-pointer cursor-not-allowed select-none pointer-events-none animate-spin animate-ping animate-pulse animate-bounce ' +
      'top-0 right-0 bottom-0 left-0 inset-0 z-0 z-10 z-20 z-30 z-40 z-50 min-h-screen min-w-full max-w-sm max-w-md max-w-lg max-w-xl max-w-2xl max-w-4xl max-w-6xl max-w-7xl max-w-full mx-auto ' +
      'backdrop-blur blur bg-gradient-to-r bg-gradient-to-l bg-gradient-to-t bg-gradient-to-b bg-gradient-to-br bg-cover bg-center list-disc list-decimal sr-only').split(' '));
    const scale = ['0', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40', '48', '64', 'auto', 'px'];
    for (const p of ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'gap', 'gap-x', 'gap-y', 'space-x', 'space-y'])
      for (const v of scale) if (!(v === 'auto' && p.startsWith('p'))) out.add(`${p}-${v}`);
    for (const p of ['w', 'h']) for (const v of scale.concat(['full', 'screen', '1/2', '1/3', '2/3', '1/4', '3/4', 'fit', 'min', 'max'])) out.add(`${p}-${v}`);
    const colors = ['slate', 'gray', 'zinc', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    for (const pre of ['text', 'bg', 'border', 'ring', 'from', 'to', 'via', 'shadow', 'fill', 'stroke']) {
      for (const c of colors) for (const s of shades) out.add(`${pre}-${c}-${s}`);
      out.add(`${pre}-white`); out.add(`${pre}-black`); out.add(`${pre}-transparent`);
    }
    return [...out].sort();
  })();
  const TW_VARIANTS = ['hover:', 'focus:', 'active:', 'disabled:', 'group-hover:', 'dark:', 'sm:', 'md:', 'lg:', 'xl:', '2xl:', 'first:', 'last:', 'odd:', 'even:'];

  function inClassAttr(cm, cur) {
    const before = cm.getLine(cur.line).slice(0, cur.ch);
    return /\bclass(Name)?\s*=\s*["'][^"']*$/.test(before);
  }

  function hint(cm, callback) {
    const lang = langOf(state.active || '');
    const cur = cm.getCursor();
    const line = cm.getLine(cur.line);
    let done = false;
    const finish = r => { if (!done) { done = true; callback(r); } };
    // HTML class="..." ichida — Tailwind klasslari
    if (lang === 'html' && inClassAttr(cm, cur)) {
      let start = cur.ch;
      while (start > 0 && /[\w:\-/.\[\]#]/.test(line[start - 1])) start--;
      const word = line.slice(start, cur.ch);
      const vIdx = word.lastIndexOf(':');
      const variant = vIdx >= 0 ? word.slice(0, vIdx + 1) : '';
      const base = word.slice(vIdx + 1);
      const list = (base ? TW.filter(c => c.startsWith(base)) : TW_VARIANTS.concat(TW.slice(0, 40))).slice(0, 80).map(c => variant + c);
      if (!list.length) return finish(null);
      return finish({ list, from: CodeMirror.Pos(cur.line, start), to: cur });
    }
    if (lang === 'sql') {
      const db = dbNameFor(cm.getValue());
      const go = tables => {
        try {
          const r = CodeMirror.hint.sql(cm, { tables, completeSingle: false });
          finish(r && r.list.length ? r : null);
        } catch (e) { finish(null); }
      };
      if (schemaCache) return go(schemaCache);
      loadSchema(db).then(go);
      return;
    }
    let r = null;
    try {
      if (lang === 'html') r = CodeMirror.hint.html(cm, { completeSingle: false });
      else if (lang === 'css') r = CodeMirror.hint.css(cm, { completeSingle: false });
      else if (lang === 'js' || lang === 'json') r = CodeMirror.hint.javascript(cm, { completeSingle: false });
    } catch (e) { r = null; }
    // Fayldagi so'zlar bilan to'ldiramiz
    if (!r || !r.list.length) {
      try { r = CodeMirror.hint.anyword(cm, { completeSingle: false }); } catch (e) { r = null; }
    }
    finish(r && r.list.length ? r : null);
  }
  hint.async = true;

  function autoHint(cm, ch) {
    const lang = langOf(state.active || '');
    const t = ch.text.join('');
    const cur = cm.getCursor();
    const before = cm.getLine(cur.line).slice(0, cur.ch);
    if (lang === 'html') {
      if (t === '<' || (inClassAttr(cm, cur) && /[\w-]$/.test(t) && /[\w-]{1,}$/.test(before))) cm.showHint();
      else if (t === ' ' && inClassAttr(cm, cur)) cm.showHint();
      return;
    }
    if (lang === 'css' && /[\w-]/.test(t) && /[\w-]{2,}$/.test(before)) return cm.showHint();
    if ((lang === 'js' || lang === 'sql') && (/^\w$/.test(t) && /\w{2,}$/.test(before) || t === '.')) return cm.showHint();
  }

  /* ================= Formatlash ================= */
  function format(p) {
    const lang = langOf(p);
    const src = editor.getValue();
    let out = src;
    try {
      const opts = { indent_size: 2, end_with_newline: true, preserve_newlines: true, max_preserve_newlines: 2 };
      if (lang === 'html' && window.html_beautify) out = html_beautify(src, Object.assign({ wrap_attributes: 'auto', indent_inner_html: false, extra_liners: [] }, opts));
      else if (lang === 'css' && window.css_beautify) out = css_beautify(src, opts);
      else if ((lang === 'js' || lang === 'json') && window.js_beautify) out = js_beautify(src, opts);
      else if (lang === 'sql' && window.sqlFormatter) out = sqlFormatter.format(src, { language: 'sqlite', keywordCase: 'upper', tabWidth: 2 }) + '\n';
      else return toast('Formatlash kutubxonasi yuklanmadi', 'error');
    } catch (e) {
      return toast('Formatlab bo\'lmadi: ' + esc(e.message), 'error');
    }
    if (out !== src) {
      const cur = editor.getCursor(), scroll = editor.getScrollInfo();
      editor.setValue(out);
      editor.setCursor(cur);
      editor.scrollTo(scroll.left, scroll.top);
    }
    status('Kod formatlandi');
  }

  /* ================= Ishga tushirish ================= */
  function run(path, con = runCon) {
    persist();
    const lang = langOf(path);
    lastRun = { kind: 'file', path };
    if (lang === 'html') return openPreview(path, con);
    if (lang === 'js') return runJs(path, con);
    if (lang === 'sql') return runSql(path, con);
  }

  /* ================= UI ulanishlari ================= */
  document.getElementById('previewReload').onclick = renderPreview;
  document.getElementById('previewClose').onclick = closePreview;
  document.getElementById('previewNewTab').onclick = () => {
    if (!previewPath) return;
    const blob = new Blob([inlineAssets(content(previewPath), dirName(previewPath))], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };
  document.querySelectorAll('[data-width]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-width]').forEach(x => x.classList.toggle('on', x === b));
    frame().style.width = b.dataset.width;
  });
  dragResize(document.getElementById('resizePreview'), e => {
    const r = document.querySelector('.editor-wrap').getBoundingClientRect();
    pv().style.width = Math.max(220, Math.min(r.width - 200, r.right - e.clientX)) + 'px';
  });
  document.querySelector('.btab[data-tab="run"]').addEventListener('click', e => e.currentTarget.classList.remove('blink'));

  // Muharrirdagi o'zgarishlar preview'ni yangilaydi
  const hook = () => {
    // `editor` app.js'dagi global o'zgaruvchi; u boot() ichida yaratiladi
    if (typeof editor === 'undefined' || !editor) return setTimeout(hook, 50);
    editor.on('change', liveReload);
  };
  hook();

  return {
    langOf, runnable, icon: l => ICONS[l], mode: p => MODES[langOf(p)], template, hint, autoHint, format, run, htmlFor,
    createWebSample, closePreview,
    onPythonReady: () => restoreDbs(),
    afterPythonRun: () => { saveDbs(); schemaCache = null; },
  };
})();
