// Import Telegram Apps SDK (you'll need to include this via CDN or npm)
// For CDN: <script src="https://unpkg.com/@telegram-apps/sdk@latest/dist/index.js"></script>

(function() {
    'use strict';

    // Check if we're running in Telegram WebApp
    function isTelegramWebApp() {
        return window.Telegram && window.Telegram.WebApp;
    }

    // Initialize Telegram WebApp and request fullscreen
    function initTelegramFullscreen() {
        try {
            const webApp = window.Telegram.WebApp;
            
            // Initialize the web app
            webApp.ready();
            
            // Request fullscreen mode
            if (webApp.isFullscreen !== undefined) {
                if (!webApp.isFullscreen) {
                    webApp.requestFullscreen();
                }
            }
            
            // Set viewport to expand
            webApp.expand();
            
            // Hide back button if not needed
            webApp.BackButton.hide();
            
            // Optional: Set header color to match your game
            webApp.setHeaderColor('#000000');
            
            console.log('Telegram WebApp fullscreen initialized');
            
        } catch (error) {
            console.error('Error initializing Telegram WebApp:', error);
        }
    }

    // Fallback fullscreen for other mobile browsers
    function requestBrowserFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // Check if device is mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Main initialization function
    function initMobileFullscreen() {
        if (!isMobile()) {
            return;
        }

        if (isTelegramWebApp()) {
            initTelegramFullscreen();
        } else {
            // For other mobile browsers, request fullscreen on user interaction
            document.addEventListener('touchstart', function onFirstTouch() {
                requestBrowserFullscreen();
                document.removeEventListener('touchstart', onFirstTouch);
            }, { once: true });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFullscreen);
    } else {
        initMobileFullscreen();
    }

    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            if (isTelegramWebApp()) {
                window.Telegram.WebApp.expand();
            }
        }, 100);
    });

})();