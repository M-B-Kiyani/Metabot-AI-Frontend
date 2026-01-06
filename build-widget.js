// Build script to create a standalone widget bundle
import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create standalone widget bundle
const buildStandaloneWidget = async () => {
  console.log("🚀 Building Metalogics AI Standalone Widget...");

  try {
    // Copy the standalone widget script
    const standaloneScript = fs.readFileSync(
      path.join(__dirname, "widget-standalone.js"),
      "utf8"
    );

    // Ensure dist directory exists
    if (!fs.existsSync("dist")) {
      fs.mkdirSync("dist");
    }

    // Write the standalone widget
    fs.writeFileSync(
      path.join(__dirname, "dist/metalogics-widget.js"),
      standaloneScript
    );

    console.log("✅ Standalone widget created at: dist/metalogics-widget.js");

    // Create a minified version
    await esbuild.build({
      entryPoints: [path.join(__dirname, "widget-standalone.js")],
      bundle: false,
      minify: true,
      outfile: path.join(__dirname, "dist/metalogics-widget.min.js"),
      format: "iife",
      target: ["es2020"],
      platform: "browser",
    });

    console.log("✅ Minified widget created at: dist/metalogics-widget.min.js");

    // Create integration examples
    createIntegrationExamples();

    console.log("🎉 Standalone widget build completed successfully!");
    console.log("\n📋 Integration Instructions:");
    console.log("1. Copy dist/metalogics-widget.min.js to your website");
    console.log(
      '2. Add <script src="metalogics-widget.min.js"></script> to your HTML'
    );
    console.log("3. The widget will auto-initialize with full functionality!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
};

// Create integration examples
const createIntegrationExamples = () => {
  // Basic integration example
  const basicExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metalogics AI Widget - Basic Integration</title>
</head>
<body>
    <h1>Your Website Content</h1>
    <p>The Metalogics AI widget will appear in the bottom-right corner.</p>
    
    <!-- Metalogics AI Widget - Single Script Integration -->
    <script src="metalogics-widget.min.js"></script>
</body>
</html>`;

  // Advanced integration example
  const advancedExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metalogics AI Widget - Advanced Integration</title>
</head>
<body>
    <h1>Your Website Content</h1>
    
    <!-- Metalogics AI Widget -->
    <script src="metalogics-widget.min.js"></script>
    
    <!-- Optional: Custom widget controls -->
    <script>
        // Wait for widget to load
        document.addEventListener('DOMContentLoaded', function() {
            // Custom controls (optional)
            
            // Show notification programmatically
            setTimeout(() => {
                if (window.MetalogicsWidget) {
                    window.MetalogicsWidget.showNotification();
                }
            }, 3000);
            
            // Open widget programmatically
            // window.MetalogicsWidget.open();
            
            // Close widget programmatically  
            // window.MetalogicsWidget.close();
            
            // Destroy widget if needed
            // window.MetalogicsWidget.destroy();
        });
    </script>
</body>
</html>`;

  // WordPress integration example
  const wordpressExample = `<?php
/*
 * Metalogics AI Widget Integration for WordPress
 * Add this to your theme's functions.php file
 */

function add_metalogics_widget() {
    ?>
    <script src="<?php echo get_template_directory_uri(); ?>/js/metalogics-widget.min.js"></script>
    <?php
}
add_action('wp_footer', 'add_metalogics_widget');
?>`;

  // Save examples
  fs.writeFileSync(
    path.join(__dirname, "dist/integration-basic.html"),
    basicExample
  );
  fs.writeFileSync(
    path.join(__dirname, "dist/integration-advanced.html"),
    advancedExample
  );
  fs.writeFileSync(
    path.join(__dirname, "dist/integration-wordpress.php"),
    wordpressExample
  );

  console.log("✅ Integration examples created in dist/ folder");
};

// Build the standalone widget
buildStandaloneWidget();
