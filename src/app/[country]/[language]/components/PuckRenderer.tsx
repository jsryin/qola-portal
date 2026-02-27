"use client";

import { Render, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "@/app/admin/puck/puck.css";
import { puckConfig } from "@/lib/puck/config";

interface PuckRendererProps {
    data: Data;
    language?: string;
}

/**
 * Puck 内容渲染器 (客户端组件)
 */
export default function PuckRenderer({ data, language }: PuckRendererProps) {
    // 确保语言信息被注入到数据中，以便组件 render 函数可以使用
    const dataWithLang = {
        ...data,
        root: {
            ...data.root,
            props: {
                ...(data.root.props as any),
                language: language || (data.root.props as any)?.language
            }
        }
    };

    return (
        <div className="puck-renderer-container" style={{ minHeight: "100vh" }}>
            <Render config={puckConfig} data={dataWithLang} />
        </div>
    );
}
