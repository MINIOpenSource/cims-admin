"use client";

/**
 * SuperAdmin 全局用户管理页面。
 * 调用 Admin API: GET /user/list, POST /user/{user_id}
 */

import React, { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";
import type { UserOut, UserUpdateRequest } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";
import {
    Button, Input, Spinner, Badge,
    MessageBar, MessageBarBody,
    Dialog, DialogSurface, DialogBody,
    DialogTitle, DialogContent, DialogActions,
    Label, Select,
} from "@fluentui/react-components";
import {
    Edit24Regular, Delete24Regular,
    Search24Regular, PersonAdd24Regular,
    ArrowReset24Regular,
} from "@fluentui/react-icons";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserOut[]>([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [editUser, setEditUser] = useState<UserOut | null>(null);
    const [editForm, setEditForm] = useState<UserUpdateRequest>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // 密码重置对话框
    const [resetPwdUser, setResetPwdUser] = useState<UserOut | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [resettingPwd, setResettingPwd] = useState(false);

    // 删除确认
    const [deleteUser, setDeleteUser] = useState<UserOut | null>(null);
    const [deleting, setDeleting] = useState(false);

    const limit = 20;

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = searchQuery
                ? await adminApi.searchUsers(searchQuery)
                : await adminApi.listUsers(offset, limit);
            setUsers(list);
        } catch (e) {
            setError(e instanceof Error ? e.message : "加载失败");
        } finally {
            setLoading(false);
        }
    }, [offset, searchQuery]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    async function handleSave() {
        if (!editUser) return;
        setSaving(true);
        setError(null);
        try {
            await adminApi.updateUser(editUser.id, editForm);
            setEditUser(null);
            setSuccessMsg("用户已更新");
            await loadUsers();
        } catch (e) {
            setError(e instanceof Error ? e.message : "更新失败");
        } finally {
            setSaving(false);
        }
    }

    async function handleResetPassword() {
        if (!resetPwdUser || !newPassword) return;
        setResettingPwd(true);
        setError(null);
        try {
            await adminApi.resetPassword(resetPwdUser.id, { new_password: newPassword });
            setResetPwdUser(null);
            setNewPassword("");
            setSuccessMsg("密码已重置");
        } catch (e) {
            setError(e instanceof Error ? e.message : "重置失败");
        } finally {
            setResettingPwd(false);
        }
    }

    async function handleDelete() {
        if (!deleteUser) return;
        setDeleting(true);
        setError(null);
        try {
            await adminApi.deleteUser(deleteUser.id);
            setDeleteUser(null);
            setSuccessMsg("用户已删除");
            await loadUsers();
        } catch (e) {
            setError(e instanceof Error ? e.message : "删除失败");
        } finally {
            setDeleting(false);
        }
    }

    function handleSearch() {
        setOffset(0);
        loadUsers();
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">全局用户管理</h1>
                    <p className="page-subtitle">管理平台中所有注册用户</p>
                </div>
                <Button
                    appearance="primary"
                    icon={<PersonAdd24Regular />}
                    size="small"
                    onClick={() => {/* TODO: 创建用户对话框 */}}
                >
                    创建用户
                </Button>
            </div>

            {/* 搜索栏 */}
            <div className="flex items-center gap-8 mb-16">
                <Input
                    placeholder="搜索用户名或邮箱..."
                    value={searchQuery}
                    onChange={(_, d) => setSearchQuery(d.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    style={{ width: 300 }}
                    contentBefore={<Search24Regular />}
                />
                <Button size="small" onClick={handleSearch}>搜索</Button>
                {searchQuery && (
                    <Button
                        size="small"
                        appearance="subtle"
                        onClick={() => { setSearchQuery(""); setOffset(0); }}
                    >
                        清除
                    </Button>
                )}
            </div>

            {error && (
                <MessageBar intent="error" style={{ marginBottom: 12 }}>
                    <MessageBarBody>{error}</MessageBarBody>
                </MessageBar>
            )}

            {successMsg && (
                <MessageBar intent="success" style={{ marginBottom: 12 }}>
                    <MessageBarBody>{successMsg}</MessageBarBody>
                </MessageBar>
            )}

            {loading ? (
                <div className="flex items-center justify-center" style={{ height: 200 }}>
                    <Spinner size="medium" />
                </div>
            ) : (
                <>
                    <div className="card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>用户名</th>
                                    <th>邮箱</th>
                                    <th>显示名</th>
                                    <th>角色</th>
                                    <th>状态</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                                            暂无用户数据
                                        </td>
                                    </tr>
                                ) : users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>{u.display_name}</td>
                                        <td>
                                            <Badge
                                                appearance="filled"
                                                color={u.role_code === "superadmin" ? "danger" : u.role_code === "admin" ? "warning" : "informative"}
                                            >
                                                {ROLE_LABELS[u.role_code] || u.role_code}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge color={u.is_active ? "success" : "severe"}>
                                                {u.is_active ? "活跃" : "禁用"}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="flex gap-4">
                                                <Button
                                                    appearance="subtle"
                                                    icon={<Edit24Regular />}
                                                    size="small"
                                                    title="编辑"
                                                    onClick={() => {
                                                        setEditUser(u);
                                                        setEditForm({
                                                            display_name: u.display_name,
                                                            role_code: u.role_code,
                                                            is_active: u.is_active,
                                                        });
                                                    }}
                                                />
                                                <Button
                                                    appearance="subtle"
                                                    icon={<ArrowReset24Regular />}
                                                    size="small"
                                                    title="重置密码"
                                                    onClick={() => {
                                                        setResetPwdUser(u);
                                                        setNewPassword("");
                                                    }}
                                                />
                                                <Button
                                                    appearance="subtle"
                                                    icon={<Delete24Regular />}
                                                    size="small"
                                                    title="删除"
                                                    onClick={() => setDeleteUser(u)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!searchQuery && (
                        <div className="flex items-center gap-8 mt-16">
                            <Button
                                disabled={offset === 0}
                                onClick={() => setOffset(Math.max(0, offset - limit))}
                                size="small"
                            >
                                上一页
                            </Button>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                第 {offset / limit + 1} 页
                            </span>
                            <Button
                                disabled={users.length < limit}
                                onClick={() => setOffset(offset + limit)}
                                size="small"
                            >
                                下一页
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* 编辑用户对话框 */}
            {editUser && (
                <Dialog open onOpenChange={(_, d) => { if (!d.open) setEditUser(null); }}>
                    <DialogSurface>
                        <DialogBody>
                            <DialogTitle>编辑用户: {editUser.username}</DialogTitle>
                            <DialogContent>
                                <div className="form-group">
                                    <Label>显示名</Label>
                                    <Input
                                        value={editForm.display_name || ""}
                                        onChange={(_, d) => setEditForm({ ...editForm, display_name: d.value })}
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <div className="form-group">
                                    <Label>角色</Label>
                                    <Select
                                        value={editForm.role_code || ""}
                                        onChange={(_, d) => setEditForm({ ...editForm, role_code: d.value })}
                                    >
                                        {Object.entries(ROLE_LABELS).map(([code, label]) => (
                                            <option key={code} value={code}>{label}</option>
                                        ))}
                                    </Select>
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button appearance="secondary" onClick={() => setEditUser(null)}>
                                    取消
                                </Button>
                                <Button appearance="primary" onClick={handleSave} disabled={saving}>
                                    {saving ? <Spinner size="tiny" /> : "保存"}
                                </Button>
                            </DialogActions>
                        </DialogBody>
                    </DialogSurface>
                </Dialog>
            )}

            {/* 重置密码对话框 */}
            {resetPwdUser && (
                <Dialog open onOpenChange={(_, d) => { if (!d.open) setResetPwdUser(null); }}>
                    <DialogSurface>
                        <DialogBody>
                            <DialogTitle>重置密码: {resetPwdUser.username}</DialogTitle>
                            <DialogContent>
                                <div className="form-group">
                                    <Label>新密码</Label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(_, d) => setNewPassword(d.value)}
                                        placeholder="至少12位新密码"
                                        style={{ width: "100%" }}
                                    />
                                    <div className="form-hint">密码将直接重置，无需旧密码验证</div>
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button appearance="secondary" onClick={() => setResetPwdUser(null)}>
                                    取消
                                </Button>
                                <Button
                                    appearance="primary"
                                    onClick={handleResetPassword}
                                    disabled={resettingPwd || newPassword.length < 12}
                                >
                                    {resettingPwd ? <Spinner size="tiny" /> : "重置"}
                                </Button>
                            </DialogActions>
                        </DialogBody>
                    </DialogSurface>
                </Dialog>
            )}

            {/* 删除确认对话框 */}
            {deleteUser && (
                <Dialog open onOpenChange={(_, d) => { if (!d.open) setDeleteUser(null); }}>
                    <DialogSurface>
                        <DialogBody>
                            <DialogTitle>确认删除用户</DialogTitle>
                            <DialogContent>
                                <p>
                                    确定要删除用户 <strong>{deleteUser.username}</strong>（{deleteUser.email}）吗？
                                    此操作不可撤销。
                                </p>
                            </DialogContent>
                            <DialogActions>
                                <Button appearance="secondary" onClick={() => setDeleteUser(null)}>
                                    取消
                                </Button>
                                <Button
                                    appearance="primary"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    style={{ background: "var(--danger-color)" }}
                                >
                                    {deleting ? <Spinner size="tiny" /> : "删除"}
                                </Button>
                            </DialogActions>
                        </DialogBody>
                    </DialogSurface>
                </Dialog>
            )}
        </div>
    );
}
