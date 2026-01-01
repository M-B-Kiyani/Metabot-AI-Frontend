# WordPress Integration Guide - Metalogics Chatbot Widget

## 🎯 Overview

This guide shows you how to integrate your Metalogics AI chatbot widget into any WordPress website using a floating chat icon. The widget provides both text and voice chat capabilities.

## 🚀 Quick WordPress Integration (3 Methods)

### Method 1: Plugin-Based Integration (Recommended)

**Step 1:** Install a code injection plugin

- Go to **Plugins → Add New**
- Search for "Insert Headers and Footers" or "Code Snippets"
- Install and activate

**Step 2:** Upload your widget files

- Upload `dist/metalogics-chatbot.iife.js` and `dist/metalogics-chatbot.css` to your WordPress media library or hosting
- Note the URLs (e.g., `https://yoursite.com/wp-content/uploads/chatbot/`)

**Step 3:** Add the widget code

- Go to **Settings → Insert Headers and Footers**
- In the "Scripts in Footer" section, paste:

```html
<!-- Retell SDK (for voice features) -->
<script src="https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.0/dist/retell-client-js-sdk.min.js"></script>

<!-- Metalogics Widget CSS -->
<link
  rel="stylesheet"
  href="https://yoursite.com/wp-content/uploads/chatbot/metalogics-chatbot.css"
/>

<!-- Metalogics Widget Script -->
<script
  src="https://yoursite.com/wp-content/uploads/chatbot/metalogics-chatbot.iife.js"
  data-api-key="YOUR_GEMINI_API_KEY"
  data-api-url="https://your-backend-url.com"
  data-retell-agent-id="YOUR_RETELL_AGENT_ID"
  data-brand-color="#3b82f6"
  data-position="bottom-right"
></script>
```

**Step 4:** Configure your settings

- Replace `YOUR_GEMINI_API_KEY` with your actual Gemini API key
- Replace `https://your-backend-url.com` with your backend URL
- Replace `YOUR_RETELL_AGENT_ID` with your Retell agent ID (optional)
- Customize `data-brand-color` to match your site's theme
- Save changes

### Method 2: Theme Functions.php (Advanced)

Add this to your theme's `functions.php` file:

