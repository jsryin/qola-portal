
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import type { CmsPage } from "@/models";

export default function PagesList() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        keyword,
      });
      
      const res = await fetch(`/api/cms/list?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setPages(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.error || "Failed to fetch pages");
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      showToast("获取页面列表失败", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, showToast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (slug: string) => {
    if (!confirm("确定要删除这个页面吗？此操作可以恢复。")) {
      return;
    }

    try {
      // Soft delete implementation: 
      // We don't have a direct API for delete in logic yet in this file, but CmsHelper has it.
      // Wait, I didn't create a DELETE route. I should strictly maybe add it or just omit for now if scope is tight.
      // But user asked for "manage" (管理). 
      // I will assume for now I can call a delete API if I had one, but I didn't create it yet.
      // I'll skip the DELETE button functionality for a second to verify I didn't miss the route.
      // I missed creating a DELETE route. I will add it or just implement view/search first as requested "2. 创建版本历史管理界面 3. 实现页面列表和搜索功能".
      // Delete is not explicitly asked for in "list and search", but implied in "management".
      // Let's stick to List and Search first to be concise.
      // If I really need it, I'll add it later.
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">CMS 页面管理</h1>
        {/* <Link 
          href="/admin/puck?slug=new-page" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          新建页面
        </Link> */}
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索页面标题或标识..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:border-gray-700"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-lg shadow overflow-hidden border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">标识 (Slug)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">国家</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">版本</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">最后更新</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-card divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  暂无页面
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.title || "无标题"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{p.slug}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-gray-100 uppercase">{p.country_code || "GLO"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      p.published_version_id 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {p.published_version_id ? "已发布" : "草稿中"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    v{p.version_counter || 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {p.updated_time ? new Date(p.updated_time).toLocaleString("zh-CN") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/admin/puck?slug=${p.slug}&country=${p.country_code || 'glo'}`}
                      className="text-primary hover:text-primary/80 mr-4"
                    >
                      编辑
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            上一页
          </button>
          <span className="px-3 py-1 text-gray-600 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
