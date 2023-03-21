window.promptHubInterface = {
  positiveHistory: [],
  negativeHistory: [],
  savedPrompts: {},
  lastSaved: null,

  toggleHistory: function () {
    if (promptHubSetup.els.historyContainer.classList.contains("hidden")) {
      promptHubSetup.els.historyContainer.classList.remove("hidden");
      gradioApp().querySelector("#history-header-expansion-indicator").classList.remove("rotate-90");
    } else {
      promptHubSetup.els.historyContainer.classList.add("hidden");
      gradioApp().querySelector("#history-header-expansion-indicator").classList.add("rotate-90");
    }
  },

  toggleSaved: function () {
    if (promptHubSetup.els.savedContainer.classList.contains("hidden")) {
      promptHubSetup.els.savedContainer.classList.remove("hidden");
      gradioApp().querySelector("#saved-header-expansion-indicator").classList.remove("rotate-90");
    } else {
      promptHubSetup.els.savedContainer.classList.add("hidden");
      gradioApp().querySelector("#saved-header-expansion-indicator").classList.add("rotate-90");
    }
  },

  loadHistory: function () {
    if (localStorage.getItem("promptHub-last-saved") === null) {
      localStorage.setItem("promptHub-last-saved", Date.now());
      return;
    }

    const positiveHistory = JSON.parse(localStorage.getItem("promptHub-positive-history"));
    const negativeHistory = JSON.parse(localStorage.getItem("promptHub-negative-history"));
    const savedPromptData = JSON.parse(localStorage.getItem("promptHub-saved-prompts"));

    if (positiveHistory !== null) {
      positiveHistory.forEach((prompt) => {
        promptHubInterface.createHistoryItem(prompt, true);
      });
    }

    if (negativeHistory !== null) {
      negativeHistory.forEach((prompt) => {
        promptHubInterface.createHistoryItem(prompt, false);
      });
    }

    if (savedPromptData !== null) {
      for (const id in savedPromptData) {
        if (savedPromptData.hasOwnProperty(id)) {
          promptHubInterface.createSavedItem(
            savedPromptData[id].name,
            savedPromptData[id].positive,
            savedPromptData[id].negative
          );
        }
      }
    }
  },

  localStorageSaveAll: function () {
    localStorage.setItem("promptHub-positive-history", JSON.stringify(promptHubInterface.positiveHistory));
    localStorage.setItem("promptHub-negative-history", JSON.stringify(promptHubInterface.negativeHistory));
    localStorage.setItem("promptHub-saved-prompts", JSON.stringify(promptHubInterface.savedPrompts));
    localStorage.setItem("promptHub-last-saved", Date.now());
  },

  generationRun: function () {
    if (promptHubSetup.txt2ImgActive) {
      promptHubInterface.createHistoryItem(promptHubSetup.els.txt2ImgPrompt.value, true);
      promptHubInterface.createHistoryItem(promptHubSetup.els.txt2ImgNegPrompt.value, false);
    } else {
      promptHubInterface.createHistoryItem(promptHubSetup.els.img2ImgPrompt.value, true);
      promptHubInterface.createHistoryItem(promptHubSetup.els.img2ImgNegPrompt.value, false);
    }
  },

  createHistoryItem: function (prompt, isPositive) {
    let historyTarget = promptHubSetup.els.positiveHistoryList;
    if (isPositive) {
      if (promptHubInterface.positiveHistory.indexOf(prompt) !== -1) return;
      promptHubInterface.positiveHistory.push(prompt);
      promptHubInterface.localStorageSaveAll();
    } else {
      if (promptHubInterface.negativeHistory.indexOf(prompt) !== -1) return;
      historyTarget = promptHubSetup.els.negativeHistoryList;
      promptHubInterface.negativeHistory.push(prompt);
      promptHubInterface.localStorageSaveAll();
    }

    var historyItem = document.createElement("option");
    historyItem.text = prompt;
    historyItem.value = prompt;
    historyTarget.appendChild(historyItem);
  },

  createSavedItem: function (name, positivePrompt, negativePrompt) {
    if (typeof promptHubInterface.savedPrompts[name] !== "undefined") return;
    const id = Date.now() + Math.floor(Math.random(Date.now()) * 10);
    promptHubInterface.savedPrompts[id] = {
      name: name,
      positive: positivePrompt,
      negative: negativePrompt,
    };
    promptHubInterface.localStorageSaveAll();
    var savedItem = document.createElement("option");
    savedItem.text = name;
    savedItem.value = id;
    promptHubSetup.els.savedPromptsList.appendChild(savedItem);
  },

  clearSaved: function () {
    if (!confirm(`Are you sure you want to clear the list of saved prompts?`)) return;
    while (promptHubSetup.els.savedPromptsList.firstChild) {
      promptHubSetup.els.savedPromptsList.removeChild(promptHubSetup.els.savedPromptsList.firstChild);
    }
    promptHubInterface.savedPrompts = {};
    promptHubInterface.localStorageSaveAll();
    promptHubInterface.displaySavedPrompt();
  },

  importSaved: function (json) {
    while (promptHubSetup.els.savedPromptsList.firstChild) {
      promptHubSetup.els.savedPromptsList.removeChild(promptHubSetup.els.savedPromptsList.firstChild);
    }
    promptHubInterface.savedPrompts = {};
    for (const id in json) {
      if (json.hasOwnProperty(id)) {
        promptHubInterface.createSavedItem(json[id].name, json[id].positive, json[id].negative);
      }
    }
  },

  exportSaved: function () {
    const filename = window.prompt(`Please enter a name for the saved prompts:`, "saved-prompts");
    const blob = new Blob([JSON.stringify(promptHubInterface.savedPrompts, null, 2)], {
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
    if (promptHubSetup.els.savedPromptsList.selectedIndex === -1) {
      promptHubSetup.els.savedPositiveInput.value = "";
      promptHubSetup.els.savedNegativeInput.value = "";
    } else {
      promptHubSetup.els.savedPositiveInput.value =
        promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].positive;
      promptHubSetup.els.savedNegativeInput.value =
        promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].negative;
    }
  },

  checkSavedInputs: function () {
    if (promptHubSetup.els.savedPromptsList.selectedIndex === -1) return;
    let changed = false;
    if (
      promptHubSetup.els.savedPositiveInput.value !==
      promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].positive
    ) {
      changed = true;
    }
    if (
      promptHubSetup.els.savedNegativeInput.value !==
      promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].negative
    ) {
      changed = true;
    }
    if (changed) promptHubSetup.els.savedUpdate.classList.remove("promptHub-hide-btn");
    else promptHubSetup.els.savedUpdate.classList.add("promptHub-hide-btn");
  },

  updateSavedPrompt: function () {
    promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].positive =
      promptHubSetup.els.savedPositiveInput.value;
    promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].negative =
      promptHubSetup.els.savedNegativeInput.value;
    promptHubSetup.els.savedUpdate.classList.add("promptHub-hide-btn");
    promptHubInterface.localStorageSaveAll();
  },

  renameSavedPrompt: function () {
    if (promptHubSetup.els.savedPromptsList.selectedIndex === -1) return;
    const name = window.prompt(
      "Please enter a new name for the saved prompt:",
      promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].name
    );
    if (name === null) return;
    if (name !== promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].name) {
      promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].name = name;
      promptHubSetup.els.savedPromptsList.options[promptHubSetup.els.savedPromptsList.selectedIndex].text = name;
      promptHubInterface.localStorageSaveAll();
    }
  },

  removeSavedPrompt: function () {
    if (promptHubSetup.els.savedPromptsList.selectedIndex === -1) return;
    if (
      !confirm(
        `Are you sure you want to remove the "${
          promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].name
        }" prompt?`
      )
    )
      return;
    delete promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value];
    promptHubSetup.els.savedPromptsList.options[promptHubSetup.els.savedPromptsList.selectedIndex].remove();
    promptHubInterface.localStorageSaveAll();
    promptHubInterface.displaySavedPrompt();
  },

  applySavedPrompt: function (option) {
    if (promptHubSetup.els.savedPromptsList.selectedIndex === -1) return;
    let positive = "";
    let negative = "";
    if (option === "both") {
      positive = promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].positive;
      negative = promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].negative;
    } else if (option === "positive")
      positive = promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].positive;
    else if (option === "negative")
      negative = promptHubInterface.savedPrompts[promptHubSetup.els.savedPromptsList.value].negative;

    if (promptHubSetup.txt2ImgActive) {
      if (positive.length)
        promptHubSetup.els.txt2ImgPrompt.value = (
          promptHubSetup.els.txt2ImgPrompt.value.trim() +
          " " +
          positive
        ).trim();
      if (negative.length)
        promptHubSetup.els.txt2ImgNegPrompt.value = (
          promptHubSetup.els.txt2ImgNegPrompt.value.trim() +
          " " +
          negative
        ).trim();
    } else {
      if (positive.length)
        promptHubSetup.els.img2ImgPrompt.value = (
          promptHubSetup.els.img2ImgPrompt.value.trim() +
          " " +
          positive
        ).trim();
      if (negative.length)
        promptHubSetup.els.img2ImgNegPrompt.value = (
          promptHubSetup.els.img2ImgNegPrompt.value.trim() +
          " " +
          negative
        ).trim();
    }
  },

  addHistoryItem: function (isPositive) {
    let historyTarget = promptHubSetup.els.txt2ImgPrompt;
    let historyValue = promptHubSetup.els.positiveHistoryList.value;

    if (!promptHubSetup.txt2ImgActive) {
      if (isPositive) historyTarget = promptHubSetup.els.img2ImgPrompt;
      else {
        historyTarget = promptHubSetup.els.img2ImgNegPrompt;
        historyValue = negativeHistoryList.value;
      }
    } else if (!isPositive) {
      historyTarget = promptHubSetup.els.txt2ImgNegPrompt;
      historyValue = promptHubSetup.els.negativeHistoryList.value;
    }

    if (historyValue === "") return;

    historyTarget.value = historyValue;
  },

  removeHistoryItem: function (isPositive) {
    if (isPositive) {
      if (promptHubSetup.els.positiveHistoryList.selectedIndex === -1) return;
      promptHubInterface.positiveHistory.splice(
        promptHubInterface.positiveHistory.indexOf(promptHubSetup.els.positiveHistoryList.value),
        1
      );
      promptHubSetup.els.positiveHistoryList.options[promptHubSetup.els.positiveHistoryList.selectedIndex].remove();
    } else {
      if (promptHubSetup.els.negativeHistoryList.selectedIndex === -1) return;
      promptHubInterface.negativeHistory.splice(
        promptHubInterface.negativeHistory.indexOf(promptHubSetup.els.negativeHistoryList.value),
        1
      );
      promptHubSetup.els.negativeHistoryList.options[promptHubSetup.els.negativeHistoryList.selectedIndex].remove();
    }
    promptHubInterface.localStorageSaveAll();
  },

  saveHistoryItem: function (isPositive) {
    let positive = "";
    let negative = "";
    if (isPositive) positive = promptHubSetup.els.positiveHistoryList.value;
    else negative = promptHubSetup.els.negativeHistoryList.value;
    if (positive === "" && negative === "") return;
    const name = window.prompt(
      `Please enter a name for the saved ${isPositive ? "positive" : "negative"} history prompt:`,
      "New saved prompt"
    );
    if (name === null) return;
    promptHubInterface.createSavedItem(name, positive, negative);
  },

  clearHistory: function (isPositive) {
    if (!confirm(`Are you sure you want to clear the ${isPositive ? "positive" : "negative"} prompt history?`)) return;

    historyTarget = isPositive ? promptHubSetup.els.positiveHistoryList : promptHubSetup.els.negativeHistoryList;
    if (isPositive) promptHubInterface.positiveHistory = [];
    else promptHubInterface.negativeHistory = [];
    while (historyTarget.firstChild) {
      historyTarget.removeChild(historyTarget.firstChild);
    }
    promptHubInterface.localStorageSaveAll();
  },

  saveCurrent: function () {
    let positive = "";
    let negative = "";
    if (promptHubSetup.txt2ImgActive) {
      positive = promptHubSetup.els.txt2ImgPrompt.value;
      negative = promptHubSetup.els.txt2ImgNegPrompt.value;
    } else {
      positive = promptHubSetup.els.img2ImgPrompt.value;
      negative = promptHubSetup.els.img2ImgNegPrompt;
    }
    if (positive === "" && negative === "") return;
    const name = window.prompt(
      `Please enter a name for the new saved ${promptHubSetup.txt2ImgActive ? "txt2img" : "img2img"} prompt:`,
      "New saved prompt"
    );
    if (name === null) return;
    promptHubInterface.createSavedItem(name, positive, negative);
  },

  saveSelected: function () {
    const positive = promptHubSetup.els.positiveHistoryList.value;
    const negative = promptHubSetup.els.negativeHistoryList.value;
    if (positive === "" && negative === "") return;
    const name = window.prompt(`Please enter a name for the saved history prompt:`, "New saved prompt");
    if (name === null) return;
    promptHubInterface.createSavedItem(name, positive, negative);
  },

  importHistory: function (data, isPositive) {
    if (isPositive) promptHubInterface.positiveHistory = [];
    else promptHubInterface.negativeHistory = [];
    data.forEach((prompt) => {
      promptHubInterface.createHistoryItem(prompt, isPositive);
    });
  },

  exportHistory: function (isPositive) {
    const filename = window.prompt(
      `Please enter a name for the ${isPositive ? "positive" : "negative"} prompt history file:`,
      isPositive ? "positive" : "negative"
    );
    const blob = new Blob(
      [JSON.stringify(isPositive ? promptHubInterface.positiveHistory : promptHubInterface.negativeHistory, null, 2)],
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
