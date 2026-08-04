"use client";

import { ArrowRight, CalendarCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("staff@example.com");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState("");
  async function login(role: "staff" | "manager") {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMessage("ログインできませんでした。デモ表示を利用できます。"); return; }
    }
    router.push(role === "manager" ? "/manager" : "/staff");
  }
  return <main className="soft-grid grid min-h-screen place-items-center px-4 py-10">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-violet-200/40 lg:grid-cols-2">
      <section className="hidden bg-[#392d56] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm"><UtensilsCrossed size={16}/> 飲食店のシフト管理</span><h1 className="mt-8 text-5xl font-black leading-tight">お店にちょうどいい人数を、<br/><span className="text-[#d6c6ff]">かんたんに。</span></h1><p className="mt-5 max-w-md leading-7 text-violet-100">休み希望から人件費まで。毎月のシフトづくりを、すっきり一つに。</p></div>
        <div className="flex gap-5 text-sm text-violet-200"><span className="flex gap-2"><CalendarCheck size={18}/>休み希望を提出</span><span className="flex gap-2"><UtensilsCrossed size={18}/>飲食店向け</span></div>
      </section>
      <section className="p-7 sm:p-12"><div className="mb-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-600 text-white"><Sparkles/></span><div><h2 className="text-2xl font-black">おかえりなさい</h2><p className="text-sm text-stone-500">アカウントにログイン</p></div></div>
        <label className="mb-2 block text-sm font-bold">メールアドレス</label><input className="mb-5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-violet-400" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <label className="mb-2 block text-sm font-bold">パスワード</label><input type="password" className="mb-4 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-violet-400" value={password} onChange={(e) => setPassword(e.target.value)}/>
        {message && <p className="mb-3 text-sm text-rose-600">{message}</p>}
        <button onClick={() => login("staff")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-bold text-white hover:bg-violet-700">スタッフとしてログイン <ArrowRight size={18}/></button>
        <button onClick={() => login("manager")} className="mt-3 w-full rounded-xl border border-violet-200 px-4 py-3 font-bold text-violet-700 hover:bg-violet-50">店長デモを見る</button>
        <p className="mt-5 text-center text-xs leading-5 text-stone-400">Supabase未設定時はデモモードでそのまま利用できます</p>
      </section>
    </div>
  </main>;
}
