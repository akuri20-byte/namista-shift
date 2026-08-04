"use client";

import { AppShell } from "@/components/app-shell";
import { getPlanningDays } from "@/lib/demo-data";
import { CalendarDays, Check, Info, Send } from "lucide-react";
import { useMemo, useState } from "react";

type Range = 16 | 31 | 93;
export default function StaffPage() {
  const allDays = useMemo(() => getPlanningDays(93), []);
  const [range, setRange] = useState<Range>(31);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const days = allDays.slice(0, range);
  function toggle(date: string) { setSubmitted(false); setSelected((current) => current.includes(date) ? current.filter((item) => item !== date) : [...current, date]); }
  function submit() { localStorage.setItem("namista-my-requests", JSON.stringify(selected)); setSubmitted(true); }
  return <AppShell name="のりぴ" role="スタッフ">
    <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><span className="text-sm font-black text-rose-600">NAMISTA SHIFT</span><h1 className="text-3xl font-black">休み希望を出す</h1><p className="mt-2 text-stone-500">休みたい日を押して、最後に提出してください。</p></div><div className="flex rounded-xl bg-white p-1 shadow-sm">{([[16, "前半"], [31, "1か月"], [93, "3か月"]] as const).map(([value, label]) => <button key={value} onClick={() => setRange(value)} className={`rounded-lg px-4 py-2 text-sm font-bold ${range === value ? "bg-rose-600 text-white" : "text-stone-500"}`}>{label}</button>)}</div></div>
    <div className="mb-5 flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4"><Info className="shrink-0 text-rose-600"/><p className="text-sm leading-6"><b>紫色ではなく赤色になった日が休み希望です。</b><br/>もう一度押すと取り消せます。</p></div>
    <section className="panel overflow-hidden"><div className="border-b bg-rose-50/50 px-5 py-4 text-sm"><b>{days[0].shortDate}〜{days.at(-1)?.shortDate}</b><span className="ml-3 text-stone-400">赤＝休み希望</span></div><div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">{days.map((day) => { const active = selected.includes(day.isoDate); return <button key={day.isoDate} onClick={() => toggle(day.isoDate)} className={`min-h-24 rounded-xl border p-3 text-left ${active ? "border-rose-600 bg-rose-600 text-white" : "bg-white hover:border-rose-300"}`}><div className="flex justify-between"><div><small className={day.weekday === "土" || day.weekday === "日" ? "text-rose-400" : "text-stone-400"}>{day.weekday}曜日</small><b className="block text-xl">{day.shortDate}</b></div><Check className={active ? "text-white" : "text-stone-200"} size={18}/></div><p className="mt-3 text-xs font-bold">{active ? "休み希望" : "勤務できます"}</p></button>; })}</div></section>
    <div className="sticky bottom-3 mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-[#29262d] p-4 text-white sm:flex-row"><div className="flex items-center gap-3"><CalendarDays/><b>休み希望：{selected.length}日</b></div><button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-rose-600 sm:w-auto"><Send size={17}/>{submitted ? "提出しました" : "この内容で提出"}</button></div>
  </AppShell>;
}
