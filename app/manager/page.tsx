"use client";

import { AppShell } from "@/components/app-shell";
import { getPlanningDays, initialStaff } from "@/lib/demo-data";
import type { Position, Staff, TimeRequirement } from "@/lib/types";
import { Banknote, CalendarDays, CheckCircle2, ChefHat, Clock3, Printer, RefreshCw, Save, Settings2, UsersRound, Wine } from "lucide-react";
import { useMemo, useState } from "react";

type Tab = "shift" | "skills" | "budget" | "rules";
type Assignment = { date: string; time: string; position: Position; staffId: string };
const positions: { key: Position; label: string; color: string }[] = [
  { key: "kitchen", label: "キッチン", color: "bg-orange-100 text-orange-800" },
  { key: "hall", label: "ホール", color: "bg-sky-100 text-sky-800" },
  { key: "drink", label: "ドリンク", color: "bg-emerald-100 text-emerald-800" },
];
const defaultSlots: TimeRequirement[] = [
  { time: "17:00", kitchen: 1, hall: 1, drink: 0 }, { time: "18:00", kitchen: 1, hall: 2, drink: 1 },
  { time: "19:00", kitchen: 2, hall: 2, drink: 1 }, { time: "20:00", kitchen: 2, hall: 2, drink: 1 },
  { time: "21:00", kitchen: 1, hall: 2, drink: 1 }, { time: "22:00", kitchen: 1, hall: 1, drink: 1 },
  { time: "23:00", kitchen: 1, hall: 1, drink: 1 }, { time: "24:00", kitchen: 1, hall: 1, drink: 0 },
  { time: "25:00", kitchen: 1, hall: 1, drink: 0 },
];
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
  const [published, setPublished] = useState(false);
  const laborBudget = salesTarget * laborRate / 100;
  const forecastLabor = assignments.reduce((sum, assignment) => sum + (members.find((member) => member.id === assignment.staffId)?.hourlyWage ?? 0), 0);

  function updateRequirement(time: string, position: Position, difference: number) {
    setRequirements((current) => ({ ...current, [selectedDate]: current[selectedDate].map((slot) => slot.time === time ? { ...slot, [position]: Math.max(0, Math.min(5, slot[position] + difference)) } : slot) }));
    setAssignments((current) => current.filter((item) => item.date !== selectedDate)); setPublished(false);
  }

  function autoBuild() {
    const next: Assignment[] = [];
    days.forEach((day) => requirements[day.isoDate].forEach((slot) => {
      const used = new Set<string>();
      positions.forEach(({ key }) => {
        const candidates = [...members].filter((member) => (member.skills?.[key] ?? 0) > 0 && !used.has(member.id)).sort((a, b) => (b.skills?.[key] ?? 0) - (a.skills?.[key] ?? 0));
        candidates.slice(0, slot[key]).forEach((member) => { next.push({ date: day.isoDate, time: slot.time, position: key, staffId: member.id }); used.add(member.id); });
      });
    }));
    setAssignments(next); setPublished(false);
  }

  function publish() { localStorage.setItem("namista-published-shifts", JSON.stringify(assignments)); localStorage.setItem("namista-staff", JSON.stringify(members)); setPublished(true); }
  function updateMember(id: string, patch: Partial<Staff>) { setMembers((current) => current.map((member) => member.id === id ? { ...member, ...patch } : member)); setPublished(false); }

  return <AppShell name="スティン" role="店長" canManage>
    <div className="mb-6"><span className="text-sm font-black text-rose-600">NAMISTA SHIFT</span><h1 className="text-3xl font-black">ナミスタ 店舗管理</h1><p className="mt-2 text-stone-500">時間帯と担当ポジションを決めて、必要な人を配置します。</p></div>
    <nav className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Menu active={tab === "shift"} onClick={() => setTab("shift")} icon={<CalendarDays/>} title="シフトを作る" note="時間・必要人数を設定"/>
      <Menu active={tab === "skills"} onClick={() => setTab("skills")} icon={<UsersRound/>} title="スタッフ技能" note="得意ポジションを登録"/>
      <Menu active={tab === "budget"} onClick={() => setTab("budget")} icon={<Banknote/>} title="売上・人件費" note="目標と予算を管理"/>
      <Menu active={tab === "rules"} onClick={() => setTab("rules")} icon={<Settings2/>} title="組み方ルール" note="自動配置の考え方"/>
    </nav>

    {tab === "shift" && <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
      <aside className="panel h-fit overflow-hidden"><div className="border-b p-4"><b>日付を選ぶ</b><p className="text-xs text-stone-400">1か月</p></div><div className="grid max-h-[650px] grid-cols-2 gap-1 overflow-y-auto p-2">{days.map((day) => <button key={day.isoDate} onClick={() => setSelectedDate(day.isoDate)} className={`rounded-lg p-2 text-left text-sm ${selectedDate === day.isoDate ? "bg-rose-600 font-bold text-white" : "hover:bg-stone-50"}`}><b>{day.shortDate}</b> <small>{day.weekday}</small></button>)}</div></aside>
      <section className="space-y-5"><div className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h2 className="text-xl font-black">{days.find((day) => day.isoDate === selectedDate)?.shortDate} の必要人数</h2><p className="text-xs text-stone-400">−／＋で時間帯ごとの人数を変更</p></div><button onClick={autoBuild} className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-bold text-white"><RefreshCw size={17}/>1か月を自動作成</button></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="bg-stone-50"><th className="p-3 text-left">時間</th>{positions.map((position) => <th key={position.key} className="p-3">{position.label}</th>)}<th className="p-3">配置状況</th></tr></thead><tbody>{requirements[selectedDate].map((slot) => <tr key={slot.time} className="border-t"><td className="p-3 font-black"><Clock3 className="mr-1 inline" size={15}/>{slot.time}</td>{positions.map((position) => <td key={position.key} className="p-3"><div className="flex justify-center gap-2"><button onClick={() => updateRequirement(slot.time, position.key, -1)} className="h-8 w-8 rounded-lg border">−</button><b className="w-8 py-1 text-center">{slot[position.key]}名</b><button onClick={() => updateRequirement(slot.time, position.key, 1)} className="h-8 w-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">＋</button></div></td>)}<td className="p-3 text-center text-xs">{positions.map((position) => { const required = slot[position.key]; const actual = assignments.filter((item) => item.date === selectedDate && item.time === slot.time && item.position === position.key).length; return required ? <span key={position.key} className={`mr-1 rounded-full px-2 py-1 ${actual >= required ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{position.label} {actual}/{required}</span> : null; })}</td></tr>)}</tbody></table></div></div>
        <AssignmentPanel date={selectedDate} requirements={requirements[selectedDate]} assignments={assignments} members={members}/>
        {!!assignments.length && <div className="flex flex-wrap justify-end gap-3"><button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold"><Printer size={17}/>印刷</button><button onClick={publish} className="flex items-center gap-2 rounded-xl bg-[#29262d] px-6 py-3 font-bold text-white"><Save size={17}/>確定して保存</button>{published && <span className="self-center text-sm font-bold text-emerald-700">保存しました</span>}</div>}
      </section>
    </div>}

    {tab === "skills" && <SkillsPanel members={members} updateMember={updateMember}/>} 
    {tab === "budget" && <BudgetPanel salesTarget={salesTarget} setSalesTarget={setSalesTarget} laborRate={laborRate} setLaborRate={setLaborRate} laborBudget={laborBudget} forecastLabor={forecastLabor}/>} 
    {tab === "rules" && <RulesPanel/>}
    <section className="print-sheet"><div className="mb-4 flex justify-between border-b-2 border-black pb-2"><div><h1 className="text-2xl font-black">ナミスタ 月間シフト表</h1><p>{days[0].shortDate}〜{days.at(-1)?.shortDate}</p></div><p>売上目標 {yen.format(salesTarget)} ／ 人件費率 {laborRate}%</p></div><table className="w-full border-collapse text-[10px]"><thead><tr><th className="border border-black p-1">日付</th><th className="border border-black p-1">時間</th><th className="border border-black p-1">キッチン</th><th className="border border-black p-1">ホール</th><th className="border border-black p-1">ドリンク</th></tr></thead><tbody>{days.flatMap((day) => requirements[day.isoDate].map((slot) => <tr key={`${day.isoDate}-${slot.time}`}><td className="border border-black p-1">{day.shortDate}({day.weekday})</td><td className="border border-black p-1">{slot.time}</td>{positions.map((position) => <td key={position.key} className="border border-black p-1">{assignments.filter((item) => item.date === day.isoDate && item.time === slot.time && item.position === position.key).map((item) => members.find((member) => member.id === item.staffId)?.name).filter(Boolean).join("、") || "-"}</td>)}</tr>))}</tbody></table></section>
  </AppShell>;
}

function AssignmentPanel({ date, requirements, assignments, members }: { date: string; requirements: TimeRequirement[]; assignments: Assignment[]; members: Staff[] }) { return <div className="panel overflow-hidden"><div className="border-b p-5"><h2 className="font-black">自動配置結果</h2><p className="text-xs text-stone-400">技能が高いスタッフから担当へ配置しています。</p></div><div className="divide-y">{requirements.map((slot) => <div key={slot.time} className="grid gap-3 p-4 md:grid-cols-[80px_1fr]"><b>{slot.time}</b><div className="flex flex-wrap gap-2">{positions.map((position) => assignments.filter((item) => item.date === date && item.time === slot.time && item.position === position.key).map((item) => { const member = members.find((staff) => staff.id === item.staffId); return <span key={`${item.position}-${item.staffId}`} className={`rounded-full px-3 py-1 text-xs font-bold ${position.color}`}>{position.label}：{member?.name}</span>; }))}</div></div>)}</div></div>; }

function SkillsPanel({ members, updateMember }: { members: Staff[]; updateMember: (id: string, patch: Partial<Staff>) => void }) { const labels = ["未対応", "△ 練習中", "○ 対応可", "◎ 得意"]; return <section className="panel overflow-hidden"><div className="border-b p-5"><h2 className="text-xl font-black">スタッフ技能・時給</h2><p className="text-xs text-stone-400">◎のスタッフを優先して自動配置します。</p></div><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead><tr className="bg-stone-50"><th className="p-3 text-left">氏名</th><th>時給</th><th>キッチン</th><th>ホール</th><th>ドリンク</th></tr></thead><tbody>{members.map((member) => <tr key={member.id} className="border-t"><td className="p-3"><input value={member.name} onChange={(e) => updateMember(member.id, { name: e.target.value })} className="rounded-lg border px-3 py-2 font-bold"/></td><td className="p-3"><input type="number" value={member.hourlyWage} onChange={(e) => updateMember(member.id, { hourlyWage: Number(e.target.value) })} className="w-24 rounded-lg border px-2 py-2"/></td>{positions.map((position) => <td key={position.key} className="p-3"><select value={member.skills?.[position.key] ?? 0} onChange={(e) => updateMember(member.id, { skills: { kitchen: member.skills?.kitchen ?? 0, hall: member.skills?.hall ?? 0, drink: member.skills?.drink ?? 0, [position.key]: Number(e.target.value) } })} className="rounded-lg border px-2 py-2">{labels.map((label, value) => <option key={value} value={value}>{label}</option>)}</select></td>)}</tr>)}</tbody></table></div></section>; }

function BudgetPanel({ salesTarget, setSalesTarget, laborRate, setLaborRate, laborBudget, forecastLabor }: { salesTarget: number; setSalesTarget: (v: number) => void; laborRate: number; setLaborRate: (v: number) => void; laborBudget: number; forecastLabor: number }) { const rate = salesTarget ? forecastLabor / salesTarget * 100 : 0; return <div className="space-y-5"><section className="grid gap-4 md:grid-cols-3"><Card label="月間売上目標" value={yen.format(salesTarget)} note="店長が変更できます"/><Card label="人件費率目標" value={`${laborRate}%`} note="売上に対する割合"/><Card label="人件費予算" value={yen.format(laborBudget)} note="売上目標 × 人件費率"/></section><section className="panel grid gap-6 p-6 md:grid-cols-2"><label><b className="block">月間売上目標</b><p className="mb-2 text-xs text-stone-400">例：300万円</p><input type="number" step="10000" value={salesTarget} onChange={(e) => setSalesTarget(Number(e.target.value))} className="w-full rounded-xl border px-4 py-3 text-xl font-black"/></label><label><b className="block">目標人件費率</b><p className="mb-2 text-xs text-stone-400">例：22%</p><div className="relative"><input type="number" step="0.1" value={laborRate} onChange={(e) => setLaborRate(Number(e.target.value))} className="w-full rounded-xl border px-4 py-3 text-xl font-black"/><span className="absolute right-4 top-4">%</span></div></label></section><section className={`rounded-2xl border p-5 ${rate <= laborRate ? "border-emerald-200 bg-emerald-50" : "border-orange-200 bg-orange-50"}`}><b>現在のシフト予測：{yen.format(forecastLabor)}（{rate.toFixed(1)}%）</b><p className="text-sm">予算との差：{yen.format(laborBudget - forecastLabor)}</p></section></div>; }
function RulesPanel() { return <section className="panel p-6"><h2 className="text-xl font-black">自動シフトのルール</h2><div className="mt-5 grid gap-3 md:grid-cols-2"><Rule icon={<ChefHat/>} title="ポジション別に配置" text="キッチン・ホール・ドリンクを別々に必要人数設定"/><Rule icon={<Wine/>} title="技能を考慮" text="◎ 得意 → ○ 対応可 → △ 練習中の順で優先"/><Rule icon={<Clock3/>} title="時間帯別に必要人数" text="17時は1人、18時は2人など時間ごとに変更"/><Rule icon={<CheckCircle2/>} title="人件費目標を確認" text="売上目標と人件費率から予算を自動計算"/></div></section>; }
function Menu({ active, onClick, icon, title, note }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; note: string }) { return <button onClick={onClick} className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${active ? "border-rose-600 bg-rose-600 text-white" : "bg-white"}`}><span>{icon}</span><span><b className="block">{title}</b><small className={active ? "text-rose-100" : "text-stone-400"}>{note}</small></span></button>; }
function Card({ label, value, note }: { label: string; value: string; note: string }) { return <div className="panel p-5"><p className="text-xs text-stone-400">{label}</p><b className="text-2xl">{value}</b><p className="text-xs text-stone-400">{note}</p></div>; }
function Rule({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex gap-3 rounded-xl bg-stone-50 p-4"><span className="text-rose-600">{icon}</span><div><b>{title}</b><p className="text-sm text-stone-500">{text}</p></div></div>; }
