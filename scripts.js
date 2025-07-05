const words = {
      en: ["year", "call", "few", "she", "very", "here", "this", "even", "out", "lead", "might", "want", "ask", "first", "plan", "have", "back", "use", "small", "down", "mean", "on", "more", "again", "hold", "of", "need", "group", "general", "see", "consider", "which", "some", "each", "become", "from", "day", "we", "school", "show", "be", "much", "govern", "problem", "by"],
      uz: ["men", "sen", "u", "biz", "ular", "bu", "o'sha", "yaxshi", "yomon", "uy", "do'st", "kitob", "o'qish", "yozish", "o'rganish", "har", "kuni", "vaqt", "ish", "hayot", "sevgi", "do'stlik", "oil", "mashq", "o'yin", "kun", "kecha", "ertaga"]

    };

    const typingText = document.getElementById('typingText');
    const typingInput = document.getElementById('typingInput');
    const timeDisplay = document.getElementById('time');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const restartBtn = document.getElementById('restartBtn');
    const timeMode = document.getElementById('timeMode');
    const language = document.getElementById('language');
    const resultModal = document.getElementById('resultModal');
    const modalWPM = document.getElementById('modalWPM');
    const modalAccuracy = document.getElementById('modalAccuracy');
    const modalTime = document.getElementById('modalTime');
    const restartModalBtn = document.getElementById('restartModalBtn');

    let currentText = [];
    let currentIndex = 0;
    let startTime = null;
    let correctChars = 0;
    let totalChars = 0;
    let timerInterval = null;
    let timeLeft = 60;

    function generateText() {
      const selectedLanguage = language.value;
      currentText = [];
      for (let i = 0; i < 50; i++) {
        const randomWord = words[selectedLanguage][Math.floor(Math.random() * words[selectedLanguage].length)];
        currentText.push(randomWord);
      }
      typingText.innerHTML = currentText.map((word, i) => `<span id="word-${i}">${word}</span>`).join(' ');
      document.getElementById(`word-${currentIndex}`).classList.add('current');
      if (selectedLanguage == 'uz'){
          document.getElementById('title-typing').innerHTML = "Tezlik Testi";
          document.getElementById('option_lang').innerHTML = "soniya";
       }
       else{
        document.getElementById('title-typing').innerHTML = "Typing Test";
        document.getElementById('option_lang').innerHTML = "seconds";

       }
      typingInput.value = '';
    }

    function startTimer() {
      if (!startTime) {
        startTime = new Date();
        timeLeft = parseInt(timeMode.value);
        updateTimer();
      }
    }

    function updateTimer() {
      if (startTime) {
        const currentTime = new Date();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        timeLeft = parseInt(timeMode.value) - elapsed;
        timeDisplay.textContent = `${timeLeft}s`;
        updateWPM(elapsed);
        if (timeLeft <= 0) {
          endTest();
          return;
        }
        timerInterval = setTimeout(updateTimer, 1000);
      }
    }

    function updateWPM(elapsed) {
      if (elapsed > 0) {
        const words = correctChars / 5;
        const wpm = Math.round((words / elapsed) * 60);
        wpmDisplay.textContent = wpm;
      }
    }

    function updateAccuracy() {
      if (totalChars > 0) {
        const accuracy = Math.round((correctChars / totalChars) * 100);
        accuracyDisplay.textContent = accuracy;
      }
    }

    function endTest() {
      clearTimeout(timerInterval);
      startTime = null;
      typingInput.disabled = true;
      const elapsed = parseInt(timeMode.value);
      const wpm = Math.round((correctChars / 5 / elapsed) * 60) || 0;
      const accuracy = Math.round((correctChars / totalChars) * 100) || 100;

      // Natijalarni result.html ga URL parametrlari orqali yuborish
      window.location.href = `result.html?wpm=${wpm}&accuracy=${accuracy}&time=${elapsed}`;
    }

    function resetTest() {
      clearTimeout(timerInterval);
      currentText = [];
      currentIndex = 0;
      startTime = null;
      correctChars = 0;
      totalChars = 0;
      typingInput.value = '';
      timeDisplay.textContent = `${parseInt(timeMode.value)}s`;
      wpmDisplay.textContent = '0';
      accuracyDisplay.textContent = '100';
      typingInput.disabled = false;
      generateText();
      typingInput.focus();
    }

    typingInput.addEventListener('input', () => {
      if (!startTime) startTimer();
      const input = typingInput.value.trim();
      const currentWord = document.getElementById(`word-${currentIndex}`);

      // To‘liq so‘zni qayta tiklash
      currentWord.innerHTML = currentText[currentIndex];

      // Yozilgan qismni ajratib ko‘rsatish
      if (input.length <= currentText[currentIndex].length) {
        const typed = currentText[currentIndex].substring(0, input.length);
        const remaining = currentText[currentIndex].substring(input.length);
        let typedClass = input === typed ? 'correct' : 'incorrect';
        currentWord.innerHTML = `<span class="${typedClass}">${typed}</span><span>${remaining}</span>`;
      } else {
        currentWord.innerHTML = `<span class="incorrect">${currentText[currentIndex]}</span>`;
      }
      updateAccuracy();
    });

    typingInput.addEventListener('keydown', (e) => {
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        const input = typingInput.value.trim();
        const currentWord = document.getElementById(`word-${currentIndex}`);
        const nextWord = currentIndex + 1 < currentText.length ? document.getElementById(`word-${currentIndex + 1}`) : null;

        if (input === currentText[currentIndex]) {
          currentWord.classList.remove('current', 'incorrect');
          currentWord.classList.add('correct');
          currentWord.innerHTML = currentText[currentIndex]; // Oddiy matnga qaytarish
          correctChars += input.length;
          totalChars += input.length;
          currentIndex++;
          typingInput.value = '';
          if (nextWord) {
            nextWord.classList.add('current');
          } else if (timeLeft > 0) {
            // So‘zlar tugasa va vaqt qolsa, yangi so‘zlar generatsiya qilish
            currentIndex = 0;
            generateText();
          } else {
            endTest();
          }
        } else {
          currentWord.classList.add('incorrect');
          currentWord.innerHTML = currentText[currentIndex]; // Oddiy matnga qaytarish
          totalChars += input.length;
          typingInput.value = '';
        }
        updateAccuracy();
      }
    });

    restartModalBtn.addEventListener('click', () => {
      resultModal.style.display = 'none';
      resetTest();
    });

    restartBtn.addEventListener('click', () => {
      resetTest();
    });

    timeMode.addEventListener('change', () => {
      resetTest();
    });

    language.addEventListener('change', () => {
      resetTest();
    });

    // Dasturni ishga tushirish
    generateText();
    typingInput.focus();









