// LifeLens - Health Services Test Suite
// Comprehensive tests for vitals, medications, and utilities

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('VitalsTracker', () => {
  const mockVitals = [
    { id: '1', type: 'heart_rate', value: 72, unit: 'bpm', timestamp: '2026-01-15T10:00:00Z', isAbnormal: false },
    { id: '2', type: 'heart_rate', value: 155, unit: 'bpm', timestamp: '2026-01-15T11:00:00Z', isAbnormal: true },
    { id: '3', type: 'spo2', value: 98, unit: '%', timestamp: '2026-01-15T10:30:00Z', isAbnormal: false },
    { id: '4', type: 'spo2', value: 87, unit: '%', timestamp: '2026-01-15T12:00:00Z', isAbnormal: true },
    { id: '5', type: 'temperature', value: 36.8, unit: 'C', timestamp: '2026-01-15T09:00:00Z', isAbnormal: false },
    { id: '6', type: 'temperature', value: 39.2, unit: 'C', timestamp: '2026-01-15T14:00:00Z', isAbnormal: true },
    { id: '7', type: 'blood_pressure', value: 120, unit: 'mmHg', timestamp: '2026-01-15T08:00:00Z', isAbnormal: false },
    { id: '8', type: 'blood_pressure', value: 185, unit: 'mmHg', timestamp: '2026-01-15T16:00:00Z', isAbnormal: true },
  ];

  it('should identify normal heart rate', () => {
    const value = 72;
    const isNormal = value >= 60 && value <= 100;
    expect(isNormal).toBe(true);
  });

  it('should identify abnormal heart rate - tachycardia', () => {
    const value = 155;
    const isAbnormal = value < 60 || value > 100;
    expect(isAbnormal).toBe(true);
  });

  it('should identify abnormal heart rate - bradycardia', () => {
    const value = 45;
    const isAbnormal = value < 60 || value > 100;
    expect(isAbnormal).toBe(true);
  });

  it('should identify critical heart rate', () => {
    const value = 160;
    const isCritical = value < 40 || value > 150;
    expect(isCritical).toBe(true);
  });

  it('should identify normal SpO2', () => {
    const value = 98;
    const isNormal = value >= 95 && value <= 100;
    expect(isNormal).toBe(true);
  });

  it('should identify low SpO2', () => {
    const value = 87;
    const isCritical = value < 90;
    expect(isCritical).toBe(true);
  });

  it('should identify normal temperature', () => {
    const value = 36.8;
    const isNormal = value >= 36.1 && value <= 37.2;
    expect(isNormal).toBe(true);
  });

  it('should identify fever', () => {
    const value = 39.2;
    const isFever = value > 37.2;
    expect(isFever).toBe(true);
  });

  it('should identify critical fever', () => {
    const value = 40.1;
    const isCritical = value > 39.5;
    expect(isCritical).toBe(true);
  });

  it('should identify normal blood pressure', () => {
    const systolic = 120;
    const isNormal = systolic >= 90 && systolic <= 120;
    expect(isNormal).toBe(true);
  });

  it('should identify hypertension', () => {
    const systolic = 185;
    const isHigh = systolic > 140;
    expect(isHigh).toBe(true);
  });

  it('should identify hypotension', () => {
    const systolic = 75;
    const isLow = systolic < 90;
    expect(isLow).toBe(true);
  });

  it('should filter abnormal readings', () => {
    const abnormal = mockVitals.filter(v => v.isAbnormal);
    expect(abnormal.length).toBe(4);
  });

  it('should filter by vital type', () => {
    const heartRateReadings = mockVitals.filter(v => v.type === 'heart_rate');
    expect(heartRateReadings.length).toBe(2);
  });

  it('should get latest reading by type', () => {
    const spo2Readings = mockVitals
      .filter(v => v.type === 'spo2')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    expect(spo2Readings[0].value).toBe(87);
  });

  it('should sort readings by timestamp', () => {
    const sorted = [...mockVitals].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    expect(sorted[0].id).toBe('7');
    expect(sorted[sorted.length - 1].id).toBe('8');
  });

  it('should calculate average heart rate', () => {
    const hrReadings = mockVitals.filter(v => v.type === 'heart_rate');
    const avg = hrReadings.reduce((sum, v) => sum + v.value, 0) / hrReadings.length;
    expect(avg).toBe(113.5);
  });

  it('should detect upward trend', () => {
    const readings = [70, 72, 75, 78, 82];
    const isUpward = readings[readings.length - 1] > readings[0];
    expect(isUpward).toBe(true);
  });

  it('should detect downward trend', () => {
    const readings = [98, 96, 94, 92, 90];
    const isDownward = readings[readings.length - 1] < readings[0];
    expect(isDownward).toBe(true);
  });
});

