"use client";

import Link from "next/link";
import { CalendarDays, LogOut, Sparkles, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

export function AppShell({ children, name, role, canManage = false }: { children: React.ReactNode; name: string; role: string; canManage?: boolean }) {
  const path = usePathname();
  return <div className="min-h-screen">
    <header className="sticky top-0 z-20 border-b border-violet-100 bg-[#fffdf9]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-black tracking-tight sm:text-lg"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-600 text-white"><Sparkles size={19}/></span><span>ナミスタ<span className="hidden sm:inline"> シフト管理</span></span></Link>
        <nav className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 text-sm">
          <Link className={`rounded-lg px-3 py-2 ${path === "/staff" ? "bg-white font-bold shadow-sm" : "text-stone-500"}`} href="/staff">スタッフ</Link>
          {canManage && <Link className={`rounded-lg px-3 py-2 ${path === "/manager" ? "bg-white font-bold shadow-sm" : "text-stone-500"}`} href="/manager">店舗管理</Link>}
        </nav>
        <div className="hidden items-center gap-3 sm:flex"><div className="text-right text-xs"><b className="block text-sm">{name}</b><span className="text-stone-500">{role}</span></div><UserRound className="rounded-full bg-violet-100 p-2 text-violet-700" size={38}/><Link href="/login" aria-label="ログアウト"><LogOut size={18}/></Link></div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-10">{children}</main>
    <footer className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 pb-8 text-xs text-stone-400"><CalendarDays size={14}/> ナミスタ シフト管理</footer>
  </div>;
}
