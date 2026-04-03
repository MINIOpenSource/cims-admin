/* ===== TypeScript 类型定义 ===== */
/* Admin 面板所需类型，对应后端 Admin API Schema */

// ============================================================
// 用户
// ============================================================

export interface UserOut {
    id: string;
    username: string;
    email: string;
    display_name: string;
    role_code: string;
    is_active: boolean;
    can_create_account?: boolean;
    created_at: string;
}

export interface UserUpdateRequest {
    display_name?: string | null;
    role_code?: string | null;
    is_active?: boolean | null;
    can_create_account?: boolean | null;
}

export interface UserRegisterRequest {
    email: string;
    password: string;
    username?: string;
    display_name?: string;
}

export interface PasswordChange {
    old_password: string;
    new_password: string;
}

// ============================================================
// 账户
// ============================================================

export interface AccountOut {
    id: string;
    name: string;
    slug: string;
    api_key: string;
    is_active: boolean;
    created_at: string;
}

// ============================================================
// 系统设置
// ============================================================

export const SETTINGS_ALLOWED_KEYS = [
    "registration_open",
    "require_approval",
    "max_accounts_per_user",
    "default_role",
    "motd",
] as const;

export interface SettingsUpdate {
    items: Record<string, string>;
}

// ============================================================
// 系统角色
// ============================================================

export const SYSTEM_ROLES = {
    BANNED: "banned",
    PENDING: "pending",
    NORMAL: "normal",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
} as const;

export const ROLE_LABELS: Record<string, string> = {
    banned: "已封禁",
    pending: "待激活",
    normal: "普通用户",
    admin: "管理员",
    superadmin: "超级管理员",
};

// ============================================================
// 通用响应
// ============================================================

export interface StatusResponse {
    status: string;
    message: string;
}

export interface MessageResponse {
    status: string;
    message: string;
}

// ============================================================
// 设置项标签
// ============================================================

export const SETTINGS_LABELS: Record<string, { label: string; hint: string; type: "boolean" | "number" | "string" }> = {
    registration_open: {
        label: "开放注册",
        hint: "允许新用户自助注册",
        type: "boolean",
    },
    require_approval: {
        label: "注册审核",
        hint: "新注册用户需要管理员审核才能激活",
        type: "boolean",
    },
    max_accounts_per_user: {
        label: "每用户最大账户数",
        hint: "单个用户可创建的最大账户数量",
        type: "number",
    },
    default_role: {
        label: "默认角色",
        hint: "新注册用户的默认角色代码",
        type: "string",
    },
    motd: {
        label: "公告信息",
        hint: "显示给所有用户的系统公告",
        type: "string",
    },
};