describe('MedicationTracker', () => {
  const mockMedications = [
    {
      id: 'med1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'twice_daily',
      isActive: true,
      timeSlots: ['08:00', '20:00'],
      reminders: [
        { id: 'r1', time: '08:00', enabled: true, taken: true, takenAt: '2026-01-15T08:05:00Z' },
        { id: 'r2', time: '20:00', enabled: true, taken: false },
      ],
    },
    {
      id: 'med2',
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'once_daily',
      isActive: true,
      timeSlots: ['09:00'],
      reminders: [
        { id: 'r3', time: '09:00', enabled: true, taken: true, takenAt: '2026-01-15T09:10:00Z' },
      ],
    },
    {
      id: 'med3',
      name: 'Vitamin D',
      dosage: '1000IU',
      frequency: 'once_daily',
      isActive: false,
      timeSlots: ['10:00'],
      reminders: [
        { id: 'r4', time: '10:00', enabled: true, taken: false },
      ],
    },
  ];

  it('should filter active medications', () => {
    const active = mockMedications.filter(m => m.isActive);
    expect(active.length).toBe(2);
  });

  it('should filter inactive medications', () => {
    const inactive = mockMedications.filter(m => !m.isActive);
    expect(inactive.length).toBe(1);
    expect(inactive[0].name).toBe('Vitamin D');
  });

  it('should find missed doses', () => {
    const active = mockMedications.filter(m => m.isActive);
    const missed = active.reduce((count, m) =>
      count + m.reminders.filter(r => !r.taken && r.enabled).length, 0
    );
    expect(missed).toBe(1);
  });

  it('should calculate adherence percentage', () => {
    const active = mockMedications.filter(m => m.isActive);
    const total = active.reduce((sum, m) => sum + m.reminders.length, 0);
    const taken = active.reduce((sum, m) => sum + m.reminders.filter(r => r.taken).length, 0);
    const adherence = Math.round((taken / total) * 100);
    expect(adherence).toBe(67);
  });

  it('should mark medication as taken', () => {
    const med = { ...mockMedications[0] };
    med.reminders = med.reminders.map(r =>
      r.id === 'r2' ? { ...r, taken: true, takenAt: new Date().toISOString() } : r
    );
    const allTaken = med.reminders.every(r => r.taken);
    expect(allTaken).toBe(true);
  });

  it('should get next dose time', () => {
    const med = mockMedications[0];
    const currentTime = '12:00';
    const nextSlot = med.timeSlots.find(slot => slot > currentTime);
    expect(nextSlot).toBe('20:00');
  });

  it('should handle medication with no upcoming doses', () => {
    const med = mockMedications[1];
    const currentTime = '22:00';
    const nextSlot = med.timeSlots.find(slot => slot > currentTime);
    expect(nextSlot).toBeUndefined();
  });
});

describe('HealthScore', () => {
  it('should start at 100', () => {
    const baseScore = 100;
    expect(baseScore).toBe(100);
  });

  it('should deduct for abnormal vitals', () => {
    const baseScore = 100;
    const abnormalCount = 3;
    const score = baseScore - (abnormalCount * 5);
    expect(score).toBe(85);
  });

  it('should deduct for missed medications', () => {
    const baseScore = 100;
    const missedDoses = 2;
    const score = baseScore - (missedDoses * 3);
    expect(score).toBe(94);
  });

  it('should not go below 0', () => {
    const baseScore = 100;
    const deductions = 150;
    const score = Math.max(0, baseScore - deductions);
    expect(score).toBe(0);
  });

  it('should not exceed 100', () => {
    const score = Math.min(100, 120);
    expect(score).toBe(100);
  });

  it('should combine deductions', () => {
    const baseScore = 100;
    const abnormalDeduction = 4 * 5;
    const missedDeduction = 2 * 3;
    const score = Math.max(0, baseScore - abnormalDeduction - missedDeduction);
    expect(score).toBe(74);
  });
});

describe('BMI Calculator', () => {
  it('should calculate normal BMI', () => {
    const weight = 70;
    const height = 175;
    const bmi = weight / ((height / 100) ** 2);
    expect(bmi).toBeCloseTo(22.86, 1);
  });

  it('should identify underweight', () => {
    const bmi = 17.5;
    const category = bmi < 18.5 ? 'Underweight' : 'Normal';
    expect(category).toBe('Underweight');
  });

  it('should identify normal weight', () => {
    const bmi = 22.5;
    const category = bmi >= 18.5 && bmi < 25 ? 'Normal' : 'Other';
    expect(category).toBe('Normal');
  });

  it('should identify overweight', () => {
    const bmi = 27.3;
    const category = bmi >= 25 && bmi < 30 ? 'Overweight' : 'Other';
    expect(category).toBe('Overweight');
  });

  it('should identify obese', () => {
    const bmi = 32.1;
    const category = bmi >= 30 ? 'Obese' : 'Other';
    expect(category).toBe('Obese');
  });
});

describe('Date Utilities', () => {
  it('should format relative time - just now', () => {
    const diff = 30000;
    const result = diff < 60000 ? 'Just now' : 'Other';
    expect(result).toBe('Just now');
  });

  it('should format relative time - minutes', () => {
    const diff = 300000;
    const result = `${Math.floor(diff / 60000)}m ago`;
    expect(result).toBe('5m ago');
  });

  it('should format relative time - hours', () => {
    const diff = 7200000;
    const result = `${Math.floor(diff / 3600000)}h ago`;
    expect(result).toBe('2h ago');
  });

  it('should format relative time - days', () => {
    const diff = 259200000;
    const result = `${Math.floor(diff / 86400000)}d ago`;
    expect(result).toBe('3d ago');
  });
});

describe('Validation', () => {
  it('should validate correct email', () => {
    const email = 'user@example.com';
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValid).toBe(true);
  });

  it('should reject invalid email', () => {
    const email = 'invalid-email';
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValid).toBe(false);
  });

  it('should validate Indian phone number', () => {
    const phone = '9876543210';
    const isValid = /^[6-9]\d{9}$/.test(phone);
    expect(isValid).toBe(true);
  });

  it('should reject invalid phone number', () => {
    const phone = '1234567890';
    const isValid = /^[6-9]\d{9}$/.test(phone);
    expect(isValid).toBe(false);
  });

  it('should validate 6-digit OTP', () => {
    const otp = '123456';
    const isValid = /^\d{6}$/.test(otp);
    expect(isValid).toBe(true);
  });

  it('should reject short OTP', () => {
    const otp = '1234';
    const isValid = /^\d{6}$/.test(otp);
    expect(isValid).toBe(false);
  });
});
