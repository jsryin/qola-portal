"use client";

import { useEffect } from "react";

interface WindowWithStorepoint extends Window {
  loadStorepoint?: () => void;
  StorepointWidget?: new (
    apiKey: string,
    targetId: string,
    options: Record<string, unknown>
  ) => void;
}

export default function PortalStoreLocator() {
  useEffect(() => {
    const win = window as unknown as WindowWithStorepoint;

    // Define the global loader function
    win.loadStorepoint = function () {
      if (win.StorepointWidget) {
        new win.StorepointWidget(
          "1693e6faed815d",
          "#storepoint-widget",
          {}
        );
      }
    };

    // Check if script is already present
    const scriptId = "storepoint-embed-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.async = true;
      script.src = "https://widget.storepoint.co/embed.js";
      script.onload = function () {
        if (typeof win.loadStorepoint === "function") {
          win.loadStorepoint();
        }
      };
      document.head.appendChild(script);
    } else {
      // If script exists, manually trigger load
      if (typeof win.loadStorepoint === "function") {
        win.loadStorepoint();
      }
    }
  }, []);

  return (
    <div 
      id="storepoint-widget" 
      className="w-full h-full min-h-[500px] bg-gray-50" 
    />
  );
}
