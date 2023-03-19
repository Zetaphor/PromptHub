promptHubSetup = {
  info: function (...data) {
    console.info("[promptHub]", ...data);
  },

  debug: function (...data) {
    console.debug("[promptHub]", ...data);
  },

  log: function (...data) {
    console.log("[promptHub]", ...data);
  },

  els: {
    historyContainer: null,
    savedContainer: null,
    savedPositiveInput: null,
    savedNegativeInput: null,
    savedUpdate: null,
    historyUiContainer: null,
    savedUiContainer: null,

    txt2ImgTab: null,
    txt2ImgTopRow: null,
    txt2ImgSettings: null,
    txt2ImgResults: null,
    txt2ImgPrompt: null,

    txt2ImgNegPrompt: null,
    img2ImgTab: null,
    img2ImgTopRow: null,
    img2ImgSettings: null,
    img2ImgPrompt: null,
    img2ImgNegPrompt: null,
    positiveHistoryList: null,
    negativeHistoryList: null,
    savedPromptsList: null,
  },

  tabMutationObserver: null,

  setupComplete: false,
  timeout: null,

  txt2ImgActive: true,

  btnToolClasses: ["gr-button", "gr-button-lg", "gr-button-tool", "promptHub-prompt-btn"],

  waitForElements: async function (selectors) {
    return new Promise((resolve) => {
      const checkElements = () => {
        clearTimeout(promptHubSetup.timeout);
        const elements = selectors.map((selector) => gradioApp().querySelector(selector));

        if (elements.every((element) => element)) {
          resolve(elements);
        } else {
          promptHubSetup.timeout = setTimeout(checkElements, 1000);
        }
      };

      checkElements();
    });
  },

  readJSONFile: function (callback, arg) {
    // Remove the old input to clear the event listeners
    const fileInput = gradioApp().querySelector("#promptHub-file-input");
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);

    newFileInput.addEventListener("change", function () {
      const file = this.files[0];
      const reader = new FileReader();

      reader.addEventListener("load", function () {
        const fileContents = JSON.parse(reader.result);
        callback(fileContents, arg);
      });

      reader.readAsText(file);
    });

    newFileInput.click();
  },

  setup: async function () {
    if (promptHubSetup.setupComplete) return;
    promptHubSetup.info("Setting up...");
    [
      promptHubSetup.els.txt2ImgTab,
      promptHubSetup.els.txt2ImgTopRow,
      promptHubSetup.els.txt2ImgSettings,
      promptHubSetup.els.txt2ImgResults,
      promptHubSetup.els.txt2ImgPromptContainer,
      promptHubSetup.els.txt2ImgPrompt,
      promptHubSetup.els.txt2ImgNegPrompt,
      promptHubSetup.els.img2ImgTab,
      promptHubSetup.els.img2ImgTopRow,
      promptHubSetup.els.img2ImgSettings,
      promptHubSetup.els.img2ImgPromptContainer,
      promptHubSetup.els.img2ImgPrompt,
      promptHubSetup.els.img2ImgNegPrompt,
    ] = await promptHubSetup.waitForElements([
      "#tab_txt2img",
      "#txt2img_toprow",
      "#txt2img_settings",
      "#txt2img_results",
      "#txt2img_prompt_container",
      "#txt2img_prompt textarea",
      "#txt2img_neg_prompt textarea",
      "#tab_img2img",
      "#img2img_toprow",
      "#img2img_settings",
      "#img2img_prompt_container",
      "#img2img_prompt textarea",
      "#img2img_neg_prompt textarea",
    ]);
    promptHubSetup.setupComplete = true;

    promptHubSetup.els.txt2ImgSettingsContainerDiv = document.createElement("div");
    promptHubSetup.els.txt2ImgSettingsContainerDiv.id = "txt2img-promptHub-settings-container";
    promptHubSetup.els.txt2ImgSettings.parentNode.insertBefore(
      promptHubSetup.els.txt2ImgSettingsContainerDiv,
      promptHubSetup.els.txt2ImgSettings
    );
    promptHubSetup.els.txt2ImgSettingsContainerDiv.appendChild(promptHubSetup.els.txt2ImgSettings);

    promptHubSetup.els.txt2ImgResultsContainerDiv = document.createElement("div");
    promptHubSetup.els.txt2ImgResultsContainerDiv.id = "txt2img-promptHub-results-container";
    promptHubSetup.els.txt2ImgResults.parentNode.insertBefore(
      promptHubSetup.els.txt2ImgResultsContainerDiv,
      promptHubSetup.els.txt2ImgResults
    );
    promptHubSetup.els.txt2ImgResultsContainerDiv.appendChild(promptHubSetup.els.txt2ImgResults);

    promptHubSetup.injectUI();
  },

  injectUI: function () {
    promptHubSetup.debug("Injecting UI...");
    fetch(`${window.location}file=/home/zetaphor/stable-diffusion-webui/extensions/promptHub/ui.html`)
      .then((response) => response.text())
      .then((data) => {
        const uiParser = new DOMParser();
        const uiData = uiParser.parseFromString(data, "text/html");

        promptHubSetup.els.historyUiContainer = uiData.querySelector("#promptHub-section-history");
        promptHubSetup.els.savedUiContainer = uiData.querySelector("#promptHub-section-saved");

        promptHubSetup.els.historyUiContainer.classList.add(
          "flex",
          "row",
          "w-full",
          "flex-wrap",
          "gap-4",
          "unequal-height"
        );
        promptHubSetup.els.savedUiContainer.classList.add(
          "flex",
          "row",
          "w-full",
          "flex-wrap",
          "gap-4",
          "unequal-height"
        );

        promptHubSetup.els.txt2ImgSettingsContainerDiv.insertBefore(
          promptHubSetup.els.historyUiContainer,
          promptHubSetup.els.txt2ImgSettings
        );

        promptHubSetup.els.txt2ImgResultsContainerDiv.insertBefore(
          promptHubSetup.els.savedUiContainer,
          promptHubSetup.els.txt2ImgResults
        );

        promptHubSetup.initTabObserver();
        promptHubSetup.injectText2ImgPromptUI();
        promptHubSetup.injectImg2ImgPromptUI();
        promptHubSetup.setupButtons();

        promptHubSetup.els.historyContainer = gradioApp().querySelector("#promptHub-history-container");
        promptHubSetup.els.savedContainer = gradioApp().querySelector("#promptHub-saved-container");
        promptHubSetup.els.positiveHistoryList = gradioApp().querySelector("#promptHub-positive-history");
        promptHubSetup.els.negativeHistoryList = gradioApp().querySelector("#promptHub-negative-history");
        promptHubSetup.els.savedPromptsList = gradioApp().querySelector("#promptHub-saved-prompts");
        promptHubSetup.els.savedPromptsList.addEventListener("change", (e) => {
          promptHubInterface.displaySavedPrompt();
        });
        promptHubSetup.els.savedUpdate = gradioApp().querySelector("#promptHub-saved-update");
        promptHubSetup.els.savedPositiveInput = gradioApp().querySelector("#promptHub-saved-positive-input");
        promptHubSetup.els.savedNegativeInput = gradioApp().querySelector("#promptHub-saved-negative-input");
        promptHubSetup.els.savedPositiveInput.addEventListener("input", (e) => {
          promptHubInterface.checkSavedInputs();
        });
        promptHubSetup.els.savedNegativeInput.addEventListener("input", (e) => {
          promptHubInterface.checkSavedInputs();
        });

        promptHubInterface.loadHistory();
        promptHubSetup.info("Setup complete!");
      })
      .catch((error) => console.error(error));
  },

  setupButtons: function () {
    promptHubSetup.debug("Adding button listeners...");

    gradioApp()
      .querySelector("#promptHub-history-save-current")
      .addEventListener("click", () => {
        promptHubInterface.saveCurrent();
      });
    gradioApp()
      .querySelector("#promptHub-history-save-selected")
      .addEventListener("click", () => {
        promptHubInterface.saveSelected();
      });

    gradioApp()
      .querySelector("#promptHub-saved-import")
      .addEventListener("click", () => {
        promptHubSetup.readJSONFile(promptHubInterface.importSaved);
      });
    gradioApp()
      .querySelector("#promptHub-saved-export")
      .addEventListener("click", () => {
        promptHubInterface.exportSaved();
      });
    gradioApp()
      .querySelector("#promptHub-saved-clear")
      .addEventListener("click", () => {
        promptHubInterface.clearSaved();
      });
    gradioApp()
      .querySelector("#promptHub-saved-update")
      .addEventListener("click", () => {
        promptHubInterface.updateSavedPrompt();
      });
    gradioApp()
      .querySelector("#promptHub-saved-rename")
      .addEventListener("click", () => {
        promptHubInterface.renameSavedPrompt();
      });
    gradioApp()
      .querySelector("#promptHub-saved-remove")
      .addEventListener("click", () => {
        promptHubInterface.removeSavedPrompt();
      });
    gradioApp()
      .querySelector("#promptHub-saved-apply-both")
      .addEventListener("click", () => {
        promptHubInterface.applySavedPrompt("both");
      });
    gradioApp()
      .querySelector("#promptHub-saved-apply-positive")
      .addEventListener("click", () => {
        promptHubInterface.applySavedPrompt("positive");
      });
    gradioApp()
      .querySelector("#promptHub-saved-apply-negative")
      .addEventListener("click", () => {
        promptHubInterface.applySavedPrompt("negative");
      });

    gradioApp()
      .querySelector("#promptHub-history-toggle")
      .addEventListener("click", () => {
        promptHubInterface.toggleHistory();
      });
    gradioApp()
      .querySelector("#promptHub-saved-toggle")
      .addEventListener("click", () => {
        promptHubInterface.toggleSaved();
      });
    gradioApp()
      .querySelector("#promptHub-history-add-positive")
      .addEventListener("click", () => {
        promptHubInterface.addHistoryItem(true);
      });
    gradioApp()
      .querySelector("#promptHub-history-remove-positive")
      .addEventListener("click", () => {
        promptHubInterface.removeHistoryItem(true);
      });
    gradioApp()
      .querySelector("#promptHub-history-save-positive")
      .addEventListener("click", () => {
        promptHubInterface.saveHistoryItem(true);
      });
    gradioApp()
      .querySelector("#promptHub-history-reset-positive")
      .addEventListener("click", () => {
        promptHubInterface.clearHistory(true);
      });
    gradioApp()
      .querySelector("#promptHub-history-import-positive")
      .addEventListener("click", () => {
        promptHubSetup.readJSONFile(promptHubInterface.importHistory, true);
      });
    gradioApp()
      .querySelector("#promptHub-history-export-positive")
      .addEventListener("click", () => {
        promptHubInterface.exportHistory(true);
      });

    gradioApp()
      .querySelector("#promptHub-history-add-negative")
      .addEventListener("click", () => {
        promptHubInterface.addHistoryItem(false);
      });
    gradioApp()
      .querySelector("#promptHub-history-remove-negative")
      .addEventListener("click", () => {
        promptHubInterface.removeHistoryItem(false);
      });
    gradioApp()
      .querySelector("#promptHub-history-save-negative")
      .addEventListener("click", () => {
        promptHubInterface.saveHistoryItem(false);
      });
    gradioApp()
      .querySelector("#promptHub-history-reset-negative")
      .addEventListener("click", () => {
        promptHubInterface.clearHistory(false);
      });
    gradioApp()
      .querySelector("#promptHub-history-import-negative")
      .addEventListener("click", () => {
        promptHubSetup.readJSONFile(promptHubInterface.importHistory, false);
      });
    gradioApp()
      .querySelector("#promptHub-history-export-negative")
      .addEventListener("click", () => {
        promptHubInterface.exportHistory(false);
      });
  },

  injectText2ImgPromptUI: function () {
    let t2iPositivePromptContainer = promptHubSetup.els.txt2ImgPromptContainer.querySelector(
      "#txt2img_prompt_container div.flex.row.w-full:nth-of-type(1)"
    );

    const t2iPositiveBtnContainer = document.createElement("div");
    t2iPositiveBtnContainer.classList.add("promptHub-prompt-btn-container");

    const t2iBtnPositiveClear = document.createElement("button");
    t2iBtnPositiveClear.classList.add(...promptHubSetup.btnToolClasses);
    t2iBtnPositiveClear.innerText = "🗑";
    t2iBtnPositiveClear.title = "Clear the positive prompt";
    t2iBtnPositiveClear.addEventListener("click", function () {
      promptHubSetup.els.txt2ImgPrompt.value = "";
    });

    const t2iBtnPositiveSave = document.createElement("button");
    t2iBtnPositiveSave.classList.add(...promptHubSetup.btnToolClasses);
    t2iBtnPositiveSave.classList.add("promptHub-prompt-top-button");
    t2iBtnPositiveSave.innerText = "💾";
    t2iBtnPositiveClear.title = "Save the positive prompt";
    t2iBtnPositiveSave.addEventListener("click", function () {
      promptHubInterface.createHistoryItem(promptHubSetup.els.txt2ImgPrompt.value, true);
    });

    t2iPositiveBtnContainer.appendChild(t2iBtnPositiveSave);
    t2iPositiveBtnContainer.appendChild(t2iBtnPositiveClear);
    t2iPositivePromptContainer.insertAdjacentElement("afterbegin", t2iPositiveBtnContainer);

    const t2iNegativePromptContainer = promptHubSetup.els.txt2ImgPromptContainer.querySelector(
      "#txt2img_prompt_container div.flex.row.w-full:nth-of-type(2)"
    );

    const t2iNegativeBtnContainer = document.createElement("div");
    t2iNegativeBtnContainer.classList.add("promptHub-prompt-btn-container");

    const t2iBtnNegativeClear = document.createElement("button");
    t2iBtnNegativeClear.classList.add(...promptHubSetup.btnToolClasses);
    t2iBtnNegativeClear.innerText = "🗑";
    t2iBtnPositiveClear.title = "Clear the negative prompt";
    t2iBtnNegativeClear.addEventListener("click", function () {
      promptHubSetup.els.txt2ImgNegPrompt.value = "";
    });

    const t2iBtnNegativeSave = document.createElement("button");
    t2iBtnNegativeSave.classList.add(...promptHubSetup.btnToolClasses);
    t2iBtnNegativeSave.classList.add("promptHub-prompt-top-button");
    t2iBtnNegativeSave.innerText = "💾";
    t2iBtnPositiveClear.title = "Save the negative prompt";
    t2iBtnNegativeSave.addEventListener("click", function () {
      promptHubInterface.createHistoryItem(promptHubSetup.els.txt2ImgNegPrompt.value, false);
    });

    t2iNegativeBtnContainer.appendChild(t2iBtnNegativeSave);
    t2iNegativeBtnContainer.appendChild(t2iBtnNegativeClear);
    t2iNegativePromptContainer.insertAdjacentElement("afterbegin", t2iNegativeBtnContainer);
  },

  injectImg2ImgPromptUI: function () {
    let i2iPositivePromptContainer = promptHubSetup.els.img2ImgPromptContainer.querySelector(
      "#img2img_prompt_container div.flex.row.w-full:nth-of-type(1)"
    );

    const i2iPositiveBtnContainer = document.createElement("div");
    i2iPositiveBtnContainer.classList.add("promptHub-prompt-btn-container");

    const i2iBtnPositiveClear = document.createElement("button");
    i2iBtnPositiveClear.classList.add(...promptHubSetup.btnToolClasses);
    i2iBtnPositiveClear.innerText = "🗑";
    i2iBtnPositiveClear.title = "Clear the positive prompt";
    i2iBtnPositiveClear.addEventListener("click", function () {
      promptHubSetup.els.img2ImgPrompt.value = "";
    });

    const i2iBtnPositiveSave = document.createElement("button");
    i2iBtnPositiveSave.classList.add(...promptHubSetup.btnToolClasses);
    i2iBtnPositiveSave.classList.add("promptHub-prompt-top-button");
    i2iBtnPositiveSave.innerText = "💾";
    i2iBtnPositiveClear.title = "Save the positive prompt";
    i2iBtnPositiveSave.addEventListener("click", function () {
      promptHubInterface.createHistoryItem(promptHubSetup.els.img2ImgPrompt.value, true);
    });

    i2iPositiveBtnContainer.appendChild(i2iBtnPositiveSave);
    i2iPositiveBtnContainer.appendChild(i2iBtnPositiveClear);
    i2iPositivePromptContainer.insertAdjacentElement("afterbegin", i2iPositiveBtnContainer);

    const i2iNegativePromptContainer = promptHubSetup.els.img2ImgPromptContainer.querySelector(
      "#img2img_prompt_container div.flex.row.w-full:nth-of-type(2)"
    );

    const i2iNegativeBtnContainer = document.createElement("div");
    i2iNegativeBtnContainer.classList.add("promptHub-prompt-btn-container");

    const i2iBtnNegativeClear = document.createElement("button");
    i2iBtnNegativeClear.classList.add(...promptHubSetup.btnToolClasses);
    i2iBtnNegativeClear.innerText = "🗑";
    i2iBtnPositiveClear.title = "Clear the negative prompt";
    i2iBtnNegativeClear.addEventListener("click", function () {
      promptHubSetup.els.img2ImgNegPrompt.querySelector("textarea").value = "";
    });

    const i2iBtnNegativeSave = document.createElement("button");
    i2iBtnNegativeSave.classList.add(...promptHubSetup.btnToolClasses);
    i2iBtnNegativeSave.classList.add("promptHub-prompt-top-button");
    i2iBtnNegativeSave.innerText = "💾";
    i2iBtnPositiveClear.title = "Save the negative prompt";
    i2iBtnNegativeSave.addEventListener("click", function () {
      promptHubInterface.createHistoryItem(promptHubSetup.els.img2ImgNegPrompt.querySelector("textarea").value, false);
    });

    i2iNegativeBtnContainer.appendChild(i2iBtnNegativeSave);
    i2iNegativeBtnContainer.appendChild(i2iBtnNegativeClear);
    i2iNegativePromptContainer.insertAdjacentElement("afterbegin", i2iNegativeBtnContainer);
  },

  initTabObserver: function () {
    promptHubSetup.debug("Initializing tab mutation observer...");
    promptHubSetup.tabMutationObserver = new MutationObserver(function (mutationsList) {
      if (promptHubSetup.els.txt2ImgTab.style.display === "block") {
        promptHubSetup.els.txt2ImgTopRow.insertAdjacentElement("afterend", promptHubSetup.els.uiContainer);
        promptHubSetup.txt2ImgActive = true;
        gradioApp().querySelector("#promptHub-history-current-label").innerText = "Save Current txt2img Prompt";
      } else if (promptHubSetup.els.img2ImgTab.style.display === "block") {
        promptHubSetup.els.img2ImgTopRow.insertAdjacentElement("afterend", promptHubSetup.els.uiContainer);
        promptHubSetup.txt2ImgActive = false;
        gradioApp().querySelector("#promptHub-history-current-label").innerText = "Save Current img2img Prompt";
      }
    });

    const observerOptions = {
      attributes: true,
      attributeFilter: ["style"],
    };

    promptHubSetup.tabMutationObserver.observe(promptHubSetup.els.txt2ImgTab, observerOptions);
    promptHubSetup.tabMutationObserver.observe(promptHubSetup.els.img2ImgTab, observerOptions);
  },
};

promptHubSetup.setup();
