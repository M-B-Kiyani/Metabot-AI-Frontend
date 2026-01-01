(function () {
  if (window.__METABOT_LOADED__) return;
  window.__METABOT_LOADED__ = true;

  const iframe = document.createElement("iframe");

  iframe.src = "https://metabot-ai-frontend-production.up.railway.app/widget";
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "380px";
  iframe.style.height = "520px";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.style.borderRadius = "14px";
  iframe.style.boxShadow = "0 10px 40px rgba(0,0,0,0.25)";

  document.body.appendChild(iframe);
})();
