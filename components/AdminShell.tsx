"use client";

/**
 * Admin Shell — 深色侧边栏 + TopBar 布局。
 * 与 CIMS-web 的 admin 布局保持完全一致的视觉风格。
 */

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@fluentui/react-components";
import {
    Home24Regular,
    People24Regular,
    PersonAccounts24Regular,
    PersonClock24Regular,
    Settings24Regular,
    SignOut24Regular,
    ArrowLeft24Regular,
} from "@fluentui/react-icons";
import { getMainSiteUrl } from "@/lib/api";

const ADMIN_NAV = [
    { label: "概览", href: "/", icon: <Home24Regular /> },
    { label: "用户管理", href: "/users", icon: <People24Regular /> },
    { label: "账户管理", href: "/accounts", icon: <PersonAccounts24Regular /> },
    { label: "待审核", href: "/pending", icon: <PersonClock24Regular /> },
    { label: "系统设置", href: "/settings", icon: <Settings24Regular /> },
];

/** 不需要 Admin Shell 的页面 */
const SHELL_EXCLUDED_PATHS = ["/auth"];

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, logout } = useAuth();
    const pathname = usePathname();

    const isExcluded = SHELL_EXCLUDED_PATHS.some(p => pathname.startsWith(p));

    // /auth 页面和加载中不显示 shell
    if (isExcluded) {
        return <>{children}</>;
    }

    // 正在探测权限
    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spinner label="正在验证管理员权限..." />
            </div>
        );
    }

    // 未认证（通常不会到这里，auth-context 会跳转）
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="app-layout">
            <aside className="sidebar admin-sidebar">
                <div className="sidebar-header">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.svg" alt="ClassIsland" className="sidebar-logo" />
                    <div className="sidebar-title">超管面板</div>
                </div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <div className="sidebar-section-label">平台管理</div>
                        {ADMIN_NAV.map(item => {
                            const isActive = pathname === item.href
                                || (item.href !== "/" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`sidebar-link ${isActive ? "active" : ""}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                    <div className="sidebar-section">
                        <a
                            href={getMainSiteUrl()}
                            className="sidebar-link"
                        >
                            <ArrowLeft24Regular />
                            <span>返回管理面板</span>
                        </a>
                    </div>
                </nav>
                <div className="sidebar-footer">
                    <button
                        className="sidebar-link"
                        onClick={logout}
                        style={{ color: "#e57373" }}
                    >
                        <SignOut24Regular />
                        <span>登出</span>
                    </button>
                </div>
            </aside>
            <div className="main-area">
                <header className="topbar admin-topbar">
                    <div className="topbar-title">CIMS 超级管理员</div>
                    <div className="topbar-right" />
                </header>
                <main className="content-area fade-in">{children}</main>
            </div>
        </div>
    );
}
