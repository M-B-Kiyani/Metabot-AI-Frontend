<?php
/**
 * Plugin Name: Metalogics Chatbot Widget
 * Plugin URI: https://metalogics.io
 * Description: AI-powered chatbot widget with voice capabilities for WordPress sites
 * Version: 1.0.0
 * Author: Metalogics
 * License: GPL v2 or later
 * Text Domain: metalogics-chatbot
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class MetalogicsChatbotPlugin {
    
    private $plugin_url;
    private $plugin_path;
    
    public function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->plugin_path = plugin_dir_path(__FILE__);
        
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        load_plugin_textdomain('metalogics-chatbot', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_scripts() {
        // Only load on frontend and if enabled
        if (is_admin() || !get_option('metalogics_chatbot_enabled', true)) {
            return;
        }
        
        // Check if API key is configured
        $api_key = get_option('metalogics_api_key', '');
        if (empty($api_key)) {
            return;
        }
        
        // Retell SDK for voice features
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
            $this->plugin_url . 'assets/metalogics-chatbot.css',
            array(),
            '1.0.0'
        );
        
        // Widget JavaScript
        wp_enqueue_script(
            'metalogics-chatbot-js',
            $this->plugin_url . 'assets/metalogics-chatbot.iife.js',
            array('retell-sdk'),
            '1.0.0',
            true
        );
        
        // Configuration
        $config = array(
            'apiKey' => get_option('metalogics_api_key', ''),
            'apiUrl' => get_option('metalogics_api_url', 'https://metabot-ai-backend-production.up.railway.app'),
            'retellAgentId' => get_option('metalogics_retell_agent_id', ''),
            'brandColor' => get_option('metalogics_brand_color', '#3b82f6'),
            'position' => get_option('metalogics_position', 'bottom-right'),
            'greeting' => get_option('metalogics_greeting', 'Welcome to our website! How can I help you today?')
        );
        
        // Initialize the chatbot
        wp_add_inline_script('metalogics-chatbot-js', 
            'document.addEventListener("DOMContentLoaded", function() {
                if (window.MetalogicsChatbot) {
                    window.MetalogicsChatbot.init(' . json_encode($config) . ');
                }
            });'
        );
    }
    
    public function admin_menu() {
        add_options_page(
            __('Metalogics Chatbot Settings', 'metalogics-chatbot'),
            __('Metalogics Chatbot', 'metalogics-chatbot'),
            'manage_options',
            'metalogics-chatbot',
            array($this, 'admin_page')
        );
    }
    
    public function admin_init() {
        register_setting('metalogics_chatbot_settings', 'metalogics_chatbot_enabled');
        register_setting('metalogics_chatbot_settings', 'metalogics_api_key');
        register_setting('metalogics_chatbot_settings', 'metalogics_api_url');
        register_setting('metalogics_chatbot_settings', 'metalogics_retell_agent_id');
        register_setting('metalogics_chatbot_settings', 'metalogics_brand_color');
        register_setting('metalogics_chatbot_settings', 'metalogics_position');
        register_setting('metalogics_chatbot_settings', 'metalogics_greeting');
        register_setting('metalogics_chatbot_settings', 'metalogics_show_on_pages');
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            // Verify nonce
            if (!wp_verify_nonce($_POST['metalogics_nonce'], 'metalogics_settings')) {
                wp_die(__('Security check failed', 'metalogics-chatbot'));
            }
            
            // Update options
            update_option('metalogics_chatbot_enabled', isset($_POST['enabled']) ? 1 : 0);
            update_option('metalogics_api_key', sanitize_text_field($_POST['api_key']));
            update_option('metalogics_api_url', esc_url_raw($_POST['api_url']));
            update_option('metalogics_retell_agent_id', sanitize_text_field($_POST['retell_agent_id']));
            update_option('metalogics_brand_color', sanitize_hex_color($_POST['brand_color']));
            update_option('metalogics_position', sanitize_text_field($_POST['position']));
            update_option('metalogics_greeting', sanitize_textarea_field($_POST['greeting']));
            update_option('metalogics_show_on_pages', sanitize_text_field($_POST['show_on_pages']));
            
            echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'metalogics-chatbot') . '</p></div>';
        }
        
        // Get current values
        $enabled = get_option('metalogics_chatbot_enabled', true);
        $api_key = get_option('metalogics_api_key', '');
        $api_url = get_option('metalogics_api_url', 'https://metabot-ai-backend-production.up.railway.app');
        $retell_agent_id = get_option('metalogics_retell_agent_id', '');
        $brand_color = get_option('metalogics_brand_color', '#3b82f6');
        $position = get_option('metalogics_position', 'bottom-right');
        $greeting = get_option('metalogics_greeting', 'Welcome to our website! How can I help you today?');
        $show_on_pages = get_option('metalogics_show_on_pages', 'all');
        ?>
        <div class="wrap">
            <h1><?php _e('Metalogics Chatbot Settings', 'metalogics-chatbot'); ?></h1>
            
            <div class="card" style="max-width: 800px;">
                <h2><?php _e('Configuration', 'metalogics-chatbot'); ?></h2>
                
                <form method="post" action="">
                    <?php wp_nonce_field('metalogics_settings', 'metalogics_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row"><?php _e('Enable Chatbot', 'metalogics-chatbot'); ?></th>
                            <td>
                                <label>
                                    <input type="checkbox" name="enabled" value="1" <?php checked($enabled, 1); ?> />
                                    <?php _e('Show chatbot on website', 'metalogics-chatbot'); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row"><?php _e('API Key', 'metalogics-chatbot'); ?> *</th>
                            <td>
                                <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" required />
                                <p class="description"><?php _e('Your Gemini API key (required)', 'metalogics-chatbot'); ?></p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row"><?php _e('Backend API URL', 'metalogics-chatbot'); ?> *</th>
                            <td>
                                <input type="url" name="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" required />
                                <p class="description"><?php _e('Your backend API endpoint', 'metalogics-chatbot'); ?></p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row"><?php _e('Retell Agent ID', 'metalogics-chatbot'); ?></th>
                            <td>
                                <input type="text" name="retell_agent_id" value="<?php echo esc_attr($retell_agent_id); ?>" class="regular-text" />
                                <p class="description"><?php _e('Optional: For voice chat features', 'metalogics-chatbot'); ?></p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row"><?php _e('Brand Color', 'metalogics-chatbot'); ?></th>
                            <td>
                                <input type="color" name="brand_color" value="<?php echo esc_attr($brand_color); ?>" />
                                <p class="description"><?php _e('Primary color for the chatbot interface', 'metalogics-chatbot'); ?></p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row"><?php _e('Position', 'metalogics-chatbot'); ?></th>
                            <td>
                                <select name="position">
                                    <option value="bottom-right" <?php selected($position, 'bottom-right'); ?>><?php _e('Bottom Right', 'metalogics-chatbot'); ?></option>
                                    <option value="bottom-left" <?php selected($position, 'bottom-left'); ?>><?php _e('Bottom Left', 'metalogics-chatbot'); ?></option>
                                </select>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row"><?php _e('Welcome Message', 'metalogics-chatbot'); ?></th>
                            <td>
                                <textarea name="greeting" rows="3" cols="50" class="large-text"><?php echo esc_textarea($greeting); ?></textarea>
                                <p class="description"><?php _e('First message users see when opening the chat', 'metalogics-chatbot'); ?></p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row"><?php _e('Show On Pages', 'metalogics-chatbot'); ?></th>
                            <td>
                                <select name="show_on_pages">
                                    <option value="all" <?php selected($show_on_pages, 'all'); ?>><?php _e('All Pages', 'metalogics-chatbot'); ?></option>
                                    <option value="homepage" <?php selected($show_on_pages, 'homepage'); ?>><?php _e('Homepage Only', 'metalogics-chatbot'); ?></option>
                                    <option value="posts" <?php selected($show_on_pages, 'posts'); ?>><?php _e('Posts Only', 'metalogics-chatbot'); ?></option>
                                    <option value="pages" <?php selected($show_on_pages, 'pages'); ?>><?php _e('Pages Only', 'metalogics-chatbot'); ?></option>
                                </select>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button(); ?>
                </form>
            </div>
            
            <div class="card" style="max-width: 800px; margin-top: 20px;">
                <h2><?php _e('Installation Instructions', 'metalogics-chatbot'); ?></h2>
                <ol>
                    <li><?php _e('Upload the widget files (metalogics-chatbot.iife.js and metalogics-chatbot.css) to the plugin assets folder', 'metalogics-chatbot'); ?></li>
                    <li><?php _e('Configure your API key and backend URL above', 'metalogics-chatbot'); ?></li>
                    <li><?php _e('Enable the chatbot and save settings', 'metalogics-chatbot'); ?></li>
                    <li><?php _e('The chatbot will appear on your website automatically', 'metalogics-chatbot'); ?></li>
                </ol>
                
                <h3><?php _e('File Locations', 'metalogics-chatbot'); ?></h3>
                <p><?php _e('Upload these files to:', 'metalogics-chatbot'); ?></p>
                <ul>
                    <li><code><?php echo $this->plugin_path; ?>assets/metalogics-chatbot.iife.js</code></li>
                    <li><code><?php echo $this->plugin_path; ?>assets/metalogics-chatbot.css</code></li>
                </ul>
            </div>
            
            <div class="card" style="max-width: 800px; margin-top: 20px;">
                <h2><?php _e('Support', 'metalogics-chatbot'); ?></h2>
                <p><?php _e('For support and documentation, visit:', 'metalogics-chatbot'); ?> <a href="https://metalogics.io" target="_blank">https://metalogics.io</a></p>
            </div>
        </div>
        
        <style>
        .card {
            background: #fff;
            border: 1px solid #ccd0d4;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
        }
        .card h2 {
            margin-top: 0;
        }
        </style>
        <?php
    }
    
    public function activate() {
        // Set default options
        add_option('metalogics_chatbot_enabled', true);
        add_option('metalogics_api_url', 'https://metabot-ai-backend-production.up.railway.app');
        add_option('metalogics_brand_color', '#3b82f6');
        add_option('metalogics_position', 'bottom-right');
        add_option('metalogics_greeting', 'Welcome to our website! How can I help you today?');
        add_option('metalogics_show_on_pages', 'all');
    }
    
    public function deactivate() {
        // Clean up if needed (but keep settings for reactivation)
    }
}

// Initialize the plugin
new MetalogicsChatbotPlugin();

// Add settings link to plugins page
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function($links) {
    $settings_link = '<a href="' . admin_url('options-general.php?page=metalogics-chatbot') . '">' . __('Settings') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
});
?>