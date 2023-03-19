sdBetterStylesSetup = {
  info: function (...data) {
    console.info("[sd-better-styles]", ...data);
  },

  debug: function (...data) {
    console.debug("[sd-better-styles]", ...data);
  },

  log: function (...data) {
    console.log("[sd-better-styles]", ...data);
  },

  els: {
    historyContainer: null,
    savedContainer: null,
    savedPositiveInput: null,
    savedNegativeInput: null,
    savedUpdate: null,

    txt2ImgTab: null,
    txt2ImgTopRow: null,
    txt2ImgSettings: null,
    txt2ImgPrompt: null,

    txt2ImgNegPrompt: null,
    img2ImgTab: null,
    img2ImgTopRow: null,
    img2ImgSettings: null,
    img2ImgPrompt: null,
    img2ImgNegPrompt: null,
    uiContainer: null,
    positiveHistoryList: null,
    negativeHistoryList: null,
    savedPromptsList: null,
  },

  tabMutationObserver: null,

  setupComplete: false,
  timeout: null,

  txt2ImgActive: true,

  btnToolClasses: ["gr-button", "gr-button-lg", "gr-button-tool", "sd-better-styles-prompt-btn"],

  waitForElements: async function (selectors) {
    return new Promise((resolve) => {
      const checkElements = () => {
        clearTimeout(sdBetterStylesSetup.timeout);
        const elements = selectors.map((selector) => gradioApp().querySelector(selector));

        if (elements.every((element) => element)) {
          resolve(elements);
        } else {
          sdBetterStylesSetup.timeout = setTimeout(checkElements, 1000);
        }
      };

      checkElements();
    });
  },

  readJSONFile: function (callback, arg) {
    // Remove the old input to clear the event listeners
    const fileInput = gradioApp().querySelector("#sd-better-styles-file-input");
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
    if (sdBetterStylesSetup.setupComplete) return;
    sdBetterStylesSetup.info("Setting up...");
    [
      sdBetterStylesSetup.els.txt2ImgTab,
      sdBetterStylesSetup.els.txt2ImgTopRow,
      sdBetterStylesSetup.els.txt2ImgSettings,
      sdBetterStylesSetup.els.txt2ImgPromptContainer,
      sdBetterStylesSetup.els.txt2ImgPrompt,
      sdBetterStylesSetup.els.txt2ImgNegPrompt,
      sdBetterStylesSetup.els.img2ImgTab,
      sdBetterStylesSetup.els.img2ImgTopRow,
      sdBetterStylesSetup.els.img2ImgSettings,
      sdBetterStylesSetup.els.img2ImgPromptContainer,
      sdBetterStylesSetup.els.img2ImgPrompt,
      sdBetterStylesSetup.els.img2ImgNegPrompt,
    ] = await sdBetterStylesSetup.waitForElements([
      "#tab_txt2img",
      "#txt2img_toprow",
      "#txt2img_settings",
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
    sdBetterStylesSetup.setupComplete = true;
    sdBetterStylesSetup.injectUI();
  },

  injectUI: function () {
    sdBetterStylesSetup.debug("Injecting UI...");
    fetch(`${window.location}file=/home/zetaphor/stable-diffusion-webui/extensions/sd-better-styles/ui.html`)
      .then((response) => response.text())
      .then((data) => {
        sdBetterStylesSetup.els.uiContainer = document.createElement("div");
        sdBetterStylesSetup.els.uiContainer.innerHTML = data;
        sdBetterStylesSetup.els.uiContainer.id = "sd-better-styles-container";
        sdBetterStylesSetup.els.uiContainer.classList.add(
          "flex",
          "row",
          "w-full",
          "flex-wrap",
          "gap-4",
          "unequal-height"
        );
        sdBetterStylesSetup.els.txt2ImgTopRow.insertAdjacentElement("afterend", sdBetterStylesSetup.els.uiContainer);

        sdBetterStylesSetup.initTabObserver();
        sdBetterStylesSetup.injectText2ImgPromptUI();
        sdBetterStylesSetup.injectImg2ImgPromptUI();
        sdBetterStylesSetup.setupButtons();

        sdBetterStylesSetup.els.historyContainer = gradioApp().querySelector("#sd-better-styles-history-container");
        sdBetterStylesSetup.els.savedContainer = gradioApp().querySelector("#sd-better-styles-saved-container");
        sdBetterStylesSetup.els.positiveHistoryList = gradioApp().querySelector("#sd-better-styles-positive-history");
        sdBetterStylesSetup.els.negativeHistoryList = gradioApp().querySelector("#sd-better-styles-negative-history");
        sdBetterStylesSetup.els.savedPromptsList = gradioApp().querySelector("#sd-better-styles-saved-prompts");
        sdBetterStylesSetup.els.savedPromptsList.addEventListener("change", (e) => {
          sdBetterStylesInterface.displaySavedPrompt();
        });
        sdBetterStylesSetup.els.savedUpdate = gradioApp().querySelector("#sd-better-styles-saved-update");
        sdBetterStylesSetup.els.savedPositiveInput = gradioApp().querySelector(
          "#sd-better-styles-saved-positive-input"
        );
        sdBetterStylesSetup.els.savedNegativeInput = gradioApp().querySelector(
          "#sd-better-styles-saved-negative-input"
        );
        sdBetterStylesSetup.els.savedPositiveInput.addEventListener("input", (e) => {
          sdBetterStylesInterface.checkSavedInputs();
        });
        sdBetterStylesSetup.els.savedNegativeInput.addEventListener("input", (e) => {
          sdBetterStylesInterface.checkSavedInputs();
        });

        sdBetterStylesInterface.loadHistory();
        sdBetterStylesSetup.info("Setup complete!");
      })
      .catch((error) => console.error(error));
  },

  setupButtons: function () {
    sdBetterStylesSetup.debug("Adding button listeners...");

    gradioApp()
      .querySelector("#sd-better-styles-history-save-current")
      .addEventListener("click", () => {
        sdBetterStylesInterface.saveCurrent();
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-save-selected")
      .addEventListener("click", () => {
        sdBetterStylesInterface.saveSelected();
      });

    gradioApp()
      .querySelector("#sd-better-styles-saved-import")
      .addEventListener("click", () => {
        sdBetterStylesSetup.readJSONFile(sdBetterStylesInterface.importSaved);
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-export")
      .addEventListener("click", () => {
        sdBetterStylesInterface.exportSaved();
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-clear")
      .addEventListener("click", () => {
        sdBetterStylesInterface.clearSaved();
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-update")
      .addEventListener("click", () => {
        sdBetterStylesInterface.updateSavedPrompt();
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-rename")
      .addEventListener("click", () => {
        sdBetterStylesInterface.renameSavedPrompt();
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-remove")
      .addEventListener("click", () => {
        sdBetterStylesInterface.removeSavedPrompt();
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-apply-both")
      .addEventListener("click", () => {
        sdBetterStylesInterface.applySavedPrompt("both");
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-apply-positive")
      .addEventListener("click", () => {
        sdBetterStylesInterface.applySavedPrompt("positive");
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-apply-negative")
      .addEventListener("click", () => {
        sdBetterStylesInterface.applySavedPrompt("negative");
      });

    gradioApp()
      .querySelector("#sd-better-styles-history-toggle")
      .addEventListener("click", () => {
        sdBetterStylesInterface.toggleHistory();
      });
    gradioApp()
      .querySelector("#sd-better-styles-saved-toggle")
      .addEventListener("click", () => {
        sdBetterStylesInterface.toggleSaved();
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-add-positive")
      .addEventListener("click", () => {
        sdBetterStylesInterface.addHistoryItem(true);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-remove-positive")
      .addEventListener("click", () => {
        sdBetterStylesInterface.removeHistoryItem(true);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-save-positive")
      .addEventListener("click", () => {
        sdBetterStylesInterface.saveHistoryItem(true);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-reset-positive")
      .addEventListener("click", () => {
        sdBetterStylesInterface.clearHistory(true);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-import-positive")
      .addEventListener("click", () => {
        sdBetterStylesSetup.readJSONFile(sdBetterStylesInterface.importHistory, true);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-export-positive")
      .addEventListener("click", () => {
        sdBetterStylesInterface.exportHistory(true);
      });

    gradioApp()
      .querySelector("#sd-better-styles-history-add-negative")
      .addEventListener("click", () => {
        sdBetterStylesInterface.addHistoryItem(false);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-remove-negative")
      .addEventListener("click", () => {
        sdBetterStylesInterface.removeHistoryItem(false);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-save-negative")
      .addEventListener("click", () => {
        sdBetterStylesInterface.saveHistoryItem(false);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-reset-negative")
      .addEventListener("click", () => {
        sdBetterStylesInterface.clearHistory(false);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-import-negative")
      .addEventListener("click", () => {
        sdBetterStylesSetup.readJSONFile(sdBetterStylesInterface.importHistory, false);
      });
    gradioApp()
      .querySelector("#sd-better-styles-history-export-negative")
      .addEventListener("click", () => {
        sdBetterStylesInterface.exportHistory(false);
      });
  },

  injectText2ImgPromptUI: function () {
    let t2iPositivePromptContainer = sdBetterStylesSetup.els.txt2ImgPromptContainer.querySelector(
      "#txt2img_prompt_container div.flex.row.w-full:nth-of-type(1)"
    );

    const t2iPositiveBtnContainer = document.createElement("div");
    t2iPositiveBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

    const t2iBtnPositiveClear = document.createElement("button");
    t2iBtnPositiveClear.classList.add(...sdBetterStylesSetup.btnToolClasses);
    t2iBtnPositiveClear.innerText = "🗑";
    t2iBtnPositiveClear.title = "Clear the positive prompt";
    t2iBtnPositiveClear.addEventListener("click", function () {
      sdBetterStylesSetup.els.txt2ImgPrompt.value = "";
    });

    const t2iBtnPositiveSave = document.createElement("button");
    t2iBtnPositiveSave.classList.add(...sdBetterStylesSetup.btnToolClasses);
    t2iBtnPositiveSave.classList.add("sd-better-styles-prompt-top-button");
    t2iBtnPositiveSave.innerText = "💾";
    t2iBtnPositiveClear.title = "Save the positive prompt";
    t2iBtnPositiveSave.addEventListener("click", function () {
      sdBetterStylesInterface.createHistoryItem(sdBetterStylesSetup.els.txt2ImgPrompt.value, true);
    });

    t2iPositiveBtnContainer.appendChild(t2iBtnPositiveSave);
    t2iPositiveBtnContainer.appendChild(t2iBtnPositiveClear);
    t2iPositivePromptContainer.insertAdjacentElement("afterbegin", t2iPositiveBtnContainer);

    const t2iNegativePromptContainer = sdBetterStylesSetup.els.txt2ImgPromptContainer.querySelector(
      "#txt2img_prompt_container div.flex.row.w-full:nth-of-type(2)"
    );

    const t2iNegativeBtnContainer = document.createElement("div");
    t2iNegativeBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

    const t2iBtnNegativeClear = document.createElement("button");
    t2iBtnNegativeClear.classList.add(...sdBetterStylesSetup.btnToolClasses);
    t2iBtnNegativeClear.innerText = "🗑";
    t2iBtnPositiveClear.title = "Clear the negative prompt";
    t2iBtnNegativeClear.addEventListener("click", function () {
      sdBetterStylesSetup.els.txt2ImgNegPrompt.value = "";
    });

    const t2iBtnNegativeSave = document.createElement("button");
    t2iBtnNegativeSave.classList.add(...sdBetterStylesSetup.btnToolClasses);
    t2iBtnNegativeSave.classList.add("sd-better-styles-prompt-top-button");
    t2iBtnNegativeSave.innerText = "💾";
    t2iBtnPositiveClear.title = "Save the negative prompt";
    t2iBtnNegativeSave.addEventListener("click", function () {
      sdBetterStylesInterface.createHistoryItem(sdBetterStylesSetup.els.txt2ImgNegPrompt.value, false);
    });

    t2iNegativeBtnContainer.appendChild(t2iBtnNegativeSave);
    t2iNegativeBtnContainer.appendChild(t2iBtnNegativeClear);
    t2iNegativePromptContainer.insertAdjacentElement("afterbegin", t2iNegativeBtnContainer);
  },

  injectImg2ImgPromptUI: function () {
    let i2iPositivePromptContainer = sdBetterStylesSetup.els.img2ImgPromptContainer.querySelector(
      "#img2img_prompt_container div.flex.row.w-full:nth-of-type(1)"
    );

    const i2iPositiveBtnContainer = document.createElement("div");
    i2iPositiveBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

    const i2iBtnPositiveClear = document.createElement("button");
    i2iBtnPositiveClear.classList.add(...sdBetterStylesSetup.btnToolClasses);
    i2iBtnPositiveClear.innerText = "🗑";
    i2iBtnPositiveClear.title = "Clear the positive prompt";
    i2iBtnPositiveClear.addEventListener("click", function () {
      sdBetterStylesSetup.els.img2ImgPrompt.value = "";
    });

    const i2iBtnPositiveSave = document.createElement("button");
    i2iBtnPositiveSave.classList.add(...sdBetterStylesSetup.btnToolClasses);
    i2iBtnPositiveSave.classList.add("sd-better-styles-prompt-top-button");
    i2iBtnPositiveSave.innerText = "💾";
    i2iBtnPositiveClear.title = "Save the positive prompt";
    i2iBtnPositiveSave.addEventListener("click", function () {
      sdBetterStylesInterface.createHistoryItem(sdBetterStylesSetup.els.img2ImgPrompt.value, true);
    });

    i2iPositiveBtnContainer.appendChild(i2iBtnPositiveSave);
    i2iPositiveBtnContainer.appendChild(i2iBtnPositiveClear);
    i2iPositivePromptContainer.insertAdjacentElement("afterbegin", i2iPositiveBtnContainer);

    const i2iNegativePromptContainer = sdBetterStylesSetup.els.img2ImgPromptContainer.querySelector(
      "#img2img_prompt_container div.flex.row.w-full:nth-of-type(2)"
    );

    const i2iNegativeBtnContainer = document.createElement("div");
    i2iNegativeBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

    const i2iBtnNegativeClear = document.createElement("button");
    i2iBtnNegativeClear.classList.add(...sdBetterStylesSetup.btnToolClasses);
    i2iBtnNegativeClear.innerText = "🗑";
    i2iBtnPositiveClear.title = "Clear the negative prompt";
    i2iBtnNegativeClear.addEventListener("click", function () {
      sdBetterStylesSetup.els.img2ImgNegPrompt.querySelector("textarea").value = "";
    });

    const i2iBtnNegativeSave = document.createElement("button");
    i2iBtnNegativeSave.classList.add(...sdBetterStylesSetup.btnToolClasses);
    i2iBtnNegativeSave.classList.add("sd-better-styles-prompt-top-button");
    i2iBtnNegativeSave.innerText = "💾";
    i2iBtnPositiveClear.title = "Save the negative prompt";
    i2iBtnNegativeSave.addEventListener("click", function () {
      sdBetterStylesInterface.createHistoryItem(
        sdBetterStylesSetup.els.img2ImgNegPrompt.querySelector("textarea").value,
        false
      );
    });

    i2iNegativeBtnContainer.appendChild(i2iBtnNegativeSave);
    i2iNegativeBtnContainer.appendChild(i2iBtnNegativeClear);
    i2iNegativePromptContainer.insertAdjacentElement("afterbegin", i2iNegativeBtnContainer);
  },

  initTabObserver: function () {
    sdBetterStylesSetup.debug("Initializing tab mutation observer...");
    sdBetterStylesSetup.tabMutationObserver = new MutationObserver(function (mutationsList) {
      if (sdBetterStylesSetup.els.txt2ImgTab.style.display === "block") {
        sdBetterStylesSetup.els.txt2ImgTopRow.insertAdjacentElement("afterend", sdBetterStylesSetup.els.uiContainer);
        sdBetterStylesSetup.txt2ImgActive = true;
        gradioApp().querySelector("#sd-better-styles-history-current-label").innerText = "Save Current txt2img Prompt";
      } else if (sdBetterStylesSetup.els.img2ImgTab.style.display === "block") {
        sdBetterStylesSetup.els.img2ImgTopRow.insertAdjacentElement("afterend", sdBetterStylesSetup.els.uiContainer);
        sdBetterStylesSetup.txt2ImgActive = false;
        gradioApp().querySelector("#sd-better-styles-history-current-label").innerText = "Save Current img2img Prompt";
      }
    });

    const observerOptions = {
      attributes: true,
      attributeFilter: ["style"],
    };

    sdBetterStylesSetup.tabMutationObserver.observe(sdBetterStylesSetup.els.txt2ImgTab, observerOptions);
    sdBetterStylesSetup.tabMutationObserver.observe(sdBetterStylesSetup.els.img2ImgTab, observerOptions);
  },
};

sdBetterStylesSetup.setup();
