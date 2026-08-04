import type { DayPlan, GeneratedShift, Staff } from "./types";

export function generateShifts(days: DayPlan[], members: Staff[], requests: Record<string, string[]>): GeneratedShift[] {
  const assigned = Object.fromEntries(members.map((member) => [member.id, 0]));

  return days.map((day) => {
    const requestedOff = new Set(requests[day.isoDate] ?? []);
    const available = members
      .filter((member) => !requestedOff.has(member.id))
      .sort((a, b) => assigned[a.id] - assigned[b.id]);
    const selected = available.slice(0, day.required);
    selected.forEach((member) => (assigned[member.id] += 1));
    return {
      date: day.isoDate,
      staffIds: selected.map((member) => member.id),
      conflicts: [],
      shortage: Math.max(0, day.required - selected.length),
    };
  });
}
