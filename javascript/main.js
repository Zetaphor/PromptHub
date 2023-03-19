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
};

let tabMutationObserver = null;

let setupComplete = false;
let timeout = null;

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

async function setup() {
  if (setupComplete) return;
  info("Setting up...");
  [
    els.txt2ImgTabEl,
    els.txt2ImgTopRowEl,
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
    "#txt2img_prompt",
    "#txt2img_neg_prompt",
    "#tab_img2img",
    "#img2img_toprow",
    "#img2img_settings",
    "#img2img_prompt_container",
    "#img2img_prompt",
    "#img2img_neg_prompt",
  ]);
  info("Setup complete");
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
    })
    .catch((error) => console.error(error));
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
  t2iBtnPositiveClear.addEventListener("click", function () {
    els.txt2ImgPrompt.querySelector("textarea").value = "";
  });

  const t2iBtnPositiveSave = document.createElement("button");
  t2iBtnPositiveSave.classList.add(...btnToolClasses);
  t2iBtnPositiveSave.classList.add("sd-better-styles-prompt-top-button");
  t2iBtnPositiveSave.innerText = "💾";
  t2iBtnPositiveSave.addEventListener("click", function () {
    // els.txt2ImgPrompt.querySelector("textarea").value = "";
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
  t2iBtnNegativeClear.addEventListener("click", function () {
    els.txt2ImgNegPrompt.querySelector("textarea").value = "";
  });

  const t2iBtnNegativeSave = document.createElement("button");
  t2iBtnNegativeSave.classList.add(...btnToolClasses);
  t2iBtnNegativeSave.classList.add("sd-better-styles-prompt-top-button");
  t2iBtnNegativeSave.innerText = "💾";
  t2iBtnNegativeSave.addEventListener("click", function () {
    // els.txt2ImgNegPrompt.querySelector("textarea").value = "";
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
  i2iBtnPositiveClear.addEventListener("click", function () {
    els.img2ImgPrompt.querySelector("textarea").value = "";
  });

  const i2iBtnPositiveSave = document.createElement("button");
  i2iBtnPositiveSave.classList.add(...btnToolClasses);
  i2iBtnPositiveSave.classList.add("sd-better-styles-prompt-top-button");
  i2iBtnPositiveSave.innerText = "💾";
  i2iBtnPositiveSave.addEventListener("click", function () {
    // els.img2ImgPrompt.querySelector("textarea").value = "";
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
  i2iBtnNegativeClear.addEventListener("click", function () {
    els.img2ImgNegPrompt.querySelector("textarea").value = "";
  });

  const i2iBtnNegativeSave = document.createElement("button");
  i2iBtnNegativeSave.classList.add(...btnToolClasses);
  i2iBtnNegativeSave.classList.add("sd-better-styles-prompt-top-button");
  i2iBtnNegativeSave.innerText = "💾";
  i2iBtnNegativeSave.addEventListener("click", function () {
    // els.img2ImgNegPrompt.querySelector("textarea").value = "";
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
      // gradioApp().querySelector("#active-tab-name").innerText = "Txt2Img";
    } else if (els.img2ImgTab.style.display === "block") {
      els.img2ImgTopRow.insertAdjacentElement("afterend", els.uiContainer);
      // gradioApp().querySelector("#active-tab-name").innerText = "Img2Img";
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
