/* PyCharm Online — brauzerda ishlaydigan Python IDE (Pyodide + CodeMirror) */
'use strict';

const ROOT = '/home/pyodide/project';
const STORE_KEY = 'pycharm_online_v1';

const DEFAULT_FILES = {
  'main.py': `from utils import salomlash, faktorial


def main():
    ism = input("Ismingiz nima? ")
    print(salomlash(ism))

    for n in range(1, 6):
        print(f"{n}! = {faktorial(n)}")


if __name__ == "__main__":
    main()
`,
  'utils.py': `def salomlash(ism: str) -> str:
    """Foydalanuvchini salomlaydi."""
    return f"Salom, {ism}! PyCharm Online'ga xush kelibsiz."


def faktorial(n: int) -> int:
    """n! ni hisoblaydi."""
    if n < 0:
        raise ValueError("Manfiy son uchun faktorial yo'q")
    natija = 1
    for i in range(2, n + 1):
        natija *= i
    return natija
`,
  'test_utils.py': `import unittest

from utils import salomlash, faktorial


class TestFaktorial(unittest.TestCase):
    def test_nol(self):
        self.assertEqual(faktorial(0), 1)

    def test_besh(self):
        self.assertEqual(faktorial(5), 120)

    def test_manfiy(self):
        with self.assertRaises(ValueError):
            faktorial(-1)


class TestSalomlash(unittest.TestCase):
    def test_ism_bor(self):
        self.assertIn("Ali", salomlash("Ali"))


if __name__ == "__main__":
    unittest.main()
`,
  'README.md': `# PyCharm Online

Brauzerda ishlaydigan Python muhiti (Pyodide, Python 3.12).

- Shift+F10 — tanlangan faylni ishga tushirish
- Ctrl+Shift+T — barcha test_*.py fayllardagi unittest testlarini ishga tushirish
- Ctrl+Space — avtoto'ldirish
- Ctrl+Alt+L — kodni formatlash (black)
- Terminal: pip install <paket> — PyPI'dan paket o'rnatish

Fayllar brauzeringizda avtomatik saqlanadi.
`
};

const PY_KEYWORDS = ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
  'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield', 'match', 'case'];
const PY_BUILTINS = ['abs', 'all', 'any', 'bin', 'bool', 'bytes', 'callable', 'chr', 'dict', 'dir', 'divmod',
  'enumerate', 'filter', 'float', 'format', 'frozenset', 'getattr', 'hasattr', 'hash', 'help', 'hex', 'id', 'input',
  'int', 'isinstance', 'issubclass', 'iter', 'len', 'list', 'map', 'max', 'min', 'next', 'object', 'oct', 'open',
  'ord', 'pow', 'print', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'str', 'sum',
  'super', 'tuple', 'type', 'vars', 'zip', 'Exception', 'ValueError', 'TypeError', 'KeyError', 'IndexError',
  'ZeroDivisionError', 'StopIteration', 'RuntimeError', 'AttributeError', 'NotImplementedError', 'self', '__name__'];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ================= Holat ================= */
let state = { files: {}, folders: [], open: [], active: null, expanded: {}, runConfig: '', fontSize: 14 };
const docs = {};            // path -> CodeMirror.Doc
const lintMarks = {};       // path -> [TextMarker]
const problems = {};        // path -> [{line,col,msg,sev}]
let editor;
let py = null, pyReady = false, running = false;
let jediReady = false, pyflakesReady = false;
let writtenPaths = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.files && Object.keys(s.files).length) { state = Object.assign(state, s); return; }
    }
  } catch (e) { /* localStorage mavjud emas */ }
  resetState();
}
function resetState() {
  state.files = { ...DEFAULT_FILES };
  state.folders = [];
  state.open = ['main.py', 'utils.py', 'test_utils.py'];
  state.active = 'main.py';
  state.expanded = { '': true };
  state.runConfig = '';
}
let saveTimer;
function persist() {
  for (const p in docs) if (p in state.files) state.files[p] = docs[p].getValue();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* e'tiborsiz */ }
}
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { persist(); syncFS(); }, 500);
}

/* ================= Yordamchi UI ================= */
let toastTimer;
function toast(msg, kind = '') {
  const t = $('#toast');
  t.className = 'toast show ' + kind;
  t.innerHTML = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
function status(msg) { $('#statusMsg').textContent = msg; }
function pyStatus(text, kind) { $('#pyStatus').innerHTML = `<span class="dot ${kind || ''}"></span> ${esc(text)}`; }

function modal({ title, body = '', input = null, okText = 'OK', cancel = true }) {
  return new Promise(resolve => {
    const bg = $('#modal'), inp = $('#modalInput');
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = body;
    $('#modalOk').textContent = okText;
    $('#modalCancel').style.display = cancel ? '' : 'none';
    inp.style.display = input === null ? 'none' : '';
    inp.value = input || '';
    bg.classList.add('show');
    if (input !== null) {
      setTimeout(() => {
        inp.focus();
        const dot = inp.value.lastIndexOf('.');
        inp.setSelectionRange(0, dot > 0 ? dot : inp.value.length);
      }, 20);
    } else setTimeout(() => $('#modalOk').focus(), 20);
    const done = v => {
      bg.classList.remove('show');
      $('#modalOk').onclick = $('#modalCancel').onclick = inp.onkeydown = bg.onmousedown = null;
      editor && setTimeout(() => editor.focus(), 0);
      resolve(v);
    };
    $('#modalOk').onclick = () => done(input === null ? true : inp.value.trim());
    $('#modalCancel').onclick = () => done(null);
    bg.onmousedown = e => { if (e.target === bg) done(null); };
    inp.onkeydown = e => {
      if (e.key === 'Enter') done(inp.value.trim());
      if (e.key === 'Escape') done(null);
    };
  });
}

/* ================= Konsollar ================= */
class Console {
  constructor(el) { this.el = el; this.errBuf = ''; this.tail = ''; }
  write(text, cls) {
    if (!text) return;
    if (cls === 'err') {
      // Xatolarni qatorma-qator chiqaramiz — fayl/qator havolalari uchun
      this.errBuf += text;
      const lines = this.errBuf.split('\n');
      this.errBuf = lines.pop();
      for (const l of lines) this._line(l + '\n');
      return;
    }
    this._append(text, cls);
  }
  flush() { if (this.errBuf) { this._line(this.errBuf); this.errBuf = ''; } }
  _line(line) {
    const m = line.match(/File "([^"]+)", line (\d+)/);
    if (m) {
      const rel = m[1].startsWith(ROOT + '/') ? m[1].slice(ROOT.length + 1) : m[1];
      const span = document.createElement('span');
      span.className = 'err';
      span.append(line.slice(0, m.index) + 'File "');
      if (rel in state.files) {
        const a = document.createElement('a');
        a.className = 'loc';
        a.textContent = rel;
        a.onclick = () => openFile(rel, +m[2]);
        span.append(a);
      } else span.append(rel);
      span.append(line.slice(m.index + m[0].length - (`", line ${m[2]}`).length));
      this.el.append(span);
      this._scroll();
    } else this._append(line, 'err');
  }
  _append(text, cls) {
    const last = this.el.lastChild;
    if (last && last.nodeType === 1 && last.tagName === 'SPAN' && (last.dataset.cls || '') === (cls || '') && !last.querySelector('a')) {
      last.textContent += text;
    } else {
      const s = document.createElement('span');
      if (cls) s.className = cls;
      s.dataset.cls = cls || '';
      s.textContent = text;
      this.el.append(s);
    }
    this.tail = (this.tail + text).slice(-400);
    if (this.el.childNodes.length > 3000) this.el.firstChild.remove();
    this._scroll();
  }
  _scroll() { this.el.scrollTop = this.el.scrollHeight; }
  clear() { this.el.textContent = ''; this.errBuf = ''; this.tail = ''; }
}
const runCon = new Console($('#runOut'));
const replCon = new Console($('#replOut'));
const termCon = new Console($('#termOut'));
let outTarget = runCon;

/* ================= Fayl daraxti ================= */
const isPy = p => p.endsWith('.py');
const baseName = p => p.split('/').pop();
const dirName = p => p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
const isTestFile = p => /^test.*\.py$/.test(baseName(p)) || /_test\.py$/.test(baseName(p));

