export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
}

export interface Medication {
  id: string;
  name: string;
  activeIngredient?: string;
  dosage: number;
  unit: string;
  form: string;
  totalQuantity?: number;
  refillThreshold: number;
  notes?: string;
  isActive: boolean;
}

export interface Schedule {
  id: string;
  medicationId: string;
  type: 'daily' | 'weekly' | 'prn';
  times: { hour: number; minute: number }[];
  daysOfWeek?: number[];
  maxPerDay?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  scheduleId?: string;
  scheduledTime?: string;
  takenTime: string;
  status: 'taken' | 'late' | 'missed' | 'skipped';
  notes?: string;
}

export interface DoseWithMedication extends DoseRecord {
  medication?: Medication;
}

export interface Refill {
  id: string;
  medicationId: string;
  fillDate: string;
  quantity: number;
  expiryDate?: string;
  lotNumber?: string;
  notes?: string;
}

export interface SupplyStatus {
  remaining: number;
  daysLeft: number;
  threshold: number;
  alert: boolean;
}

export interface AdherenceDay {
  date: string;
  adherence: number;
  taken: number;
  late: number;
  skipped: number;
  missed: number;
  total: number;
}

export interface Overview {
  todayProgress: { taken: number; total: number; percent: number };
  weekAdherence: number;
  streak: number;
  refillAlerts: { medicationName: string; daysLeft: number }[];
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifyAtDoseTime: boolean;
  notifyBefore15min: boolean;
  notifyDailySummary: boolean;
  notifyRefill: boolean;
  notifyMissedDose: boolean;
}
