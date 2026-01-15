import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // 已注释以支持后端部署
  //如果您将此应用部署在 example.github.io/my-repo 下，
  //则需要将 basePath 设置为 "/my-repo"
  //您可以在 GitHub Actions 中设置环境变量 NEXT_PUBLIC_BASE_PATH
  basePath: "",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
trailingSlash: false, // 明确不使用尾随斜杠，有助于 Cloudflare 匹配路由
};

export default nextConfig;