function fileIcon(p) {
  if (isPy(p)) return isTestFile(p) ? '<i class="ico test fa-solid fa-flask"></i>' : '<i class="ico py fa-brands fa-python"></i>';
  if (p.endsWith('.md')) return '<i class="ico md fa-brands fa-markdown"></i>';
  return '<i class="ico txt fa-regular fa-file-lines"></i>';
}

function allFolders() {
  const set = new Set(state.folders);
  for (const p in state.files) {
    let d = dirName(p);
    while (d) { set.add(d); d = dirName(d); }
  }
  return [...set];
}

function renderTree() {
  const folders = allFolders();
  const children = dir => {
    const subdirs = folders.filter(f => dirName(f) === dir).sort();
    const files = Object.keys(state.files).filter(f => dirName(f) === dir).sort((a, b) => a.localeCompare(b));
    return { subdirs, files };
  };
  const depthPad = d => `padding-left:${8 + d * 16}px`;
  const build = (dir, depth) => {
    const { subdirs, files } = children(dir);
    let h = '<ul>';
    for (const sd of subdirs) {
      const open = !!state.expanded[sd];
      h += `<li><div class="node" data-folder="${esc(sd)}" style="${depthPad(depth)}">
        <span class="chev"><i class="fa-solid fa-chevron-${open ? 'down' : 'right'}"></i></span>
        <i class="ico folder fa-solid fa-folder${open ? '-open' : ''}"></i><span>${esc(baseName(sd))}</span></div>
        ${open ? build(sd, depth + 1) : ''}</li>`;
    }
    for (const f of files) {
      h += `<li><div class="node${f === state.active ? ' active' : ''}" data-file="${esc(f)}" style="${depthPad(depth)}">
        <span class="chev"></span>${fileIcon(f)}<span>${esc(baseName(f))}</span></div></li>`;
    }
    return h + '</ul>';
  };
  const rootOpen = state.expanded[''] !== false;
  $('#tree').innerHTML = `<ul><li><div class="node" data-folder="" style="${depthPad(0)}">
      <span class="chev"><i class="fa-solid fa-chevron-${rootOpen ? 'down' : 'right'}"></i></span>
      <i class="ico folder fa-solid fa-folder${rootOpen ? '-open' : ''}"></i><b>project</b><span class="root-label">~/project</span></div>
      ${rootOpen ? build('', 1) : ''}</li></ul>`;
  renderRunConfigs();
}

$('#tree').addEventListener('click', e => {
  const n = e.target.closest('.node');
  if (!n) return;
  if (n.dataset.file !== undefined) openFile(n.dataset.file);
  else {
    const f = n.dataset.folder;
    state.expanded[f] = f === '' ? state.expanded[''] === false : !state.expanded[f];
    renderTree(); persist();
  }
});
$('#tree').addEventListener('contextmenu', e => {
  e.preventDefault();
  const n = e.target.closest('.node');
  if (!n) return showCtx(e, folderMenu(''));
  if (n.dataset.file !== undefined) showCtx(e, fileMenu(n.dataset.file));
  else showCtx(e, folderMenu(n.dataset.folder));
});

function fileMenu(p) {
  const items = [];
  if (isPy(p)) items.push(['fa-play', `'${baseName(p)}' ni ishga tushirish`, () => runFile(p)]);
  if (isTestFile(p)) items.push(['fa-flask-vial', 'Shu fayldagi testlar', () => runTests({ pattern: baseName(p), dir: dirName(p) })]);
  if (items.length) items.push('-');
  items.push(['fa-pen', 'Qayta nomlash...', () => renamePath(p, false)]);
  items.push(['fa-download', 'Yuklab olish', () => downloadFile(p)]);
  items.push('-');
  items.push(['fa-trash', "O'chirish", () => deletePath(p, false), 'danger']);
  return items;
}
function folderMenu(d) {
  const items = [
    ['fa-file', 'Yangi Python fayl', () => newFile(d)],
    ['fa-folder', 'Yangi papka', () => newFolder(d)],
  ];
  if (d) {
    items.push(['fa-cube', 'Python paket (__init__.py)', () => createFile(d + '/__init__.py', '')]);
    items.push('-');
    items.push(['fa-pen', 'Qayta nomlash...', () => renamePath(d, true)]);
    items.push(['fa-trash', "O'chirish", () => deletePath(d, true), 'danger']);
  } else {
    items.push('-');
    items.push(['fa-flask-vial', 'Barcha testlar', () => runTests()]);
  }
  return items;
}
function showCtx(e, items) {
  const c = $('#ctx');
  c.innerHTML = '';
  for (const it of items) {
    if (it === '-') { c.append(document.createElement('hr')); continue; }
    const b = document.createElement('button');
    b.innerHTML = `<i class="fa-solid ${it[0]}"></i>${esc(it[1])}`;
    if (it[3]) b.className = it[3];
    b.onclick = () => { hideCtx(); it[2](); };
    c.append(b);
  }
  c.classList.add('show');
  const r = c.getBoundingClientRect();
  c.style.left = Math.min(e.clientX, innerWidth - r.width - 8) + 'px';
  c.style.top = Math.min(e.clientY, innerHeight - r.height - 8) + 'px';
}
const hideCtx = () => $('#ctx').classList.remove('show');
document.addEventListener('mousedown', e => {
  if (!e.target.closest('#ctx')) hideCtx();
  if (!e.target.closest('.menu')) $$('.menu.open').forEach(m => m.classList.remove('open'));
});

