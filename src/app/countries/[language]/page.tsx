import Link from "next/link";
import Image from "next/image";
import CountryClient from "./CountryClient";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function RegionsPage({
    params,
}: {
    params: Promise<{ language: string }>;
}) {
    const { language } = await params;

    // 1. 简单的多语言标题词典（在导航页本身实现国际化）
    const titles: Record<string, { title: string; subtitle: string; choose: string; searchPlaceholder: string; noResults: string; noResultsDetail: string; clearSearch: string; footerText: string; poweredBy: string; selectLanguage: string }> = {
        zh: {
            title: "选择您的国家或地区",
            subtitle: "请在下方列表中选择与您相关的区域，以获取本地化的服务和产品。",
            choose: "选择",
            searchPlaceholder: "搜索国家或地区...",
            noResults: "未找到相关国家或地区",
            noResultsDetail: "请尝试使用其他关键字重新搜索。",
            clearSearch: "清除搜索",
            footerText: "选择您的国家以继续访问本网站的本地化版本。",
            poweredBy: "技术支持",
            selectLanguage: "选择语言"
        },
        en: {
            title: "Choose your country or region",
            subtitle: "Please select your region below to discover local services and products.",
            choose: "Select",
            searchPlaceholder: "Search countries or regions...",
            noResults: "No countries found",
            noResultsDetail: "Please try searching with different keywords.",
            clearSearch: "Clear Search",
            footerText: "Select your country to continue to the localized version of our website.",
            poweredBy: "Powered by",
            selectLanguage: "Select Language"
        },
        fr: {
            title: "Choisissez votre pays ou région",
            subtitle: "Veuillez sélectionner votre région ci-dessous pour découvrir les services locaux.",
            choose: "Choisir",
            searchPlaceholder: "Rechercher des pays ou régions...",
            noResults: "Aucun pays trouvé",
            noResultsDetail: "Veuillez essayer de rechercher avec d'autres mots-clés.",
            clearSearch: "Effacer la recherche",
            footerText: "Sélectionnez votre pays pour continuer vers la version localisée de notre site web.",
            poweredBy: "Propulsé par",
            selectLanguage: "Choisir la langue"
        },
    };

    // 根据 params 中带来的 language 自适应语言，如果没有匹配则默认展示英语版
    const t = titles[language] || titles.en;

    // 2. 模拟的国家/地区配置数据
    const regions = [
        { id: "us", lang: "en", name: "United States", group: "Americas", flag: "🇺🇸", code: "EN" },
        { id: "ae", lang: "en", name: "United Arab Emirates", group: "Middle East", flag: "🇦🇪", code: "EN" },
        { id: "my", lang: "en", name: "Malaysia", group: "Asia", flag: "🇲🇾", code: "EN" },
        { id: "iq", lang: "en", name: "Iraq", group: "Middle East", flag: "🇮🇶", code: "EN" },
        { id: "it", lang: "en", name: "Italy", group: "Europe", flag: "🇮🇹", code: "EN" },
        { id: "th", lang: "en", name: "Thailand", group: "Asia", flag: "🇹🇭", code: "EN" },
        { id: "za", lang: "en", name: "South Africa", group: "Africa", flag: "🇿🇦", code: "EN" },
        { id: "id", lang: "en", name: "Indonesia", group: "Asia", flag: "🇮🇩", code: "EN" },
        { id: "mo", lang: "en", name: "Macau", group: "Asia", flag: "🇲🇴", code: "EN" },
        { id: "mx", lang: "en", name: "Mexico", group: "Americas", flag: "🇲🇽", code: "EN" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden flex flex-col">
            {/* 背景发光装饰（致敬 qolamall 风格） */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

            {/* 页面头部：Logo栏 */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95">
                            <Image
                                src="/logo-ctr.png"
                                alt="Logo"
                                width={93}
                                height={40}
                                className="h-[40px] w-auto mix-blend-multiply"
                                priority
                            />
                        </Link>
                        <LanguageSwitcher currentLang={language} label={t.selectLanguage} />
                    </div>
                </div>
            </div>

            {/* 主要内容区 */}
            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col py-6 md:py-10 px-4 relative z-10">
                <div className="w-full">
                    {/* 导航页头部 */}
                    <div className="text-center mb-10 space-y-6">
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent leading-tight pb-2">{t.title}</h1>
                            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                {t.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* 核心功能区：复用带有搜索逻辑和网格列表的客户端组件 */}
                    <CountryClient regions={regions} t={t} currentLanguage={language} />

                    {/* ---------------- 仅用于开发调试 ---------------- */}
                    <div className="mt-20 pt-10 border-t border-gray-200/60 hidden">
                        <p className="text-sm text-center text-gray-400 mb-6">
                            👆 以上就是您完美的网关页。<br />
                            👇 下面是给开发同学准备的快速切换测试按钮（体验 URL 的不同带来标题的变化）：
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <Link
                                href="/countries/zh"
                                className="text-sm px-6 py-2.5 bg-white/50 border border-gray-200 rounded-full text-gray-700 hover:bg-white hover:shadow-md transition-all font-medium"
                            >
                                🇨🇳 模拟测试：/countries/zh
                            </Link>
                            <Link
                                href="/countries/en"
                                className="text-sm px-6 py-2.5 bg-white/50 border border-gray-200 rounded-full text-gray-700 hover:bg-white hover:shadow-md transition-all font-medium"
                            >
                                🇬🇧 模拟测试：/countries/en
                            </Link>
                            <Link
                                href="/countries/fr"
                                className="text-sm px-6 py-2.5 bg-white/50 border border-gray-200 rounded-full text-gray-700 hover:bg-white hover:shadow-md transition-all font-medium"
                            >
                                🇫🇷 模拟测试：/countries/fr
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 页脚信息 */}
            <div className="border-t border-border/40 bg-background/70 backdrop-blur-md mt-auto relative z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {t.footerText}
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground/70">
                            <span>{t.poweredBy}</span>
                            <span className="font-semibold text-primary transition-transform duration-200 hover:scale-110 cursor-pointer">
                                QOLA
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
