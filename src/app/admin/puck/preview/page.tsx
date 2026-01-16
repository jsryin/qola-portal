"use client";

import { useEffect, useState } from "react";
import { Render, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck.css";
import { puckConfig, initialData } from "@/lib/puck";

/**
 * Puck 预览页面
 * 访问路径: /admin/puck/preview
 * 用于预览草稿内容
 */
export default function PuckPreviewPage() {
  const [data, setData] = useState<Data>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 sessionStorage 读取预览数据
    const previewData = sessionStorage.getItem("puck-preview-data");
    if (previewData) {
      try {
        const parsedData = JSON.parse(previewData);
        setData(parsedData);
      } catch (error) {
        console.error("解析预览数据失败:", error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#6b7280",
        }}
      >
        加载预览内容...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* 预览内容 */}
      <div style={{ padding: "24px" }}>
        <Render config={puckConfig} data={data} />
      </div>
    </div>
  );
}