function validName(name) {
  return name && !/[\\:*?"<>|]/.test(name) && !name.split('/').some(s => !s || s === '.' || s === '..');
}
async function newFile(dir = null) {
  if (dir === null) dir = state.active ? dirName(state.active) : '';
  let name = await modal({ title: 'Yangi fayl', body: `Papka: <code>${esc(dir || 'project')}</code>`, input: 'yangi_fayl.py' });
  if (!name) return;
  if (!name.includes('.')) name += '.py';
  const path = dir ? dir + '/' + name : name;
  if (!validName(path)) return toast("Noto'g'ri fayl nomi", 'error');
  if (path in state.files) return toast('Bunday fayl allaqachon bor', 'error');
  const tpl = isTestFile(path)
    ? `import unittest\n\n\nclass TestNamuna(unittest.TestCase):\n    def test_birinchi(self):\n        self.assertTrue(True)\n\n\nif __name__ == "__main__":\n    unittest.main()\n`
    : '';
  createFile(path, tpl);
}
function createFile(path, content) {
  if (path in state.files) return openFile(path);
  state.files[path] = content;
  let d = dirName(path);
  while (d) { state.expanded[d] = true; d = dirName(d); }
  openFile(path);
  persist(); syncFS();
}
async function newFolder(dir = '') {
  const name = await modal({ title: 'Yangi papka', body: `Ichida: <code>${esc(dir || 'project')}</code>`, input: 'papka' });
  if (!name) return;
  const path = dir ? dir + '/' + name : name;
  if (!validName(path)) return toast("Noto'g'ri papka nomi", 'error');
  if (allFolders().includes(path)) return toast('Bunday papka bor', 'error');
  state.folders.push(path);
  state.expanded[path] = true;
  if (dir) state.expanded[dir] = true;
  renderTree(); persist();
}
async function renamePath(p, isDir) {
  const name = await modal({ title: 'Qayta nomlash', input: baseName(p) });
  if (!name || name === baseName(p)) return;
  const np = (dirName(p) ? dirName(p) + '/' : '') + name;
  if (!validName(np)) return toast("Noto'g'ri nom", 'error');
  if (np in state.files || allFolders().includes(np)) return toast('Bu nom band', 'error');
  persist();
  const move = (from, to) => {
    state.files[to] = state.files[from]; delete state.files[from];
    if (docs[from]) {
      docs[to] = docs[from]; delete docs[from];
      docs[to].__path = to;
      if (editor.getDoc() === docs[to]) editor.setOption('mode', modeFor(to));
    }
    state.open = state.open.map(o => o === from ? to : o);
    if (state.active === from) state.active = to;
    clearLint(from);
  };
  if (isDir) {
    for (const f of Object.keys(state.files)) if (f.startsWith(p + '/')) move(f, np + f.slice(p.length));
    state.folders = state.folders.map(f => f === p || f.startsWith(p + '/') ? np + f.slice(p.length) : f);
    state.expanded[np] = true;
  } else {
    move(p, np);
  }
  renderAll(); persist(); syncFS();
}
async function deletePath(p, isDir) {
  const ok = await modal({ title: "O'chirish", body: `<code>${esc(p)}</code> ${isDir ? 'papkasi va ichidagi barcha fayllar' : 'fayli'} o'chirilsinmi?`, okText: "O'chirish" });
  if (!ok) return;
  const kill = f => {
    delete state.files[f]; delete docs[f]; clearLint(f); delete problems[f];
    state.open = state.open.filter(o => o !== f);
    if (state.active === f) state.active = state.open[state.open.length - 1] || null;
  };
  if (isDir) {
    Object.keys(state.files).filter(f => f.startsWith(p + '/')).forEach(kill);
    state.folders = state.folders.filter(f => f !== p && !f.startsWith(p + '/'));
  } else kill(p);
  renderAll(); persist(); syncFS(); renderProblems();
}

/* ================= Muharrir va tablar ================= */
function modeFor(p) {
  if (isPy(p)) return { name: 'python', version: 3, singleLineStringErrors: false };
  if (p.endsWith('.md')) return 'markdown';
  return 'text/plain';
}
function getDoc(p) {
  if (!docs[p]) {
    docs[p] = CodeMirror.Doc(state.files[p] ?? '', modeFor(p));
    docs[p].__path = p;
  }
  return docs[p];
}
function openFile(p, line) {
  if (!(p in state.files)) return;
  if (!state.open.includes(p)) state.open.push(p);
  state.active = p;
  let d = dirName(p);
  while (d) { state.expanded[d] = true; d = dirName(d); }
  const doc = getDoc(p);
  if (editor.getDoc() !== doc) editor.swapDoc(doc);
  renderAll();
  if (line) {
    const ln = line - 1;
    editor.setCursor({ line: ln, ch: 0 });
    editor.scrollIntoView({ line: ln, ch: 0 }, 120);
    const mk = editor.markText({ line: ln, ch: 0 }, { line: ln, ch: editor.getLine(ln)?.length || 0 }, { className: 'cm-flash' });
    setTimeout(() => mk.clear(), 900);
  }
  setTimeout(() => editor.focus(), 0);
  updateRunGutter();
  lintSoon(0);
  persist();
}
function closeTab(p) {
  const i = state.open.indexOf(p);
  if (i < 0) return;
  persist();
  state.open.splice(i, 1);
  if (state.active === p) {
    state.active = state.open[Math.min(i, state.open.length - 1)] || null;
    if (state.active) editor.swapDoc(getDoc(state.active));
  }
  renderAll(); persist();
}
function renderTabs() {
  const t = $('#tabs');
  t.innerHTML = state.open.map(p => {
    const hasErr = (problems[p] || []).some(x => x.sev === 'error');
    return `<div class="tab${p === state.active ? ' active' : ''}${hasErr ? ' has-error' : ''}" data-path="${esc(p)}" title="${esc(p)}">
      ${fileIcon(p)}<span class="name">${esc(baseName(p))}</span><button class="x" title="Yopish"><i class="fa-solid fa-xmark"></i></button></div>`;
  }).join('');
  const act = $('.tab.active', t);
  act && act.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
$('#tabs').addEventListener('mousedown', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  if (e.button === 1) { e.preventDefault(); closeTab(tab.dataset.path); return; }
  if (e.target.closest('.x')) { e.preventDefault(); closeTab(tab.dataset.path); return; }
  if (e.button === 0) openFile(tab.dataset.path);
});
$('#tabs').addEventListener('contextmenu', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  e.preventDefault();
  const p = tab.dataset.path;
  showCtx(e, [
    ['fa-xmark', 'Yopish', () => closeTab(p)],
    ['fa-layer-group', 'Boshqalarini yopish', () => { state.open = [p]; openFile(p); }],
    ['fa-ban', 'Hammasini yopish', () => { state.open = []; state.active = null; renderAll(); persist(); }],
    '-',
    ...fileMenu(p),
  ]);
});

function renderAll() {
  renderTree(); renderTabs();
  const has = !!state.active;
  $('#emptyEditor').classList.toggle('show', !has);
  $('#crumbFile').textContent = state.active || '—';
  document.title = (state.active ? baseName(state.active) + ' — ' : '') + 'PyCharm Online';
  if (has && editor.getDoc().__path !== state.active) editor.swapDoc(getDoc(state.active));
}

function renderRunConfigs() {
  const sel = $('#runConfig');
  const pyFiles = Object.keys(state.files).filter(isPy).sort();
  if (state.runConfig && !pyFiles.includes(state.runConfig)) state.runConfig = '';
  sel.innerHTML = `<option value="">Joriy fayl</option>` +
    pyFiles.map(f => `<option value="${esc(f)}">${esc(f.replace(/\.py$/, ''))}</option>`).join('');
  sel.value = state.runConfig;
}
$('#runConfig').onchange = e => { state.runConfig = e.target.value; persist(); };

/* ================= Ishga tushirish ================= */
function runTarget() {
  if (state.runConfig) return state.runConfig;
  if (state.active && isPy(state.active)) return state.active;
  return 'main.py' in state.files ? 'main.py' : Object.keys(state.files).find(isPy);
}
let lastRun = null;

function syncFS() {
  if (!pyReady) return;
  const FS = py.FS;
  const now = new Set();
  for (const [p, content] of Object.entries(state.files)) {
    const full = ROOT + '/' + p;
    const d = full.slice(0, full.lastIndexOf('/'));
    try { FS.mkdirTree(d); } catch (e) { /* bor */ }
    const val = docs[p] ? docs[p].getValue() : content;
    FS.writeFile(full, val);
    now.add(p);
  }
  for (const f of state.folders) { try { FS.mkdirTree(ROOT + '/' + f); } catch (e) { /* bor */ } }
  for (const p of writtenPaths) if (!now.has(p)) { try { FS.unlink(ROOT + '/' + p); } catch (e) { /* yo'q */ } }
  writtenPaths = now;
}

function setRunning(v) {
  running = v;
  $('#btnRun').disabled = $('#btnTests').disabled = $('#btnRerun').disabled = v;
  if (v) pyStatus('Bajarilmoqda...', 'busy');
  else if (pyReady) pyStatus(`Python ${pyVersion} tayyor`);
}

async function ensureReady() {
  if (pyReady) return true;
  toast('Python hali yuklanmoqda, biroz kuting...', '');
  return false;
}

async function loadImports(con) {
  const code = Object.entries(state.files).filter(([p]) => isPy(p)).map(([p]) => docs[p] ? docs[p].getValue() : state.files[p]).join('\n');
  try {
    await py.loadPackagesFromImports(code, {
      messageCallback: m => { if (/^Loading|^Loaded/.test(m)) con.write(m + '\n', 'meta'); },
      errorCallback: m => con.write(m + '\n', 'warn'),
    });
  } catch (e) { /* noma'lum modul — Python o'zi xabar beradi */ }
}

async function runFile(path, con = runCon) {
  path = path || runTarget();
  if (!path) return toast('Ishga tushirish uchun .py fayl yo\'q', 'error');
  if (!await ensureReady() || running) return;
  lastRun = { kind: 'file', path };
  persist(); syncFS();
  if (con === runCon) { showBottom('run'); runCon.clear(); }
  con.write(`python ${path}\n`, 'meta');
  setRunning(true);
  await loadImports(con);
  await sleep(30); // UI chizilib olsin
  outTarget = con;
  const t0 = performance.now();
  let code = 1;
  try {
    code = py.globals.get('_pc_run_file')(path);
  } catch (e) {
    con.write(String(e) + '\n', 'err');
  }
  con.flush();
  const secs = ((performance.now() - t0) / 1000).toFixed(2);
  con.write(`\nProcess finished with exit code ${code}  (${secs}s)\n`, code === 0 ? 'meta' : 'err');
  outTarget = runCon;
  setRunning(false);
}

/* input() — brauzer oynasi orqali */
window.pcInput = promptText => {
  const ctx = outTarget.tail.split('\n').slice(-6).join('\n').trim();
  const r = window.prompt((ctx || 'input()') + '\n\n▶ Qiymat kiriting:', '');
  return r;
};
window.pcEcho = text => outTarget.write(text + '\n', 'in');

