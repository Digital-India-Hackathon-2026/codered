// LifeLens - Custom React Hooks
// Reusable hooks for health data, authentication, and app state

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Dimensions } from 'react-native';
import { STORAGE_KEYS, VITAL_THRESHOLDS } from '../constants';
import { VitalSign, Medication, HealthReport, Insight } from '../types';

// Hook for managing vital signs data
export function useVitals(userId: string) {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(async () => {
    try {
      setLoading(true);
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.cachedVitals);
      if (cached) {
        setVitals(JSON.parse(cached));
      }
      setError(null);
    } catch (err) {
      setError('Failed to load vitals');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addVital = useCallback(async (vital: Omit<VitalSign, 'id' | 'userId' | 'timestamp'>) => {
    const newVital: VitalSign = {
      ...vital,
      id: Date.now().toString(),
      userId,
      timestamp: new Date().toISOString(),
      isAbnormal: checkAbnormal(vital.type, vital.value),
    };
    const updated = [...vitals, newVital];
    setVitals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.cachedVitals, JSON.stringify(updated));
    return newVital;
  }, [vitals, userId]);

  const getLatest = useCallback((type: string) => {
    return vitals
      .filter(v => v.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [vitals]);

  const getHistory = useCallback((type: string, days: number = 30) => {
    const cutoff = Date.now() - days * 86400000;
    return vitals
      .filter(v => v.type === type && new Date(v.timestamp).getTime() > cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [vitals]);

  const getAbnormal = useCallback(() => {
    return vitals.filter(v => v.isAbnormal);
  }, [vitals]);

  useEffect(() => { fetchVitals(); }, [fetchVitals]);

  return { vitals, loading, error, addVital, getLatest, getHistory, getAbnormal, refresh: fetchVitals };
}

// Hook for medication management
export function useMedications(userId: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.cachedMedications);
      if (cached) setMedications(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getActive = useMemo(() => medications.filter(m => m.isActive), [medications]);

  const getDueToday = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return getActive.filter(m =>
      m.timeSlots.some(slot => slot >= currentTime && !m.reminders.find(r => r.time === slot)?.taken)
    );
  }, [getActive]);

  const markTaken = useCallback(async (medicationId: string, time: string) => {
    const updated = medications.map(m => {
      if (m.id !== medicationId) return m;
      return {
        ...m,
        reminders: m.reminders.map(r =>
          r.time === time ? { ...r, taken: true, takenAt: new Date().toISOString() } : r
        ),
      };
    });
    setMedications(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.cachedMedications, JSON.stringify(updated));
  }, [medications]);

  const getAdherence = useCallback((days: number = 7) => {
    const total = getActive.reduce((sum, m) => sum + m.reminders.length * days, 0);
    const taken = getActive.reduce((sum, m) => sum + m.reminders.filter(r => r.taken).length, 0);
    return total > 0 ? Math.round((taken / total) * 100) : 100;
  }, [getActive]);

  useEffect(() => { fetchMedications(); }, [fetchMedications]);

  return { medications, loading, getActive, getDueToday, markTaken, getAdherence, refresh: fetchMedications };
}

// Hook for debounced search
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Hook for app state (foreground/background)
export function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const previousState = useRef(appState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      previousState.current = appState;
      setAppState(nextState);
    });
    return () => subscription?.remove();
  }, [appState]);

  const isActive = appState === 'active';
  const cameFromBackground = previousState.current !== 'active' && appState === 'active';

  return { appState, isActive, cameFromBackground, previousState: previousState.current };
}

// Hook for countdown timer
export function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

// Hook for responsive dimensions
export function useResponsive() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isSmall = dimensions.width < 375;
  const isMedium = dimensions.width >= 375 && dimensions.width < 414;
  const isLarge = dimensions.width >= 414;
  const isLandscape = dimensions.width > dimensions.height;

  return { ...dimensions, isSmall, isMedium, isLarge, isLandscape };
}

// Hook for async storage with type safety
export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key).then(stored => {
      if (stored) setValue(JSON.parse(stored));
      setLoaded(true);
    });
  }, [key]);

  const update = useCallback(async (newValue: T) => {
    setValue(newValue);
    await AsyncStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);

  const remove = useCallback(async () => {
    setValue(defaultValue);
    await AsyncStorage.removeItem(key);
  }, [key, defaultValue]);

  return { value, update, remove, loaded };
}

// Hook for network connectivity
export function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // NetInfo would be used here in production
    setIsConnected(true);
    setConnectionType('wifi');
  }, []);

  return { isConnected, connectionType };
}

// Hook for health insights generation
export function useInsights(vitals: VitalSign[], medications: Medication[]) {
  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    // Check for abnormal vital trends
    const abnormalVitals = vitals.filter(v => v.isAbnormal);
    if (abnormalVitals.length > 3) {
      result.push({
        id: 'abnormal-trend',
        userId: '',
        type: 'anomaly_detected',
        title: 'Abnormal Vital Signs Detected',
        description: `${abnormalVitals.length} abnormal readings in recent history. Consider consulting your doctor.`,
        priority: 'high',
        actionable: true,
        action: 'Schedule a checkup',
        createdAt: new Date().toISOString(),
        dismissed: false,
      });
    }

    // Check medication adherence
    const activeMeds = medications.filter(m => m.isActive);
    const missedDoses = activeMeds.reduce((count, m) =>
      count + m.reminders.filter(r => !r.taken && r.enabled).length, 0
    );
    if (missedDoses > 0) {
      result.push({
        id: 'missed-meds',
        userId: '',
        type: 'medication_adherence',
        title: 'Missed Medications',
        description: `You have ${missedDoses} missed dose(s) today. Staying consistent helps your treatment.`,
        priority: 'medium',
        actionable: true,
        action: 'View medications',
        createdAt: new Date().toISOString(),
        dismissed: false,
      });
    }

    // Hydration reminder based on time
    const hour = new Date().getHours();
    if (hour >= 10 && hour <= 18) {
      result.push({
        id: 'hydration',
        userId: '',
        type: 'lifestyle_suggestion',
        title: 'Stay Hydrated',
        description: 'Remember to drink water regularly. Aim for 8 glasses per day.',
        priority: 'low',
        actionable: false,
        createdAt: new Date().toISOString(),
        dismissed: false,
      });
    }

    return result;
  }, [vitals, medications]);

  return insights;
}

// Helper function for vital threshold checking
function checkAbnormal(type: string, value: number): boolean {
  const threshold = VITAL_THRESHOLDS[type as keyof typeof VITAL_THRESHOLDS];
  if (!threshold) return false;
  return value < threshold.min || value > threshold.max;
}
