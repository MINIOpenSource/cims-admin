"use client";

/**
 * Admin 认证上下文。
 *
 * 不含登录/注册流程 — token 由 /auth 页面从 URL 参数注入。
 * 启动时探测 Admin API `/` 端点验证超管权限，
 * 无权限则跳转回主站。
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { adminApi, getToken, clearToken, getMainSiteUrl } from "./api";

interface AuthState {
    /** 是否已认证且为超管 */
    isAuthenticated: boolean;
    /** 当前 token */
    token: string | null;
    /** 正在加载（探测权限中） */
    loading: boolean;
    /** 登出（清 token 并跳回主站） */
    logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 初始化：从 localStorage 读取 token 并探测权限
    useEffect(() => {
        const stored = getToken();
        if (!stored) {
            // 无 token，直接跳转主站
            window.location.href = getMainSiteUrl();
            return;
        }
        setTokenState(stored);

        adminApi.probe()
            .then(() => {
                // 权限验证通过
                setLoading(false);
            })
            .catch(() => {
                // 无超管权限，跳回主站
                clearToken();
                window.location.href = getMainSiteUrl();
            });
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setTokenState(null);
        window.location.href = getMainSiteUrl();
    }, []);

    const isAuthenticated = !!token && !loading;

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            token,
            loading,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