/* ================= Testlar ================= */
let lastTests = [];
async function runTests(opts = {}) {
  if (!await ensureReady() || running) return;
  lastRun = { kind: 'tests', opts };
  persist(); syncFS();
  showBottom('tests');
  runCon.clear();
  runCon.write(`python -m unittest ${opts.names ? opts.names.join(' ') : 'discover -p "' + (opts.pattern || 'test*.py') + '"'}\n`, 'meta');
  $('#testSummary').textContent = 'Testlar bajarilmoqda...';
  $('#testList').innerHTML = '';
  $('#testDetail').textContent = '';
  $('#testBar').style.width = '30%';
  setRunning(true);
  await loadImports(runCon);
  await sleep(30);
  outTarget = runCon;
  const t0 = performance.now();
  let res;
  try {
    const fn = py.globals.get('_pc_run_tests');
    res = JSON.parse(fn(opts.pattern || 'test*.py', opts.dir || '', opts.names ? JSON.stringify(opts.names) : ''));
  } catch (e) {
    res = { items: [], error: String(e) };
  }
  runCon.flush();
  outTarget = runCon;
  setRunning(false);
  renderTests(res, performance.now() - t0);
}

function renderTests(res, ms) {
  lastTests = res.items || [];
  const n = lastTests.length;
  const bad = lastTests.filter(t => t.status === 'fail' || t.status === 'error').length;
  const ok = lastTests.filter(t => t.status === 'ok').length;
  const skip = n - bad - ok;
  const bar = $('#testBar');
  bar.style.width = n ? '100%' : '0';
  bar.classList.toggle('bad', bad > 0);
  const cnt = $('#testCount');
  cnt.textContent = n ? (bad ? bad : ok) : '';
  cnt.className = 'count ' + (n ? (bad ? 'bad' : 'good') : '');
  if (res.error) {
    $('#testSummary').innerHTML = `<span class="st-error">Xato:</span> ${esc(res.error)}`;
  } else if (!n) {
    $('#testSummary').innerHTML = 'Hech qanday test topilmadi. <code>test_*.py</code> faylda <code>unittest.TestCase</code> sinfini yarating.';
  } else {
    $('#testSummary').innerHTML = bad
      ? `<span class="st-fail"><i class="fa-solid fa-circle-xmark"></i> ${bad} ta test yiqildi</span>, ${ok} ta o'tdi${skip ? `, ${skip} ta o'tkazib yuborildi` : ''} — ${n} ta testdan · ${Math.round(ms)} ms`
      : `<span class="st-ok"><i class="fa-solid fa-circle-check"></i> ${ok} ta test o'tdi</span>${skip ? `, ${skip} ta o'tkazib yuborildi` : ''} · ${Math.round(ms)} ms`;
  }
  const groups = {};
  lastTests.forEach((t, i) => {
    const parts = t.id.split('.');
    const g = parts.length > 1 ? parts.slice(0, -1).join('.') : '';
    (groups[g] = groups[g] || []).push([t, i]);
  });
  const icon = s => ({ ok: 'fa-circle-check st-ok', fail: 'fa-circle-xmark st-fail', error: 'fa-circle-exclamation st-error', skip: 'fa-circle-minus st-skip' }[s]);
  let h = '';
  for (const [g, list] of Object.entries(groups)) {
    const gBad = list.some(([t]) => t.status === 'fail' || t.status === 'error');
    h += `<li class="group"><i class="fa-solid ${gBad ? 'fa-circle-xmark st-fail' : 'fa-circle-check st-ok'}"></i>${esc(g || 'testlar')}</li>`;
    for (const [t, i] of list) {
      h += `<li class="case" data-i="${i}" title="Ikki marta bosing — kodga o'tish"><i class="fa-solid ${icon(t.status)}"></i>${esc(t.id.split('.').pop())}<span class="ms">${t.ms} ms</span></li>`;
    }
  }
  $('#testList').innerHTML = h;
  const firstBad = lastTests.findIndex(t => t.status === 'fail' || t.status === 'error');
  selectTest(firstBad >= 0 ? firstBad : (n ? 0 : -1));
  if (!n) $('#testDetail').textContent = runCon.el.textContent;
}
function selectTest(i) {
  $$('#testList li.sel').forEach(l => l.classList.remove('sel'));
  const det = $('#testDetail');
  if (i < 0) return;
  const li = $(`#testList li[data-i="${i}"]`);
  li && li.classList.add('sel');
  const t = lastTests[i];
  const con = new Console(det);
  con.clear();
  con.write(`${t.id}\n\n`, 'meta');
  if (t.status === 'ok') con.write("Test muvaffaqiyatli o'tdi ✔\n", 'ok');
  else if (t.status === 'skip') con.write("O'tkazib yuborildi: " + t.msg + '\n', 'meta');
  else con.write(t.msg, 'err');
  if (t.out) con.write('\n--- chiqish ---\n' + t.out, '');
  con.flush();
}
$('#testList').addEventListener('click', e => {
  const li = e.target.closest('li.case');
  if (li) selectTest(+li.dataset.i);
});
$('#testList').addEventListener('dblclick', e => {
  const li = e.target.closest('li.case');
  if (!li) return;
  const t = lastTests[+li.dataset.i];
  if (t.file && t.file in state.files) openFile(t.file, t.line);
});

