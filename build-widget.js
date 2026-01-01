// Build script to create a standalone widget bundle
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Widget entry point that will be bundled
const widgetEntry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import WidgetChatbot from './components/WidgetChatbot';
import WidgetBookingModal from './components/WidgetBookingModal';

// Widget styles (will be inlined)
const widgetStyles = \`
  .metabot-widget-container {
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
  }

  .metabot-chat-container.open {
    transform: scale(1) translateY(0);
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 480px) {
    .metabot-widget-container {
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
\`;

// Main Widget Class
class MetabotWidget {
  constructor(config = {}) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl || 'https://metabot-ai-backend-production.up.railway.app',
      agentId: config.agentId || 'your_retell_agent_id_here',
      position: config.position || 'bottom-right',
      ...config
    };
    
    this.isOpen = false;
    this.container = null;
    this.chatButton = null;
    this.chatContainer = null;
    this.reactRoot = null;
    
    this.init();
  }

  init() {
    // Inject styles
    this.injectStyles();
    
    // Create widget DOM
    this.createWidget();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  injectStyles() {
    if (document.getElementById('metabot-widget-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'metabot-widget-styles';
    styleSheet.textContent = widgetStyles;
    document.head.appendChild(styleSheet);
  }

  createWidget() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'metabot-widget-container';
    
    // Create chat button
    this.chatButton = document.createElement('button');
    this.chatButton.className = 'metabot-chat-button';
    this.chatButton.innerHTML = \`
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    \`;
    
    // Create chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'metabot-chat-container';
    
    // Assemble widget
    this.container.appendChild(this.chatButton);
    this.container.appendChild(this.chatContainer);
    document.body.appendChild(this.container);
  }

  setupEventListeners() {
    this.chatButton.addEventListener('click', () => this.toggle());
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
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
    this.chatContainer.classList.add('open');
    
    // Update button icon
    this.chatButton.innerHTML = \`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M6 18L18 6M6 6l12 12"/>
      </svg>
    \`;
    
    // Load React chat component if not already loaded
    if (!this.reactRoot) {
      this.loadChatComponent();
    }
  }

  close() {
    this.isOpen = false;
    this.chatContainer.classList.remove('open');
    
    // Update button icon
    this.chatButton.innerHTML = \`
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    \`;
  }

  loadChatComponent() {
    // Create React root and render chat component
    this.reactRoot = createRoot(this.chatContainer);
    this.reactRoot.render(React.createElement(WidgetChatbot, {
      config: this.config,
      onClose: () => this.close()
    }));
  }

  destroy() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    const styles = document.getElementById('metabot-widget-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Global initialization function
window.MetabotWidget = MetabotWidget;

// Auto-initialize if config is provided
if (window.METABOT_CONFIG) {
  new MetabotWidget(window.METABOT_CONFIG);
}

export default MetabotWidget;
`;

// Write the entry file
fs.writeFileSync(path.join(__dirname, "widget-entry.js"), widgetEntry);

// Build configuration
const buildConfig = {
  entryPoints: ["widget-entry.js"],
  bundle: true,
  minify: true,
  format: "iife",
  globalName: "MetabotWidget",
  outfile: "dist/metabot-widget.js",
  external: [], // Bundle everything
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
    ".jsx": "jsx",
    ".js": "js",
  },
  target: ["es2020"],
  platform: "browser",
};

// Build the widget
esbuild
  .build(buildConfig)
  .then(() => {
    console.log("✅ Widget built successfully!");

    // Clean up temporary file
    fs.unlinkSync(path.join(__dirname, "widget-entry.js"));

    console.log("📦 Widget bundle created at: dist/metabot-widget.js");
  })
  .catch((error) => {
    console.error("❌ Build failed:", error);
    process.exit(1);
  });
