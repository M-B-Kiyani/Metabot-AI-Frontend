// Metalogics AI Widget - Standalone Script Version
// No iframe limitations - full functionality with microphone access

(function () {
  "use strict";

  // Prevent multiple widget loads
  if (window.__METALOGICS_WIDGET_LOADED__) {
    console.log("Metalogics Widget already loaded");
    return;
  }
  window.__METALOGICS_WIDGET_LOADED__ = true;

  // Widget configuration
  const WIDGET_CONFIG = {
    apiUrl: "https://metabot-ai-frontend-production.up.railway.app",
    widgetUrl: "/widget",
    position: "bottom-right",
    zIndex: 10000,
  };

  // CSS Styles for the widget (isolated with prefix)
  const WIDGET_STYLES = `
    /* Metalogics Widget Styles - Isolated */
    .metalogics-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: ${WIDGET_CONFIG.zIndex};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      --widget-primary: #667eea;
      --widget-secondary: #764ba2;
      --widget-success: #10b981;
      --widget-error: #ef4444;
      --widget-warning: #f59e0b;
    }

    .metalogics-widget-button {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--widget-primary) 0%, var(--widget-secondary) 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .metalogics-widget-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
      border-radius: 50%;
    }

    .metalogics-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
    }

    .metalogics-widget-button:active {
      transform: scale(0.95);
    }

    .metalogics-widget-button svg {
      width: 32px;
      height: 32px;
      color: white;
      z-index: 1;
      position: relative;
    }

    .metalogics-widget-chat {
      position: absolute;
      bottom: 84px;
      right: 0;
      width: 400px;
      height: 600px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
      transform: scale(0.8) translateY(20px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
    }

    .metalogics-widget-chat.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      visibility: visible;
    }

    .metalogics-widget-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
      color: white;
      border-radius: 20px;
    }

    .metalogics-widget-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: metalogics-spin 1s linear infinite;
    }

    @keyframes metalogics-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .metalogics-widget-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      text-align: center;
      background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
      color: white;
      border-radius: 20px;
    }

    .metalogics-widget-error h3 {
      margin: 0 0 10px 0;
      color: var(--widget-error);
    }

    .metalogics-widget-error p {
      margin: 0 0 20px 0;
      opacity: 0.8;
    }

    .metalogics-widget-retry {
      background: var(--widget-primary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .metalogics-widget-retry:hover {
      background: var(--widget-secondary);
      transform: scale(1.05);
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .metalogics-widget-container {
        bottom: 16px;
        right: 16px;
      }
      
      .metalogics-widget-chat {
        width: calc(100vw - 32px);
        height: calc(100vh - 120px);
        bottom: 84px;
        right: 0;
      }
    }

    /* Notification dot */
    .metalogics-widget-notification {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 16px;
      height: 16px;
      background: var(--widget-error);
      border-radius: 50%;
      border: 3px solid white;
      animation: metalogics-pulse 2s infinite;
    }

    @keyframes metalogics-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
  `;

  // Inject widget styles
  function injectStyles() {
    const styleId = "metalogics-widget-styles";
    if (document.getElementById(styleId)) return;

    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.textContent = WIDGET_STYLES;
    document.head.appendChild(styleSheet);
  }

  // Create widget HTML structure
  function createWidgetHTML() {
    return `
      <div class="metalogics-widget-container" id="metalogics-widget">
        <button class="metalogics-widget-button" id="metalogics-widget-toggle" aria-label="Open Metalogics AI Assistant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <div class="metalogics-widget-notification" id="metalogics-widget-notification" style="display: none;"></div>
        </button>
        
        <div class="metalogics-widget-chat" id="metalogics-widget-chat">
          <div class="metalogics-widget-loading" id="metalogics-widget-loading">
            <div>
              <div class="metalogics-widget-spinner"></div>
              <p style="margin-top: 16px; font-size: 14px;">Loading Metalogics AI...</p>
            </div>
          </div>
          <div id="metalogics-widget-content" style="display: none; height: 100%;"></div>
          <div class="metalogics-widget-error" id="metalogics-widget-error" style="display: none;">
            <h3>Connection Error</h3>
            <p>Unable to load the AI assistant. Please check your connection and try again.</p>
            <button class="metalogics-widget-retry" onclick="window.MetalogicsWidget.retry()">Retry</button>
          </div>
        </div>
      </div>
    `;
  }

  // Widget state management
  const WidgetState = {
    isOpen: false,
    isLoaded: false,
    isLoading: false,
    hasError: false,
    retryCount: 0,
    maxRetries: 3,
  };

  // Widget API
  const MetalogicsWidget = {
    // Initialize the widget
    init() {
      console.log("Initializing Metalogics AI Widget...");

      // Inject styles
      injectStyles();

      // Create widget container
      const widgetHTML = createWidgetHTML();
      document.body.insertAdjacentHTML("beforeend", widgetHTML);

      // Setup event listeners
      this.setupEventListeners();

      // Load widget content
      this.loadWidget();

      console.log("Metalogics AI Widget initialized successfully");
    },

    // Setup event listeners
    setupEventListeners() {
      const toggleButton = document.getElementById("metalogics-widget-toggle");
      const chatContainer = document.getElementById("metalogics-widget-chat");

      if (toggleButton) {
        toggleButton.addEventListener("click", () => this.toggle());
      }

      // Close on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && WidgetState.isOpen) {
          this.close();
        }
      });

      // Close when clicking outside
      document.addEventListener("click", (e) => {
        const widget = document.getElementById("metalogics-widget");
        if (widget && !widget.contains(e.target) && WidgetState.isOpen) {
          this.close();
        }
      });
    },

    // Load widget content
    async loadWidget() {
      if (WidgetState.isLoading || WidgetState.isLoaded) return;

      WidgetState.isLoading = true;
      this.showLoading();

      try {
        // Create iframe for the widget content (but with full permissions)
        const iframe = document.createElement("iframe");
        iframe.src = WIDGET_CONFIG.apiUrl + WIDGET_CONFIG.widgetUrl;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.borderRadius = "20px";

        // CRITICAL: Full permissions for microphone access
        iframe.setAttribute(
          "allow",
          "microphone; camera; autoplay; encrypted-media; fullscreen; geolocation"
        );
        iframe.setAttribute(
          "sandbox",
          "allow-same-origin allow-scripts allow-forms allow-popups allow-presentation allow-top-navigation-by-user-activation allow-downloads"
        );

        // Handle iframe load
        iframe.onload = () => {
          console.log("Widget content loaded successfully");
          WidgetState.isLoaded = true;
          WidgetState.isLoading = false;
          WidgetState.hasError = false;
          WidgetState.retryCount = 0;
          this.showContent();
        };

        iframe.onerror = () => {
          console.error("Failed to load widget content");
          this.handleError();
        };

        // Add iframe to content container
        const contentContainer = document.getElementById(
          "metalogics-widget-content"
        );
        if (contentContainer) {
          contentContainer.innerHTML = "";
          contentContainer.appendChild(iframe);
        }

        // Timeout fallback
        setTimeout(() => {
          if (WidgetState.isLoading) {
            console.warn("Widget loading timeout");
            this.handleError();
          }
        }, 15000); // 15 second timeout
      } catch (error) {
        console.error("Error loading widget:", error);
        this.handleError();
      }
    },

    // Show loading state
    showLoading() {
      const loading = document.getElementById("metalogics-widget-loading");
      const content = document.getElementById("metalogics-widget-content");
      const error = document.getElementById("metalogics-widget-error");

      if (loading) loading.style.display = "flex";
      if (content) content.style.display = "none";
      if (error) error.style.display = "none";
    },

    // Show content
    showContent() {
      const loading = document.getElementById("metalogics-widget-loading");
      const content = document.getElementById("metalogics-widget-content");
      const error = document.getElementById("metalogics-widget-error");

      if (loading) loading.style.display = "none";
      if (content) content.style.display = "block";
      if (error) error.style.display = "none";
    },

    // Show error state
    showError() {
      const loading = document.getElementById("metalogics-widget-loading");
      const content = document.getElementById("metalogics-widget-content");
      const error = document.getElementById("metalogics-widget-error");

      if (loading) loading.style.display = "none";
      if (content) content.style.display = "none";
      if (error) error.style.display = "flex";
    },

    // Handle errors
    handleError() {
      WidgetState.isLoading = false;
      WidgetState.hasError = true;
      WidgetState.retryCount++;

      if (WidgetState.retryCount <= WidgetState.maxRetries) {
        console.log(
          `Widget load failed, retry ${WidgetState.retryCount}/${WidgetState.maxRetries}`
        );
        setTimeout(() => this.retry(), 2000 * WidgetState.retryCount);
      } else {
        console.error("Widget failed to load after maximum retries");
        this.showError();
      }
    },

    // Retry loading
    retry() {
      console.log("Retrying widget load...");
      WidgetState.isLoaded = false;
      WidgetState.hasError = false;
      this.loadWidget();
    },

    // Toggle widget
    toggle() {
      if (WidgetState.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    // Open widget
    open() {
      const chatContainer = document.getElementById("metalogics-widget-chat");
      const toggleButton = document.getElementById("metalogics-widget-toggle");
      const notification = document.getElementById(
        "metalogics-widget-notification"
      );

      if (chatContainer) {
        chatContainer.classList.add("open");
        WidgetState.isOpen = true;

        // Update button icon to close
        if (toggleButton) {
          toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          `;
          toggleButton.setAttribute(
            "aria-label",
            "Close Metalogics AI Assistant"
          );
        }

        // Hide notification
        if (notification) {
          notification.style.display = "none";
        }

        // Load widget if not already loaded
        if (!WidgetState.isLoaded && !WidgetState.isLoading) {
          this.loadWidget();
        }
      }
    },

    // Close widget
    close() {
      const chatContainer = document.getElementById("metalogics-widget-chat");
      const toggleButton = document.getElementById("metalogics-widget-toggle");

      if (chatContainer) {
        chatContainer.classList.remove("open");
        WidgetState.isOpen = false;

        // Update button icon to chat
        if (toggleButton) {
          toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <div class="metalogics-widget-notification" id="metalogics-widget-notification" style="display: none;"></div>
          `;
          toggleButton.setAttribute(
            "aria-label",
            "Open Metalogics AI Assistant"
          );
        }
      }
    },

    // Show notification
    showNotification() {
      const notification = document.getElementById(
        "metalogics-widget-notification"
      );
      if (notification && !WidgetState.isOpen) {
        notification.style.display = "block";
      }
    },

    // Hide notification
    hideNotification() {
      const notification = document.getElementById(
        "metalogics-widget-notification"
      );
      if (notification) {
        notification.style.display = "none";
      }
    },

    // Destroy widget
    destroy() {
      const widget = document.getElementById("metalogics-widget");
      const styles = document.getElementById("metalogics-widget-styles");

      if (widget) widget.remove();
      if (styles) styles.remove();

      window.__METALOGICS_WIDGET_LOADED__ = false;
      delete window.MetalogicsWidget;

      console.log("Metalogics Widget destroyed");
    },
  };

  // Expose widget API globally
  window.MetalogicsWidget = MetalogicsWidget;

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      MetalogicsWidget.init()
    );
  } else {
    MetalogicsWidget.init();
  }

  // Optional: Auto-show notification after delay
  setTimeout(() => {
    if (!WidgetState.isOpen) {
      MetalogicsWidget.showNotification();
    }
  }, 5000);
})();
