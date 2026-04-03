import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import AdminShell from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "CIMS 超管面板",
  description: "ClassIsland Management Service - 超级管理员平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <AdminShell>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  );
}
