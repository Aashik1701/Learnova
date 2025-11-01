import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler to filter out Chrome extension errors
window.addEventListener("error", (event) => {
  // Filter out Chrome extension errors that don't affect the app
  if (
    event.message?.includes("chrome-extension://") ||
    event.filename?.includes("chrome-extension://") ||
    event.error?.message?.includes("chrome-extension://")
  ) {
    event.preventDefault();
    console.warn("Chrome extension error filtered (does not affect app):", event.message);
    return false;
  }
});

// Handle unhandled promise rejections from Chrome extensions
window.addEventListener("unhandledrejection", (event) => {
  const errorMessage = event.reason?.message || String(event.reason || "");
  if (errorMessage.includes("chrome-extension://")) {
    event.preventDefault();
    console.warn("Chrome extension promise rejection filtered (does not affect app):", errorMessage);
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
