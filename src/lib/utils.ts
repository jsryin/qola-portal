import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 获取静态资源路径，自动处理 GitHub Pages 的 basePath
 * @param path 资源路径，如 "/images/logo.png"
 * @returns 处理后的路径
 */
export function getAssetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path) return path;
  
  // 如果是外部链接，直接返回
  if (path.startsWith("http") || path.startsWith("//") || path.startsWith("data:")) {
    return path;
  }
  
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // 如果 basePath 已经包含在路径开头，则不再重复添加
  if (basePath && normalizedPath.startsWith(basePath)) {
    return normalizedPath;
  }
  
  return `${basePath}${normalizedPath}`;
}
