function info(...data) {
  console.info("[sd-better-styles]", ...data);
}

function debug(...data) {
  console.debug("[sd-better-styles]", ...data);
}

function log(...data) {
  console.log("[sd-better-styles]", ...data);
}

let txt2ImgTabEl = null;
let txt2ImgTopRowEl = null;
let img2ImgTabEl = null;
let img2ImgTopRowEl = null;
let uiContainerEl = null;
let tabMutationObserver = null;

let setupComplete = false;
let timeout = null;

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
  [txt2ImgTabEl, txt2ImgTopRowEl, img2ImgTabEl, img2ImgTopRowEl] = await waitForElements([
    "#tab_txt2img",
    "#txt2img_toprow",
    "#tab_img2img",
    "#img2img_toprow",
  ]);
  debug("txt2ImgTabEl", txt2ImgTabEl);
  debug("txt2ImgTopRow", txt2ImgTopRowEl);
  debug("img2ImgTabEl", img2ImgTabEl);
  debug("img2ImgTopRow", img2ImgTopRowEl);
  info("Setup complete");
  setupComplete = true;
  injectUI();
}

function injectUI() {
  debug("Injecting UI...");
  fetch(`${window.location}file=/home/zetaphor/stable-diffusion-webui/extensions/sd-better-styles/ui.html`)
    .then((response) => response.text())
    .then((data) => {
      uiContainerEl = document.createElement("div");
      uiContainerEl.innerHTML = data;
      uiContainerEl.id = "sd-better-styles-container";
      txt2ImgTopRowEl.insertAdjacentElement("afterend", uiContainerEl);
      initTabObserver();
    })
    .catch((error) => console.error(error));
}

function initTabObserver() {
  debug("Initializing tab mutation observer...");
  tabMutationObserver = new MutationObserver(function (mutationsList) {
    if (txt2ImgTabEl.style.display === "block") {
      txt2ImgTopRowEl.insertAdjacentElement("afterend", uiContainerEl);
      gradioApp().querySelector("#active-tab-name").innerText = "Txt2Img";
    } else if (img2ImgTabEl.style.display === "block") {
      img2ImgTopRowEl.insertAdjacentElement("afterend", uiContainerEl);
      gradioApp().querySelector("#active-tab-name").innerText = "Img2Img";
    }
  });

  const observerOptions = {
    attributes: true,
    attributeFilter: ["style"],
  };

  tabMutationObserver.observe(txt2ImgTabEl, observerOptions);
  tabMutationObserver.observe(img2ImgTabEl, observerOptions);
}

setup();