```php
<?php
function add_metalogics_chatbot() {
    // Only load on frontend
    if (!is_admin()) {
        // Retell SDK
        wp_enqueue_script(
            'retell-sdk',
            'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.0/dist/retell-client-js-sdk.min.js',
            array(),
            '2.0.0',
            true
        );

        // Widget CSS
        wp_enqueue_style(
            'metalogics-chatbot-css',
            get_template_directory_uri() . '/assets/metalogics-chatbot.css',
            array(),
            '1.0.0'
        );

        // Widget JS
        wp_enqueue_script(
            'metalogics-chatbot-js',
            get_template_directory_uri() . '/assets/metalogics-chatbot.iife.js',
            array('retell-sdk'),
            '1.0.0',
            true
        );

        // Configuration
        wp_add_inline_script('metalogics-chatbot-js', '
            document.addEventListener("DOMContentLoaded", function() {
                if (window.MetalogicsChatbot) {
                    window.MetalogicsChatbot.init({
                        apiKey: "' . get_option('metalogics_api_key', '') . '",
                        apiUrl: "' . get_option('metalogics_api_url', 'https://your-backend.com') . '",
                        retellAgentId: "' . get_option('metalogics_retell_agent_id', '') . '",
                        brandColor: "' . get_option('metalogics_brand_color', '#3b82f6') . '",
                        position: "' . get_option('metalogics_position', 'bottom-right') . '",
                        greeting: "' . get_option('metalogics_greeting', 'Welcome to our website! How can I help you today?') . '"
                    });
                }
            });
        ');
    }
}
add_action('wp_enqueue_scripts', 'add_metalogics_chatbot');

// Add admin options page
function metalogics_chatbot_admin_menu() {
    add_options_page(
        'Metalogics Chatbot Settings',
        'Metalogics Chatbot',
        'manage_options',
        'metalogics-chatbot',
        'metalogics_chatbot_admin_page'
    );
}
add_action('admin_menu', 'metalogics_chatbot_admin_menu');

function metalogics_chatbot_admin_page() {
    if (isset($_POST['submit'])) {
        update_option('metalogics_api_key', sanitize_text_field($_POST['api_key']));
        update_option('metalogics_api_url', esc_url_raw($_POST['api_url']));
        update_option('metalogics_retell_agent_id', sanitize_text_field($_POST['retell_agent_id']));
        update_option('metalogics_brand_color', sanitize_hex_color($_POST['brand_color']));
        update_option('metalogics_position', sanitize_text_field($_POST['position']));
        update_option('metalogics_greeting', sanitize_textarea_field($_POST['greeting']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }

    $api_key = get_option('metalogics_api_key', '');
    $api_url = get_option('metalogics_api_url', 'https://your-backend.com');
    $retell_agent_id = get_option('metalogics_retell_agent_id', '');
    $brand_color = get_option('metalogics_brand_color', '#3b82f6');
    $position = get_option('metalogics_position', 'bottom-right');
    $greeting = get_option('metalogics_greeting', 'Welcome to our website! How can I help you today?');
    ?>
    <div class="wrap">
        <h1>Metalogics Chatbot Settings</h1>
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">API Key</th>
                    <td><input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" required /></td>
                </tr>
                <tr>
                    <th scope="row">API URL</th>
                    <td><input type="url" name="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" required /></td>
                </tr>
                <tr>
                    <th scope="row">Retell Agent ID</th>
                    <td><input type="text" name="retell_agent_id" value="<?php echo esc_attr($retell_agent_id); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th scope="row">Brand Color</th>
                    <td><input type="color" name="brand_color" value="<?php echo esc_attr($brand_color); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row">Position</th>
                    <td>
                        <select name="position">
                            <option value="bottom-right" <?php selected($position, 'bottom-right'); ?>>Bottom Right</option>
                            <option value="bottom-left" <?php selected($position, 'bottom-left'); ?>>Bottom Left</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Greeting Message</th>
                    <td><textarea name="greeting" rows="3" cols="50"><?php echo esc_textarea($greeting); ?></textarea></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
?>
```

### Method 3: Direct Theme Integration

**Step 1:** Upload widget files to your theme

- Copy `metalogics-chatbot.iife.js` and `metalogics-chatbot.css` to your theme's folder
- Typically: `/wp-content/themes/your-theme/assets/`

**Step 2:** Edit your theme's `footer.php`
Add before the closing `</body>` tag:

```html
<!-- Retell SDK -->
<script src="https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.0/dist/retell-client-js-sdk.min.js"></script>

<!-- Metalogics Widget -->
<link
  rel="stylesheet"
  href="<?php echo get_template_directory_uri(); ?>/assets/metalogics-chatbot.css"
/>
<script
  src="<?php echo get_template_directory_uri(); ?>/assets/metalogics-chatbot.iife.js"
  data-api-key="YOUR_GEMINI_API_KEY"
  data-api-url="https://your-backend-url.com"
  data-retell-agent-id="YOUR_RETELL_AGENT_ID"
  data-brand-color="#3b82f6"
  data-position="bottom-right"
></script>
```

## 🎨 WordPress-Specific Customization

### Match Your WordPress Theme Colors

```javascript
// Get WordPress theme colors dynamically
window.MetalogicsChatbot.init({
  apiKey: "YOUR_API_KEY",
  apiUrl: "https://your-backend.com",
  brandColor:
    getComputedStyle(document.documentElement).getPropertyValue(
      "--wp--preset--color--primary"
    ) || "#3b82f6",
});
```

### Conditional Loading (Show only on specific pages)

```php
<?php
function add_metalogics_chatbot_conditional() {
    // Only load on homepage and contact page
    if (is_home() || is_page('contact')) {
        add_metalogics_chatbot();
    }
}
add_action('wp_enqueue_scripts', 'add_metalogics_chatbot_conditional');
?>
```

### WooCommerce Integration

