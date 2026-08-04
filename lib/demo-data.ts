import type { DayPlan, Staff } from "./types";

export const initialStaff: Staff[] = [
  { id: "n1", name: "のりぴ", role: "staff", jobTitle: "ホール", isNew: false, hourlyWage: 1200, color: "#7357c8", skills: { kitchen: 1, hall: 3, drink: 2 } },
  { id: "n2", name: "かりん", role: "staff", jobTitle: "ホール", isNew: false, hourlyWage: 1200, color: "#e98270", skills: { kitchen: 1, hall: 3, drink: 2 } },
  { id: "n3", name: "スティン", role: "manager", jobTitle: "店長", isNew: false, hourlyWage: 1200, color: "#58a6a6", skills: { kitchen: 3, hall: 3, drink: 3 } },
  { id: "n4", name: "ソウン", role: "staff", jobTitle: "キッチン", isNew: false, hourlyWage: 1200, color: "#d6a84b", skills: { kitchen: 3, hall: 1, drink: 1 } },
  { id: "n5", name: "Ye", role: "staff", jobTitle: "リーダー", isNew: false, hourlyWage: 1200, color: "#5587c9", skills: { kitchen: 3, hall: 3, drink: 2 } },
  { id: "n6", name: "オカ", role: "staff", jobTitle: "キッチン", isNew: false, hourlyWage: 1200, color: "#c4669a", skills: { kitchen: 3, hall: 1, drink: 1 } },
  { id: "n7", name: "キンちゃん", role: "staff", jobTitle: "ドリンク", isNew: false, hourlyWage: 1200, color: "#766f64", skills: { kitchen: 1, hall: 2, drink: 3 } },
  { id: "n8", name: "ピョーくん", role: "staff", jobTitle: "リーダー", isNew: false, hourlyWage: 1300, color: "#337f72", skills: { kitchen: 3, hall: 3, drink: 3 } },
  { id: "n9", name: "るみ", role: "staff", jobTitle: "ホール", isNew: true, hourlyWage: 1200, color: "#d87835", skills: { kitchen: 0, hall: 2, drink: 1 } },
  { id: "n10", name: "ソーザー", role: "staff", jobTitle: "キッチン", isNew: false, hourlyWage: 1200, color: "#704a91", skills: { kitchen: 3, hall: 1, drink: 2 } },
  { id: "n11", name: "かりん（友達）", role: "staff", jobTitle: "ホール", isNew: true, hourlyWage: 1177, color: "#829b45", skills: { kitchen: 0, hall: 1, drink: 0 } },
];

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
export const nextStaffColor = (index: number) => ["#7357c8", "#e98270", "#58a6a6", "#d6a84b", "#5587c9", "#c4669a"][index % 6];

export function getPlanningDays(count = 31): DayPlan[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start); date.setDate(start.getDate() + index);
    const isoDate = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    return { isoDate, weekday: weekdays[date.getDay()], shortDate: `${date.getMonth() + 1}/${date.getDate()}`, required: 3, forecastSales: date.getDay() === 6 ? 140000 : 95000, reservations: {} };
  });
}

export function getNextWeek() { return getPlanningDays(7); }
