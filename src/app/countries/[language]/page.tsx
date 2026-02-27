export const runtime = "edge";
export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import CountryClient from "./CountryClient";
import LanguageSwitcher from "./LanguageSwitcher";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export default async function RegionsPage({
    params,
}: {
    params: Promise<{ language: string }>;
}) {
    const { language } = await params;

    const t = await getTranslations({
        locale: language,
        namespace: 'Countries'
    });

    const rt = await getTranslations({
        locale: language,
        namespace: 'Regions'
    });

    // 获取所有消息以供客户端组件使用
    const messages = await getMessages({ locale: language });

    // 2. 模拟的国家/地区配置数据
    const staticRegions = [
        { id: "us", flag: "🇺🇸", codes: ["EN"] },
        { id: "ae", flag: "🇦🇪", codes: ["EN", "AR"] },
        { id: "my", flag: "🇲🇾", codes: ["EN"] },
        { id: "iq", flag: "🇮🇶", codes: ["EN", "AR"] },
        { id: "it", flag: "🇮🇹", codes: ["EN"] },
        { id: "th", flag: "🇹🇭", codes: ["EN"] },
        { id: "za", flag: "🇿🇦", codes: ["EN"] },
        { id: "id", flag: "🇮🇩", codes: ["EN"] },
        { id: "mo", flag: "🇲🇴", codes: ["EN"] },
        { id: "mx", flag: "🇲🇽", codes: ["EN"] },
    ];

    const regions = staticRegions.map(r => ({
        ...r,
        name: rt(r.id),
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden flex flex-col">
            {/* 背景发光装饰（致敬 qolamall 风格） */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

            {/* 页面头部：Logo栏 */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="inline-block">
                            <Image
                                src="/logo-ctr.png"
                                alt="Logo"
                                width={93}
                                height={40}
                                className="h-[40px] w-auto mix-blend-multiply"
                                priority
                            />
                        </div>
                        <LanguageSwitcher currentLang={language} label={t('selectLanguage')} />
                    </div>
                </div>
            </div>

            {/* 主要内容区 */}
            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col py-6 md:py-10 px-4 relative z-10">
                <div className="w-full">
                    {/* 导航页头部 */}
                    <div className="text-center mb-10 space-y-6">
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent leading-tight pb-2">{t('title')}</h1>
                            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* 核心功能区：复用带有搜索逻辑和网格列表的客户端组件 */}
                    <NextIntlClientProvider messages={messages} locale={language}>
                        <CountryClient regions={regions} currentLanguage={language} />
                    </NextIntlClientProvider>

                </div>
            </div>

            {/* 页脚信息 */}
            <div className="border-t border-border/40 bg-background/70 backdrop-blur-md mt-auto relative z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {t('footerText')}
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground/70">
                            <span>{t('poweredBy')}</span>
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
