"use client";

import { useState, useCallback, useEffect, createContext, useContext, ReactNode, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toast 类型定义
 */
type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

// 1. 静态配置提升到组件外，避免每次渲染都重新创建对象
const TOAST_CONFIG = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    bg: "bg-white/90 border-emerald-100/50 text-emerald-900 shadow-emerald-500/10",
    iconBg: "bg-emerald-50/50",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    bg: "bg-white/90 border-rose-100/50 text-rose-900 shadow-rose-500/10",
    iconBg: "bg-rose-50/50",
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-500" />,
    bg: "bg-white/90 border-blue-100/50 text-blue-900 shadow-blue-500/10",
    iconBg: "bg-blue-50/50",
  },
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * 内部使用的单个 Toast 组件
 */
function ToastItem({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: ToastType; 
  onClose: () => void; 
}) {
  const [isExiting, setIsExiting] = useState(false);
  const config = TOAST_CONFIG[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 300); // 等待退出动画结束
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, 3000); // 3秒后自动关闭
    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <div 
      role="alert"
      className={cn(
        "fixed top-8 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        config.bg,
        isExiting 
          ? "opacity-0 -translate-y-4 scale-95" 
          : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-full duration-700 [--tw-enter-translate-x:-50%]"
      )}
    >
      <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl shrink-0", config.iconBg)}>
        {config.icon}
      </div>
      
      <p className="flex-1 text-[14px] font-medium leading-relaxed tracking-tight">
        {message}
      </p>

      <button 
        onClick={handleClose}
        className="shrink-0 p-1.5 rounded-lg hover:bg-black/5 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity" />
      </button>

      {/* 进度条：使用 Tailwind 任意值写法减少静态 style 标签渲染 */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-current opacity-10 w-full origin-left animate-[toast-progress_3s_linear_forwards]" />
      
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}

/**
 * Toast 提供者组件
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    // 快速连续点击时，直接更新内容，并赋予新的 ID 以重置组件生命周期
    setToast({ id: nextId.current++, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // 使用 useMemo 缓存 context value，防止 Provider 重渲染导致所有 consumer 重渲染
  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted && toast && createPortal(
        <ToastItem 
          key={toast.id}
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />,
        document.body
      )}
    </ToastContext.Provider>
  );
}

/**
 * 使用 Toast 的 Hook
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