```php
<?php
// Show chatbot on product pages for customer support
function add_chatbot_to_woocommerce() {
    if (is_product() || is_shop() || is_cart()) {
        add_metalogics_chatbot();
    }
}
add_action('wp_enqueue_scripts', 'add_chatbot_to_woocommerce');
?>
```

## 📱 Mobile Optimization for WordPress

The widget automatically adapts to WordPress themes:

```css
/* Add to your theme's style.css for additional mobile optimization */
@media (max-width: 768px) {
  .metalogics-chat-button {
    bottom: 20px !important;
    right: 20px !important;
    width: 60px !important;
    height: 60px !important;
  }

  .metalogics-chat-window {
    margin: 10px !important;
    height: calc(100vh - 20px) !important;
  }
}
```

## 🔧 WordPress-Specific Backend Configuration

If you're using WordPress as your backend too, add these endpoints:

```php
<?php
// Add to your theme's functions.php or a plugin

// REST API endpoint for chat
add_action('rest_api_init', function () {
    register_rest_route('metalogics/v1', '/chat', array(
        'methods' => 'POST',
        'callback' => 'handle_chat_request',
        'permission_callback' => '__return_true', // Add proper auth in production
    ));
});

function handle_chat_request($request) {
    $message = $request->get_param('message');
    $session_id = $request->get_param('sessionId');

    // Process with your AI service
    $response = process_ai_message($message, $session_id);

    return new WP_REST_Response(array(
        'response' => $response
    ), 200);
}

function process_ai_message($message, $session_id) {
    // Integrate with your AI service (Gemini, OpenAI, etc.)
    // This is where you'd call your AI API
    return "AI response to: " . $message;
}
?>
```

## 🛡️ Security Best Practices for WordPress

### 1. Secure API Keys

```php
<?php
// Store API keys in wp-config.php
define('METALOGICS_API_KEY', 'your-secret-api-key');
define('METALOGICS_API_URL', 'https://your-backend.com');

// Use in your code
$api_key = defined('METALOGICS_API_KEY') ? METALOGICS_API_KEY : '';
?>
```

### 2. Nonce Verification

```php
<?php
function metalogics_chatbot_admin_page() {
    if (isset($_POST['submit']) && wp_verify_nonce($_POST['metalogics_nonce'], 'metalogics_settings')) {
        // Process form
    }

    // Add nonce field to form
    wp_nonce_field('metalogics_settings', 'metalogics_nonce');
}
?>
```

### 3. Capability Checks

```php
<?php
function metalogics_chatbot_admin_menu() {
    add_options_page(
        'Metalogics Chatbot Settings',
        'Metalogics Chatbot',
        'manage_options', // Only administrators can access
        'metalogics-chatbot',
        'metalogics_chatbot_admin_page'
    );
}
?>
```

## 🧪 Testing Your WordPress Integration

### 1. Test on Different Themes

- Switch to a default WordPress theme (Twenty Twenty-Four)
- Verify the chatbot appears and functions correctly
- Test responsiveness on mobile

### 2. Test with Common Plugins

- WooCommerce
- Contact Form 7
- Yoast SEO
- Caching plugins (WP Rocket, W3 Total Cache)

### 3. Performance Testing

- Use GTmetrix or Google PageSpeed Insights
- Check that the widget doesn't significantly impact load times
- Test with caching enabled

## 🚀 WordPress Plugin Development (Advanced)

Create a complete WordPress plugin:

