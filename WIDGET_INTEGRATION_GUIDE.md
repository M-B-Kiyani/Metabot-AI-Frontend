# 🤖 MetaBot Widget Integration Guide

A modern, standalone AI chatbot widget that integrates seamlessly into any website without iframes or external dependencies.

## 🚀 Quick Start

Add our AI chatbot to your website with just one line of code:

```html
<script src="https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js"></script>
```

That's it! The widget will automatically appear on your website with full functionality.

## ✨ Key Features

### 🎨 Modern Design

- **Glassmorphism UI** with backdrop blur effects
- **Smooth animations** and micro-interactions
- **Mobile-responsive** design that works on all devices
- **Professional styling** with gradient backgrounds

### ⚡ Performance

- **No iframe overhead** - direct DOM integration
- **Lightweight bundle** - optimized for fast loading
- **Minimal footprint** - doesn't interfere with your site
- **Fast initialization** - ready in milliseconds

### 🔧 Easy Integration

- **One-line installation** - no complex setup
- **Universal compatibility** - works with any website
- **No dependencies** - completely self-contained
- **Programmatic control** - JavaScript API for custom behavior

### 🤖 AI Capabilities

- **Intelligent conversations** powered by advanced AI
- **Booking system** for appointment scheduling
- **Voice chat support** for natural interactions
- **Real-time responses** with typing indicators

## 📋 Integration Examples

### Basic Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to my site</h1>

    <!-- MetaBot Widget -->
    <script src="https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js"></script>
  </body>
</html>
```

### Custom Configuration

```html
<script>
  window.METABOT_CONFIG = {
    apiBaseUrl: "https://your-api.com",
    position: "bottom-left",
    theme: "dark",
    autoOpen: false,
    showNotifications: true,
  };
</script>
<script src="https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js"></script>
```

### Programmatic Control

```html
<button onclick="Metabot.open()">Open Chat</button>
<button onclick="Metabot.close()">Close Chat</button>
<button onclick="Metabot.toggle()">Toggle Chat</button>
<button onclick="Metabot.showNotification()">Show Notification</button>

<script src="https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js"></script>
```

## 🛠️ Platform-Specific Integration

### WordPress

Add to your theme's `functions.php`:

```php
function add_metabot_widget() {
    wp_enqueue_script(
        'metabot-widget',
        'https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'add_metabot_widget');
```

### React

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      window.Metabot?.destroy();
    };
  }, []);

  return <div>Your React App</div>;
}
```

### Vue.js

```vue
<template>
  <div>Your Vue App</div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement("script");
    script.src =
      "https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js";
    script.async = true;
    document.body.appendChild(script);
  },
  beforeDestroy() {
    window.Metabot?.destroy();
  },
};
</script>
```

### Shopify

Add to your theme's `theme.liquid` before the closing `</body>` tag:

```html
<script src="https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js"></script>
```

### Squarespace

1. Go to Settings → Advanced → Code Injection
2. Add to Footer:

```html
<script src="https://metabot-ai-frontend-production.up.railway.app/metabot-widget-standalone.js"></script>
```

## ⚙️ Configuration Options

```javascript
window.METABOT_CONFIG = {
  // API Configuration
  apiBaseUrl: "https://your-api.com", // Your backend API URL
  geminiApiKey: "your-api-key", // Gemini API key (optional)

  // Widget Appearance
  position: "bottom-right", // 'bottom-right', 'bottom-left'
  theme: "dark", // 'dark', 'light'

  // Behavior
  autoOpen: false, // Auto-open on page load
  showNotifications: true, // Show notification dot

  // Custom Messages
  welcomeMessage: "Hello! How can I help you?", // Custom welcome message
};
```

## 🎮 JavaScript API

### Methods

```javascript
// Widget Control
Metabot.open(); // Open the chat widget
Metabot.close(); // Close the chat widget
Metabot.toggle(); // Toggle widget open/closed
Metabot.destroy(); // Remove widget from page

// Notifications
Metabot.showNotification(); // Show notification dot
```

### Events

```javascript
// Listen for widget events
window.addEventListener("metabot:opened", () => {
  console.log("Widget opened");
});

window.addEventListener("metabot:closed", () => {
  console.log("Widget closed");
});

window.addEventListener("metabot:message", (event) => {
  console.log("New message:", event.detail);
});
```

## 🎨 Customization

### CSS Custom Properties

Override widget styling with CSS variables:

```css
:root {
  --metabot-primary-color: #667eea;
  --metabot-secondary-color: #764ba2;
  --metabot-text-color: #ffffff;
  --metabot-background: rgba(15, 23, 42, 0.95);
  --metabot-border-radius: 16px;
  --metabot-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

### Custom Positioning

```css
.metabot-widget {
  bottom: 20px !important;
  left: 20px !important; /* Move to bottom-left */
  right: auto !important;
}
```

## 📱 Mobile Optimization

The widget automatically adapts to mobile devices:

- **Responsive sizing** - adjusts to screen size
- **Touch-friendly** - optimized for touch interactions
- **Full-screen mode** - expands to full screen on small devices
- **Keyboard handling** - proper keyboard support

## 🔒 Security & Privacy

- **No data collection** - respects user privacy
- **Secure communication** - HTTPS only
- **No tracking** - doesn't track user behavior
- **GDPR compliant** - follows privacy regulations

## 🚀 Performance

- **Lightweight** - < 50KB gzipped
- **Fast loading** - optimized bundle size
- **Lazy loading** - loads components on demand
- **Memory efficient** - minimal memory footprint

## 🛠️ Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify script URL is accessible
3. Ensure no ad blockers are interfering
4. Check for JavaScript errors on your site

### Styling Issues

1. Check for CSS conflicts
2. Verify z-index is sufficient (default: 2147483647)
3. Ensure no parent elements have overflow: hidden

### API Issues

1. Verify API endpoint is accessible
2. Check CORS configuration
3. Ensure API key is valid (if required)

## 📞 Support

Need help? We're here for you:

- **Email**: contact@metalogics.io
- **Documentation**: [View Full Docs](https://metabot-ai-frontend-production.up.railway.app)
- **Demo**: [Try Live Demo](https://metabot-ai-frontend-production.up.railway.app)

## 📄 License

This widget is provided by Metalogics.io. Contact us for licensing information.

---

**Ready to enhance your website with AI?**
Add the widget now and start engaging with your visitors like never before! 🚀
