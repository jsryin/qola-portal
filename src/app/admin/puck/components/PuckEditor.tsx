"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck.css";
import { puckConfig, initialData } from "@/lib/puck";
import { useCallback, useState } from "react";

/**
 * Puck 编辑器客户端组件
 */
export default function PuckEditor() {
  const [data, setData] = useState<Data>(initialData);

  // 发布回调
  const handlePublish = useCallback((publishData: Data) => {
    console.log("发布数据:", publishData);
    // TODO: 保存到数据库
    alert("页面已发布！查看控制台获取数据。");
  }, []);

  // 数据变更回调
  const handleChange = useCallback((changeData: Data) => {
    setData(changeData);
  }, []);

  // 预览回调
  const handlePreview = useCallback(() => {
    // 将当前数据存储到 sessionStorage
    sessionStorage.setItem("puck-preview-data", JSON.stringify(data));
    // 在新窗口中打开预览页面
    window.open("/admin/puck/preview", "_blank");
  }, [data]);

  // 保存回调
  const handleSave = useCallback(() => {
    console.log("保存草稿数据:", data);
    // TODO: 保存草稿到数据库
    alert("草稿已保存！查看控制台获取数据。");
  }, [data]);

  return (
    <Puck
      config={puckConfig}
      data={data}
      onPublish={handlePublish}
      onChange={handleChange}
      overrides={{
        headerActions: ({ children }) => (
          <>
            <button
              onClick={handlePreview}
              style={{
                marginRight: "8px",
                padding: "8px 16px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#4b5563";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6b7280";
              }}
            >
              View Page
            </button>
            <button
              onClick={handleSave}
              style={{
                marginRight: "8px",
                padding: "8px 16px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#10b981";
              }}
            >
              Save
            </button>
            {children}
          </>
        ),
      }}
    />
  );
}
