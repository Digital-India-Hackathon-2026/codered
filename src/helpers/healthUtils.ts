// LifeLens - Helper Utilities
// Common utility functions used across the application

import { VITAL_THRESHOLDS, COLORS } from '../constants';
import { VitalType, VitalSign, Medication } from '../types';

// Date formatting utilities
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (format === 'relative') {
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// Vital sign utilities
export function getVitalStatus(type: VitalType, value: number): 'normal' | 'warning' | 'critical' {
  const threshold = VITAL_THRESHOLDS[type as keyof typeof VITAL_THRESHOLDS];
  if (!threshold) return 'normal';

  if (value <= threshold.criticalMin || value >= threshold.criticalMax) return 'critical';
  if (value < threshold.min || value > threshold.max) return 'warning';
  return 'normal';
}

export function getVitalStatusColor(status: 'normal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'critical': return COLORS.danger;
    case 'warning': return COLORS.warning;
    default: return COLORS.success;
  }
}

export function getVitalDisplayValue(type: VitalType, value: number, secondaryValue?: number): string {
  if (type === 'blood_pressure' && secondaryValue) {
    return `${Math.round(value)}/${Math.round(secondaryValue)}`;
  }
  if (type === 'temperature') return value.toFixed(1);
  return Math.round(value).toString();
}

export function getVitalTrend(readings: VitalSign[]): 'up' | 'down' | 'stable' {
  if (readings.length < 3) return 'stable';
  const recent = readings.slice(-5);
  const avg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
  const lastValue = recent[recent.length - 1].value;
  const diff = ((lastValue - avg) / avg) * 100;

  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

// BMI calculation
export function calculateBMI(weightKg: number, heightCm: number): { value: number; category: string; color: string } {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: string;
  let color: string;

  if (bmi < 18.5) { category = 'Underweight'; color = COLORS.info; }
  else if (bmi < 25) { category = 'Normal'; color = COLORS.success; }
  else if (bmi < 30) { category = 'Overweight'; color = COLORS.warning; }
  else { category = 'Obese'; color = COLORS.danger; }

  return { value: parseFloat(bmi.toFixed(1)), category, color };
}

// Medication utilities
export function getMedicationTimeStatus(medication: Medication): 'upcoming' | 'due' | 'missed' | 'taken' {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const reminder of medication.reminders) {
    if (reminder.taken) continue;
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const reminderMinutes = hours * 60 + minutes;
    const diff = currentMinutes - reminderMinutes;

    if (diff > 60) return 'missed';
    if (diff >= -15 && diff <= 60) return 'due';
  }

  const allTaken = medication.reminders.every(r => r.taken);
  if (allTaken) return 'taken';
  return 'upcoming';
}

export function getNextDoseTime(medication: Medication): string | null {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const nextSlot = medication.timeSlots.find(slot => slot > currentTime);
  return nextSlot || medication.timeSlots[0] || null;
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Number utilities
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

// Color utilities
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (severity) {
    case 'critical': return COLORS.danger;
    case 'high': return '#FF5722';
    case 'medium': return COLORS.warning;
    case 'low': return COLORS.success;
  }
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortByDate<T extends { timestamp?: string; date?: string; createdAt?: string }>(
  array: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.timestamp || b.date || b.createdAt || 0).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

export function removeDuplicates<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

// Health score calculation
export function calculateHealthScore(vitals: VitalSign[], medications: Medication[]): number {
  let score = 100;

  // Deduct for abnormal vitals
  const recentVitals = vitals.filter(v =>
    Date.now() - new Date(v.timestamp).getTime() < 86400000
  );
  const abnormalCount = recentVitals.filter(v => v.isAbnormal).length;
  score -= abnormalCount * 5;

  // Deduct for missed medications
  const activeMeds = medications.filter(m => m.isActive);
  const missedDoses = activeMeds.reduce((count, m) =>
    count + m.reminders.filter(r => !r.taken && r.enabled).length, 0
  );
  score -= missedDoses * 3;

  return clamp(score, 0, 100);
}

// Sleep quality estimation
export function estimateSleepQuality(hoursSlept: number): { quality: string; color: string; score: number } {
  if (hoursSlept >= 7 && hoursSlept <= 9) return { quality: 'Good', color: COLORS.success, score: 90 };
  if (hoursSlept >= 6 && hoursSlept < 7) return { quality: 'Fair', color: COLORS.warning, score: 70 };
  if (hoursSlept >= 9 && hoursSlept <= 10) return { quality: 'Fair', color: COLORS.warning, score: 70 };
  return { quality: 'Poor', color: COLORS.danger, score: 40 };
}
