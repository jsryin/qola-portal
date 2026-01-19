"use client";

import type { Config } from "@puckeditor/core";
import React, { Fragment } from "react";

// Portal 组件导入
import PortalHero from "@/app/[country]/[language]/components/PortalHero";
import PortalVideo from "@/app/[country]/[language]/components/PortalVideo";
import PortalProductFeatures from "@/app/[country]/[language]/components/PortalProductFeatures";
import PortalDidYouKnow from "@/app/[country]/[language]/components/PortalDidYouKnow";
import PortalAboutUs from "@/app/[country]/[language]/components/PortalAboutUs";
import PortalUsageScenarios from "@/app/[country]/[language]/components/PortalUsageScenarios";
import PortalFlavors from "@/app/[country]/[language]/components/PortalFlavors";
import PortalCustomerReviews from "@/app/[country]/[language]/components/PortalCustomerReviews";
import PortalFAQ from "@/app/[country]/[language]/components/PortalFAQ";
import PortalCommunity from "@/app/[country]/[language]/components/PortalCommunity";
import PortalPouchFeatures from "@/app/[country]/[language]/components/PortalPouchFeatures";
import PortalUserGuide from "@/app/[country]/[language]/components/PortalUserGuide";
import PortalFooter from "@/app/[country]/[language]/components/PortalFooter";
import MouseFollower from "@/app/[country]/[language]/components/MouseFollower";

/**
 * Portal 组件的 Puck 配置
 * 这些组件可以在 Puck 编辑器中拖拽使用，用于创建类似 ClientPortal 首页风格的页面
 */
export const portalComponents: Config["components"] = {
    // ==================== 页面布局组件 ====================

    /**
     * Portal 页面容器
     * 提供统一的页面背景和鼠标跟随效果
     */
    PortalContainer: {
        label: "📦 Portal 容器",
        fields: {
            showMouseFollower: {
                type: "radio",
                label: "显示鼠标跟随效果",
                options: [
                    { label: "是", value: "yes" },
                    { label: "否", value: "no" },
                ],
            },
            backgroundColor: {
                type: "text",
                label: "背景颜色",
            },
        },
        defaultProps: {
            showMouseFollower: "yes",
            backgroundColor: "#1c1917", // stone-900
        },
        render: ({ showMouseFollower, backgroundColor, puck }: any) => {
            return (
                <div
                    className="relative min-h-screen"
                    style={{ backgroundColor }}
                >
                    {showMouseFollower === "yes" && <MouseFollower />}
                    {puck.renderDropZone({ zone: "content" })}
                </div>
            );
        },
    },

    // ==================== Hero 区块 ====================

    /**
     * Portal Hero 轮播组件
     * 首屏展示，支持轮播切换
     */
    PortalHeroBlock: {
        label: "🎠 Hero 轮播",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="sticky top-0 h-screen w-full bg-stone-900">
                    <PortalHero />
                </div>
            );
        },
    },

    // ==================== 视频区块 ====================

    /**
     * Portal 视频组件
     * 全屏视频展示，滚动时自动播放
     */
    PortalVideoBlock: {
        label: "🎬 视频区块",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalVideo />
                </div>
            );
        },
    },

    // ==================== 产品特性区块 ====================

    /**
     * Portal 产品特性组件
     * 展示产品图片和特性列表
     */
    PortalProductFeaturesBlock: {
        label: "✨ 产品特性",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalProductFeatures />
                </div>
            );
        },
    },

    // ==================== Did You Know 区块 ====================

    /**
     * Portal 介绍卡片组件
     * "Did you know us?" 双卡片介绍
     */
    PortalDidYouKnowBlock: {
        label: "💡 Did You Know",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalDidYouKnow />
                </div>
            );
        },
    },

    // ==================== 关于我们区块 ====================

    /**
     * Portal 关于我们组件
     * 公司介绍和 Logo 滚动
     */
    PortalAboutUsBlock: {
        label: "🏢 关于我们",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalAboutUs />
                </div>
            );
        },
    },

    // ==================== 使用场景区块 ====================

    /**
     * Portal 使用场景组件
     * 图片横向滚动展示
     */
    PortalUsageScenariosBlock: {
        label: "🎯 使用场景",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalUsageScenarios />
                </div>
            );
        },
    },

    // ==================== 口味列表区块 ====================

    /**
     * Portal 口味展示组件
     * 鼠标悬停显示产品图片
     */
    PortalFlavorsBlock: {
        label: "🍬 口味列表",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalFlavors />
                </div>
            );
        },
    },

    // ==================== 用户评论区块 ====================

    /**
     * Portal 用户评论组件
     * 评论卡片网格 + 滚动分离动画
     */
    PortalCustomerReviewsBlock: {
        label: "💬 用户评论",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalCustomerReviews />
                </div>
            );
        },
    },

    // ==================== FAQ 区块 ====================

    /**
     * Portal FAQ 组件
     * 滚动触发的手风琴式问答
     */
    PortalFAQBlock: {
        label: "❓ FAQ",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalFAQ />
                </div>
            );
        },
    },

    // ==================== 社区区块 ====================

    /**
     * Portal 社区组件
     * 社交媒体图片横向滚动
     */
    PortalCommunityBlock: {
        label: "🌐 社区",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalCommunity />
                </div>
            );
        },
    },

    // ==================== 产品对比区块 ====================

    /**
     * Portal 产品对比组件
     * 滚动文字 + 进度条对比图
     */
    PortalPouchFeaturesBlock: {
        label: "📊 产品对比",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalPouchFeatures />
                </div>
            );
        },
    },

    // ==================== 使用指南区块 ====================

    /**
     * Portal 使用指南组件
     * 四步骤使用教程
     */
    PortalUserGuideBlock: {
        label: "📖 使用指南",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalUserGuide />
                </div>
            );
        },
    },

    // ==================== 页脚区块 ====================

    /**
     * Portal 页脚组件
     * 完整的页脚，包含导航、联系方式、订阅表单
     */
    PortalFooterBlock: {
        label: "🦶 页脚",
        fields: {},
        defaultProps: {},
        render: () => {
            return (
                <div className="relative z-30">
                    <PortalFooter />
                </div>
            );
        },
    },
};