```php
<?php
/**
 * Plugin Name: Metalogics Chatbot Widget
 * Description: AI-powered chatbot with voice capabilities
 * Version: 1.0.0
 * Author: Metalogics
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class MetalogicsChatbotPlugin {

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'admin_menu'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    public function init() {
        // Plugin initialization
    }

    public function enqueue_scripts() {
        if (!is_admin() && get_option('metalogics_chatbot_enabled', true)) {
            // Enqueue scripts and styles
            wp_enqueue_script(
                'retell-sdk',
                'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.0/dist/retell-client-js-sdk.min.js',
                array(),
                '2.0.0',
                true
            );

            wp_enqueue_style(
                'metalogics-chatbot-css',
                plugin_dir_url(__FILE__) . 'assets/metalogics-chatbot.css',
                array(),
                '1.0.0'
            );

            wp_enqueue_script(
                'metalogics-chatbot-js',
                plugin_dir_url(__FILE__) . 'assets/metalogics-chatbot.iife.js',
                array('retell-sdk'),
                '1.0.0',
                true
            );

            // Add configuration
            $config = array(
                'apiKey' => get_option('metalogics_api_key', ''),
                'apiUrl' => get_option('metalogics_api_url', ''),
                'retellAgentId' => get_option('metalogics_retell_agent_id', ''),
                'brandColor' => get_option('metalogics_brand_color', '#3b82f6'),
                'position' => get_option('metalogics_position', 'bottom-right'),
                'greeting' => get_option('metalogics_greeting', 'Welcome! How can I help you?')
            );

            wp_add_inline_script('metalogics-chatbot-js',
                'document.addEventListener("DOMContentLoaded", function() {
                    if (window.MetalogicsChatbot) {
                        window.MetalogicsChatbot.init(' . json_encode($config) . ');
                    }
                });'
            );
        }
    }

    public function admin_menu() {
        add_options_page(
            'Metalogics Chatbot',
            'Metalogics Chatbot',
            'manage_options',
            'metalogics-chatbot',
            array($this, 'admin_page')
        );
    }

    public function admin_page() {
        // Admin page HTML
        include plugin_dir_path(__FILE__) . 'admin/settings-page.php';
    }

    public function activate() {
        // Set default options
        add_option('metalogics_chatbot_enabled', true);
        add_option('metalogics_brand_color', '#3b82f6');
        add_option('metalogics_position', 'bottom-right');
    }

    public function deactivate() {
        // Cleanup if needed
    }
}

// Initialize the plugin
new MetalogicsChatbotPlugin();
?>
```

## 📊 Analytics Integration for WordPress

### Google Analytics 4

```javascript
// Track chatbot interactions
window.MetalogicsChatbot.init({
  apiKey: "YOUR_API_KEY",
  apiUrl: "https://your-backend.com",
  onOpen: function () {
    gtag("event", "chatbot_opened", {
      event_category: "engagement",
      event_label: "Metalogics Chatbot",
    });
  },
  onMessage: function (message) {
    gtag("event", "chatbot_message_sent", {
      event_category: "engagement",
      event_label: "User Message",
    });
  },
});
```

### WordPress-specific Analytics

```php
<?php
// Track chatbot usage in WordPress admin
function track_chatbot_usage() {
    $usage_count = get_option('metalogics_usage_count', 0);
    update_option('metalogics_usage_count', $usage_count + 1);
}

// Add AJAX endpoint for tracking
add_action('wp_ajax_track_chatbot_usage', 'track_chatbot_usage');
add_action('wp_ajax_nopriv_track_chatbot_usage', 'track_chatbot_usage');
?>
```

## 🎯 Next Steps

1. **Choose your integration method** (Plugin-based recommended for beginners)
2. **Upload your widget files** to WordPress
3. **Configure your API keys** and backend URL
4. **Test thoroughly** on different devices and browsers
5. **Monitor performance** and user engagement
6. **Customize styling** to match your WordPress theme

## 🆘 WordPress-Specific Troubleshooting

### Widget not appearing

- Check if JavaScript is enabled
- Verify file paths are correct
- Check WordPress admin → Tools → Site Health for conflicts

### Conflicts with other plugins

- Deactivate other plugins temporarily to identify conflicts
- Check browser console for JavaScript errors
- Use WordPress debug mode: `define('WP_DEBUG', true);`

### Caching issues

- Clear all caches (WordPress, CDN, browser)
- Add cache exclusions for chatbot files
- Test in incognito mode

### Mobile issues on WordPress

- Check if theme is mobile-responsive
- Test with different WordPress themes
- Verify viewport meta tag is present

---

**Your Metalogics chatbot widget is now ready for WordPress integration!** 🎉

Choose the method that best fits your technical comfort level and WordPress setup.
