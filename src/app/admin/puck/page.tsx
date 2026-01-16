"use client";

import dynamic from "next/dynamic";

// 禁用 SSR,避免 hydration 错误
// Puck 内部使用随机 ID,服务端和客户端会生成不同的值
const PuckEditor = dynamic(() => import("./components/PuckEditor"), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh" 
    }}>
      加载编辑器...
    </div>
  ),
});

/**
 * Puck 编辑器页面
 * 访问路径: /admin/puck
 */
export default function PuckEditorPage() {
  return <PuckEditor />;
}
