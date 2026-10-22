// NeoCoder — tezlik testi
(function () {
  'use strict';

  const WORDS = {
    en: ("the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is was are been has had were said did made find very long down call few here lead might ask plan small mean more again hold need group general consider each become school show much problem world life hand part child eye woman place week case point number fact home water room mother area money story month lot right study book job word business issue side kind head house service friend father power hour game line end member law car city community name president team minute idea kid body information nothing ago lead social understand whether watch together follow around parent stop face anything create public already speak others read level allow add office spend door health person art sure such war history party within grow result open change morning walk reason low win research girl guy early food before moment himself air teacher force offer enough both education across although remember foot second boy maybe toward able age off policy everything love process music including").split(' '),
    uz: ("men sen u biz siz ular bu shu o'sha yaxshi yomon katta kichik uy do'st kitob o'qish yozish o'rganish har kuni vaqt ish hayot sevgi do'stlik oila mashq o'yin kun kecha ertaga bugun yil oy hafta soat daqiqa bola ona ota aka uka opa singil buva buvi maktab sinf dars ustoz o'quvchi talaba daftar qalam ruchka stol stul eshik deraza xona shahar qishloq ko'cha yo'l mashina avtobus poyezd samolyot suv non choy ovqat meva olma uzum anor qovun tarvuz bog' daraxt gul yaproq osmon quyosh yulduz bulut yomg'ir qor shamol tog' daryo dengiz ko'l cho'l yer olam dunyo vatan xalq til so'z gap matn harf raqam son hisob savol javob fikr g'oya bilim fan texnika kompyuter dastur dasturchi kod internet sayt tarmoq xabar telefon ekran klaviatura sichqoncha tez sekin oson qiyin yangi eski chiroyli toza baland past uzun qisqa issiq sovuq qizil yashil ko'k sariq oq qora bor yo'q kel ket bor ol ber qil ko'r eshit gapir ayt bil o'yla yasha ishla yugur yur o'tir tur yot uxla uyg'on yeg ich kul yig'la quvon sev bajar boshla tugat yordam muhim kerak mumkin albatta hamisha doim ba'zan hech qachon hozir keyin oldin birga yolg'iz").split(' '),
    ru: ("и в не на я быть он с что а по это она этот к но они мы как из у который то за свой что весь год от так о для ты же все тот мочь вы человек такой его сказать только или ещё бы себя один как уже до время если сам когда другой вот говорить наш мой знать стать при чтобы дело жизнь кто первый очень два день её новый рука даже во со раз где там под можно ну какой после их работа без самый потом надо хотеть ли слово идти большой должен место иметь ничто то сейчас тут лицо каждый друг нет теперь ни глаз тоже тогда видеть вопрос через да здесь дом да потому сторона какой-то думать сделать страна жить чем мир об последний случай голова более делать что-то смотреть ребёнок просто конечно сила российский конец перед несколько вид система всегда работать между три нет понять пойти часть спросить город дать также никто понимать получить отношение лишь второй именно вода").split(' '),
    code: ("def class return import from print len range list dict set tuple str int float bool true false none if elif else for while break continue try except finally raise with as lambda yield async await self init main args kwargs value key item index count sum max min sorted filter map open read write file path json data result error function variable const let var console log document window array object string number null undefined new this await promise fetch then catch export default module require package public private static void interface extends implements switch case loop debug compile build deploy server client request response query table select insert update delete where join order group git commit push pull merge branch").split(' '),
  };
  const LABELS = {
    uz: { title: 'Tezlik testi', sec: 'soniya', time: 'Vaqt', wpm: 'WPM', acc: 'Aniqlik', restart: 'Qayta boshlash', hint: 'Yozishni boshlang — vaqt birinchi tugmadan hisoblanadi · Esc — qayta boshlash' },
    en: { title: 'Typing test', sec: 'seconds', time: 'Time', wpm: 'WPM', acc: 'Accuracy', restart: 'Restart', hint: 'Start typing — the timer starts on the first key · Esc — restart' },
    ru: { title: 'Тест скорости', sec: 'секунд', time: 'Время', wpm: 'WPM', acc: 'Точность', restart: 'Заново', hint: 'Начните печатать — таймер стартует с первой клавиши · Esc — заново' },
    code: { title: 'Kod so\'zlari', sec: 'soniya', time: 'Vaqt', wpm: 'WPM', acc: 'Aniqlik', restart: 'Qayta boshlash', hint: 'Dasturlash so\'zlari bilan mashq · Esc — qayta boshlash' },
  };

  const $ = id => document.getElementById(id);
  const typingText = $('typingText');
  const typingInput = $('typingInput');
  const timeDisplay = $('time');
  const wpmDisplay = $('wpm');
  const accuracyDisplay = $('accuracy');
  const timeMode = $('timeMode');
  const language = $('language');

  let words = [];         // ko'rsatilayotgan so'zlar
  let typed = [];         // har bir so'z uchun yozilgan matn
  let index = 0;          // joriy so'z
  let startTime = 0;
  let timer = null;
  let finished = false;
  let keystrokes = 0;
  let mistakes = 0;

  const normalize = s => s.replace(/[‘’ʻʼ`´]/g, "'");

  function randomWords(n) {
    const pool = WORDS[language.value] || WORDS.en;
    const out = [];
    while (out.length < n) {
      const w = pool[Math.floor(Math.random() * pool.length)];
      if (w && w !== out[out.length - 1]) out.push(w);
    }
    return out;
  }

  function applyLabels() {
    const L = LABELS[language.value] || LABELS.uz;
    $('title-typing').textContent = L.title;
    Array.from(timeMode.options).forEach(o => { o.textContent = `${o.value} ${L.sec}`; });
    $('restartBtn').textContent = L.restart;
    $('lblTime').textContent = L.time;
    $('lblWpm').textContent = L.wpm;
    $('lblAcc').textContent = L.acc;
    $('typingHint').textContent = L.hint;
    try { localStorage.setItem('typing_prefs', JSON.stringify({ lang: language.value, time: timeMode.value })); } catch (e) { /* e'tiborsiz */ }
  }

  function renderWord(i) {
    const el = typingText.children[i];
    if (!el) return;
    const w = words[i], t = typed[i] || '';
    let html = '';
    for (let k = 0; k < Math.max(w.length, t.length); k++) {
      const ch = w[k], tc = t[k];
      if (tc === undefined) html += `<span class="ch${i === index && k === t.length ? ' caret' : ''}">${ch}</span>`;
      else if (ch === undefined) html += `<span class="ch extra">${escapeHtml(tc)}</span>`;
      else html += `<span class="ch ${normalize(tc) === ch ? 'ok' : 'bad'}">${ch}</span>`;
    }
    if (i === index && t.length >= w.length) html += '<span class="ch caret end"></span>';
    el.innerHTML = html;
    el.classList.toggle('current', i === index);
    if (i < index) el.classList.toggle('wrong', normalize(t) !== w);
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function renderAll() {
    typingText.innerHTML = words.map(() => '<span class="word"></span>').join(' ');
    words.forEach((_, i) => renderWord(i));
    scrollToCurrent();
  }

  function scrollToCurrent() {
    const cur = typingText.children[index];
    if (!cur) return;
    const lineH = cur.offsetHeight + 8;
    const top = cur.offsetTop - typingText.children[0].offsetTop;
    const line = Math.round(top / lineH);
    typingText.scrollTop = Math.max(0, (line - 1) * lineH);
  }

  function stats() {
    const elapsed = startTime ? Math.min((Date.now() - startTime) / 1000, +timeMode.value) : 0;
    let correctChars = 0, correctWords = 0, wrongWords = 0;
    for (let i = 0; i < index; i++) {
      if (normalize(typed[i]) === words[i]) { correctChars += words[i].length + 1; correctWords++; }
      else wrongWords++;
    }
    // Joriy so'zning to'g'ri boshlanishi ham hisobga olinadi
    const cur = normalize(typed[index] || '');
    if (cur && words[index].startsWith(cur)) correctChars += cur.length;
    const wpm = elapsed > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0;
    const accuracy = keystrokes ? Math.max(0, Math.round((1 - mistakes / keystrokes) * 100)) : 100;
    return { elapsed, wpm, accuracy, correctWords, wrongWords };
  }

  function tick() {
    const left = Math.max(0, +timeMode.value - Math.floor((Date.now() - startTime) / 1000));
    timeDisplay.textContent = `${left}s`;
    const s = stats();
    wpmDisplay.textContent = s.wpm;
    accuracyDisplay.textContent = s.accuracy;
    if (left <= 0) endTest();
  }

  function endTest() {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    typingInput.disabled = true;
    const s = stats();
    const time = +timeMode.value;
    const wpm = Math.round((s.wpm * s.elapsed) / time) || s.wpm;
    let isBest = false;
    if (window.Neo) isBest = Neo.stats.record('typing', { score: wpm, wpm, accuracy: s.accuracy, time, lang: language.value, words: s.correctWords, wrong: s.wrongWords }).isBest;
    const q = new URLSearchParams({ wpm, accuracy: s.accuracy, time, words: s.correctWords, wrong: s.wrongWords, lang: language.value, best: isBest ? 1 : 0 });
    window.location.href = `result.html?${q}`;
  }

  function resetTest() {
    clearInterval(timer);
    timer = null;
    startTime = 0;
    finished = false;
    index = 0;
    keystrokes = 0;
    mistakes = 0;
    words = randomWords(120);
    typed = words.map(() => '');
    typingInput.value = '';
    typingInput.disabled = false;
    timeDisplay.textContent = `${timeMode.value}s`;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100';
    applyLabels();
    renderAll();
    typingInput.focus();
  }

  function commitWord() {
    if (!typed[index]) return;
    index++;
    if (index >= words.length - 20) {
      const more = randomWords(60);
      words = words.concat(more);
      typed = typed.concat(more.map(() => ''));
      typingText.insertAdjacentHTML('beforeend', more.map(() => ' <span class="word"></span>').join(''));
      for (let i = words.length - more.length; i < words.length; i++) renderWord(i);
    }
    renderWord(index - 1);
    renderWord(index);
    scrollToCurrent();
  }

  typingInput.addEventListener('input', () => {
    if (finished) return;
    if (!startTime) {
      startTime = Date.now();
      timer = setInterval(tick, 250);
    }
    let v = typingInput.value;
    // Mobil klaviaturalarda probel "input" orqali keladi
    if (v.includes(' ')) {
      const before = v.slice(0, v.indexOf(' '));
      if (before) typed[index] = before;
      typingInput.value = '';
      commitWord();
      return;
    }
    const prev = typed[index] || '';
    if (v.length > prev.length) {
      for (let k = prev.length; k < v.length; k++) {
        keystrokes++;
        if (normalize(v[k]) !== words[index][k]) mistakes++;
      }
    }
    typed[index] = v;
    typingInput.classList.toggle('incorrect', !words[index].startsWith(normalize(v)));
    renderWord(index);
  });

  typingInput.addEventListener('keydown', e => {
    if (e.key === ' ') {
      e.preventDefault();
      if (!finished && typingInput.value) {
        keystrokes++;
        if (normalize(typingInput.value) !== words[index]) mistakes++;
        typed[index] = typingInput.value;
        typingInput.value = '';
        typingInput.classList.remove('incorrect');
        commitWord();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      resetTest();
    }
  });

  $('restartBtn').addEventListener('click', resetTest);
  const restartModalBtn = $('restartModalBtn');
  if (restartModalBtn) restartModalBtn.addEventListener('click', () => { $('resultModal').style.display = 'none'; resetTest(); });
  timeMode.addEventListener('change', resetTest);
  language.addEventListener('change', resetTest);
  typingText.addEventListener('click', () => typingInput.focus());

  try {
    const p = JSON.parse(localStorage.getItem('typing_prefs'));
    if (p) { language.value = p.lang || language.value; timeMode.value = p.time || timeMode.value; }
  } catch (e) { /* e'tiborsiz */ }
  const best = window.Neo && Neo.stats.best('typing');
  if (best) $('bestLine').textContent = `🏆 Rekordingiz: ${best} WPM`;
  resetTest();
})();
