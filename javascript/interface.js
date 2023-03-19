window.sdBetterStylesInterface = {
  positiveHistory: [],
  negativeHistory: [],
  savedPrompts: {},
  lastSaved: null,

  toggleHistory: function () {
    if (sdBetterStylesSetup.els.historyContainer.classList.contains("hidden")) {
      sdBetterStylesSetup.els.historyContainer.classList.remove("hidden");
      gradioApp().querySelector("#history-header-expansion-indicator").classList.remove("rotate-90");
    } else {
      sdBetterStylesSetup.els.historyContainer.classList.add("hidden");
      gradioApp().querySelector("#history-header-expansion-indicator").classList.add("rotate-90");
    }
  },

  toggleSaved: function () {
    if (sdBetterStylesSetup.els.savedContainer.classList.contains("hidden")) {
      sdBetterStylesSetup.els.savedContainer.classList.remove("hidden");
      gradioApp().querySelector("#saved-header-expansion-indicator").classList.remove("rotate-90");
    } else {
      sdBetterStylesSetup.els.savedContainer.classList.add("hidden");
      gradioApp().querySelector("#saved-header-expansion-indicator").classList.add("rotate-90");
    }
  },

  loadHistory: function () {
    if (localStorage.getItem("sd-better-styles-last-saved") === null) {
      localStorage.setItem("sd-better-styles-last-saved", Date.now());
      return;
    }

    const positiveHistory = JSON.parse(localStorage.getItem("sd-better-styles-positive-history"));
    const negativeHistory = JSON.parse(localStorage.getItem("sd-better-styles-negative-history"));
    const savedPromptData = JSON.parse(localStorage.getItem("sd-better-styles-saved-prompts"));

    positiveHistory.forEach((prompt) => {
      console.log("Load history positive", prompt);
      sdBetterStylesInterface.createHistoryItem(prompt, true);
    });

    negativeHistory.forEach((prompt) => {
      sdBetterStylesInterface.createHistoryItem(prompt, false);
    });

    for (const id in savedPromptData) {
      if (savedPromptData.hasOwnProperty(id)) {
        sdBetterStylesInterface.createSavedItem(
          savedPromptData[id].name,
          savedPromptData[id].positive,
          savedPromptData[id].negative
        );
      }
    }
  },

  localStorageSaveAll: function () {
    localStorage.setItem("sd-better-styles-positive-history", JSON.stringify(sdBetterStylesInterface.positiveHistory));
    localStorage.setItem("sd-better-styles-negative-history", JSON.stringify(sdBetterStylesInterface.negativeHistory));
    localStorage.setItem("sd-better-styles-saved-prompts", JSON.stringify(sdBetterStylesInterface.savedPrompts));
    localStorage.setItem("sd-better-styles-last-saved", Date.now());
  },

  createHistoryItem: function (prompt, isPositive) {
    let historyTarget = sdBetterStylesSetup.els.positiveHistoryList;
    if (isPositive) {
      if (sdBetterStylesInterface.positiveHistory.indexOf(prompt) !== -1) return;
      sdBetterStylesInterface.positiveHistory.push(prompt);
      sdBetterStylesInterface.localStorageSaveAll();
    } else {
      if (sdBetterStylesInterface.negativeHistory.indexOf(prompt) !== -1) return;
      historyTarget = sdBetterStylesSetup.els.negativeHistoryList;
      sdBetterStylesInterface.negativeHistory.push(prompt);
      sdBetterStylesInterface.localStorageSaveAll();
    }

    var historyItem = document.createElement("option");
    historyItem.text = prompt;
    historyItem.value = prompt;
    historyTarget.appendChild(historyItem);
  },

  createSavedItem: function (name, positivePrompt, negativePrompt) {
    if (typeof sdBetterStylesInterface.savedPrompts[name] !== "undefined") return;
    const id = Date.now() + Math.floor(Math.random(Date.now()) * 10);
    sdBetterStylesInterface.savedPrompts[id] = {
      name: name,
      positive: positivePrompt,
      negative: negativePrompt,
    };
    sdBetterStylesInterface.localStorageSaveAll();
    var savedItem = document.createElement("option");
    savedItem.text = name;
    savedItem.value = id;
    sdBetterStylesSetup.els.savedPromptsList.appendChild(savedItem);
  },

  clearSaved: function () {
    if (!confirm(`Are you sure you want to clear the list of saved prompts?`)) return;
    while (sdBetterStylesSetup.els.savedPromptsList.firstChild) {
      sdBetterStylesSetup.els.savedPromptsList.removeChild(sdBetterStylesSetup.els.savedPromptsList.firstChild);
    }
    sdBetterStylesInterface.savedPrompts = {};
    sdBetterStylesInterface.localStorageSaveAll();
    sdBetterStylesInterface.displaySavedPrompt();
  },

  importSaved: function (json) {
    while (sdBetterStylesSetup.els.savedPromptsList.firstChild) {
      sdBetterStylesSetup.els.savedPromptsList.removeChild(sdBetterStylesSetup.els.savedPromptsList.firstChild);
    }
    sdBetterStylesInterface.savedPrompts = {};
    for (const id in json) {
      if (json.hasOwnProperty(id)) {
        sdBetterStylesInterface.createSavedItem(json[id].name, json[id].positive, json[id].negative);
      }
    }
  },

  exportSaved: function () {
    const filename = window.prompt(`Please enter a name for the saved prompts:`, "saved-prompts");
    const blob = new Blob([JSON.stringify(sdBetterStylesInterface.savedPrompts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename + ".prompts.json";
    link.click();
    URL.revokeObjectURL(url);
  },

  displaySavedPrompt: function () {
    if (sdBetterStylesSetup.els.savedPromptsList.selectedIndex === -1) {
      sdBetterStylesSetup.els.savedPositiveInput.value = "";
      sdBetterStylesSetup.els.savedNegativeInput.value = "";
    } else {
      sdBetterStylesSetup.els.savedPositiveInput.value =
        sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].positive;
      sdBetterStylesSetup.els.savedNegativeInput.value =
        sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].negative;
    }
  },

  checkSavedInputs: function () {
    if (sdBetterStylesSetup.els.savedPromptsList.selectedIndex === -1) return;
    let changed = false;
    if (
      sdBetterStylesSetup.els.savedPositiveInput.value !==
      sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].positive
    ) {
      changed = true;
    }
    if (
      sdBetterStylesSetup.els.savedNegativeInput.value !==
      sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].negative
    ) {
      changed = true;
    }
    if (changed) sdBetterStylesSetup.els.savedUpdate.classList.remove("sd-better-styles-hide-btn");
    else sdBetterStylesSetup.els.savedUpdate.classList.add("sd-better-styles-hide-btn");
  },

  updateSavedPrompt: function () {
    sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].positive =
      sdBetterStylesSetup.els.savedPositiveInput.value;
    sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].negative =
      sdBetterStylesSetup.els.savedNegativeInput.value;
    sdBetterStylesSetup.els.savedUpdate.classList.add("sd-better-styles-hide-btn");
    sdBetterStylesInterface.localStorageSaveAll();
  },

  renameSavedPrompt: function () {
    if (sdBetterStylesSetup.els.savedPromptsList.selectedIndex === -1) return;
    const name = window.prompt(
      "Please enter a new name for the saved prompt:",
      sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].name
    );
    if (name === null) return;
    if (name !== sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].name) {
      sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].name = name;
      sdBetterStylesSetup.els.savedPromptsList.options[sdBetterStylesSetup.els.savedPromptsList.selectedIndex].text =
        name;
      sdBetterStylesInterface.localStorageSaveAll();
    }
  },

  removeSavedPrompt: function () {
    if (sdBetterStylesSetup.els.savedPromptsList.selectedIndex === -1) return;
    if (
      !confirm(
        `Are you sure you want to remove the "${
          sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].name
        }" prompt?`
      )
    )
      return;
    delete sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value];
    sdBetterStylesSetup.els.savedPromptsList.options[sdBetterStylesSetup.els.savedPromptsList.selectedIndex].remove();
    sdBetterStylesInterface.localStorageSaveAll();
    sdBetterStylesInterface.displaySavedPrompt();
  },

  applySavedPrompt: function (option) {
    if (sdBetterStylesSetup.els.savedPromptsList.selectedIndex === -1) return;
    let positive = "";
    let negative = "";
    if (option === "both") {
      positive = sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].positive;
      negative = sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].negative;
    } else if (option === "positive")
      positive = sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].positive;
    else if (option === "negative")
      negative = sdBetterStylesInterface.savedPrompts[sdBetterStylesSetup.els.savedPromptsList.value].negative;

    if (sdBetterStylesSetup.txt2ImgActive) {
      if (positive.length)
        sdBetterStylesSetup.els.txt2ImgPrompt.value = (
          sdBetterStylesSetup.els.txt2ImgPrompt.value.trim() +
          " " +
          positive
        ).trim();
      if (negative.length)
        sdBetterStylesSetup.els.txt2ImgNegPrompt.value = (
          sdBetterStylesSetup.els.txt2ImgNegPrompt.value.trim() +
          " " +
          negative
        ).trim();
    } else {
      if (positive.length)
        sdBetterStylesSetup.els.img2ImgPrompt.value = (
          sdBetterStylesSetup.els.img2ImgPrompt.value.trim() +
          " " +
          positive
        ).trim();
      if (negative.length)
        sdBetterStylesSetup.els.img2ImgNegPrompt.value = (
          sdBetterStylesSetup.els.img2ImgNegPrompt.value.trim() +
          " " +
          negative
        ).trim();
    }
  },

  addHistoryItem: function (isPositive) {
    let historyTarget = sdBetterStylesSetup.els.txt2ImgPrompt;
    let historyValue = sdBetterStylesSetup.els.positiveHistoryList.value;

    if (!sdBetterStylesSetup.txt2ImgActive) {
      if (isPositive) historyTarget = sdBetterStylesSetup.els.img2ImgPrompt;
      else {
        historyTarget = sdBetterStylesSetup.els.img2ImgNegPrompt;
        historyValue = negativeHistoryList.value;
      }
    } else if (!isPositive) {
      historyTarget = sdBetterStylesSetup.els.txt2ImgNegPrompt;
      historyValue = sdBetterStylesSetup.els.negativeHistoryList.value;
    }

    if (historyValue === "") return;

    historyTarget.value = historyValue;
  },

  removeHistoryItem: function (isPositive) {
    if (isPositive) {
      if (sdBetterStylesSetup.els.positiveHistoryList.selectedIndex === -1) return;
      sdBetterStylesInterface.positiveHistory.splice(
        sdBetterStylesInterface.positiveHistory.indexOf(sdBetterStylesSetup.els.positiveHistoryList.value),
        1
      );
      sdBetterStylesSetup.els.positiveHistoryList.options[
        sdBetterStylesSetup.els.positiveHistoryList.selectedIndex
      ].remove();
    } else {
      if (sdBetterStylesSetup.els.negativeHistoryList.selectedIndex === -1) return;
      sdBetterStylesInterface.negativeHistory.splice(
        sdBetterStylesInterface.negativeHistory.indexOf(sdBetterStylesSetup.els.negativeHistoryList.value),
        1
      );
      sdBetterStylesSetup.els.negativeHistoryList.options[
        sdBetterStylesSetup.els.negativeHistoryList.selectedIndex
      ].remove();
    }
    sdBetterStylesInterface.localStorageSaveAll();
  },

  saveHistoryItem: function (isPositive) {
    let positive = "";
    let negative = "";
    if (isPositive) positive = sdBetterStylesSetup.els.positiveHistoryList.value;
    else negative = sdBetterStylesSetup.els.negativeHistoryList.value;
    if (positive === "" && negative === "") return;
    const name = window.prompt(
      `Please enter a name for the saved ${isPositive ? "positive" : "negative"} history prompt:`,
      "New saved prompt"
    );
    if (name === null) return;
    sdBetterStylesInterface.createSavedItem(name, positive, negative);
  },

  clearHistory: function (isPositive) {
    if (!confirm(`Are you sure you want to clear the ${isPositive ? "positive" : "negative"} prompt history?`)) return;

    historyTarget = isPositive
      ? sdBetterStylesSetup.els.positiveHistoryList
      : sdBetterStylesSetup.els.negativeHistoryList;
    if (isPositive) sdBetterStylesInterface.positiveHistory = [];
    else sdBetterStylesInterface.negativeHistory = [];
    while (historyTarget.firstChild) {
      historyTarget.removeChild(historyTarget.firstChild);
    }
    sdBetterStylesInterface.localStorageSaveAll();
  },

  saveCurrent: function () {
    let positive = "";
    let negative = "";
    if (sdBetterStylesSetup.txt2ImgActive) {
      positive = sdBetterStylesSetup.els.txt2ImgPrompt.value;
      negative = sdBetterStylesSetup.els.txt2ImgNegPrompt.value;
    } else {
      positive = sdBetterStylesSetup.els.img2ImgPrompt.value;
      negative = sdBetterStylesSetup.els.img2ImgNegPrompt;
    }
    if (positive === "" && negative === "") return;
    const name = window.prompt(
      `Please enter a name for the new saved ${sdBetterStylesSetup.txt2ImgActive ? "txt2img" : "img2img"} prompt:`,
      "New saved prompt"
    );
    if (name === null) return;
    sdBetterStylesInterface.createSavedItem(name, positive, negative);
  },

  saveSelected: function () {
    const positive = sdBetterStylesSetup.els.positiveHistoryList.value;
    const negative = sdBetterStylesSetup.els.negativeHistoryList.value;
    if (positive === "" && negative === "") return;
    const name = window.prompt(`Please enter a name for the saved history prompt:`, "New saved prompt");
    if (name === null) return;
    sdBetterStylesInterface.createSavedItem(name, positive, negative);
  },

  importHistory: function (data, isPositive) {
    if (isPositive) sdBetterStylesInterface.positiveHistory = [];
    else sdBetterStylesInterface.negativeHistory = [];
    data.forEach((prompt) => {
      sdBetterStylesInterface.createHistoryItem(prompt, isPositive);
    });
  },

  exportHistory: function (isPositive) {
    const filename = window.prompt(
      `Please enter a name for the ${isPositive ? "positive" : "negative"} prompt history file:`,
      isPositive ? "positive" : "negative"
    );
    const blob = new Blob(
      [
        JSON.stringify(
          isPositive ? sdBetterStylesInterface.positiveHistory : sdBetterStylesInterface.negativeHistory,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename + ".prompt-history.json";
    link.click();
    URL.revokeObjectURL(url);
  },
};
