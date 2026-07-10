// LifeLens - Health Data Type Definitions
// Core type system for the health monitoring application

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height: number;
  weight: number;
  profilePicture?: string;
  emergencyContact: EmergencyContact;
  medicalHistory: MedicalHistory;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export interface MedicalHistory {
  allergies: string[];
  chronicConditions: string[];
  surgeries: Surgery[];
  familyHistory: FamilyHistoryItem[];
  immunizations: Immunization[];
}

export interface Surgery {
  name: string;
  date: string;
  hospital: string;
  notes?: string;
}

export interface FamilyHistoryItem {
  condition: string;
  relationship: string;
  ageOfOnset?: number;
}

export interface Immunization {
  name: string;
  date: string;
  nextDueDate?: string;
  provider?: string;
}

export interface VitalSign {
  id: string;
  userId: string;
  type: VitalType;
  value: number;
  secondaryValue?: number;
  unit: string;
  timestamp: string;
  source: 'manual' | 'device' | 'healthConnect';
  isAbnormal: boolean;
  notes?: string;
}

export type VitalType =
  | 'heart_rate'
  | 'blood_pressure'
  | 'spo2'
  | 'temperature'
  | 'respiratory_rate'
  | 'blood_glucose'
  | 'weight'
  | 'steps'
  | 'sleep';

export interface VitalThreshold {
  type: VitalType;
  min: number;
  max: number;
  criticalMin: number;
  criticalMax: number;
  unit: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  startDate: string;
  endDate?: string;
  timeSlots: string[];
  instructions?: string;
  sideEffects?: string[];
  prescribedBy?: string;
  isActive: boolean;
  reminders: MedicationReminder[];
}

export type MedicationFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'thrice_daily'
  | 'weekly'
  | 'as_needed'
  | 'custom';

export interface MedicationReminder {
  id: string;
  time: string;
  enabled: boolean;
  taken: boolean;
  takenAt?: string;
}

export interface HealthReport {
  id: string;
  userId: string;
  title: string;
  type: ReportType;
  date: string;
  fileUrl: string;
  thumbnailUrl?: string;
  extractedData?: Record<string, any>;
  aiSummary?: string;
  tags: string[];
  hospital?: string;
  doctor?: string;
}

export type ReportType =
  | 'blood_test'
  | 'xray'
  | 'mri'
  | 'ct_scan'
  | 'ultrasound'
  | 'ecg'
  | 'prescription'
  | 'discharge_summary'
  | 'other';

export interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  relatedVitals?: string[];
  relatedReports?: string[];
  relatedMedications?: string[];
  metadata?: Record<string, any>;
}

export type TimelineEventType =
  | 'symptom'
  | 'diagnosis'
  | 'medication_start'
  | 'medication_end'
  | 'lab_result'
  | 'doctor_visit'
  | 'hospitalization'
  | 'surgery'
  | 'vaccination'
  | 'lifestyle_change';

export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  status: 'active' | 'archived';
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: ChatMessageType;
  metadata?: ChatMessageMetadata;
}

export type ChatMessageType =
  | 'text'
  | 'asking_permission'
  | 'diagnostic_question'
  | 'summary'
  | 'recommendation';

export interface ChatMessageMetadata {
  title?: string;
  questionFormat?: 'mcq' | 'text' | 'scale';
  questionConfig?: {
    options?: string[];
    multiSelect?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
  };
  questionNumber?: number;
  severity?: string;
  topHypothesis?: string;
  narrative?: string;
  sections?: Record<string, any>;
  sectionOrder?: string[];
}

export interface Insight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: string;
  createdAt: string;
  expiresAt?: string;
  dismissed: boolean;
}

export type InsightType =
  | 'vital_trend'
  | 'medication_adherence'
  | 'lifestyle_suggestion'
  | 'anomaly_detected'
  | 'preventive_care'
  | 'goal_progress';

export interface HealthGoal {
  id: string;
  userId: string;
  type: string;
  target: number;
  current: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  value: number;
  reached: boolean;
  reachedAt?: string;
  label: string;
}

export interface NotificationPreferences {
  medicationReminders: boolean;
  vitalAlerts: boolean;
  insightNotifications: boolean;
  weeklyReport: boolean;
  appointmentReminders: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  units: {
    temperature: 'celsius' | 'fahrenheit';
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
    bloodGlucose: 'mg/dL' | 'mmol/L';
  };
  notifications: NotificationPreferences;
  dataSync: {
    healthConnect: boolean;
    autoBackup: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
