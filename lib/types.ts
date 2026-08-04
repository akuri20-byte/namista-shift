export type Role = "staff" | "manager";

export type Staff = {
  id: string;
  name: string;
  role: Role;
  jobTitle: string;
  isNew: boolean;
  hourlyWage: number;
  color: string;
  skills?: {
    kitchen: number;
    hall: number;
    drink: number;
  };
};

export type Position = "kitchen" | "hall" | "drink";

export type TimeRequirement = {
  time: string;
  kitchen: number;
  hall: number;
  drink: number;
};

export type DayPlan = {
  isoDate: string;
  weekday: string;
  shortDate: string;
  required: number;
  forecastSales: number;
  reservations: Record<string, number>;
};

export type GeneratedShift = {
  date: string;
  staffIds: string[];
  conflicts: string[];
  shortage: number;
};
