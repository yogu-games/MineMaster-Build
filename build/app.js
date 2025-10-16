var appInstance;
var unsubscribeEvent;

var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var progressBarEmpty = document.querySelector("#unity-progress-bar-empty");

var buildUrl = "Build";
var loaderUrl = buildUrl + "/{{{ LOADER_FILENAME }}}";
var config = {
  dataUrl: buildUrl + "/{{{ DATA_FILENAME }}}",
  frameworkUrl: buildUrl + "/{{{ FRAMEWORK_FILENAME }}}",
  streamingAssetsUrl: "StreamingAssets",
  companyName: (function () {
    try { return JSON.parse('{{{ JSON.stringify(COMPANY_NAME) }}}'); }
    catch (e) { return typeof COMPANY_NAME !== "undefined" ? COMPANY_NAME : ""; }
  })(),
  productName: (function () {
    try { return JSON.parse('{{{ JSON.stringify(PRODUCT_NAME) }}}'); }
    catch (e) { return typeof PRODUCT_NAME !== "undefined" ? PRODUCT_NAME : ""; }
  })(),
  productVersion: (function () {
    try { return JSON.parse('{{{ JSON.stringify(PRODUCT_VERSION) }}}'); }
    catch (e) { return typeof PRODUCT_VERSION !== "undefined" ? PRODUCT_VERSION : ""; }
  })()
};

var useThreads = JSON.parse("{{{ JSON.stringify((typeof USE_THREADS !== 'undefined') && USE_THREADS) }}}");
var workerFilename = "{{{ typeof WORKER_FILENAME !== 'undefined' ? WORKER_FILENAME : '' }}}";
if (useThreads && workerFilename) {
  config.workerUrl = buildUrl + "/" + workerFilename;
}

var useWasm = JSON.parse("{{{ JSON.stringify((typeof USE_WASM !== 'undefined') && USE_WASM) }}}");
var codeFilename = "{{{ typeof CODE_FILENAME !== 'undefined' ? CODE_FILENAME : '' }}}";
if (useWasm && codeFilename) {
  config.codeUrl = buildUrl + "/" + codeFilename;
}

var memoryFilename = "{{{ typeof MEMORY_FILENAME !== 'undefined' ? MEMORY_FILENAME : '' }}}";
if (memoryFilename) {
  config.memoryUrl = buildUrl + "/" + memoryFilename;
}

var symbolsFilename = "{{{ typeof SYMBOLS_FILENAME !== 'undefined' ? SYMBOLS_FILENAME : '' }}}";
if (symbolsFilename) {
  config.symbolsUrl = buildUrl + "/" + symbolsFilename;
}

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
{
  var meta = document.createElement('meta');
    
  meta.name = 'viewport';
  meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    
  document.getElementsByTagName('head')[0].appendChild(meta);
}
  
var backgroundFilename = "{{{ typeof BACKGROUND_FILENAME !== 'undefined' ? BACKGROUND_FILENAME.replace(/'/g, '%27') : '' }}}";
if (backgroundFilename) {
  canvas.style.background = "url('" + buildUrl + "/" + backgroundFilename + "') center / cover";
}
loadingBar.style.display = "block";
  
var script = document.createElement("script");
script.src = loaderUrl;
  
script.onload = () => 
{
    let indeterminateShown = false;
    let finalizingMsg = null;
    createUnityInstance(canvas, config, (progress) => 
    {
      if (progress < 0.87) {
        progressBarFull.style.width = (100 * (progress / 0.87)) + "%";
        progressBarFull.classList.remove("indeterminate");
        if (finalizingMsg) {
          finalizingMsg.remove();
          finalizingMsg = null;
        }
        indeterminateShown = false;
      } else {
        // Show indeterminate spinner/message at the end
        if (!indeterminateShown) {
          progressBarFull.style.width = "100%";
          progressBarFull.classList.add("indeterminate");
          // Fade out the progress bar graphics since we no longer need them
          if (progressBarEmpty) {
            progressBarEmpty.classList.add("fade-out");
            const hideOnTransitionEnd = (e) => {
              if (e.propertyName === "opacity") {
                progressBarEmpty.style.display = "none";
                progressBarEmpty.removeEventListener('transitionend', hideOnTransitionEnd);
              }
            };
            progressBarEmpty.addEventListener('transitionend', hideOnTransitionEnd);
          }
          // Show a message
          finalizingMsg = document.createElement("div");
          finalizingMsg.id = "unity-finalizing-msg";
          finalizingMsg.innerText = "Finalizing...";
          finalizingMsg.style.marginTop = "10px";
          finalizingMsg.style.textAlign = "center";
          finalizingMsg.style.color = "#fff";
          loadingBar.appendChild(finalizingMsg);
          indeterminateShown = true;
        }
      }
    }
    ).then((unityInstance) => 
    {
      appInstance = unityInstance;
      // Fade out loading bar
      loadingBar.style.transition = "opacity 0.5s";
      loadingBar.style.opacity = 0;
      setTimeout(() => loadingBar.style.display = "none", 500);
    }
    ).catch((message) => 
    {
      alert(message);
    });
};
  
document.body.appendChild(script);
  
// ---------------- Portrait Orientation Enforcement ----------------
function updateOrientationState() {
  var isPortrait = window.matchMedia && window.matchMedia("(orientation: portrait)").matches;
  if (isPortrait) {
    document.body.classList.remove('landscape');
    if (canvas) canvas.style.pointerEvents = 'auto';
  } else {
    document.body.classList.add('landscape');
    if (canvas) canvas.style.pointerEvents = 'none';
  }
}

async function tryLockPortrait() {
  var orientationObject = screen.orientation || screen.msOrientation || screen.mozOrientation;
  if (orientationObject && orientationObject.lock) {
    try { await orientationObject.lock('portrait'); } catch(e) { /* silently ignore */ }
  }
}

// Attempt lock on first user interaction (required by many browsers)
window.addEventListener('pointerdown', function once() {
  tryLockPortrait();
  window.removeEventListener('pointerdown', once);
});

window.addEventListener('orientationchange', updateOrientationState);
window.addEventListener('resize', updateOrientationState);
// Initial state (script loaded after DOM so safe)
updateOrientationState();
// ------------------------------------------------------------------

window.addEventListener('load', function ()
{
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  
  console.log("Telegram Web App has been expanded to full screen");
  
  var version = Telegram.WebApp.version;
  var versionFloat = parseFloat(version);
  
  if (versionFloat >= 7.7)
  {
      Telegram.WebApp.disableVerticalSwipes();
          
      console.log('Activating vertical swipe disable');
  }
  
  console.log(`Telegram Web App opened with version: ${version}`);
  console.log(`Telegram Web App checked latest version status with `+
      `result: ${Telegram.WebApp.isVersionAtLeast(version)}`);
});