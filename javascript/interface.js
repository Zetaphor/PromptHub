let positiveHistory = [];
let negativeHistory = [];
let savedPrompts = {};
let lastSaved = null;

function toggleHistory() {
  if (els.historyContainer.classList.contains("hidden")) {
    els.historyContainer.classList.remove("hidden");
    gradioApp().querySelector("#history-header-expansion-indicator").classList.remove("rotate-90");
  } else {
    els.historyContainer.classList.add("hidden");
    gradioApp().querySelector("#history-header-expansion-indicator").classList.add("rotate-90");
  }
}

function toggleSaved() {
  if (els.savedContainer.classList.contains("hidden")) {
    els.savedContainer.classList.remove("hidden");
    gradioApp().querySelector("#saved-header-expansion-indicator").classList.remove("rotate-90");
  } else {
    els.savedContainer.classList.add("hidden");
    gradioApp().querySelector("#saved-header-expansion-indicator").classList.add("rotate-90");
  }
}

function loadHistory() {
  if (localStorage.getItem("sd-better-styles-last-saved") === null) {
    localStorage.setItem("sd-better-styles-last-saved", Date.now());
    return;
  }

  positiveHistory = JSON.parse(localStorage.getItem("sd-better-styles-positive-history"));
  negativeHistory = JSON.parse(localStorage.getItem("sd-better-styles-positive-history"));
  const savedPromptData = JSON.parse(localStorage.getItem("sd-better-styles-saved-prompts"));
  positiveHistory.forEach((prompt) => {
    console.log("Load history positive", prompt);
    createHistoryItem(prompt, true);
  });

  negativeHistory.forEach((prompt) => {
    createHistoryItem(prompt, false);
  });

  for (const id in savedPromptData) {
    if (savedPromptData.hasOwnProperty(id)) {
      createSavedItem(savedPromptData[id].name, savedPromptData[id].positive, savedPromptData[id].negative);
    }
  }
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

function createSavedItem(name, positivePrompt, negativePrompt) {
  if (typeof savedPrompts[name] !== "undefined") return;
  const id = Date.now() + Math.floor(Math.random(Date.now()) * 10);
  savedPrompts[id] = {
    name: name,
    positive: positivePrompt,
    negative: negativePrompt,
  };
  localStorageSaveAll();
  var savedItem = document.createElement("option");
  savedItem.text = name;
  savedItem.value = id;
  els.savedPromptsList.appendChild(savedItem);
}

function clearSaved() {
  if (!confirm(`Are you sure you want to clear the list of saved prompts?`)) return;
  while (els.savedPromptsList.firstChild) {
    els.savedPromptsList.removeChild(els.savedPromptsList.firstChild);
  }
  savedPrompts = {};
  localStorageSaveAll();
  displaySavedPrompt();
}

function importSaved(json) {
  while (els.savedPromptsList.firstChild) {
    els.savedPromptsList.removeChild(els.savedPromptsList.firstChild);
  }
  savedPrompts = {};
  for (const id in json) {
    if (json.hasOwnProperty(id)) {
      createSavedItem(json[id].name, json[id].positive, json[id].negative);
    }
  }
}

function exportSaved() {
  const filename = window.prompt(`Please enter a name for the saved prompts:`, "saved-prompts");
  const blob = new Blob([JSON.stringify(savedPrompts, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename + ".prompts.json";
  link.click();
  URL.revokeObjectURL(url);
}

function displaySavedPrompt() {
  if (els.savedPromptsList.selectedIndex === -1) {
    els.savedPositiveInput.value = "";
    els.savedNegativeInput.value = "";
  } else {
    els.savedPositiveInput.value = savedPrompts[els.savedPromptsList.value].positive;
    els.savedNegativeInput.value = savedPrompts[els.savedPromptsList.value].negative;
  }
}

function checkSavedInputs() {
  if (els.savedPromptsList.selectedIndex === -1) return;
  let changed = false;
  if (els.savedPositiveInput.value !== savedPrompts[els.savedPromptsList.value].positive) {
    changed = true;
  }
  if (els.savedNegativeInput.value !== savedPrompts[els.savedPromptsList.value].negative) {
    changed = true;
  }
  if (changed) els.savedUpdate.classList.remove("sd-better-styles-hide-btn");
  else els.savedUpdate.classList.add("sd-better-styles-hide-btn");
}

function updateSavedPrompt() {
  savedPrompts[els.savedPromptsList.value].positive = els.savedPositiveInput.value;
  savedPrompts[els.savedPromptsList.value].negative = els.savedNegativeInput.value;
  els.savedUpdate.classList.add("sd-better-styles-hide-btn");
  localStorageSaveAll();
}

function renameSavedPrompt() {
  if (els.savedPromptsList.selectedIndex === -1) return;
  const name = window.prompt(
    "Please enter a new name for the saved prompt:",
    savedPrompts[els.savedPromptsList.value].name
  );
  if (name === null) return;
  if (name !== savedPrompts[els.savedPromptsList.value].name) {
    savedPrompts[els.savedPromptsList.value].name = name;
    els.savedPromptsList.options[els.savedPromptsList.selectedIndex].text = name;
    localStorageSaveAll();
  }
}

function removeSavedPrompt() {
  if (els.savedPromptsList.selectedIndex === -1) return;
  if (!confirm(`Are you sure you want to remove the "${savedPrompts[els.savedPromptsList.value].name}" prompt?`))
    return;
  delete savedPrompts[els.savedPromptsList.value];
  els.savedPromptsList.options[els.savedPromptsList.selectedIndex].remove();
  localStorageSaveAll();
  displaySavedPrompt();
}

function applySavedPrompt(option) {
  if (els.savedPromptsList.selectedIndex === -1) return;
  let positive = "";
  let negative = "";
  if (option === "both") {
    positive = savedPrompts[els.savedPromptsList.value].positive;
    negative = savedPrompts[els.savedPromptsList.value].negative;
  } else if (option === "positive") positive = savedPrompts[els.savedPromptsList.value].positive;
  else if (option === "negative") negative = savedPrompts[els.savedPromptsList.value].negative;

  console.log("Apply saved", option, positive, negative);

  if (txt2ImgActive) {
    if (positive.length) els.txt2ImgPrompt.value = (els.txt2ImgPrompt.value.trim() + " " + positive).trim();
    if (negative.length) els.txt2ImgNegPrompt.value = (els.txt2ImgNegPrompt.value.trim() + " " + negative).trim();
  } else {
    if (positive.length) els.img2ImgPrompt.value = (els.img2ImgPrompt.value.trim() + " " + positive).trim();
    if (negative.length) els.img2ImgNegPrompt.value = (els.img2ImgNegPrompt.value.trim() + " " + negative).trim();
  }
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

  if (historyValue === "") return;

  historyTarget.value = historyValue;
}

function removeHistoryItem(isPositive) {
  if (isPositive) {
    if (els.positiveHistoryList.selectedIndex === -1) return;
    positiveHistory.splice(positiveHistory.indexOf(els.positiveHistoryList.value), 1);
    els.positiveHistoryList.options[els.positiveHistoryList.selectedIndex].remove();
  } else {
    if (els.negativeHistoryList.selectedIndex === -1) return;
    negativeHistory.splice(negativeHistory.indexOf(els.negativeHistoryList.value), 1);
    els.negativeHistoryList.options[els.negativeHistoryList.selectedIndex].remove();
  }
  localStorageSaveAll();
}

function saveHistoryItem(isPositive) {
  let positive = "";
  let negative = "";
  if (isPositive) positive = els.positiveHistoryList.value;
  else negative = els.negativeHistoryList.value;
  if (positive === "" && negative === "") return;
  const name = window.prompt(
    `Please enter a name for the saved ${isPositive ? "positive" : "negative"} history prompt:`,
    "New saved prompt"
  );
  if (name === null) return;
  createSavedItem(name, positive, negative);
}

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

function saveCurrent() {
  let positive = "";
  let negative = "";
  if (txt2ImgActive) {
    positive = els.txt2ImgPrompt.value;
    negative = els.txt2ImgNegPrompt.value;
  } else {
    positive = els.img2ImgPrompt.value;
    negative = els.img2ImgNegPrompt;
  }
  if (positive === "" && negative === "") return;
  const name = window.prompt(
    `Please enter a name for the new saved ${txt2ImgActive ? "txt2img" : "img2img"} prompt:`,
    "New saved prompt"
  );
  if (name === null) return;
  createSavedItem(name, positive, negative);
}

function saveSelected() {
  const positive = els.positiveHistoryList.value;
  const negative = els.negativeHistoryList.value;
  if (positive === "" && negative === "") return;
  const name = window.prompt(`Please enter a name for the saved history prompt:`, "New saved prompt");
  if (name === null) return;
  createSavedItem(name, positive, negative);
}

function importHistory(data, isPositive) {
  if (isPositive) positiveHistory = [];
  else negativeHistory = [];
  data.forEach((prompt) => {
    createHistoryItem(prompt, isPositive);
  });
}

function exportHistory(isPositive) {
  const filename = window.prompt(
    `Please enter a name for the ${isPositive ? "positive" : "negative"} prompt history file:`,
    isPositive ? "positive" : "negative"
  );
  const blob = new Blob([JSON.stringify(isPositive ? positiveHistory : negativeHistory, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename + ".prompt-history.json";
  link.click();
  URL.revokeObjectURL(url);
}
