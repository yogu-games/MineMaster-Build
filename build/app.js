var appInstance;
var unsubscribeEvent;

var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");
var progressBarEmpty = document.querySelector("#unity-progress-bar-empty");

// Lightweight status UI for the tail end of loading
var statusContainer = document.createElement("div");
statusContainer.id = "unity-status";
var statusSpinner = document.createElement("div");
statusSpinner.id = "unity-spinner";
var statusHint = document.createElement("div");
statusHint.id = "unity-hint";
statusContainer.appendChild(statusSpinner);
statusContainer.appendChild(statusHint);
statusContainer.style.display = "none";
loadingBar.appendChild(statusContainer);

var buildUrl = "Build";
var loaderUrl = buildUrl + "/Default WebGL.loader.js";
var config = {
  dataUrl: buildUrl + "/Default WebGL.data",
  frameworkUrl: buildUrl + "/Default WebGL.framework.js",
  codeUrl: buildUrl + "/Default WebGL.wasm",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "YoGu-Games",
  productName: "MineMaster",
  productVersion: "1.0.185"
};

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
{
  var meta = document.createElement('meta');
    
  meta.name = 'viewport';
  meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    
  document.getElementsByTagName('head')[0].appendChild(meta);
}
  
loadingBar.style.display = "block";
  
var script = document.createElement("script");
script.src = loaderUrl;
  
script.onload = () => 
{
    var progressAtFinalPhase = 0.87;
    var maxShownProgress = 0.99; // keep some headroom for the real completion snap
    var hints = [
      "Sharpening pickaxes…",
      "Sweeping up crystal dust…",
      "Polishing gem shaders…",
      "Hauling fresh ore to memory…",
      "Checking canary in the code mine…",
      "Stacking loot crates…",
      "Mapping tunnels to WebAssembly…"
    ];
    var hintIndex = 0;
    var hintTimer = null;
    var finalPhaseStarted = false;
    var currentDisplayProgress = 0;
    var targetDisplayProgress = 0;
    var rafId = null;

    function setHint(text) {
      statusHint.textContent = text;
    }

    function startHints() {
      if (hintTimer) return;
      statusContainer.style.display = "flex";
      setHint(hints[hintIndex % hints.length]);
      hintTimer = setInterval(function() {
        hintIndex += 1;
        setHint(hints[hintIndex % hints.length]);
      }, 6000);
    }

    function stopHints(finalText) {
      if (hintTimer) {
        clearInterval(hintTimer);
        hintTimer = null;
      }
      if (finalText) setHint(finalText);
      statusSpinner.style.display = "none";
    }

    function updateBarWidth(p) {
      var clamped = Math.max(0, Math.min(1, p));
      progressBarFull.style.width = (clamped * 100) + "%";
    }

    function scheduleFrame() {
      if (rafId) return;
      rafId = requestAnimationFrame(tick);
    }

    function tick() {
      rafId = null;
      var diff = targetDisplayProgress - currentDisplayProgress;
      if (Math.abs(diff) < 0.001) {
        currentDisplayProgress = targetDisplayProgress;
      } else {
        // Ease toward target, with a tiny floor to keep motion visible
        currentDisplayProgress += diff * 0.08 + (diff > 0 ? 0.0015 : -0.0015);
        scheduleFrame();
      }
      updateBarWidth(currentDisplayProgress);
    }

    function setProgressTarget(p) {
      targetDisplayProgress = Math.max(targetDisplayProgress, p);
      scheduleFrame();
    }

    createUnityInstance(canvas, config, (progress) => 
    {
      if (progress < progressAtFinalPhase) {
        var mapped = (progress / progressAtFinalPhase) * 0.95; // maps to 0-95%
        setProgressTarget(mapped);
      } else {
        if (!finalPhaseStarted) {
          finalPhaseStarted = true;
          startHints();
        }
        setProgressTarget(maxShownProgress);
      }
    }
    ).then((unityInstance) => 
    {
      appInstance = unityInstance;
      stopHints("Ready");
      setProgressTarget(1);
      // Fade out loading bar
      loadingBar.style.transition = "opacity 0.5s";
      loadingBar.style.opacity = 0;
      setTimeout(() => loadingBar.style.display = "none", 500);
    }
    ).catch((message) => 
    {
      stopHints();
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
  try {
    if (typeof Telegram.WebApp.setClosingBehavior === 'function') {
      Telegram.WebApp.setClosingBehavior({ need_confirmation: true });
      console.log('Telegram closing confirmation enabled');
    } else if (typeof Telegram.WebApp.enableClosingConfirmation === 'function') {
      Telegram.WebApp.enableClosingConfirmation();
      console.log('Telegram closing confirmation enabled via legacy API');
    }
  } catch (e) {
    console.warn('Unable to configure Telegram closing behavior', e);
  }
  
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
