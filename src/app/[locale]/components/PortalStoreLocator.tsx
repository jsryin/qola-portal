"use client";

import { useEffect, useRef, useState, useMemo } from "react";

// Storepoint Widget 的 API Key（模块级常量，避免重复创建）
const STOREPOINT_API_KEY = "1693e6faed815d";

export default function PortalStoreLocator() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 使用 key 来强制重新创建 iframe
  const [iframeKey, setIframeKey] = useState(0);

  // 构建 iframe 的 HTML 内容（使用 useMemo 缓存，避免每次渲染重新创建）
  const iframeContent = useMemo(() => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        #storepoint-container {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="storepoint-container"></div>
      <script>
        (function() {
          window.loadStorepoint = function() {
            if (window.StorepointWidget) {
              new window.StorepointWidget(
                "${STOREPOINT_API_KEY}",
                "#storepoint-container",
                {}
              );
              // 通知父窗口加载完成
              window.parent.postMessage({ type: 'storepoint-loaded' }, '*');
            }
          };
          
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.src = 'https://widget.storepoint.co/embed.js';
          script.onload = function() {
            if (typeof window.loadStorepoint === 'function') {
              window.loadStorepoint();
            }
          };
          document.head.appendChild(script);
        })();
      </script>
    </body>
    </html>
  `, []);

  useEffect(() => {
    // 每次组件挂载时，强制更新 iframe key 以重新创建 iframe
    setIframeKey(prev => prev + 1);
    setIsLoading(true);

    // 监听来自 iframe 的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'storepoint-loaded') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // 设置超时，防止永久 loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // 写入 iframe 内容
    const writeContent = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(iframeContent);
          doc.close();
        }
      } catch (error) {
        console.warn("无法写入 iframe 内容:", error);
      }
    };

    // 确保 iframe 已加载
    if (iframe.contentDocument?.readyState === 'complete') {
      writeContent();
    } else {
      iframe.addEventListener('load', writeContent, { once: true });
    }
  }, [iframeKey, iframeContent]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-50">
      {/* Loading 指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-amber-600 rounded-full animate-spin"></div>
            <span className="text-gray-500 text-sm">Loading map...</span>
          </div>
        </div>
      )}
      
      {/* iframe 容器 */}
      <iframe
        key={`storepoint-iframe-${iframeKey}`}
        ref={iframeRef}
        title="Store Locator"
        className="w-full h-full min-h-[500px] border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}

