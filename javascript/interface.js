let positiveHistory = [];
let negativeHistory = [];
let savedPrompts = [];
let lastSaved = null;

function loadHistory() {
  if (localStorage.getItem("sd-better-styles-last-saved") === null) {
    localStorage.setItem("sd-better-styles-last-saved", Date.now());
    return;
  }

  const positiveHistory = JSON.parse(localStorage.getItem("sd-better-styles-positive-history"));
  const negativeHistory = JSON.parse(localStorage.getItem("sd-better-styles-positive-history"));
  const savedPrompts = JSON.parse(localStorage.getItem("sd-better-styles-saved-prompts"));
  positiveHistory.forEach((prompt) => {
    console.log("Load history positive", prompt);
    createHistoryItem(prompt, true);
  });

  negativeHistory.forEach((prompt) => {
    createHistoryItem(prompt, false);
  });
}

function localStorageSaveAll() {
  localStorage.setItem("sd-better-styles-positive-history", JSON.stringify(positiveHistory));
  localStorage.setItem("sd-better-styles-negative-history", JSON.stringify(negativeHistory));
  localStorage.setItem("sd-better-styles-saved-prompts", JSON.stringify(savedPrompts));
  localStorage.setItem("sd-better-styles-last-saved", Date.now());
}

function createHistoryItem(prompt, isPositive) {
  let historyTarget = els.positiveHistoryList;
  if (isPositive) {
    if (positiveHistory.indexOf(prompt) !== -1) return;
    positiveHistory.push(prompt);
    localStorageSaveAll();
  } else {
    if (negativeHistory.indexOf(prompt) !== -1) return;
    historyTarget = els.negativeHistoryList;
    negativeHistory.push(prompt);
    localStorageSaveAll();
  }

  var historyItem = document.createElement("option");
  historyItem.text = prompt;
  historyItem.value = prompt;
  historyTarget.appendChild(historyItem);
}

function addHistoryItem(isPositive) {
  let historyTarget = els.txt2ImgPrompt;
  let historyValue = els.positiveHistoryList.value;

  if (!txt2ImgActive) {
    if (isPositive) historyTarget = els.img2ImgPrompt;
    else {
      historyTarget = els.img2ImgNegPrompt;
      historyValue = negativeHistoryList.value;
    }
  } else if (!isPositive) {
    historyTarget = els.txt2ImgNegPrompt;
    historyValue = els.negativeHistoryList.value;
  }

  historyTarget.value = historyValue;
}

function removeHistoryItem(isPositive) {
  if (isPositive) {
    positiveHistory.splice(positiveHistory.indexOf(els.positiveHistoryList.value), 1);
    els.positiveHistoryList.remove(els.positiveHistoryList.value);
  } else {
    negativeHistory.splice(negativeHistory.indexOf(els.negativeHistoryList.value), 1);
    els.negativeHistoryList.remove(els.negativeHistoryList.value);
  }
  localStorageSaveAll();
}

function saveHistoryItem(isPositive) {}

function clearHistory(isPositive) {
  if (!confirm(`Are you sure you want to clear the ${isPositive ? "positive" : "negative"} prompt history?`)) return;

  historyTarget = isPositive ? els.positiveHistoryList : els.negativeHistoryList;
  if (isPositive) positiveHistory = [];
  else negativeHistory = [];
  while (historyTarget.firstChild) {
    historyTarget.removeChild(historyTarget.firstChild);
  }
  localStorageSaveAll();
}

function importHistory(isPositive) {}

function exportHistory(isPositive) {}
