import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ナミスタ シフト管理",
  description: "ナミスタ専用のシフト・人件費管理アプリ",
  applicationName: "ナミスタ シフト管理",
  openGraph: {
    title: "ナミスタ シフト管理",
    description: "ナミスタ専用のシフト・人件費管理アプリ",
    type: "website",
    locale: "ja_JP",
    siteName: "ナミスタ シフト管理",
  },
  twitter: {
    card: "summary",
    title: "ナミスタ シフト管理",
    description: "ナミスタ専用のシフト・人件費管理アプリ",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
