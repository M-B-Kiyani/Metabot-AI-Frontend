(function () {
  if (window.__METABOT_LOADED__) return;
  window.__METABOT_LOADED__ = true;

  // Create styles
  const styles = `
    .metabot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .metabot-chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .metabot-chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
    }

    .metabot-chat-button:active {
      transform: scale(0.95);
    }

    .metabot-chat-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      border-radius: 50%;
    }

    .metabot-chat-icon {
      width: 24px;
      height: 24px;
      fill: white;
      transition: transform 0.3s ease;
    }

    .metabot-close-icon {
      width: 20px;
      height: 20px;
      fill: white;
      transform: rotate(45deg);
      transition: transform 0.3s ease;
    }

    .metabot-chat-container {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 520px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      transform: scale(0.8) translateY(20px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .metabot-chat-container.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      visibility: visible;
    }

    .metabot-chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .metabot-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
    }

    .metabot-header-text {
      flex: 1;
    }

    .metabot-header-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 2px 0;
    }

    .metabot-header-subtitle {
      font-size: 12px;
      opacity: 0.9;
      margin: 0;
    }

    .metabot-minimize-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .metabot-minimize-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .metabot-chat-iframe {
      width: 100%;
      height: calc(100% - 80px);
      border: none;
      background: white;
    }

    .metabot-notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      background: #ff4757;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 480px) {
      .metabot-widget {
        bottom: 10px;
        right: 10px;
      }
      
      .metabot-chat-container {
        width: calc(100vw - 20px);
        height: calc(100vh - 100px);
        bottom: 80px;
        right: 0;
      }
    }

    .metabot-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: #f8f9fa;
    }

    .metabot-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e9ecef;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Inject styles
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget container
  const widget = document.createElement("div");
  widget.className = "metabot-widget";

  // Create chat button
  const chatButton = document.createElement("button");
  chatButton.className = "metabot-chat-button";
  chatButton.innerHTML = `
    <svg class="metabot-chat-icon" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
  `;

  // Create notification dot (optional - can be shown when there are new messages)
  const notificationDot = document.createElement("div");
  notificationDot.className = "metabot-notification-dot";
  notificationDot.style.display = "none";

  // Create chat container
  const chatContainer = document.createElement("div");
  chatContainer.className = "metabot-chat-container";

  // Create chat header
  const chatHeader = document.createElement("div");
  chatHeader.className = "metabot-chat-header";
  chatHeader.innerHTML = `
    <div class="metabot-avatar">AI</div>
    <div class="metabot-header-text">
      <h3 class="metabot-header-title">MetaBot Assistant</h3>
      <p class="metabot-header-subtitle">We're here to help you</p>
    </div>
    <button class="metabot-minimize-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13H5v-2h14v2z"/>
      </svg>
    </button>
  `;

  // Create iframe with loading state
  const iframeContainer = document.createElement("div");
  iframeContainer.style.height = "calc(100% - 80px)";
  iframeContainer.style.position = "relative";

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "metabot-loading";
  loadingDiv.innerHTML = '<div class="metabot-spinner"></div>';

  const iframe = document.createElement("iframe");
  iframe.className = "metabot-chat-iframe";
  iframe.src = "https://metabot-ai-frontend-production.up.railway.app/widget";
  iframe.style.display = "none";

  // Handle iframe loading
  iframe.onload = function () {
    loadingDiv.style.display = "none";
    iframe.style.display = "block";
  };

  iframeContainer.appendChild(loadingDiv);
  iframeContainer.appendChild(iframe);

  // Assemble the widget
  chatContainer.appendChild(chatHeader);
  chatContainer.appendChild(iframeContainer);

  chatButton.appendChild(notificationDot);
  widget.appendChild(chatButton);
  widget.appendChild(chatContainer);

  // Add event listeners
  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;

    if (isOpen) {
      chatContainer.classList.add("open");
      chatButton.innerHTML = `
        <svg class="metabot-close-icon" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      `;
      // Hide notification dot when chat is opened
      notificationDot.style.display = "none";
    } else {
      chatContainer.classList.remove("open");
      chatButton.innerHTML = `
        <svg class="metabot-chat-icon" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      `;
    }
  }

  chatButton.addEventListener("click", toggleChat);

  // Minimize button
  const minimizeBtn = chatHeader.querySelector(".metabot-minimize-btn");
  minimizeBtn.addEventListener("click", toggleChat);

  // Close on escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) {
      toggleChat();
    }
  });

  // Optional: Show notification dot (you can call this function when you want to show notifications)
  window.showMetabotNotification = function () {
    if (!isOpen) {
      notificationDot.style.display = "block";
    }
  };

  // Optional: Hide notification dot
  window.hideMetabotNotification = function () {
    notificationDot.style.display = "none";
  };

  // Add to page
  document.body.appendChild(widget);

  // Optional: Auto-open after a delay (uncomment if desired)
  // setTimeout(() => {
  //   if (!isOpen) {
  //     window.showMetabotNotification();
  //   }
  // }, 5000);
})();
