"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck.css";
import { puckConfig, initialData } from "@/lib/puck";
import { useCallback, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

import { CmsPageVersion } from "@/models";

/**
 * Puck 编辑器客户端组件
 */
export default function PuckEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = searchParams.get("slug") || "home"; // 默认编辑 home 页面
  
  const [data, setData] = useState<Data>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<CmsPageVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const { showToast } = useToast();

  // 加载草稿内容
  useEffect(() => {
    const loadDraft = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cms/load-draft?slug=${slug}`);
        const result = await response.json();

        if (result.success && result.content) {
          setData(result.content);
        } else {
          // 如果没有草稿，使用初始数据
          console.log("未找到草稿，使用初始数据");
        }
      } catch (error) {
        console.error("加载草稿失败:", error);
        showToast("加载草稿失败，使用初始数据", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [slug, showToast]);

  // 数据变更回调
  const handleChange = useCallback((changeData: Data) => {
    setData(changeData);
  }, []);

  // 保存草稿回调
  const handleSave = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/cms/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          content: data,
          userId: "admin", // TODO: 从用户会话获取
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast("草稿保存成功！", "success");
        
        // 如果 slug 发生了变化（Slug 被修改），更新 URL
        if (result.slug && result.slug !== slug) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("slug", result.slug);
          router.push(`${pathname}?${params.toString()}`);
        }
      } else {
        throw new Error(result.error || "保存失败");
      }
    } catch (error) {
      console.error("保存草稿失败:", error);
      showToast(`保存失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
    } finally {
      setIsSaving(false);
    }
  }, [data, slug, isSaving, router, pathname, searchParams, showToast]);

  // 发布回调
  const handlePublish = useCallback(async (publishData: Data) => {
    if (isPublishing) return;

    try {
      setIsPublishing(true);

      // 1. 先保存草稿
      const saveDraftResponse = await fetch("/api/cms/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          content: publishData,
          userId: "admin", // TODO: 从用户会话获取
        }),
      });

      const saveDraftResult = await saveDraftResponse.json();
      if (!saveDraftResult.success) {
        throw new Error(saveDraftResult.error || "保存草稿失败");
      }

      // 获取最新的 slug (如果 Slug 被修改了)
      const currentSlug = saveDraftResult.slug || slug;

      // 2. 发布页面
      const publishResponse = await fetch("/api/cms/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: currentSlug,
          userId: "admin", // TODO: 从用户会话获取
          remark: `发布于 ${new Date().toLocaleString("zh-CN")}`,
        }),
      });

      const publishResult = await publishResponse.json();

      if (publishResult.success) {
        showToast("页面发布成功！", "success");
        
        // 如果 slug 发生了变化，更新 URL
        if (currentSlug !== slug) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("slug", currentSlug);
          router.push(`${pathname}?${params.toString()}`);
        }
      } else {
        throw new Error(publishResult.error || "发布失败");
      }
    } catch (error) {
      console.error("发布页面失败:", error);
      showToast(`发布失败: ${error instanceof Error ? error.message : "未知错误"}`, "error");
    } finally {
      setIsPublishing(false);
    }
  }, [slug, isPublishing, router, pathname, searchParams, showToast]);

  // 预览回调
  const handlePreview = useCallback(() => {
    // 将当前数据存储到 sessionStorage
    sessionStorage.setItem("puck-preview-data", JSON.stringify(data));
    // 在新窗口中打开预览页面
    window.open("/admin/puck/preview", "_blank");
  }, [data]);

  // 获取版本历史
  const fetchVersions = useCallback(async () => {
    try {
      setLoadingVersions(true);
      const res = await fetch(`/api/cms/${slug}/versions`);
      const result = await res.json();
      if (result.success) {
        setVersions(result.data);
      } else {
        showToast("获取版本历史失败", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("获取版本历史失败", "error");
    } finally {
      setLoadingVersions(false);
    }
  }, [slug, showToast]);

  // 切换历史面板
  const toggleHistory = useCallback(() => {
    if (!showHistory) {
      fetchVersions();
    }
    setShowHistory((prev) => !prev);
  }, [showHistory, fetchVersions]);

  // 回滚版本
  const handleRestore = async (version: CmsPageVersion) => {
    if (!confirm(`确定要回滚到版本 v${version.version_num} 吗？当前草稿将被覆盖。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/${slug}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionNum: version.version_num, userId: "admin" }),
      });
      const result = await res.json();

      if (result.success) {
        showToast("回滚成功，正在刷新...", "success");
        // Reload page to fetch new draft content
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      showToast("回滚失败", "error");
    }
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e5e7eb",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ fontSize: "16px", color: "#6b7280" }}>
          加载编辑器中...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
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
                onClick={toggleHistory}
                style={{
                  marginRight: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6366f1";
                }}
              >
                History
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  marginRight: "8px",
                  padding: "8px 16px",
                  backgroundColor: isSaving ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  opacity: isSaving ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = "#10b981";
                  }
                }}
              >
                {isSaving ? "保存中..." : "Save"}
              </button>
              {children}
            </>
          ),
        }}
      />

      {/* 历史版本侧边栏 */}
      {showHistory && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "350px",
            backgroundColor: "white",
            boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
            zIndex: 1000,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            transition: "transform 0.3s ease-in-out"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>版本历史</h2>
            <button 
              onClick={() => setShowHistory(false)}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "20px", color: "#666" }}
            >
              ×
            </button>
          </div>

          {loadingVersions ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>加载中...</div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>暂无历史版本</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {versions.map((v) => (
                <div 
                  key={v.id} 
                  style={{ 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "8px", 
                    padding: "12px",
                    backgroundColor: v.is_published ? "#f0fdf4" : "white"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                      v{v.version_num}
                      {v.is_published ? <span style={{ marginLeft: "6px", backgroundColor: "#16a34a", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>Published</span> : null}
                    </span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {v.created_time ? new Date(v.created_time).toLocaleString("zh-CN") : ""}
                    </span>
                  </div>
                  {v.remark && (
                    <div style={{ fontSize: "13px", color: "#374151", marginBottom: "10px", fontStyle: "italic" }}>
                      "{v.remark}"
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleRestore(v)}
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "white",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        color: "#374151"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                    >
                      回滚至此版本
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
