(function () {
  "use strict";

  // Prevent multiple initializations
  if (window.__METABOT_WIDGET_LOADED__) return;
  window.__METABOT_WIDGET_LOADED__ = true;

  // Configuration
  const DEFAULT_CONFIG = {
    apiBaseUrl: "https://metabot-ai-backend-production.up.railway.app",
    geminiApiKey: "", // Will be set from environment
    position: "bottom-right",
    theme: "dark",
    autoOpen: false,
    showNotifications: true,
  };

  // Widget styles
  const WIDGET_STYLES = `
    .metabot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
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
      width: 28px;
      height: 28px;
      stroke: white;
      fill: none;
      stroke-width: 2;
      transition: transform 0.3s ease;
    }

    .metabot-close-icon {
      width: 24px;
      height: 24px;
      stroke: white;
      fill: none;
      stroke-width: 2;
      transition: transform 0.3s ease;
    }

    .metabot-chat-container {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 520px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: scale(0.8) translateY(20px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
    }

    .metabot-chat-container.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      visibility: visible;
    }

    .metabot-chat-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .metabot-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .metabot-header-text {
      flex: 1;
    }

    .metabot-header-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 2px 0;
      background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .metabot-header-subtitle {
      font-size: 12px;
      opacity: 0.8;
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
    }

    .metabot-minimize-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metabot-minimize-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .metabot-chat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .metabot-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .metabot-messages::-webkit-scrollbar {
      width: 4px;
    }

    .metabot-messages::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }

    .metabot-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    .metabot-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      animation: messageSlideIn 0.3s ease-out;
    }

    .metabot-message.user {
      flex-direction: row-reverse;
    }

    .metabot-message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
    }

    .metabot-message-avatar.bot {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .metabot-message-avatar.user {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
      color: white;
    }

    .metabot-message-content {
      max-width: 280px;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .metabot-message.bot .metabot-message-content {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-bottom-left-radius: 4px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .metabot-message.user .metabot-message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .metabot-input-area {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      flex-shrink: 0;
    }

    .metabot-input-container {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .metabot-input-wrapper {
      flex: 1;
      position: relative;
    }

    .metabot-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 12px 16px;
      color: white;
      font-size: 14px;
      resize: none;
      outline: none;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }

    .metabot-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .metabot-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }

    .metabot-send-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .metabot-send-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .metabot-send-btn:active {
      transform: translateY(0);
    }

    .metabot-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .metabot-typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-width: fit-content;
    }

    .metabot-typing-dots {
      display: flex;
      gap: 4px;
    }

    .metabot-typing-dot {
      width: 6px;
      height: 6px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: typingBounce 1.4s infinite ease-in-out;
    }

    .metabot-typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .metabot-typing-dot:nth-child(2) { animation-delay: -0.16s; }

    .metabot-notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes typingBounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.7;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
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
  `;

  // Simple AI Chat Implementation
  class MetabotAI {
    constructor(config) {
      this.config = config;
      this.messages = [];
    }

    async sendMessage(message) {
      // Add user message
      this.messages.push({ role: "user", content: message });

      // Simulate AI response (replace with actual API call)
      return new Promise((resolve) => {
        setTimeout(() => {
          const responses = [
            "Hello! I'm your AI assistant. How can I help you today?",
            "I'd be happy to help you with information about our services. What would you like to know?",
            "That's a great question! Let me provide you with some information.",
            "I can help you book a consultation or answer questions about our services. What interests you most?",
            "Thank you for your message. I'm here to assist you with any questions you might have.",
          ];

          const response =
            responses[Math.floor(Math.random() * responses.length)];
          this.messages.push({ role: "assistant", content: response });
          resolve(response);
        }, 1000 + Math.random() * 2000);
      });
    }
  }

  // Main Widget Class
  class MetabotWidget {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.isOpen = false;
      this.ai = new MetabotAI(this.config);
      this.messages = [
        {
          role: "assistant",
          content:
            "Welcome to Metalogics.io! How can I help you today? I can provide information about our services or help you book a consultation.",
        },
      ];

      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.setupEventListeners();
      this.renderMessages();
    }

    injectStyles() {
      if (document.getElementById("metabot-widget-styles")) return;

      const styleSheet = document.createElement("style");
      styleSheet.id = "metabot-widget-styles";
      styleSheet.textContent = WIDGET_STYLES;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      // Create main container
      this.container = document.createElement("div");
      this.container.className = "metabot-widget";

      // Create chat button
      this.chatButton = document.createElement("button");
      this.chatButton.className = "metabot-chat-button";
      this.chatButton.innerHTML = `
        <svg class="metabot-chat-icon" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      `;

      // Create notification dot
      this.notificationDot = document.createElement("div");
      this.notificationDot.className = "metabot-notification-dot";
      this.notificationDot.style.display = "none";

      // Create chat container
      this.chatContainer = document.createElement("div");
      this.chatContainer.className = "metabot-chat-container";
      this.chatContainer.innerHTML = `
        <div class="metabot-chat-header">
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
        </div>
        <div class="metabot-chat-content">
          <div class="metabot-messages"></div>
          <div class="metabot-input-area">
            <div class="metabot-input-container">
              <div class="metabot-input-wrapper">
                <textarea class="metabot-input" placeholder="Type your message..." rows="1"></textarea>
              </div>
              <button class="metabot-send-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      // Get references to elements
      this.messagesContainer =
        this.chatContainer.querySelector(".metabot-messages");
      this.input = this.chatContainer.querySelector(".metabot-input");
      this.sendBtn = this.chatContainer.querySelector(".metabot-send-btn");
      this.minimizeBtn = this.chatContainer.querySelector(
        ".metabot-minimize-btn"
      );

      // Assemble widget
      this.chatButton.appendChild(this.notificationDot);
      this.container.appendChild(this.chatButton);
      this.container.appendChild(this.chatContainer);
      document.body.appendChild(this.container);
    }

    setupEventListeners() {
      // Chat button click
      this.chatButton.addEventListener("click", () => this.toggle());

      // Minimize button click
      this.minimizeBtn.addEventListener("click", () => this.close());

      // Send button click
      this.sendBtn.addEventListener("click", () => this.sendMessage());

      // Enter key to send
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      this.input.addEventListener("input", () => {
        this.input.style.height = "auto";
        this.input.style.height = Math.min(this.input.scrollHeight, 120) + "px";
      });

      // Close on escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.chatContainer.classList.add("open");
      this.notificationDot.style.display = "none";

      // Update button icon
      this.chatButton.innerHTML = `
        <svg class="metabot-close-icon" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `;

      // Focus input
      setTimeout(() => this.input.focus(), 300);
    }

    close() {
      this.isOpen = false;
      this.chatContainer.classList.remove("open");

      // Update button icon
      this.chatButton.innerHTML = `
        <svg class="metabot-chat-icon" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      `;
    }

    async sendMessage() {
      const message = this.input.value.trim();
      if (!message) return;

      // Add user message
      this.messages.push({ role: "user", content: message });
      this.input.value = "";
      this.input.style.height = "auto";
      this.renderMessages();

      // Show typing indicator
      this.showTypingIndicator();

      try {
        // Get AI response
        const response = await this.ai.sendMessage(message);

        // Add AI response
        this.messages.push({ role: "assistant", content: response });
        this.hideTypingIndicator();
        this.renderMessages();
      } catch (error) {
        console.error("Error sending message:", error);
        this.hideTypingIndicator();
        this.messages.push({
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        });
        this.renderMessages();
      }
    }

    renderMessages() {
      this.messagesContainer.innerHTML = "";

      this.messages.forEach((message) => {
        const messageEl = document.createElement("div");
        messageEl.className = `metabot-message ${
          message.role === "user" ? "user" : "bot"
        }`;

        const avatarEl = document.createElement("div");
        avatarEl.className = `metabot-message-avatar ${
          message.role === "user" ? "user" : "bot"
        }`;
        avatarEl.textContent = message.role === "user" ? "U" : "AI";

        const contentEl = document.createElement("div");
        contentEl.className = "metabot-message-content";
        contentEl.textContent = message.content;

        messageEl.appendChild(avatarEl);
        messageEl.appendChild(contentEl);
        this.messagesContainer.appendChild(messageEl);
      });

      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
      const typingEl = document.createElement("div");
      typingEl.className = "metabot-message bot";
      typingEl.innerHTML = `
        <div class="metabot-message-avatar bot">AI</div>
        <div class="metabot-typing-indicator">
          <div class="metabot-typing-dots">
            <div class="metabot-typing-dot"></div>
            <div class="metabot-typing-dot"></div>
            <div class="metabot-typing-dot"></div>
          </div>
          <span style="color: rgba(255,255,255,0.7); font-size: 12px; margin-left: 8px;">AI is typing...</span>
        </div>
      `;
      typingEl.id = "typing-indicator";
      this.messagesContainer.appendChild(typingEl);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
      const typingEl = document.getElementById("typing-indicator");
      if (typingEl) {
        typingEl.remove();
      }
    }

    showNotification() {
      if (!this.isOpen) {
        this.notificationDot.style.display = "block";
      }
    }

    destroy() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      const styles = document.getElementById("metabot-widget-styles");
      if (styles) {
        styles.remove();
      }
    }
  }

  // Global API
  window.MetabotWidget = MetabotWidget;

  // Auto-initialize if config is provided
  if (window.METABOT_CONFIG) {
    window.metabotWidget = new MetabotWidget(window.METABOT_CONFIG);
  } else {
    // Default initialization
    window.metabotWidget = new MetabotWidget();
  }

  // Expose methods for external control
  window.Metabot = {
    open: () => window.metabotWidget?.open(),
    close: () => window.metabotWidget?.close(),
    toggle: () => window.metabotWidget?.toggle(),
    showNotification: () => window.metabotWidget?.showNotification(),
    destroy: () => window.metabotWidget?.destroy(),
  };
})();
