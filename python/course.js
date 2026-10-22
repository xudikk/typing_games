/* Python kursi dvigateli: mundarija, darsni chizish, kodni ishga tushirish (Pyodide) va topshiriqlarni tekshirish */
(function () {
  'use strict';

  const LESSONS = window.COURSE.slice().sort((a, b) => a.id - b.id);
  const MODULES = window.COURSE_MODULES;
  const STORE = 'neo_python_v1';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Progress ---------- */
  function loadProgress() {
    try { return Object.assign({ lessons: {}, code: {} }, JSON.parse(localStorage.getItem(STORE)) || {}); }
    catch (e) { return { lessons: {}, code: {} }; }
  }
  let P = loadProgress();
  function save() { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) { /* e'tiborsiz */ } }
  const lp = id => (P.lessons[id] = P.lessons[id] || { tasks: {}, quiz: {} });
  const isDone = id => !!(P.lessons[id] && P.lessons[id].done);
  function checkDone(lesson) {
    const s = lp(lesson.id);
    const allTasks = lesson.tasks.every((_, i) => s.tasks[i]);
    if (allTasks && !s.done) {
      s.done = Date.now();
      save();
      const n = LESSONS.filter(l => isDone(l.id)).length;
      if (window.Neo) { Neo.stats.record('python', { score: n, lesson: lesson.id }); Neo.sound.play('win'); }
      return true;
    }
    return false;
  }

  /* ---------- Mundarija ---------- */
  function renderToc(activeId) {
    const doneCount = LESSONS.filter(l => isDone(l.id)).length;
    $('overallBar').style.width = (doneCount / LESSONS.length * 100) + '%';
    $('overallText').textContent = `${doneCount}/${LESSONS.length} dars tugatildi`;
    $('toc').innerHTML = MODULES.map(m => {
      const ls = LESSONS.filter(l => l.module === m.id);
      const d = ls.filter(l => isDone(l.id)).length;
      return `<div class="mod"><div class="mod-title"><span>${m.icon} ${esc(m.title)}</span><span>${d}/${ls.length}</span></div>
        ${ls.map(l => {
          const s = P.lessons[l.id];
          const cls = isDone(l.id) ? 'done' : s && Object.keys(s.tasks).length ? 'partial' : '';
          return `<a class="toc-item ${cls} ${l.id === activeId ? 'active' : ''}" href="#${l.id}"><span class="num">${isDone(l.id) ? '✓' : l.id}</span>${esc(l.title)}</a>`;
        }).join('')}</div>`;
    }).join('');
    const act = $('toc').querySelector('.active');
    if (act) act.scrollIntoView({ block: 'nearest' });
  }

  /* ---------- Pyodide (birinchi ishga tushirishda yuklanadi) ---------- */
  let pyPromise = null;
  let curOut = null;
  function pyStatus(text) {
    const el = $('pyStatus');
    el.textContent = text || '';
    el.classList.toggle('show', !!text);
  }
  function getPython() {
    if (pyPromise) return pyPromise;
    pyPromise = (async () => {
      pyStatus('⏳ Python yuklanmoqda (birinchi marta bir necha soniya)...');
      if (!window.loadPyodide) {
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          s.onload = res; s.onerror = () => rej(new Error('Pyodide yuklanmadi'));
          document.head.appendChild(s);
        });
      }
      const py = await loadPyodide();
      const dec = new TextDecoder();
      py.setStdout({ write: b => { if (curOut) curOut(dec.decode(b, { stream: true }), ''); return b.length; } });
      py.setStderr({ write: b => { if (curOut) curOut(dec.decode(b, { stream: true }), 'err'); return b.length; } });
      py.runPython(PY_HELPERS);
      pyStatus('');
      return py;
    })();
    pyPromise.catch(() => { pyPromise = null; pyStatus("❌ Python yuklanmadi. Internetni tekshiring."); });
    return pyPromise;
  }
  window.courseInput = (prompt, ctx) => window.prompt(((ctx || '').trim().split('\n').slice(-5).join('\n') || 'input()') + '\n\n▶ Qiymat kiriting:', '');

  const PY_HELPERS = String.raw`
import sys, io, os, json, builtins, traceback, contextlib, linecache
import js

KURS_DIR = '/home/pyodide/kurs'
os.makedirs(KURS_DIR, exist_ok=True)

def _fmt_exc(e, fname):
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == fname]
    s = ''
    if frames:
        s = 'Traceback (most recent call last):\n' + ''.join(traceback.format_list(frames))
    return s + ''.join(traceback.format_exception_only(type(e), e))

def _exec_user(code, inputs, interactive):
    os.chdir(KURS_DIR)
    linecache.cache['<kod>'] = (len(code), None, code.splitlines(True), '<kod>')
    buf = io.StringIO()
    feed = iter(inputs or [])
    def _inp(prompt=''):
        prompt = str(prompt)
        sys.stdout.write(prompt)          # _Tee orqali buf'ga ham yoziladi
        if interactive:
            r = js.courseInput(prompt, buf.getvalue()[-400:])
            if r is None:
                raise KeyboardInterrupt('input() bekor qilindi')
            r = str(r)
        else:
            r = next(feed, '')
        sys.stdout.write(r + '\n')
        return r
    g = {'__name__': '__main__', '__builtins__': builtins, 'input': _inp}
    err = None

    class _Tee(io.TextIOBase):
        def write(self, s):
            buf.write(s)
            sys.__stdout__.write(s)
            return len(s)
    tee = _Tee()
    old = sys.stdout
    sys.stdout = tee
    try:
        exec(compile(code, '<kod>', 'exec'), g)
    except SystemExit:
        pass
    except BaseException as e:
        err = _fmt_exc(e, '<kod>')
    finally:
        sys.stdout = old
    return g, buf.getvalue(), err

def _course_run(code):
    g, out, err = _exec_user(code, [], True)
    if err:
        sys.stderr.write(err)
    return json.dumps({'ok': err is None})

def _course_check(code, tests, inputs_json):
    inputs = json.loads(inputs_json)
    g, out, err = _exec_user(code, inputs, False)
    if err:
        return json.dumps({'ok': False, 'msg': 'Kodingizni bajarishda xato:\n' + err})
    g['out'] = out
    g['__code__'] = code
    linecache.cache['<test>'] = (len(tests), None, tests.splitlines(True), '<test>')
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(tests, '<test>', 'exec'), g)
    except AssertionError as e:
        msg = str(e) or "Test o'tmadi"
        return json.dumps({'ok': False, 'msg': msg})
    except BaseException as e:
        return json.dumps({'ok': False, 'msg': 'Tekshiruvda xato: ' + ''.join(traceback.format_exception_only(type(e), e)).strip()})
    return json.dumps({'ok': True})
`;

  /* ---------- Kod bloki ---------- */
  function makeOutput(pre) {
    pre.textContent = '';
    pre.classList.add('show');
    return (text, cls) => {
      const last = pre.lastChild;
      if (last && last.dataset && last.dataset.cls === (cls || '')) last.textContent += text;
      else {
        const s = document.createElement('span');
        s.dataset.cls = cls || '';
        if (cls) s.className = cls;
        s.textContent = text;
        pre.appendChild(s);
      }
      pre.scrollTop = pre.scrollHeight;
    };
  }

  async function runCode(code, pre, btn) {
    const write = makeOutput(pre);
    btn.disabled = true;
    write(pyPromise ? '' : "Python yuklanmoqda...\n", 'muted');
    try {
      const py = await getPython();
      pre.textContent = '';
      try { await py.loadPackagesFromImports(code); } catch (e) { /* noma'lum modul */ }
      await new Promise(r => setTimeout(r, 20));
      curOut = write;
      py.globals.get('_course_run')(code);
      if (!pre.textContent) write('(chiqish yo\'q)', 'muted');
    } catch (e) {
      write(String(e) + '\n', 'err');
    } finally {
      curOut = null;
      btn.disabled = false;
    }
  }

  let liveEditors = [];
  function editorFor(host, code, onChange) {
    const cm = CodeMirror(host, {
      value: code, mode: 'python', theme: 'dracula', lineNumbers: true, indentUnit: 4, tabSize: 4,
      matchBrackets: true, autoCloseBrackets: true, viewportMargin: Infinity,
      extraKeys: {
        Tab: c => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('    ', 'end'),
        'Shift-Tab': c => c.indentSelection('subtract'),
        'Ctrl-/': c => c.toggleComment(), 'Cmd-/': c => c.toggleComment(),
      },
    });
    if (onChange) cm.on('change', () => onChange(cm.getValue()));
    liveEditors.push(cm);
    return cm;
  }

  function openInPyCharm(name, code) {
    try { localStorage.setItem('pycharm_handoff', JSON.stringify({ name, code })); } catch (e) { /* e'tiborsiz */ }
    window.open('../arcade/pycharm/index.html', '_blank');
  }

  function codeBox(code, label, name) {
    const box = document.createElement('div');
    box.className = 'code-box';
    box.innerHTML = `<div class="code-bar"><span class="lbl">${esc(label)}</span>
      <button class="cbtn run"><i class="fa-solid fa-play"></i> Ishga tushirish</button>
      <button class="cbtn reset" title="Asl holatiga qaytarish"><i class="fa-solid fa-rotate-left"></i></button>
      <button class="cbtn pc" title="PyCharm Online'da ochish"><i class="fa-solid fa-arrow-up-right-from-square"></i></button></div>
      <div class="cm-host"></div><pre class="output"></pre>`;
    const cm = editorFor(box.querySelector('.cm-host'), code);
    const pre = box.querySelector('.output');
    const run = box.querySelector('.run');
    run.onclick = () => runCode(cm.getValue(), pre, run);
    cm.setOption('extraKeys', Object.assign({}, cm.getOption('extraKeys'), { 'Shift-Enter': () => run.click(), 'Ctrl-Enter': () => run.click() }));
    box.querySelector('.reset').onclick = () => { cm.setValue(code); pre.classList.remove('show'); };
    box.querySelector('.pc').onclick = () => openInPyCharm(name, cm.getValue());
    return box;
  }

  /* ---------- Dars sahifasi ---------- */
  function renderLesson(lesson) {
    const idx = LESSONS.indexOf(lesson);
    const mod = MODULES.find(m => m.id === lesson.module);
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    const s = lp(lesson.id);
    const view = $('view');
    view.innerHTML = `<article class="lesson">
      <div class="crumbs">${mod.icon} ${esc(mod.title)} · ${lesson.id}-dars</div>
      <h1>${esc(lesson.title)}</h1>
      <div class="meta"><span><i class="fa-regular fa-clock"></i> ~${lesson.minutes} daqiqa</span>
        <span><i class="fa-solid fa-list-check"></i> ${lesson.tasks.length} ta topshiriq</span>
        <span><i class="fa-regular fa-circle-question"></i> ${lesson.quiz.length} ta savol</span>
        ${isDone(lesson.id) ? '<span style="color:var(--ok)"><i class="fa-solid fa-circle-check"></i> Tugatilgan</span>' : ''}</div>
      <div class="intro">${lesson.intro}</div>
      <div id="secs"></div>
      <section class="quiz"><h3 class="block-title">🧠 O'zingizni tekshiring</h3><div id="quiz"></div></section>
      <section class="tasks"><h3 class="block-title">💻 Amaliy topshiriqlar</h3>
        <p style="color:var(--muted);margin-bottom:14px">Kodni yozing, <b>Tekshirish</b> tugmasini bosing — avtomatik testlar natijani baholaydi. Barcha topshiriqlar bajarilsa, dars tugatilgan hisoblanadi.</p>
        <div id="tasks"></div></section>
      <div class="done-banner" id="doneBanner">🎉 <b>Dars tugatildi!</b> ${next ? `Keyingi dars: <a href="#${next.id}">${esc(next.title)} →</a>` : "Siz butun kursni tugatdingiz — tabriklaymiz! 🎓"}</div>
      <nav class="pager">
        ${prev ? `<a href="#${prev.id}"><small>← Oldingi</small>${esc(prev.title)}</a>` : '<a href="#"><small>← Kurs haqida</small>Bosh sahifa</a>'}
        ${next ? `<a class="next" href="#${next.id}"><small>Keyingi →</small>${esc(next.title)}</a>` : ''}
      </nav></article>`;

    const secs = $('secs');
    lesson.sections.forEach((sec, i) => {
      const el = document.createElement('section');
      el.className = 'sec';
      el.innerHTML = `<h2><span class="idx">${lesson.id}.${i + 1}</span> ${esc(sec.h)}</h2>${sec.html || ''}`;
      if (sec.code) el.appendChild(codeBox(sec.code, `misol_${i + 1}.py`, `dars${lesson.id}_misol${i + 1}`));
      secs.appendChild(el);
    });

    // Test savollari
    const quiz = $('quiz');
    lesson.quiz.forEach((q, qi) => {
      const el = document.createElement('div');
      el.className = 'q';
      el.innerHTML = `<h4>${qi + 1}. ${esc(q.q)}</h4><div class="opts">${q.options.map((o, oi) => `<button class="opt" data-i="${oi}">${esc(o)}</button>`).join('')}</div>
        <p class="explain">💡 ${esc(q.explain || '')}</p>`;
      const showAnswer = picked => {
        el.querySelectorAll('.opt').forEach(b => {
          const i = +b.dataset.i;
          b.disabled = true;
          if (i === q.answer) b.classList.add('right');
          else if (i === picked) b.classList.add('wrong');
        });
        el.querySelector('.explain').classList.add('show');
      };
      if (s.quiz[qi] !== undefined) showAnswer(s.quiz[qi]);
      el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const picked = +b.dataset.i;
        s.quiz[qi] = picked;
        save();
        showAnswer(picked);
        if (window.Neo) Neo.sound.play(picked === q.answer ? 'ok' : 'error');
      });
      quiz.appendChild(el);
    });

    // Topshiriqlar
    const tasks = $('tasks');
    lesson.tasks.forEach((t, ti) => {
      const key = `${lesson.id}-${ti}`;
      const el = document.createElement('div');
      el.className = 'task' + (s.tasks[ti] ? ' passed' : '');
      el.innerHTML = `<h4>📝 ${ti + 1}. ${esc(t.title)} <span class="badge-ok">✔ Bajarildi</span></h4>
        <div class="task-desc">${t.desc}</div>
        <div class="code-box"><div class="code-bar"><span class="lbl">yechim.py</span>
          <button class="cbtn run"><i class="fa-solid fa-play"></i> Ishga tushirish</button>
          <button class="cbtn check"><i class="fa-solid fa-flask-vial"></i> Tekshirish</button>
          <button class="cbtn hint-btn" title="Maslahat"><i class="fa-regular fa-lightbulb"></i></button>
          <button class="cbtn reset" title="Boshlang'ich kod"><i class="fa-solid fa-rotate-left"></i></button>
          <button class="cbtn pc" title="PyCharm Online'da ochish"><i class="fa-solid fa-arrow-up-right-from-square"></i></button></div>
          <div class="cm-host"></div><pre class="output"></pre></div>
        <div class="result"></div>
        <div class="hint-box"><b>💡 Maslahat:</b><pre>${esc(t.hint || '')}</pre></div>`;
      const cm = editorFor(el.querySelector('.cm-host'), P.code[key] ?? t.starter ?? '', v => { P.code[key] = v; save(); });
      const pre = el.querySelector('.output');
      const res = el.querySelector('.result');
      const runBtn = el.querySelector('.run'), checkBtn = el.querySelector('.check');
      runBtn.onclick = () => runCode(cm.getValue(), pre, runBtn);
      checkBtn.onclick = async () => {
        checkBtn.disabled = true;
        res.className = 'result show';
        res.textContent = '⏳ Tekshirilmoqda...';
        try {
          const py = await getPython();
          const code = cm.getValue();
          try { await py.loadPackagesFromImports(code); } catch (e) { /* e'tiborsiz */ }
          const write = makeOutput(pre);
          curOut = write;
          const r = JSON.parse(py.globals.get('_course_check')(code, t.tests, JSON.stringify(t.inputs || [])));
          curOut = null;
          if (!pre.textContent) pre.classList.remove('show');
          if (r.ok) {
            res.className = 'result show ok';
            res.textContent = '✅ Barcha testlar o\'tdi! Ajoyib.';
            s.tasks[ti] = true;
            save();
            el.classList.add('passed');
            if (window.Neo) Neo.sound.play('ok');
            if (checkDone(lesson)) $('doneBanner').classList.add('show');
            renderToc(lesson.id);
          } else {
            res.className = 'result show bad';
            res.textContent = '❌ ' + r.msg;
            if (window.Neo) Neo.sound.play('error');
          }
        } catch (e) {
          res.className = 'result show bad';
          res.textContent = '❌ ' + e;
        } finally {
          curOut = null;
          checkBtn.disabled = false;
        }
      };
      cm.setOption('extraKeys', Object.assign({}, cm.getOption('extraKeys'), { 'Shift-Enter': () => runBtn.click(), 'Ctrl-Enter': () => checkBtn.click() }));
      el.querySelector('.hint-btn').onclick = () => el.querySelector('.hint-box').classList.toggle('show');
      el.querySelector('.reset').onclick = async () => {
        if (!confirm("Kod boshlang'ich holatiga qaytarilsinmi?")) return;
        cm.setValue(t.starter || '');
      };
      el.querySelector('.pc').onclick = () => openInPyCharm(`dars${lesson.id}_topshiriq${ti + 1}`, cm.getValue());
      tasks.appendChild(el);
    });
    if (isDone(lesson.id)) $('doneBanner').classList.add('show');
    // Muharrirlar DOM'ga qo'shilgandan keyin o'lchamlarini qayta hisoblaydi (qator raqamlari uchun)
    const eds = liveEditors;
    liveEditors = [];
    requestAnimationFrame(() => eds.forEach(c => c.refresh()));
    document.title = `${lesson.id}. ${lesson.title} — Python kursi`;
  }

  /* ---------- Kurs bosh sahifasi ---------- */
  function renderHome() {
    const doneCount = LESSONS.filter(l => isDone(l.id)).length;
    const nextL = LESSONS.find(l => !isDone(l.id)) || LESSONS[0];
    const totalMin = LESSONS.reduce((a, l) => a + l.minutes, 0);
    const totalTasks = LESSONS.reduce((a, l) => a + l.tasks.length, 0);
    $('view').innerHTML = `<section class="hero">
        <h1>🐍 Python: noldan professional darajagacha</h1>
        <p>${LESSONS.length} ta qadamma-qadam dars, ${totalTasks} ta avtomatik tekshiriladigan topshiriq. Hech narsa o'rnatish shart emas — barcha kod shu brauzerning o'zida ishlaydi.</p>
        <a class="big-btn" href="#${nextL.id}">${doneCount ? `▶ Davom ettirish: ${nextL.id}-dars` : '▶ Kursni boshlash'}</a>
      </section>
      <div class="features">
        <div class="feature">📖<b>Tushunarli nazariya</b><span>O'zbek tilida, misollar bilan</span></div>
        <div class="feature">▶️<b>Jonli misollar</b><span>Har bir kodni o'zgartirib, ishga tushiring</span></div>
        <div class="feature">✅<b>Avtomatik tekshiruv</b><span>Topshiriqlar testlar bilan baholanadi</span></div>
        <div class="feature">⏱️<b>~${Math.round(totalMin / 60)} soat</b><span>O'z tezligingizda o'rganing</span></div>
      </div>
      ${MODULES.map(m => {
        const ls = LESSONS.filter(l => l.module === m.id);
        return `<div class="mod-card"><h3>${m.icon} ${m.id}-modul. ${esc(m.title)} <span>${ls.filter(l => isDone(l.id)).length}/${ls.length}</span></h3>
          <div class="mod-lessons">${ls.map(l => `<a class="toc-item ${isDone(l.id) ? 'done' : ''}" href="#${l.id}"><span class="num">${isDone(l.id) ? '✓' : l.id}</span>${esc(l.title)}</a>`).join('')}</div></div>`;
      }).join('')}`;
    document.title = 'Python kursi — NeoCoder';
  }

  /* ---------- Marshrutlash ---------- */
  function route() {
    const id = parseInt(location.hash.slice(1), 10);
    const lesson = LESSONS.find(l => l.id === id);
    $('sidebar').classList.remove('open');
    if (lesson) { P.last = id; save(); renderLesson(lesson); }
    else renderHome();
    renderToc(lesson ? lesson.id : 0);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  $('tocToggle').onclick = () => $('sidebar').classList.toggle('open');
  document.addEventListener('click', e => {
    if ($('sidebar').classList.contains('open') && !e.target.closest('#sidebar') && !e.target.closest('#tocToggle')) $('sidebar').classList.remove('open');
  });
  if (window.Neo) Neo.addMuteButton();
  window.CourseEngine = { getPython, lessons: LESSONS };
  route();
})();
