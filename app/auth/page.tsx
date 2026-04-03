"use client";

/**
 * Auth Token 接收页。
 *
 * 从 CIMS-web 跳转而来，URL 带 ?token=xxx，
 * 存入 localStorage 后跳转到管理面板首页。
 */

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/api";
import { Spinner } from "@fluentui/react-components";

export default function AuthTransferPage() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");
            if (token) {
                setToken(token);
            }
            // 跳转到管理面板首页（replace 防止返回循环）
            router.replace("/");
        }
    }, [router]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Spinner label="正在验证并登录管理面板..." />
        </div>
    );
}
