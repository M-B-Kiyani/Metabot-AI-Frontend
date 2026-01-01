import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import WidgetApp from "./components/WidgetApp";

// Check if we're in widget mode based on URL path
const isWidgetMode =
  window.location.pathname === "/widget" ||
  window.location.pathname.includes("/widget");

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Render appropriate component based on mode
root.render(
  <React.StrictMode>{isWidgetMode ? <WidgetApp /> : <App />}</React.StrictMode>
);