/* ================= Run gutter (yashil uchburchaklar) ================= */
let gutterTimer;
function updateRunGutter() {
  clearTimeout(gutterTimer);
  gutterTimer = setTimeout(() => {
    const p = state.active;
    if (!p) return;
    editor.clearGutter('run-gutter');
    if (!isPy(p)) return;
    const mod = p.replace(/\.py$/, '').replace(/\//g, '.');
    const testFile = isTestFile(p);
    let cls = null;
    editor.eachLine(lh => {
      const text = lh.text;
      const ln = editor.getLineNumber(lh);
      let action = null, title = '';
      let m;
      if (/^if\s+__name__\s*==\s*['"]__main__['"]\s*:/.test(text)) {
        action = () => runFile(p); title = `'${baseName(p)}' ni ishga tushirish`;
      } else if (testFile && (m = text.match(/^class\s+(\w+)\s*[(:]/))) {
        cls = m[1];
        const name = `${mod}.${cls}`;
        action = () => runTests({ names: [name] }); title = `${cls} testlari`;
      } else if (testFile && cls && (m = text.match(/^\s+def\s+(test\w*)\s*\(/))) {
        const name = `${mod}.${cls}.${m[1]}`;
        action = () => runTests({ names: [name] }); title = `${m[1]} testi`;
      } else if (/^\S/.test(text) && !/^(class|#|@)/.test(text)) {
        cls = null;
      }
      if (action) {
        const el = document.createElement('i');
        el.className = 'gutter-run fa-solid fa-play';
        el.title = title;
        el.onmousedown = e => { e.preventDefault(); action(); };
        editor.setGutterMarker(ln, 'run-gutter', el);
      }
    });
  }, 150);
}

/* ================= Lint (sintaksis + pyflakes) ================= */
let lintTimer;
function lintSoon(delay = 600) {
  clearTimeout(lintTimer);
  lintTimer = setTimeout(lintActive, delay);
}
function clearLint(p) { (lintMarks[p] || []).forEach(m => m.clear()); lintMarks[p] = []; }
function lintActive() {
  const p = state.active;
  if (!p || !pyReady || !isPy(p)) return;
  const doc = docs[p];
  if (!doc) return;
  let list = [];
  try { list = JSON.parse(py.globals.get('_pc_lint')(doc.getValue(), p)); } catch (e) { return; }
  clearLint(p);
  for (let i = 0; i < doc.lineCount(); i++) doc.removeLineClass(i, 'background', 'lint-line-error');
  problems[p] = list;
  for (const pr of list) {
    const ln = Math.max(0, Math.min(doc.lineCount() - 1, pr.line - 1));
    const lineText = doc.getLine(ln) || '';
    let from = Math.max(0, Math.min(lineText.length, pr.col));
    let to = from;
    const word = lineText.slice(from).match(/^[\w.]+/);
    to = word ? from + word[0].length : from + 1;
    if (to > lineText.length) { from = Math.max(0, lineText.length - 1); to = lineText.length; }
    if (from === to) { from = 0; to = lineText.length; }
    const cls = pr.sev === 'error' ? 'cm-lint-error' : (pr.unused ? 'cm-lint-warning cm-lint-unused' : 'cm-lint-warning');
    lintMarks[p].push(doc.markText({ line: ln, ch: from }, { line: ln, ch: to }, { className: cls, title: pr.msg }));
    if (pr.sev === 'error') doc.addLineClass(ln, 'background', 'lint-line-error');
  }
  renderProblems(); renderTabs();
}
function renderProblems() {
  const all = [];
  for (const [f, list] of Object.entries(problems)) if (f in state.files) list.forEach(pr => all.push({ f, ...pr }));
  all.sort((a, b) => (a.sev === b.sev ? 0 : a.sev === 'error' ? -1 : 1) || a.f.localeCompare(b.f) || a.line - b.line);
  const cnt = $('#problemCount');
  const errs = all.filter(a => a.sev === 'error').length;
  cnt.textContent = all.length || '';
  cnt.className = 'count' + (errs ? ' bad' : '');
  $('#problemList').innerHTML = all.length
    ? all.map(a => `<li data-f="${esc(a.f)}" data-l="${a.line}"><i class="fa-solid ${a.sev === 'error' ? 'fa-circle-exclamation sev-error' : 'fa-triangle-exclamation sev-warning'}"></i>
        <span>${esc(a.msg)}</span><span class="file">${esc(a.f)}</span><span class="pos">${a.line}:${a.col + 1}</span></li>`).join('')
    : `<li class="empty">Muammo topilmadi ${pyflakesReady ? '(sintaksis + pyflakes)' : '(sintaksis tekshiruvi)'}</li>`;
}
$('#problemList').addEventListener('click', e => {
  const li = e.target.closest('li[data-f]');
  if (li) openFile(li.dataset.f, +li.dataset.l);
});

/* ================= Avtoto'ldirish ================= */
function pyHint(cm, callback) {
  const cur = cm.getCursor();
  const line = cm.getLine(cur.line);
  let start = cur.ch;
  while (start > 0 && /\w/.test(line[start - 1])) start--;
  const prefix = line.slice(start, cur.ch);
  const afterDot = line[start - 1] === '.';
  const tok = cm.getTokenAt(cur);
  if (tok.type === 'comment' || (tok.type === 'string' && !/^from|^import/.test(line.trim()))) return callback(null);
  const from = CodeMirror.Pos(cur.line, start), to = CodeMirror.Pos(cur.line, cur.ch);
  let list = [];
  if (jediReady && isPy(state.active || '')) {
    try {
      const res = JSON.parse(py.globals.get('_pc_complete')(cm.getValue(), cur.line + 1, cur.ch, state.active));
      list = res.map(([name, type]) => ({ text: name, kind: type }));
    } catch (e) { list = []; }
  }
  if (!list.length && !afterDot) {
    const seen = new Set();
    const words = cm.getValue().match(/[A-Za-z_]\w+/g) || [];
    const pool = [...PY_KEYWORDS.map(k => [k, 'keyword']), ...PY_BUILTINS.map(b => [b, 'function']), ...words.map(w => [w, 'v'])];
    for (const [w, k] of pool) {
      if (w !== prefix && w.toLowerCase().startsWith(prefix.toLowerCase()) && !seen.has(w)) { seen.add(w); list.push({ text: w, kind: k }); }
    }
  }
  if (!list.length) return callback(null);
  callback({
    from, to,
    list: list.slice(0, 60).map(it => ({
      text: it.text,
      render: el => {
        const k = it.kind || 'v';
        el.innerHTML = `<span class="hint-kind ${esc(k)}">${esc(k[0])}</span><span>${esc(it.text)}</span><span class="hint-type">${esc(k)}</span>`;
      },
    })),
  });
}
pyHint.async = true;

/* ================= Formatlash ================= */
let blackReady = false;
async function formatCode() {
  const p = state.active;
  if (!p || !isPy(p)) return;
  if (!await ensureReady()) return;
  try {
    if (!blackReady) {
      status("black o'rnatilmoqda...");
      await py.runPythonAsync(`import micropip\nawait micropip.install("black")`);
      blackReady = true;
    }
    const src = editor.getValue();
    const out = py.globals.get('_pc_format')(src);
    if (out !== src) {
      const cur = editor.getCursor(), scroll = editor.getScrollInfo();
      editor.operation(() => { editor.setValue(out); });
      editor.setCursor(cur); editor.scrollTo(scroll.left, scroll.top);
    }
    status('Kod formatlandi (black)');
  } catch (e) {
    const msg = String(e).split('\n').filter(Boolean).pop();
    toast('Formatlab bo\'lmadi: ' + esc(msg), 'error');
    status('');
  }
}

/* ================= Python konsol (REPL) ================= */
const replHist = [];
let replHistIdx = 0, replMore = false;
$('#replIn').addEventListener('keydown', async e => {
  const inp = e.target;
  if (e.key === 'Enter') {
    if (!pyReady || running) return;
    const line = inp.value;
    inp.value = '';
    if (line.trim()) { replHist.push(line); }
    replHistIdx = replHist.length;
    replCon.write((replMore ? '... ' : '>>> ') + line + '\n', 'cmd');
    syncFS();
    outTarget = replCon;
    setRunning(true);
    try {
      if (!replMore) await py.loadPackagesFromImports(line);
      replMore = py.globals.get('_pc_repl_push')(line);
    } catch (err) { replCon.write(String(err) + '\n', 'err'); replMore = false; }
    replCon.flush();
    setRunning(false);
    outTarget = runCon;
    $('#replPs').textContent = replMore ? '...' : '>>>';
    inp.focus();
  } else if (e.key === 'ArrowUp') {
    if (replHistIdx > 0) { inp.value = replHist[--replHistIdx]; e.preventDefault(); }
  } else if (e.key === 'ArrowDown') {
    if (replHistIdx < replHist.length - 1) inp.value = replHist[++replHistIdx];
    else { replHistIdx = replHist.length; inp.value = ''; }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    inp.value = inp.value.slice(0, inp.selectionStart) + '    ' + inp.value.slice(inp.selectionEnd);
  }
});
$('#repl').addEventListener('mouseup', () => { if (!getSelection().toString()) $('#replIn').focus(); });

/* ================= Terminal ================= */
const termHist = [];
let termHistIdx = 0;
$('#termIn').addEventListener('keydown', async e => {
  const inp = e.target;
  if (e.key === 'ArrowUp') { if (termHistIdx > 0) { inp.value = termHist[--termHistIdx]; e.preventDefault(); } return; }
  if (e.key === 'ArrowDown') { inp.value = termHistIdx < termHist.length - 1 ? termHist[++termHistIdx] : (termHistIdx = termHist.length, ''); return; }
  if (e.key !== 'Enter') return;
  const cmd = inp.value.trim();
  inp.value = '';
  termCon.write('project $ ' + cmd + '\n', 'in');
  if (!cmd) return;
  termHist.push(cmd); termHistIdx = termHist.length;
  inp.disabled = true;
  try { await terminalCommand(cmd); } catch (err) { termCon.write(String(err) + '\n', 'err'); }
  termCon.flush();
  inp.disabled = false;
  inp.focus();
});
$('#term').addEventListener('mouseup', () => { if (!getSelection().toString()) $('#termIn').focus(); });

async function terminalCommand(cmd) {
  const args = cmd.split(/\s+/);
  const c = args[0];
  if (c === 'clear' || c === 'cls') return termCon.clear();
  if (c === 'help') {
    return termCon.write([
      'Mavjud buyruqlar:',
      '  pip install <paket>...   PyPI yoki Pyodide paketini o\'rnatish (masalan: pip install requests)',
      '  pip list                 o\'rnatilgan paketlar',
      '  python <fayl.py>         faylni ishga tushirish',
      '  python -m unittest       testlarni ishga tushirish',
      '  ls, cat <fayl>, pwd, clear',
      '',
    ].join('\n'), '');
  }
  if (c === 'pwd') return termCon.write('~/project\n');
  if (c === 'ls' || c === 'dir') {
    return termCon.write(Object.keys(state.files).sort().join('\n') + '\n');
  }
  if (c === 'cat' || c === 'type') {
    const f = args[1];
    if (!(f in state.files)) return termCon.write(`cat: ${f}: bunday fayl yo'q\n`, 'err');
    return termCon.write((docs[f] ? docs[f].getValue() : state.files[f]) + '\n');
  }
  if (!pyReady) return termCon.write('Python hali yuklanmoqda...\n', 'warn');
  if ((c === 'pip' || c === 'pip3') || (c === 'python' && args[1] === '-m' && args[2] === 'pip')) {
    const rest = c === 'python' ? args.slice(3) : args.slice(1);
    const sub = rest[0];
    if (sub === 'install') {
      const pkgs = rest.slice(1).filter(a => !a.startsWith('-'));
      if (!pkgs.length) return termCon.write('Paket nomini kiriting: pip install <paket>\n', 'warn');
      pyStatus('Paket o\'rnatilmoqda...', 'busy');
      termCon.write(`Collecting ${pkgs.join(', ')}...\n`, 'meta');
      try {
        await py.loadPackage('micropip');
        const micropip = py.pyimport('micropip');
        await micropip.install(pkgs);
        termCon.write(`Successfully installed ${pkgs.join(' ')}\n`, 'ok');
      } catch (err) {
        const msg = String(err).split('\n').filter(Boolean).pop();
        termCon.write(`ERROR: ${msg}\n`, 'err');
        termCon.write('Eslatma: faqat sof Python (py3-none-any) yoki Pyodide paketlarini o\'rnatish mumkin.\n', 'meta');
      }
      pyStatus(`Python ${pyVersion} tayyor`);
      return;
    }
    if (sub === 'list' || sub === 'freeze') {
      await py.loadPackage('micropip');
      const out = py.runPython(`import micropip\n"\\n".join(f"{k:<28} {v.version}" for k, v in sorted(micropip.list().items()))`);
      return termCon.write('Package                      Version\n---------------------------- -------\n' + out + '\n');
    }
    return termCon.write('Qo\'llab-quvvatlanadi: pip install, pip list\n', 'warn');
  }
  if (c === 'python' || c === 'python3' || c === 'py') {
    if (args[1] === '-m' && args[2] === 'unittest') {
      await runTests();
      return termCon.write('Natijalar "Testlar" panelida.\n', 'meta');
    }
    if (!args[1]) return termCon.write('Interaktiv rejim uchun "Python konsol" tabidan foydalaning.\n', 'meta');
    if (!(args[1] in state.files)) return termCon.write(`python: '${args[1]}' faylini ochib bo'lmadi\n`, 'err');
    return runFile(args[1], termCon);
  }
  termCon.write(`'${c}' buyrug'i topilmadi. "help" yozing.\n`, 'err');
}

/* ================= Panellar ================= */
function showBottom(tab) {
  $('#bottomPanel').classList.remove('hidden');
  $('#resizeBottom').style.display = '';
  if (tab) {
    $$('.btab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    $$('.bpane').forEach(p => p.classList.toggle('active', p.dataset.pane === tab));
    if (tab === 'console') setTimeout(() => $('#replIn').focus(), 0);
    if (tab === 'terminal') setTimeout(() => $('#termIn').focus(), 0);
  }
  editor.refresh();
}
function toggleBottom() {
  const b = $('#bottomPanel');
  const hide = !b.classList.contains('hidden');
  b.classList.toggle('hidden', hide);
  $('#resizeBottom').style.display = hide ? 'none' : '';
  editor.refresh();
}
function toggleProject(force) {
  const p = $('#projectPanel');
  const hide = force !== undefined ? !force : !p.classList.contains('hidden');
  p.classList.toggle('hidden', hide);
  $('#resizeSide').style.display = hide ? 'none' : '';
  $('#stripeProject').classList.toggle('active', !hide);
  editor.refresh();
}
$$('.btab').forEach(b => b.onclick = () => showBottom(b.dataset.tab));
$('#btnHideBottom').onclick = toggleBottom;
$('#stripeProject').onclick = () => toggleProject();
$('#btnClearOut').onclick = () => {
  const tab = $('.btab.active').dataset.tab;
  ({ run: runCon, console: replCon, terminal: termCon }[tab] || runCon).clear();
};

function dragResize(handle, onMove) {
  handle.addEventListener('pointerdown', e => {
    e.preventDefault();
    handle.classList.add('drag');
    handle.setPointerCapture(e.pointerId);
    const move = ev => { onMove(ev); editor.refresh(); };
    const up = () => { handle.classList.remove('drag'); handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  });
}
dragResize($('#resizeSide'), e => {
  const left = $('#projectPanel').getBoundingClientRect().left;
  $('#projectPanel').style.width = Math.max(140, Math.min(innerWidth * 0.5, e.clientX - left)) + 'px';
});
dragResize($('#resizeBottom'), e => {
  const bottom = $('.work').getBoundingClientRect().bottom;
  $('#bottomPanel').style.height = Math.max(80, Math.min(innerHeight - 160, bottom - e.clientY)) + 'px';
});

/* ================= Fayllarni yuklash / yuklab olish ================= */
function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function downloadFile(p = state.active) {
  if (!p) return;
  persist();
  downloadBlob(new Blob([state.files[p]], { type: 'text/plain' }), baseName(p));
}
async function downloadZip() {
  if (!await ensureReady()) return;
  persist(); syncFS();
  py.runPython(`
import zipfile, os
with zipfile.ZipFile('/tmp/project.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(ROOT):
        if '__pycache__' in d: continue
        for f in fs:
            full = os.path.join(d, f)
            z.write(full, os.path.join('project', os.path.relpath(full, ROOT)))
`);
  downloadBlob(new Blob([py.FS.readFile('/tmp/project.zip')], { type: 'application/zip' }), 'project.zip');
}
$('#fileUpload').addEventListener('change', async e => {
  const dir = state.active ? dirName(state.active) : '';
  for (const f of e.target.files) {
    const text = await f.text();
    const path = dir ? dir + '/' + f.name : f.name;
    state.files[path] = text;
    delete docs[path];
    openFile(path);
  }
  e.target.value = '';
  persist(); syncFS();
  toast('Fayl(lar) yuklandi', 'success');
});

/* ================= Amallar va menyu ================= */
function setFont(size) {
  state.fontSize = Math.max(10, Math.min(28, size));
  document.documentElement.style.setProperty('--editor-size', state.fontSize + 'px');
  editor.refresh(); persist();
}
const actions = {
  newFile: () => newFile(),
  newFolder: () => newFolder(state.active ? dirName(state.active) : ''),
  upload: () => $('#fileUpload').click(),
  save: () => { persist(); syncFS(); status('Barcha fayllar saqlandi'); toast('<i class="fa-solid fa-check"></i> Saqlandi', 'success'); },
  downloadFile: () => downloadFile(),
  downloadZip,
  resetProject: async () => {
    if (!await modal({ title: 'Loyihani tiklash', body: "Barcha fayllaringiz o'chib, namuna loyiha qaytariladi. Davom etilsinmi?", okText: 'Tiklash' })) return;
    for (const k in docs) delete docs[k];
    for (const k in problems) delete problems[k];
    resetState(); persist(); syncFS();
    openFile(state.active);
  },
  exit: () => { persist(); location.href = '../../games.html'; },
  undo: () => editor.undo(),
  redo: () => editor.redo(),
  find: () => editor.execCommand('find'),
  replace: () => editor.execCommand('replace'),
  gotoLine: () => editor.execCommand('jumpToLine'),
  comment: () => editor.toggleComment({ indent: true }),
  duplicate: () => duplicateLine(editor),
  deleteLine: () => editor.execCommand('deleteLine'),
  format: formatCode,
  toggleProject: () => toggleProject(),
  toggleBottom,
  zoomIn: () => setFont(state.fontSize + 1),
  zoomOut: () => setFont(state.fontSize - 1),
  zoomReset: () => setFont(14),
  run: () => runFile(),
  runCurrent: () => runFile(state.active && isPy(state.active) ? state.active : null),
  runTests: () => runTests(),
  openConsole: () => showBottom('console'),
  openTerminal: () => showBottom('terminal'),
  shortcuts: () => modal({
    title: 'Klaviatura qisqartmalari', cancel: false, body: `<table>${[
      ['Ishga tushirish', 'Shift+F10'], ['Joriy faylni ishga tushirish', 'Ctrl+Shift+F10'], ['Testlarni ishga tushirish', 'Ctrl+Shift+T'],
      ['Saqlash', 'Ctrl+S'], ['Avtoto\'ldirish', 'Ctrl+Space'], ['Izohga olish', 'Ctrl+/'], ['Qatorni nusxalash', 'Ctrl+D'],
      ['Qatorni o\'chirish', 'Ctrl+Y'], ['Qatorni yuqoriga/pastga', 'Alt+Shift+↑/↓'], ['Formatlash', 'Ctrl+Alt+L'],
      ['Qidirish / almashtirish', 'Ctrl+F / Ctrl+R'], ['Qatorga o\'tish', 'Ctrl+G'], ['Yangi fayl', 'Alt+Insert'],
      ['Loyiha paneli', 'Alt+1'], ['Pastki panel', 'Alt+4'], ['Terminal', 'Alt+F12'], ['Tabni yopish', 'Ctrl+F4 / Alt+W'],
    ].map(([a, k]) => `<tr><td>${a}</td><td><kbd>${k}</kbd></td></tr>`).join('')}</table>`,
  }),
  about: () => modal({
    title: 'PyCharm Online haqida', cancel: false, body: `
      <p>Brauzerda to'liq ishlaydigan Python muhiti. Kod sizning kompyuteringizda, <b>Pyodide</b> (WebAssembly'dagi CPython ${pyVersion}) orqali bajariladi.</p>
      <p>• Bir nechta fayl va papkalar, modullarni import qilish<br>• <code>unittest</code> testlari va natijalar paneli<br>
      • Jedi avtoto'ldirish, pyflakes tekshiruvi, black formatlash<br>• <code>pip install</code> — PyPI'dagi sof Python paketlar<br>
      • numpy, pandas, matplotlib kabi paketlar import qilinganda o'zi yuklanadi</p>
      <p style="color:var(--text-dim)">Eslatma: <code>input()</code> brauzer oynasi orqali so'raladi. Cheksiz sikl sahifani qotirib qo'yishi mumkin — u holda sahifani yangilang (fayllar saqlanib qoladi).</p>`,
  }),
  collapseAll: () => { state.expanded = { '': true }; renderTree(); persist(); },
};
$$('[data-act]').forEach(b => b.addEventListener('click', () => {
  $$('.menu.open').forEach(m => m.classList.remove('open'));
  actions[b.dataset.act]();
}));
$$('.menu').forEach(m => {
  m.addEventListener('mousedown', e => {
    if (e.target.closest('.menu-pop')) return;
    const was = m.classList.contains('open');
    $$('.menu.open').forEach(x => x.classList.remove('open'));
    if (!was) m.classList.add('open');
  });
  m.addEventListener('mouseenter', () => {
    if ($$('.menu.open').length && !m.classList.contains('open')) {
      $$('.menu.open').forEach(x => x.classList.remove('open'));
      m.classList.add('open');
    }
  });
});
$('#btnRun').onclick = actions.run;
$('#btnTests').onclick = actions.runTests;
$('#btnFormat').onclick = formatCode;
$('#btnRerun').onclick = () => {
  if (!lastRun) return actions.run();
  lastRun.kind === 'tests' ? runTests(lastRun.opts) : runFile(lastRun.path);
};

function duplicateLine(cm) {
  cm.operation(() => {
    const sels = cm.listSelections();
    for (let i = sels.length - 1; i >= 0; i--) {
      const s = sels[i];
      if (s.empty()) {
        const ln = s.head.line;
        cm.replaceRange(cm.getLine(ln) + '\n', { line: ln, ch: 0 });
      } else {
        const text = cm.getRange(s.from(), s.to());
        cm.replaceRange(text, s.to());
      }
    }
  });
}

document.addEventListener('keydown', e => {
  const k = e.key, ctrl = e.ctrlKey || e.metaKey;
  const hit = (cond, fn) => { if (cond) { e.preventDefault(); e.stopPropagation(); fn(); return true; } return false; };
  hit(e.shiftKey && !ctrl && k === 'F10', actions.run) ||
  hit(e.shiftKey && ctrl && k === 'F10', actions.runCurrent) ||
  hit(ctrl && e.shiftKey && (k === 'T' || k === 't'), actions.runTests) ||
  hit(ctrl && !e.shiftKey && (k === 's' || k === 'S'), actions.save) ||
  hit(ctrl && e.altKey && (k === 'l' || k === 'L'), formatCode) ||
  hit(e.altKey && !ctrl && k === '1', () => toggleProject()) ||
  hit(e.altKey && !ctrl && k === '4', toggleBottom) ||
  hit(e.altKey && k === 'F12', () => showBottom('terminal')) ||
  hit(e.altKey && k === 'Insert', () => newFile()) ||
  hit((ctrl && k === 'F4') || (e.altKey && !ctrl && (k === 'w' || k === 'W')), () => state.active && closeTab(state.active)) ||
  hit(ctrl && (k === '=' || k === '+'), actions.zoomIn) ||
  hit(ctrl && k === '-', actions.zoomOut) ||
  hit(ctrl && k === '0', actions.zoomReset) ||
  hit(k === 'Escape' && $('#ctx').classList.contains('show'), hideCtx);
}, true);

/* ================= Muharrirni yaratish ================= */
function makeEditor() {
  editor = CodeMirror($('#editor'), {
    theme: 'darcula',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    matchBrackets: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    foldGutter: true,
    foldOptions: { rangeFinder: CodeMirror.fold.indent, widget: ' … ' },
    gutters: ['CodeMirror-linenumbers', 'run-gutter', 'CodeMirror-foldgutter'],
    hintOptions: { hint: pyHint, completeSingle: false, closeCharacters: /[\s()\[\]{};:>,=]/ },
    extraKeys: {
      Tab: cm => {
        if (cm.somethingSelected()) cm.indentSelection('add');
        else cm.replaceSelection('    ', 'end');
      },
      'Shift-Tab': cm => cm.indentSelection('subtract'),
      Backspace: cm => {
        // 4 bo'shliqni bittada o'chirish
        if (cm.somethingSelected()) return CodeMirror.Pass;
        const c = cm.getCursor();
        const before = cm.getLine(c.line).slice(0, c.ch);
        if (before.length && /^ +$/.test(before)) {
          const n = ((before.length - 1) % 4) + 1;
          cm.replaceRange('', { line: c.line, ch: c.ch - n }, c);
          return;
        }
        return CodeMirror.Pass;
      },
      'Ctrl-Space': cm => cm.showHint(),
      'Ctrl-/': cm => cm.toggleComment({ indent: true }),
      'Cmd-/': cm => cm.toggleComment({ indent: true }),
      'Ctrl-D': duplicateLine,
      'Cmd-D': duplicateLine,
      'Ctrl-Y': 'deleteLine',
      'Ctrl-R': 'replace',
      'Ctrl-G': 'jumpToLine',
      'Alt-Shift-Up': 'swapLineUp',
      'Alt-Shift-Down': 'swapLineDown',
      'Shift-Enter': cm => { cm.execCommand('goLineEnd'); cm.execCommand('newlineAndIndent'); },
    },
  });
  CodeMirror.commands.swapLineUp = cm => moveLine(cm, -1);
  CodeMirror.commands.swapLineDown = cm => moveLine(cm, 1);

  editor.on('change', (cm, ch) => {
    scheduleSave();
    updateRunGutter();
    lintSoon();
  });
  editor.on('cursorActivity', cm => {
    const c = cm.getCursor();
    const sel = cm.getSelection();
    $('#cursorPos').textContent = `${c.line + 1}:${c.ch + 1}` + (sel ? ` (${sel.length} belgi)` : '');
  });
  editor.on('inputRead', (cm, ch) => {
    if (cm.state.completionActive || !isPy(state.active || '')) return;
    const t = ch.text.join('');
    if (/^[A-Za-z_.]$/.test(t)) {
      const cur = cm.getCursor();
      const before = cm.getLine(cur.line).slice(0, cur.ch);
      const m = before.match(/[\w]+$/);
      if (t === '.' ? /[\w)\]]\.$/.test(before) : (m && m[0].length >= 2)) cm.showHint();
    }
  });
}
function moveLine(cm, dir) {
  const c = cm.getCursor(), ln = c.line, to = ln + dir;
  if (to < 0 || to >= cm.lineCount()) return;
  const a = cm.getLine(ln), b = cm.getLine(to);
  cm.operation(() => {
    cm.replaceRange(b, { line: ln, ch: 0 }, { line: ln, ch: a.length });
    cm.replaceRange(a, { line: to, ch: 0 }, { line: to, ch: b.length });
    cm.setCursor({ line: to, ch: c.ch });
  });
}

/* ================= Python (Pyodide) ishga tushishi ================= */
let pyVersion = '3';
const BOOT = String.raw`
import sys, os, builtins, traceback, runpy, json, unittest, time, io, code, ast
import js

ROOT = '/home/pyodide/project'
os.makedirs(ROOT, exist_ok=True)
os.chdir(ROOT)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

def _pc_input(prompt=''):
    prompt = str(prompt)
    sys.stdout.write(prompt)
    sys.stdout.flush()
    r = js.pcInput(prompt)
    if r is None:
        sys.stdout.write('\n')
        raise KeyboardInterrupt("input() bekor qilindi")
    r = str(r)
    js.pcEcho(r)
    return r

builtins.input = _pc_input

def _pc_purge():
    for name, m in list(sys.modules.items()):
        f = getattr(m, '__file__', None) or ''
        if f.startswith(ROOT):
            del sys.modules[name]
    import importlib
    importlib.invalidate_caches()

def _pc_format_exc(etype, value, tb):
    frames = [f for f in traceback.extract_tb(tb) if f.filename.startswith(ROOT)]
    out = ''
    if frames:
        out += 'Traceback (most recent call last):\n' + ''.join(traceback.format_list(frames))
    out += ''.join(traceback.format_exception_only(etype, value))
    return out

def _pc_run_file(rel):
    _pc_purge()
    os.chdir(ROOT)
    path = os.path.join(ROOT, rel)
    sys.argv = [path]
    rc = 0
    try:
        runpy.run_path(path, run_name='__main__')
    except SystemExit as e:
        if e.code is None:
            rc = 0
        elif isinstance(e.code, int):
            rc = e.code
        else:
            print(e.code, file=sys.stderr)
            rc = 1
    except KeyboardInterrupt as e:
        print('KeyboardInterrupt', file=sys.stderr)
        rc = 130
    except BaseException as e:
        sys.stderr.write(_pc_format_exc(type(e), e, e.__traceback__))
        rc = 1
    finally:
        sys.stdout.flush()
        sys.stderr.flush()
    return rc

class _PcResult(unittest.TestResult):
    def __init__(self):
        super().__init__()
        self.items = []
        self._t = 0
    def startTest(self, test):
        super().startTest(test)
        self._t = time.perf_counter()
    def _add(self, test, status, err=None, msg=''):
        item = dict(id=test.id(), status=status, ms=round((time.perf_counter() - self._t) * 1000, 1),
                    msg=_pc_format_exc(*err) if err else msg)
        try:
            import inspect
            fn = getattr(type(test), test._testMethodName)
            src = inspect.getsourcefile(fn)
            if src and src.startswith(ROOT):
                item['file'] = os.path.relpath(src, ROOT).replace(os.sep, '/')
                item['line'] = inspect.getsourcelines(fn)[1]
        except Exception:
            pass
        self.items.append(item)
    def addSuccess(self, t): super().addSuccess(t); self._add(t, 'ok')
    def addFailure(self, t, err): super().addFailure(t, err); self._add(t, 'fail', err)
    def addError(self, t, err): super().addError(t, err); self._add(t, 'error', err)
    def addSkip(self, t, r): super().addSkip(t, r); self._add(t, 'skip', msg=str(r))
    def addExpectedFailure(self, t, err): super().addExpectedFailure(t, err); self._add(t, 'ok')
    def addUnexpectedSuccess(self, t): super().addUnexpectedSuccess(t); self._add(t, 'fail', msg='Kutilmagan muvaffaqiyat (expectedFailure)')

def _pc_run_tests(pattern, subdir, names):
    _pc_purge()
    os.chdir(ROOT)
    loader = unittest.TestLoader()
    try:
        if names:
            suite = loader.loadTestsFromNames(json.loads(names))
        else:
            start = os.path.join(ROOT, subdir) if subdir else ROOT
            suite = loader.discover(start, pattern=pattern, top_level_dir=ROOT)
    except BaseException as e:
        return json.dumps(dict(items=[], error=_pc_format_exc(type(e), e, e.__traceback__)))
    res = _PcResult()
    suite.run(res)
    sys.stdout.flush(); sys.stderr.flush()
    n = len(res.items)
    bad = sum(1 for i in res.items if i['status'] in ('fail', 'error'))
    print(f"\nRan {n} test{'s' if n != 1 else ''}")
    print('OK' if not bad else f'FAILED ({bad})', file=sys.stderr if bad else sys.stdout)
    return json.dumps(dict(items=res.items))

class _PcConsole(code.InteractiveConsole):
    def write(self, data):
        sys.stderr.write(data)

_pc_repl = _PcConsole({'__name__': '__console__', '__builtins__': builtins})

def _pc_repl_push(line):
    os.chdir(ROOT)
    try:
        return _pc_repl.push(line)
    finally:
        sys.stdout.flush(); sys.stderr.flush()

def _pc_lint(src, name):
    out = []
    try:
        tree = ast.parse(src, name)
        compile(tree, name, 'exec')
    except SyntaxError as e:
        line = e.lineno or 1
        col = max(0, (e.offset or 1) - 1)
        return json.dumps([dict(line=line, col=col, msg=f'{type(e).__name__}: {e.msg}', sev='error')])
    try:
        from pyflakes import checker, messages as M
    except ImportError:
        return json.dumps(out)
    w = checker.Checker(tree, filename=name)
    for m in w.messages:
        unused = isinstance(m, (M.UnusedImport, M.UnusedVariable))
        sev = 'error' if isinstance(m, (M.UndefinedName, M.UndefinedLocal)) else 'warning'
        out.append(dict(line=m.lineno, col=getattr(m, 'col', 0) or 0, msg=m.message % m.message_args, sev=sev, unused=unused))
    return json.dumps(out)

def _pc_complete(src, line, col, rel):
    import jedi
    try:
        s = jedi.Interpreter(src, [{}], path=os.path.join(ROOT, rel))
    except TypeError:
        s = jedi.Interpreter(src, [{}])
    res = []
    for c in s.complete(line, col)[:80]:
        if c.name.startswith('__') and not c.name.endswith('__'):
            continue
        res.append([c.name, c.type])
    res.sort(key=lambda r: (r[0].startswith('_'), r[0].lower()))
    return json.dumps(res)

def _pc_format(src):
    import black
    return black.format_str(src, mode=black.Mode())

f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
`;

async function initPython() {
  const t0 = performance.now();
  try {
    py = await loadPyodide();
    const dec = new TextDecoder(), decErr = new TextDecoder();
    py.setStdout({ write: buf => { outTarget.write(dec.decode(buf, { stream: true })); return buf.length; } });
    py.setStderr({ write: buf => { outTarget.write(decErr.decode(buf, { stream: true }), 'err'); return buf.length; } });
    pyVersion = py.runPython(BOOT);
    pyReady = true;
    syncFS();
    $('#pyVersion').textContent = `Python ${pyVersion} (Pyodide)`;
    pyStatus(`Python ${pyVersion} tayyor`);
    runCon.write(`Python ${pyVersion} (Pyodide ${py.version}) — ${((performance.now() - t0) / 1000).toFixed(1)}s da yuklandi.\n`, 'meta');
    runCon.write('Ishga tushirish: Shift+F10 yoki ▶ tugmasi. Testlar: Ctrl+Shift+T.\n', 'meta');
    replCon.write(`Python ${pyVersion} (Pyodide) — interaktiv konsol. Loyiha modullarini import qilishingiz mumkin.\n`, 'meta');
    lintSoon(0);
    // Qo'shimcha vositalar fonda yuklanadi
    loadExtras();
  } catch (e) {
    pyStatus('Python yuklanmadi', 'fail');
    runCon.write('Python (Pyodide) yuklanmadi. Internet aloqasini tekshirib, sahifani yangilang.\n' + e + '\n', 'err');
  }
}
async function loadExtras() {
  try {
    await py.loadPackage('jedi', { messageCallback: () => {} });
    py.runPython('import jedi');
    jediReady = true;
  } catch (e) { /* jedi yo'q — oddiy so'z bo'yicha to'ldirish */ }
  try {
    await py.loadPackage('micropip', { messageCallback: () => {} });
    await py.runPythonAsync('import micropip\nawait micropip.install("pyflakes")');
    pyflakesReady = true;
    lintSoon(0);
  } catch (e) { /* pyflakes yo'q — faqat sintaksis tekshiriladi */ }
  status([jediReady && 'Jedi avtoto\'ldirish', pyflakesReady && 'pyflakes tekshiruvi'].filter(Boolean).join(' · ') + (jediReady || pyflakesReady ? ' faol' : ''));
}

/* ================= Boshlash ================= */
load();
makeEditor();
setFont(state.fontSize || 14);
state.open = state.open.filter(p => p in state.files);
if (state.active && !(state.active in state.files)) state.active = state.open[0] || null;
if (state.active) openFile(state.active); else renderAll();
if (innerWidth <= 760) toggleProject(false);
renderProblems();
window.addEventListener('beforeunload', persist);
initPython();
