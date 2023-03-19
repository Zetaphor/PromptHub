function info(...data) {
  console.info("[sd-better-styles]", ...data);
}

function debug(...data) {
  console.debug("[sd-better-styles]", ...data);
}

function log(...data) {
  console.log("[sd-better-styles]", ...data);
}

const els = {
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
};

let historyVisible = false;

let tabMutationObserver = null;

let setupComplete = false;
let timeout = null;

let txt2ImgActive = true;

let fileContents = "";
let fileReadCallback = null;

const btnToolClasses = ["gr-button", "gr-button-lg", "gr-button-tool", "sd-better-styles-prompt-btn"];

async function waitForElements(selectors) {
  return new Promise((resolve) => {
    const checkElements = () => {
      clearTimeout(timeout);
      const elements = selectors.map((selector) => gradioApp().querySelector(selector));

      if (elements.every((element) => element)) {
        resolve(elements);
      } else {
        timeout = setTimeout(checkElements, 1000);
      }
    };

    checkElements();
  });
}

function readJSONFile(callback, arg) {
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
}

async function setup() {
  if (setupComplete) return;
  info("Setting up...");
  [
    els.txt2ImgTab,
    els.txt2ImgTopRow,
    els.txt2ImgSettings,
    els.txt2ImgPromptContainer,
    els.txt2ImgPrompt,
    els.txt2ImgNegPrompt,
    els.img2ImgTab,
    els.img2ImgTopRow,
    els.img2ImgSettings,
    els.img2ImgPromptContainer,
    els.img2ImgPrompt,
    els.img2ImgNegPrompt,
  ] = await waitForElements([
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
  setupComplete = true;
  injectUI();
}

function injectUI() {
  debug("Injecting UI...");
  fetch(`${window.location}file=/home/zetaphor/stable-diffusion-webui/extensions/sd-better-styles/ui.html`)
    .then((response) => response.text())
    .then((data) => {
      els.uiContainer = document.createElement("div");
      els.uiContainer.innerHTML = data;
      els.uiContainer.id = "sd-better-styles-container";
      els.uiContainer.classList.add("flex", "row", "w-full", "flex-wrap", "gap-4", "unequal-height");
      els.txt2ImgTopRow.insertAdjacentElement("afterend", els.uiContainer);

      initTabObserver();
      injectText2ImgPromptUI();
      injectImg2ImgPromptUI();
      setupButtons();

      els.historyContainer = gradioApp().querySelector("#sd-better-styles-history-container");
      els.savedContainer = gradioApp().querySelector("#sd-better-styles-saved-container");
      els.positiveHistoryList = gradioApp().querySelector("#sd-better-styles-positive-history");
      els.negativeHistoryList = gradioApp().querySelector("#sd-better-styles-negative-history");
      els.savedPromptsList = gradioApp().querySelector("#sd-better-styles-saved-prompts");
      els.savedPromptsList.addEventListener("change", (e) => {
        displaySavedPrompt();
      });
      els.savedUpdate = gradioApp().querySelector("#sd-better-styles-saved-update");
      els.savedPositiveInput = gradioApp().querySelector("#sd-better-styles-saved-positive-input");
      els.savedNegativeInput = gradioApp().querySelector("#sd-better-styles-saved-negative-input");
      els.savedPositiveInput.addEventListener("input", (e) => {
        checkSavedInputs();
      });
      els.savedNegativeInput.addEventListener("input", (e) => {
        checkSavedInputs();
      });

      loadHistory();
      info("Setup complete!");
    })
    .catch((error) => console.error(error));
}

function setupButtons() {
  debug("Adding button listeners...");

  gradioApp()
    .querySelector("#sd-better-styles-history-save-current")
    .addEventListener("click", () => {
      saveCurrent();
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-save-selected")
    .addEventListener("click", () => {
      saveSelected();
    });

  gradioApp()
    .querySelector("#sd-better-styles-saved-import")
    .addEventListener("click", () => {
      readJSONFile(importSaved);
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-export")
    .addEventListener("click", () => {
      exportSaved();
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-clear")
    .addEventListener("click", () => {
      clearSaved();
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-update")
    .addEventListener("click", () => {
      updateSavedPrompt();
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-rename")
    .addEventListener("click", () => {
      renameSavedPrompt();
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-remove")
    .addEventListener("click", () => {
      removeSavedPrompt();
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-apply-both")
    .addEventListener("click", () => {
      applySavedPrompt("both");
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-apply-positive")
    .addEventListener("click", () => {
      applySavedPrompt("positive");
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-apply-negative")
    .addEventListener("click", () => {
      applySavedPrompt("negative");
    });

  gradioApp()
    .querySelector("#sd-better-styles-history-toggle")
    .addEventListener("click", () => {
      toggleHistory();
    });
  gradioApp()
    .querySelector("#sd-better-styles-saved-toggle")
    .addEventListener("click", () => {
      toggleSaved();
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-add-positive")
    .addEventListener("click", () => {
      addHistoryItem(true);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-remove-positive")
    .addEventListener("click", () => {
      removeHistoryItem(true);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-save-positive")
    .addEventListener("click", () => {
      saveHistoryItem(true);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-reset-positive")
    .addEventListener("click", () => {
      clearHistory(true);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-import-positive")
    .addEventListener("click", () => {
      readJSONFile(importHistory, true);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-export-positive")
    .addEventListener("click", () => {
      exportHistory(true);
    });

  gradioApp()
    .querySelector("#sd-better-styles-history-add-negative")
    .addEventListener("click", () => {
      addHistoryItem(false);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-remove-negative")
    .addEventListener("click", () => {
      removeHistoryItem(false);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-save-negative")
    .addEventListener("click", () => {
      saveHistoryItem(false);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-reset-negative")
    .addEventListener("click", () => {
      clearHistory(false);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-import-negative")
    .addEventListener("click", () => {
      readJSONFile(importHistory, false);
    });
  gradioApp()
    .querySelector("#sd-better-styles-history-export-negative")
    .addEventListener("click", () => {
      exportHistory(false);
    });
}

function injectText2ImgPromptUI() {
  let t2iPositivePromptContainer = els.txt2ImgPromptContainer.querySelector(
    "#txt2img_prompt_container div.flex.row.w-full:nth-of-type(1)"
  );

  const t2iPositiveBtnContainer = document.createElement("div");
  t2iPositiveBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

  const t2iBtnPositiveClear = document.createElement("button");
  t2iBtnPositiveClear.classList.add(...btnToolClasses);
  t2iBtnPositiveClear.innerText = "🗑";
  t2iBtnPositiveClear.title = "Clear the positive prompt";
  t2iBtnPositiveClear.addEventListener("click", function () {
    els.txt2ImgPrompt.value = "";
  });

  const t2iBtnPositiveSave = document.createElement("button");
  t2iBtnPositiveSave.classList.add(...btnToolClasses);
  t2iBtnPositiveSave.classList.add("sd-better-styles-prompt-top-button");
  t2iBtnPositiveSave.innerText = "💾";
  t2iBtnPositiveClear.title = "Save the positive prompt";
  t2iBtnPositiveSave.addEventListener("click", function () {
    createHistoryItem(els.txt2ImgPrompt.value, true);
  });

  t2iPositiveBtnContainer.appendChild(t2iBtnPositiveSave);
  t2iPositiveBtnContainer.appendChild(t2iBtnPositiveClear);
  t2iPositivePromptContainer.insertAdjacentElement("afterbegin", t2iPositiveBtnContainer);

  const t2iNegativePromptContainer = els.txt2ImgPromptContainer.querySelector(
    "#txt2img_prompt_container div.flex.row.w-full:nth-of-type(2)"
  );

  const t2iNegativeBtnContainer = document.createElement("div");
  t2iNegativeBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

  const t2iBtnNegativeClear = document.createElement("button");
  t2iBtnNegativeClear.classList.add(...btnToolClasses);
  t2iBtnNegativeClear.innerText = "🗑";
  t2iBtnPositiveClear.title = "Clear the negative prompt";
  t2iBtnNegativeClear.addEventListener("click", function () {
    els.txt2ImgNegPrompt.value = "";
  });

  const t2iBtnNegativeSave = document.createElement("button");
  t2iBtnNegativeSave.classList.add(...btnToolClasses);
  t2iBtnNegativeSave.classList.add("sd-better-styles-prompt-top-button");
  t2iBtnNegativeSave.innerText = "💾";
  t2iBtnPositiveClear.title = "Save the negative prompt";
  t2iBtnNegativeSave.addEventListener("click", function () {
    createHistoryItem(els.txt2ImgNegPrompt.value, false);
  });

  t2iNegativeBtnContainer.appendChild(t2iBtnNegativeSave);
  t2iNegativeBtnContainer.appendChild(t2iBtnNegativeClear);
  t2iNegativePromptContainer.insertAdjacentElement("afterbegin", t2iNegativeBtnContainer);
}

function injectImg2ImgPromptUI() {
  let i2iPositivePromptContainer = els.img2ImgPromptContainer.querySelector(
    "#img2img_prompt_container div.flex.row.w-full:nth-of-type(1)"
  );

  const i2iPositiveBtnContainer = document.createElement("div");
  i2iPositiveBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

  const i2iBtnPositiveClear = document.createElement("button");
  i2iBtnPositiveClear.classList.add(...btnToolClasses);
  i2iBtnPositiveClear.innerText = "🗑";
  i2iBtnPositiveClear.title = "Clear the positive prompt";
  i2iBtnPositiveClear.addEventListener("click", function () {
    els.img2ImgPrompt.value = "";
  });

  const i2iBtnPositiveSave = document.createElement("button");
  i2iBtnPositiveSave.classList.add(...btnToolClasses);
  i2iBtnPositiveSave.classList.add("sd-better-styles-prompt-top-button");
  i2iBtnPositiveSave.innerText = "💾";
  i2iBtnPositiveClear.title = "Save the positive prompt";
  i2iBtnPositiveSave.addEventListener("click", function () {
    createHistoryItem(els.img2ImgPrompt.value, true);
  });

  i2iPositiveBtnContainer.appendChild(i2iBtnPositiveSave);
  i2iPositiveBtnContainer.appendChild(i2iBtnPositiveClear);
  i2iPositivePromptContainer.insertAdjacentElement("afterbegin", i2iPositiveBtnContainer);

  const i2iNegativePromptContainer = els.img2ImgPromptContainer.querySelector(
    "#img2img_prompt_container div.flex.row.w-full:nth-of-type(2)"
  );

  const i2iNegativeBtnContainer = document.createElement("div");
  i2iNegativeBtnContainer.classList.add("sd-better-styles-prompt-btn-container");

  const i2iBtnNegativeClear = document.createElement("button");
  i2iBtnNegativeClear.classList.add(...btnToolClasses);
  i2iBtnNegativeClear.innerText = "🗑";
  i2iBtnPositiveClear.title = "Clear the negative prompt";
  i2iBtnNegativeClear.addEventListener("click", function () {
    els.img2ImgNegPrompt.querySelector("textarea").value = "";
  });

  const i2iBtnNegativeSave = document.createElement("button");
  i2iBtnNegativeSave.classList.add(...btnToolClasses);
  i2iBtnNegativeSave.classList.add("sd-better-styles-prompt-top-button");
  i2iBtnNegativeSave.innerText = "💾";
  i2iBtnPositiveClear.title = "Save the negative prompt";
  i2iBtnNegativeSave.addEventListener("click", function () {
    createHistoryItem(els.img2ImgNegPrompt.querySelector("textarea").value, false);
  });

  i2iNegativeBtnContainer.appendChild(i2iBtnNegativeSave);
  i2iNegativeBtnContainer.appendChild(i2iBtnNegativeClear);
  i2iNegativePromptContainer.insertAdjacentElement("afterbegin", i2iNegativeBtnContainer);
}

function initTabObserver() {
  debug("Initializing tab mutation observer...");
  tabMutationObserver = new MutationObserver(function (mutationsList) {
    if (els.txt2ImgTab.style.display === "block") {
      els.txt2ImgTopRow.insertAdjacentElement("afterend", els.uiContainer);
      txt2ImgActive = true;
      gradioApp().querySelector("#sd-better-styles-history-current-label").innerText = "Save Current txt2img Prompt";
    } else if (els.img2ImgTab.style.display === "block") {
      els.img2ImgTopRow.insertAdjacentElement("afterend", els.uiContainer);
      txt2ImgActive = false;
      gradioApp().querySelector("#sd-better-styles-history-current-label").innerText = "Save Current img2img Prompt";
    }
  });

  const observerOptions = {
    attributes: true,
    attributeFilter: ["style"],
  };

  tabMutationObserver.observe(els.txt2ImgTab, observerOptions);
  tabMutationObserver.observe(els.img2ImgTab, observerOptions);
}

setup();
