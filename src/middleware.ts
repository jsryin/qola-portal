import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // 跳过 Next.js 静态文件、API 等
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.match(/\.(.*)$/)
    ) {
        return NextResponse.next();
    }

    // 提取 subdomain, 兼容处理本地与生产环境
    const currentHost = hostname.split(':')[0];
    const isLocal = currentHost.endsWith('localhost');
    const baseDomain = isLocal ? 'localhost' : 'qola.com';

    let subdomain = '';
    if (currentHost.endsWith(`.${baseDomain}`)) {
        subdomain = currentHost.replace(`.${baseDomain}`, '');
    }

    // 忽略 www，当作没有 subdomain
    if (subdomain === 'www') subdomain = '';

    // 1. 如果直接访问主域名 (如 qola.com)，且路径是根路径 /
    if (!subdomain && url.pathname === '/') {
        // 默认跳转到 /countries (由于那里有拦截，会跳 /countries/en)
        url.pathname = '/countries';
        return NextResponse.redirect(url);
    }

    // 2. 如果访问子域名 (如 ae.qola.com)
    if (subdomain) {
        // 这里我们采用 Rewrite（重写）方式，使得用户地址栏保留 ae.qola.com
        // 但实际渲染的是类似 /ae 的路径。
        // 如果您希望直接让地址栏也变成 qola.com/ae，可以将下面的 rewrite 改为 redirect。

        // 如果路径还没有带有国家前缀，添加上该前缀
        if (!url.pathname.startsWith(`/${subdomain}`)) {
            // Next-on-Pages 可能会在重写时进入死循环，如果是这样我们从 header 判断是否已经重写过
            if (request.headers.get('x-rewritten-subdomain') === subdomain) {
                return NextResponse.next();
            }

            const rewrittenPath = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
            url.pathname = rewrittenPath;

            const response = NextResponse.rewrite(url);
            response.headers.set('x-rewritten-subdomain', subdomain);
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // 匹配所有的路径，除了静态文件和 API
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
    ],
};
