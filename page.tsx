"use client";

import { AppShell } from "@/components/app-shell";
import { getPlanningDays, initialStaff, nextStaffColor } from "@/lib/demo-data";
import type { Position, Staff, TimeRequirement } from "@/lib/types";
import { Banknote, CalendarDays, CheckCircle2, ChefHat, ChevronLeft, ChevronRight, Clock3, Plus, Printer, RefreshCw, Settings2, Trash2, UsersRound, Wine } from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "shift" | "skills" | "budget" | "rules";
type Assignment = { date: string; time: string; position: Position; staffId: string };
const positions: { key: Position; label: string; color: string }[] = [
  { key: "kitchen", label: "キッチン", color: "bg-orange-100 text-orange-800" },
  { key: "hall", label: "ホール", color: "bg-sky-100 text-sky-800" },
  { key: "drink", label: "ドリンク", color: "bg-emerald-100 text-emerald-800" },
];
const defaultSlots: TimeRequirement[] = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00", "25:00"].map((time, index) => ({ time, kitchen: index > 1 && index < 5 ? 2 : 1, hall: index === 0 ? 1 : 2, drink: index === 0 || index > 7 ? 0 : 1 }));
const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });

export default function ManagerPage() {
  const days = useMemo(() => getPlanningDays(31), []);
  const [tab, setTab] = useState<Tab>("shift");
  const [selectedDate, setSelectedDate] = useState(days[0].isoDate);
  const [members, setMembers] = useState<Staff[]>(initialStaff);
  const [requirements, setRequirements] = useState<Record<string, TimeRequirement[]>>(() => Object.fromEntries(days.map((day) => [day.isoDate, structuredClone(defaultSlots)])));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [salesTarget, setSalesTarget] = useState(3000000);
  const [laborRate, setLaborRate] = useState(22);
  const [printHalf, setPrintHalf] = useState<"first" | "second">("first");
  const [printMode, setPrintMode] = useState<"staff" | "manager">("staff");
  const selectedIndex = days.findIndex((day) => day.isoDate === selectedDate);
  const laborBudget = salesTarget * laborRate / 100;
  const forecastLabor = assignments.reduce((sum, item) => sum + (members.find((member) => member.id === item.staffId)?.hourlyWage ?? 0), 0);
  const printDays = printHalf === "first" ? days.slice(0, 16) : days.slice(16);

  function updateRequirement(time: string, position: Position, difference: number) {
    setRequirements((current) => ({ ...current, [selectedDate]: current[selectedDate].map((slot) => slot.time === time ? { ...slot, [position]: Math.max(0, Math.min(5, slot[position] + difference)) } : slot) }));
    setAssignments((current) => current.filter((item) => item.date !== selectedDate));
  }
  function autoBuild() {
    const next: Assignment[] = [];
    days.forEach((day) => requirements[day.isoDate].forEach((slot) => {
      const used = new Set<string>();
      positions.forEach(({ key }) => [...members].filter((member) => (member.skills?.[key] ?? 0) > 0 && !used.has(member.id)).sort((a, b) => (b.skills?.[key] ?? 0) - (a.skills?.[key] ?? 0)).slice(0, slot[key]).forEach((member) => { next.push({ date: day.isoDate, time: slot.time, position: key, staffId: member.id }); used.add(member.id); }));
    }));
    setAssignments(next);
  }
  function updateMember(id: string, patch: Partial<Staff>) { setMembers((current) => current.map((member) => member.id === id ? { ...member, ...patch } : member)); }
  function addMember() { const index = members.length; setMembers((current) => [...current, { id: `staff-${Date.now()}`, name: "新しいスタッフ", role: "staff", jobTitle: "ホール", isNew: true, hourlyWage: 1200, color: nextStaffColor(index), skills: { kitchen: 0, hall: 1, drink: 0 } }]); setTab("skills"); }
  function deleteMember(id: string) { setMembers((current) => current.filter((member) => member.id !== id)); setAssignments((current) => current.filter((item) => item.staffId !== id)); }
  function moveDay(diff: number) { setSelectedDate(days[Math.max(0, Math.min(days.length - 1, selectedIndex + diff))].isoDate); }
  function printSchedule(mode: "staff" | "manager") { setPrintMode(mode); document.body.dataset.printMode = mode; setTimeout(() => window.print(), 0); }
  function shiftText(staffId: string, date: string) { const times = assignments.filter((item) => item.staffId === staffId && item.date === date).map((item) => Number(item.time.split(":")[0])).sort((a, b) => a - b); return times.length ? `${Math.min(...times)}-${Math.max(...times) + 1}` : ""; }
  function dayLabor(date: string) { return assignments.filter((item) => item.date === date).reduce((sum, item) => sum + (members.find((member) => member.id === item.staffId)?.hourlyWage ?? 0), 0); }
  function dayHours(date: string) { return assignments.filter((item) => item.date === date).length; }

  return <AppShell name="スティン" role="店長" canManage>
    <div className="mb-5"><span className="text-sm font-black text-rose-600">NAMISTA SHIFT</span><h1 className="text-2xl font-black sm:text-3xl">ナミスタ 店舗管理</h1><p className="mt-1 text-sm text-stone-500">必要人数を決め、自動作成して、確認・公開します。</p></div>
    <nav className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <Menu active={tab === "shift"} onClick={() => setTab("shift")} icon={<CalendarDays/>} title="シフトを作る" note="人数設定・自動作成"/>
      <Menu active={tab === "skills"} onClick={() => setTab("skills")} icon={<UsersRound/>} title="スタッフ管理" note="追加・時給・技能"/>
      <Menu active={tab === "budget"} onClick={() => setTab("budget")} icon={<Banknote/>} title="売上・人件費" note="目標と予算"/>
      <Menu active={tab === "rules"} onClick={() => setTab("rules")} icon={<Settings2/>} title="自動作成ルール" note="考え方を確認"/>
    </nav>

    {tab === "shift" && <>
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-y bg-[#f6f2ec]/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => moveDay(-1)} disabled={selectedIndex === 0} className="rounded-xl border bg-white p-3 disabled:opacity-30" aria-label="前の日"><ChevronLeft/></button>
          <button className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-center shadow-sm"><small className="block text-stone-400">編集中の日付</small><b>{days[selectedIndex].shortDate}（{days[selectedIndex].weekday}）</b></button>
          <button onClick={() => moveDay(1)} disabled={selectedIndex === days.length - 1} className="rounded-xl border bg-white p-3 disabled:opacity-30" aria-label="次の日"><ChevronRight/></button>
          <button onClick={autoBuild} className="flex shrink-0 items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-bold text-white"><RefreshCw size={17}/><span className="hidden sm:inline">1か月を</span>自動作成</button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 sm:hidden">{days.map((day) => <button key={day.isoDate} onClick={() => setSelectedDate(day.isoDate)} className={`shrink-0 rounded-lg px-3 py-2 text-xs ${selectedDate === day.isoDate ? "bg-rose-600 font-bold text-white" : "bg-white"}`}>{day.shortDate}</button>)}</div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
        <aside className="panel hidden h-fit overflow-hidden xl:block"><div className="border-b p-4"><b>日付を選ぶ</b><p className="text-xs text-stone-400">1か月</p></div><div className="grid max-h-[650px] grid-cols-2 gap-1 overflow-y-auto p-2">{days.map((day) => <button key={day.isoDate} onClick={() => setSelectedDate(day.isoDate)} className={`rounded-lg p-2 text-left text-sm ${selectedDate === day.isoDate ? "bg-rose-600 font-bold text-white" : "hover:bg-stone-50"}`}><b>{day.shortDate}</b> <small>{day.weekday}</small></button>)}</div></aside>
        <section className="min-w-0 space-y-5">
          <div className="panel overflow-hidden"><div className="border-b p-4 sm:p-5"><h2 className="text-lg font-black">{days[selectedIndex].shortDate} の必要人数</h2><p className="text-xs text-stone-400">− / ＋ で時間帯ごとの人数を変更</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="bg-stone-50"><th className="p-3 text-left">時間</th>{positions.map((position) => <th key={position.key} className="p-3">{position.label}</th>)}<th className="p-3">充足状況</th></tr></thead><tbody>{requirements[selectedDate].map((slot) => <tr key={slot.time} className="border-t"><td className="p-3 font-black"><Clock3 className="mr-1 inline" size={15}/>{slot.time}</td>{positions.map((position) => <td key={position.key} className="p-3"><div className="flex justify-center gap-2"><button onClick={() => updateRequirement(slot.time, position.key, -1)} className="h-9 w-9 rounded-lg border">−</button><b className="w-9 py-2 text-center">{slot[position.key]}人</b><button onClick={() => updateRequirement(slot.time, position.key, 1)} className="h-9 w-9 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">＋</button></div></td>)}<td className="p-3 text-center text-xs">{positions.map((position) => { const required = slot[position.key]; const actual = assignments.filter((item) => item.date === selectedDate && item.time === slot.time && item.position === position.key).length; return required ? <span key={position.key} className={`mr-1 rounded-full px-2 py-1 ${actual >= required ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{position.label} {actual}/{required}</span> : null; })}</td></tr>)}</tbody></table></div></div>
          <AssignmentPanel date={selectedDate} requirements={requirements[selectedDate]} assignments={assignments} members={members}/>
          {!!assignments.length && <div className="rounded-2xl border bg-white p-3"><p className="mb-2 text-xs font-bold text-stone-500">印刷する期間と用途を選んでください</p><div className="flex flex-col gap-2 sm:flex-row"><select value={printHalf} onChange={(e) => setPrintHalf(e.target.value as "first" | "second")} className="min-w-0 rounded-xl border px-3 py-3"><option value="first">前半（1〜16日）</option><option value="second">後半（17日〜末日）</option></select><button onClick={() => printSchedule("staff")} className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold"><Printer size={17}/>スタッフ共有用（時給なし）</button><button onClick={() => printSchedule("manager")} className="flex items-center justify-center gap-2 rounded-xl bg-[#29262d] px-4 py-3 font-bold text-white"><Printer size={17}/>店舗管理用（人件費あり）</button></div></div>}
        </section>
      </div>
    </>}
    {tab === "skills" && <SkillsPanel members={members} updateMember={updateMember} addMember={addMember} deleteMember={deleteMember}/>} 
    {tab === "budget" && <BudgetPanel salesTarget={salesTarget} setSalesTarget={setSalesTarget} laborRate={laborRate} setLaborRate={setLaborRate} laborBudget={laborBudget} forecastLabor={forecastLabor}/>} 
    {tab === "rules" && <RulesPanel/>}

    <section className="print-sheet">
      <header className="print-title"><h1>{printMode === "manager" ? "店舗管理用シフト表" : "スタッフ共有シフト表"}</h1><b>{printDays[0]?.shortDate}〜{printDays.at(-1)?.shortDate}</b><strong>ナミスタ</strong></header>
      <table className={`print-table ${printMode === "staff" ? "staff-print" : "manager-print"}`}><thead><tr>{printMode === "manager" && <th className="wage-column">時給</th>}<th>氏名</th>{printDays.map((day) => <th key={day.isoDate}>{day.shortDate}<small>({day.weekday})</small></th>)}</tr></thead><tbody>{members.map((member) => <tr key={member.id}>{printMode === "manager" && <td className="wage-column">{yen.format(member.hourlyWage)}</td>}<td>{member.isNew ? "🔰 " : ""}{member.name}</td>{printDays.map((day) => <td key={day.isoDate}>{shiftText(member.id, day.isoDate)}</td>)}</tr>)}{printMode === "manager" && <><tr className="summary-row"><th colSpan={2}>予想勤務時間</th>{printDays.map((day) => <th key={day.isoDate}>{dayHours(day.isoDate)}h</th>)}</tr><tr className="summary-row"><th colSpan={2}>予想人件費</th>{printDays.map((day) => <th key={day.isoDate}>{yen.format(dayLabor(day.isoDate))}</th>)}</tr></>}</tbody></table>
      {printMode === "manager" && <div className="print-summary"><div><small>期間スタッフ数</small><b>{members.length}人</b></div><div><small>期間予想勤務時間</small><b>{printDays.reduce((sum, day) => sum + dayHours(day.isoDate), 0)}時間</b></div><div><small>期間予想人件費</small><b>{yen.format(printDays.reduce((sum, day) => sum + dayLabor(day.isoDate), 0))}</b></div></div>}
    </section>
  </AppShell>;
}

function AssignmentPanel({ date, requirements, assignments, members }: { date: string; requirements: TimeRequirement[]; assignments: Assignment[]; members: Staff[] }) { return <div className="panel overflow-hidden"><div className="border-b p-4 sm:p-5"><h2 className="font-black">自動作成結果</h2><p className="text-xs text-stone-400">時間ごとの担当スタッフです</p></div><div className="divide-y">{requirements.map((slot) => <div key={slot.time} className="grid gap-2 p-3 sm:grid-cols-[70px_1fr]"><b>{slot.time}</b><div className="flex flex-wrap gap-2">{positions.flatMap((position) => assignments.filter((item) => item.date === date && item.time === slot.time && item.position === position.key).map((item) => { const member = members.find((staff) => staff.id === item.staffId); return <span key={`${item.position}-${item.staffId}`} className={`rounded-full px-3 py-1 text-xs font-bold ${position.color}`}>{position.label}・{member?.name}</span>; }))}</div></div>)}</div></div>; }

function SkillsPanel({ members, updateMember, addMember, deleteMember }: { members: Staff[]; updateMember: (id: string, patch: Partial<Staff>) => void; addMember: () => void; deleteMember: (id: string) => void }) { const labels = ["未対応", "☆ 練習中", "○ 対応可", "◎ 得意"]; return <section className="panel overflow-hidden"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="text-xl font-black">スタッフ・時給・技能</h2><p className="text-xs text-stone-400">スタッフを追加し、新人マーク・時給・得意ポジションを設定できます</p></div><button onClick={addMember} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-bold text-white"><Plus size={18}/>新しいスタッフを追加</button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="bg-stone-50"><th className="p-3 text-left">氏名</th><th>新人</th><th>時給</th><th>キッチン</th><th>ホール</th><th>ドリンク</th><th>削除</th></tr></thead><tbody>{members.map((member) => <tr key={member.id} className="border-t"><td className="p-3"><input value={member.name} onChange={(e) => updateMember(member.id, { name: e.target.value })} className="rounded-lg border px-3 py-2 font-bold"/></td><td className="p-3 text-center"><label className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 font-bold ${member.isNew ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-500"}`}><input type="checkbox" checked={member.isNew} onChange={(e) => updateMember(member.id, { isNew: e.target.checked })}/><span>{member.isNew ? "🔰 新人" : "通常"}</span></label></td><td className="p-3"><input type="number" value={member.hourlyWage} onChange={(e) => updateMember(member.id, { hourlyWage: Number(e.target.value) })} className="w-24 rounded-lg border px-2 py-2"/></td>{positions.map((position) => <td key={position.key} className="p-3"><select value={member.skills?.[position.key] ?? 0} onChange={(e) => updateMember(member.id, { skills: { kitchen: member.skills?.kitchen ?? 0, hall: member.skills?.hall ?? 0, drink: member.skills?.drink ?? 0, [position.key]: Number(e.target.value) } })} className="rounded-lg border px-2 py-2">{labels.map((label, value) => <option key={value} value={value}>{label}</option>)}</select></td>)}<td className="p-3 text-center"><button onClick={() => deleteMember(member.id)} className="rounded-lg border p-2 text-stone-400 hover:border-red-300 hover:text-red-600" aria-label={`${member.name}を削除`}><Trash2 size={17}/></button></td></tr>)}</tbody></table></div></section>; }

function BudgetPanel({ salesTarget, setSalesTarget, laborRate, setLaborRate, laborBudget, forecastLabor }: { salesTarget: number; setSalesTarget: (v: number) => void; laborRate: number; setLaborRate: (v: number) => void; laborBudget: number; forecastLabor: number }) { const rate = salesTarget ? forecastLabor / salesTarget * 100 : 0; return <div className="space-y-5"><section className="grid gap-4 md:grid-cols-3"><Card label="月間売上目標" value={yen.format(salesTarget)} note="店長が変更できます"/><Card label="人件費率目標" value={`${laborRate}%`} note="売上に対する割合"/><Card label="人件費予算" value={yen.format(laborBudget)} note="売上目標 × 人件費率"/></section><section className="panel grid gap-6 p-6 md:grid-cols-2"><label><b className="block">月間売上目標</b><input type="number" step="10000" value={salesTarget} onChange={(e) => setSalesTarget(Number(e.target.value))} className="mt-2 w-full rounded-xl border px-4 py-3 text-xl font-black"/></label><label><b className="block">目標人件費率</b><div className="relative mt-2"><input type="number" step="0.1" value={laborRate} onChange={(e) => setLaborRate(Number(e.target.value))} className="w-full rounded-xl border px-4 py-3 text-xl font-black"/><span className="absolute right-4 top-4">%</span></div></label></section><section className={`rounded-2xl border p-5 ${rate <= laborRate ? "border-emerald-200 bg-emerald-50" : "border-orange-200 bg-orange-50"}`}><b>現在のシフト予測：{yen.format(forecastLabor)}（{rate.toFixed(1)}%）</b><p className="text-sm">予算との差：{yen.format(laborBudget - forecastLabor)}</p></section></div>; }
function RulesPanel() { return <section className="panel p-6"><h2 className="text-xl font-black">自動シフトのルール</h2><div className="mt-5 grid gap-3 md:grid-cols-2"><Rule icon={<ChefHat/>} title="ポジション別に配置" text="キッチン・ホール・ドリンク別に必要人数を設定"/><Rule icon={<Wine/>} title="技能を優先" text="得意なスタッフから優先して配置"/><Rule icon={<Clock3/>} title="時間帯ごとに必要人数" text="17時は1人、18時は2人など自由に変更"/><Rule icon={<CheckCircle2/>} title="公開前に確認" text="自動作成の結果を確認してからスタッフへ公開"/></div></section>; }
function Menu({ active, onClick, icon, title, note }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; note: string }) { return <button onClick={onClick} className={`flex items-center gap-3 rounded-2xl border p-3 text-left sm:p-4 ${active ? "border-rose-600 bg-rose-600 text-white" : "bg-white"}`}><span className="hidden sm:block">{icon}</span><span><b className="block text-sm sm:text-base">{title}</b><small className={active ? "text-rose-100" : "text-stone-400"}>{note}</small></span></button>; }
function Card({ label, value, note }: { label: string; value: string; note: string }) { return <div className="panel p-5"><p className="text-xs text-stone-400">{label}</p><b className="text-2xl">{value}</b><p className="text-xs text-stone-400">{note}</p></div>; }
function Rule({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex gap-3 rounded-xl bg-stone-50 p-4"><span className="text-rose-600">{icon}</span><div><b>{title}</b><p className="text-sm text-stone-500">{text}</p></div></div>; }
