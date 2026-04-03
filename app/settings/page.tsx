"use client";

/**
 * 系统设置页面。
 * 调用 Admin API: GET /settings, POST /settings
 */

import React, { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { SETTINGS_LABELS } from "@/lib/types";
import {
    Button, Spinner, Input, Switch,
    MessageBar, MessageBarBody,
} from "@fluentui/react-components";
import { Save24Regular } from "@fluentui/react-icons";

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setLoading(true);
        setError(null);
        try {
            const data = await adminApi.getSettings();
            const mapped: Record<string, string> = {};
            for (const [k, v] of Object.entries(data)) {
                mapped[k] = String(v ?? "");
            }
            setSettings(mapped);
        } catch (e) {
            setError(e instanceof Error ? e.message : "加载失败");
        } finally {
            setLoading(false);
        }
    }

    function updateSetting(key: string, value: string) {
        setSettings(prev => ({ ...prev, [key]: value }));
        setDirty(true);
        setSuccessMsg(null);
    }

    async function handleSave() {
        setSaving(true);
        setError(null);
        setSuccessMsg(null);
        try {
            await adminApi.updateSettings({ items: settings });
            setSuccessMsg("设置已保存");
            setDirty(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "保存失败");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: 200 }}>
                <Spinner size="medium" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">系统设置</h1>
                    <p className="page-subtitle">管理全平台系统配置</p>
                </div>
                <Button
                    appearance="primary"
                    icon={<Save24Regular />}
                    disabled={!dirty || saving}
                    onClick={handleSave}
                >
                    {saving ? <Spinner size="tiny" /> : "保存设置"}
                </Button>
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

            <div className="card">
                <div className="settings-section">
                    <div className="settings-section-title">注册与审核</div>

                    {Object.entries(SETTINGS_LABELS).map(([key, meta]) => (
                        <div className="settings-item" key={key}>
                            <div className="settings-item-info">
                                <div className="settings-item-label">{meta.label}</div>
                                <div className="settings-item-hint">{meta.hint}</div>
                            </div>
                            <div>
                                {meta.type === "boolean" ? (
                                    <Switch
                                        checked={settings[key] === "true" || settings[key] === "1"}
                                        onChange={(_, d) => updateSetting(key, d.checked ? "true" : "false")}
                                    />
                                ) : meta.type === "number" ? (
                                    <Input
                                        type="number"
                                        value={settings[key] || ""}
                                        onChange={(_, d) => updateSetting(key, d.value)}
                                        style={{ width: 120 }}
                                    />
                                ) : (
                                    <Input
                                        value={settings[key] || ""}
                                        onChange={(_, d) => updateSetting(key, d.value)}
                                        style={{ width: 240 }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
