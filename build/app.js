var appInstance;
var unsubscribeEvent;

var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var loadingBar = document.querySelector("#unity-loading-bar");
var progressBarFull = document.querySelector("#unity-progress-bar-full");

var buildUrl = "Build";
var loaderUrl = buildUrl + "/Default WebGL.loader.js";
var config = {
  dataUrl: buildUrl + "/Default WebGL.data",
  frameworkUrl: buildUrl + "/Default WebGL.framework.js",
  codeUrl: buildUrl + "/Default WebGL.wasm",
  streamingAssetsUrl: "StreamingAssets",
  companyName: "YoGu-Games",
  productName: "MineMaster",
  productVersion: "0.1.37"
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
          // Show a message
          finalizingMsg = document.createElement("div");
          finalizingMsg.id = "unity-finalizing-msg";
          finalizingMsg.innerText = "Finalizing...";
          finalizingMsg.style.marginTop = "10px";
          finalizingMsg.style.textAlign = "center";
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
