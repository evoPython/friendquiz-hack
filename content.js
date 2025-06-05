
(() => {
  let correctImages = new Set();

  function showError(message) {
    const panel = document.createElement("div");
    panel.className = "fq-error";
    panel.innerText = `❌ ${message}`;
    document.body.appendChild(panel);
    setTimeout(() => panel.remove(), 10000);
  }

  function showDebug(message) {
    const log = document.createElement("div");
    log.className = "fq-debug";
    log.innerText = `💡 ${message}`;
    document.body.appendChild(log);
    setTimeout(() => log.remove(), 6000);
  }

  function addToggleButton() {
    const btn = document.createElement("button");
    btn.innerText = "🔍 Highlight Answers";
    btn.className = "fq-btn";
    btn.onclick = highlightAnswers;
    document.body.appendChild(btn);
  }

  async function fetchAnswers() {
    const quizCode = window.location.href.match(/quiz\/([^?]+)/)?.[1];
    if (!quizCode) throw new Error("Could not parse quiz code");

    const res = await fetch(`https://friendquiz.me/api/quiz.php?code=${quizCode}`);
    if (!res.ok) throw new Error("Failed to fetch quiz data");

    const data = await res.json();
    const correctOptionIds = new Set(data.values.map(Number));

    for (const question of data.questions) {
      for (const option of question.options) {
        if (correctOptionIds.has(option.option_id) && option.image) {
          correctImages.add(option.image);
        }
      }
    }

    showDebug(`✅ Loaded ${correctImages.size} correct image URLs`);
  }

  function highlightCorrectOptions() {
    let count = 0;
    const imgs = document.querySelectorAll("img");

    imgs.forEach(img => {
      if (correctImages.has(img.src)) {
        const li = img.closest("li");
        if (li && !li.classList.contains("fq-correct")) {
          li.classList.add("fq-correct");
          count++;
        }
      }
    });

    if (count === 0) showDebug("No matching images found in DOM");
    else showDebug(`✅ Highlighted ${count} correct answers`);
  }

  
  async function highlightAnswers() {
  try {
    await fetchAnswers();
  } catch (err) {
    return showError(err.message);
  }

  highlightCorrectOptions();

  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        highlightCorrectOptions();
      }, 200); 
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => observer.disconnect(), 20000);
  }

  addToggleButton();
})();
