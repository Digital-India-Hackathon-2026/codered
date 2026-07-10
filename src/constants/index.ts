// LifeLens - Application Constants
// Centralized configuration for the health monitoring app

export const APP_CONFIG = {
  name: 'LifeLens',
  version: '1.0.0',
  buildNumber: 1,
  bundleId: 'com.codered.lifelens',
  supportEmail: 'support@lifelens.health',
  privacyPolicyUrl: 'https://lifelens.health/privacy',
  termsUrl: 'https://lifelens.health/terms',
};

export const API_CONFIG = {
  baseUrl: 'https://askfirst.co/api',
  aiBaseUrl: 'https://askfirst.co/api/ai',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const VITAL_THRESHOLDS = {
  heart_rate: {
    min: 60,
    max: 100,
    criticalMin: 40,
    criticalMax: 150,
    unit: 'bpm',
    label: 'Heart Rate',
    icon: 'heart-pulse',
  },
  blood_pressure_systolic: {
    min: 90,
    max: 120,
    criticalMin: 70,
    criticalMax: 180,
    unit: 'mmHg',
    label: 'Systolic BP',
    icon: 'activity',
  },
  blood_pressure_diastolic: {
    min: 60,
    max: 80,
    criticalMin: 40,
    criticalMax: 120,
    unit: 'mmHg',
    label: 'Diastolic BP',
    icon: 'activity',
  },
  spo2: {
    min: 95,
    max: 100,
    criticalMin: 90,
    criticalMax: 100,
    unit: '%',
    label: 'SpO2',
    icon: 'droplet',
  },
  temperature: {
    min: 36.1,
    max: 37.2,
    criticalMin: 35.0,
    criticalMax: 39.5,
    unit: '°C',
    label: 'Temperature',
    icon: 'thermometer',
  },
  respiratory_rate: {
    min: 12,
    max: 20,
    criticalMin: 8,
    criticalMax: 30,
    unit: 'breaths/min',
    label: 'Respiratory Rate',
    icon: 'wind',
  },
  blood_glucose_fasting: {
    min: 70,
    max: 100,
    criticalMin: 54,
    criticalMax: 250,
    unit: 'mg/dL',
    label: 'Blood Glucose (Fasting)',
    icon: 'droplet',
  },
  blood_glucose_postmeal: {
    min: 70,
    max: 140,
    criticalMin: 54,
    criticalMax: 300,
    unit: 'mg/dL',
    label: 'Blood Glucose (Post-meal)',
    icon: 'droplet',
  },
};

export const MEDICATION_FREQUENCIES = [
  { value: 'once_daily', label: 'Once Daily', times: 1 },
  { value: 'twice_daily', label: 'Twice Daily', times: 2 },
  { value: 'thrice_daily', label: 'Three Times Daily', times: 3 },
  { value: 'weekly', label: 'Weekly', times: 1 },
  { value: 'as_needed', label: 'As Needed', times: 0 },
  { value: 'custom', label: 'Custom Schedule', times: 0 },
];

export const REPORT_TYPES = [
  { value: 'blood_test', label: 'Blood Test', icon: 'test-tube' },
  { value: 'xray', label: 'X-Ray', icon: 'scan' },
  { value: 'mri', label: 'MRI', icon: 'brain' },
  { value: 'ct_scan', label: 'CT Scan', icon: 'layers' },
  { value: 'ultrasound', label: 'Ultrasound', icon: 'radio' },
  { value: 'ecg', label: 'ECG', icon: 'activity' },
  { value: 'prescription', label: 'Prescription', icon: 'file-text' },
  { value: 'discharge_summary', label: 'Discharge Summary', icon: 'clipboard' },
  { value: 'other', label: 'Other', icon: 'file' },
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa drugs',
  'Aspirin',
  'Ibuprofen',
  'Latex',
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Eggs',
  'Milk',
  'Soy',
  'Wheat',
  'Dust mites',
  'Pollen',
  'Pet dander',
  'Mold',
  'Insect stings',
];

export const COMMON_CONDITIONS = [
  'Diabetes Type 1',
  'Diabetes Type 2',
  'Hypertension',
  'Asthma',
  'COPD',
  'Heart Disease',
  'Arthritis',
  'Thyroid Disorder',
  'Depression',
  'Anxiety',
  'Migraine',
  'Epilepsy',
  'Kidney Disease',
  'Liver Disease',
  'Cancer',
  'HIV/AIDS',
  'Tuberculosis',
  'Anemia',
];

export const SYMPTOM_CATEGORIES = {
  general: ['Fever', 'Fatigue', 'Weight Loss', 'Weight Gain', 'Night Sweats', 'Chills'],
  head: ['Headache', 'Dizziness', 'Blurred Vision', 'Ear Pain', 'Sore Throat', 'Nasal Congestion'],
  chest: ['Chest Pain', 'Shortness of Breath', 'Cough', 'Palpitations', 'Wheezing'],
  abdomen: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal Pain', 'Bloating', 'Loss of Appetite'],
  musculoskeletal: ['Back Pain', 'Joint Pain', 'Muscle Aches', 'Swelling', 'Stiffness', 'Weakness'],
  skin: ['Rash', 'Itching', 'Bruising', 'Dry Skin', 'Discoloration', 'Lumps'],
  neurological: ['Numbness', 'Tingling', 'Tremors', 'Memory Loss', 'Confusion', 'Seizures'],
  mental: ['Anxiety', 'Depression', 'Insomnia', 'Mood Swings', 'Irritability', 'Panic Attacks'],
};

export const COLORS = {
  primary: '#2D7FF9',
  primaryLight: '#E8F1FF',
  primaryDark: '#1A5BC4',
  secondary: '#6C63FF',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  danger: '#F44336',
  dangerLight: '#FFEBEE',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  background: '#FAFBFC',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  disabled: '#D1D5DB',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  hero: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  userId: 'userId',
  userProfile: 'userProfile',
  onboardingComplete: 'onboardingComplete',
  appSettings: 'appSettings',
  lastSyncTime: 'lastSyncTime',
  cachedVitals: 'cachedVitals',
  cachedMedications: 'cachedMedications',
  notificationPermission: 'notificationPermission',
};

export const HEALTH_CONNECT_PERMISSIONS = [
  'android.permission.health.READ_HEART_RATE',
  'android.permission.health.READ_BLOOD_PRESSURE',
  'android.permission.health.READ_BLOOD_GLUCOSE',
  'android.permission.health.READ_BODY_TEMPERATURE',
  'android.permission.health.READ_OXYGEN_SATURATION',
  'android.permission.health.READ_RESPIRATORY_RATE',
  'android.permission.health.READ_STEPS',
  'android.permission.health.READ_SLEEP',
  'android.permission.health.READ_WEIGHT',
  'android.permission.health.READ_HEIGHT',
  'android.permission.health.WRITE_HEART_RATE',
  'android.permission.health.WRITE_BLOOD_PRESSURE',
  'android.permission.health.WRITE_STEPS',
];
