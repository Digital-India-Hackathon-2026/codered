import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
  getGrantedPermissions,
} from 'react-native-health-connect';
import { Platform, Linking } from 'react-native';

export interface HealthData {
  heartRate: { bpm: number; time: string } | null;
  steps: number;
  sleep: { hours: number; minutes: number } | null;
  spo2: number | null;
  calories: number;
  distance: number;
  bloodPressure: { systolic: number; diastolic: number } | null;
}

const PERMISSIONS = [
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'OxygenSaturation' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'BloodPressure' },
] as const;

class HealthConnectService {
  private initialized = false;

  async checkAvailability(): Promise<'available' | 'unavailable' | 'not_installed'> {
    if (Platform.OS !== 'android') return 'unavailable';
    try {
      const status = await getSdkStatus();
      if (status === SdkAvailabilityStatus.SDK_AVAILABLE) return 'available';
      if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return 'not_installed';
      return 'unavailable';
    } catch {
      return 'unavailable';
    }
  }

  async init(): Promise<boolean> {
    try {
      if (this.initialized) return true;
      const result = await initialize();
      this.initialized = result;
      return result;
    } catch (e) {
      console.log('Health Connect init error:', e);
      return false;
    }
  }

  async hasPermissions(): Promise<boolean> {
    try {
      const granted = await getGrantedPermissions();
      return granted.length > 0;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const inited = await this.init();
      if (!inited) return false;

      // Check if already granted
      const existing = await getGrantedPermissions();
      if (existing.length >= 3) return true;

      // Request permissions - this opens the Health Connect permission screen
      const granted = await requestPermission(PERMISSIONS as any);
      return granted.length > 0;
    } catch (e) {
      console.log('Health Connect permission error:', e);
      return false;
    }
  }

  openHealthConnectSettings() {
    // Opens Health Connect app directly
    Linking.openURL('content://com.google.android.apps.healthdata').catch(() => {
      // Fallback: open Health Connect in Play Store
      Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata');
    });
  }

  async getHealthData(): Promise<HealthData> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);

    const data: HealthData = {
      heartRate: null,
      steps: 0,
      sleep: null,
      spo2: null,
      calories: 0,
      distance: 0,
      bloodPressure: null,
    };

    try {
      const hr = await readRecords('HeartRate', {
        timeRangeFilter: { operator: 'between', startTime: yesterday.toISOString(), endTime: now.toISOString() },
      });
      if (hr.records.length > 0) {
        const last = hr.records[hr.records.length - 1];
        const samples = (last as any).samples || [];
        if (samples.length > 0) {
          data.heartRate = {
            bpm: samples[samples.length - 1].beatsPerMinute,
            time: samples[samples.length - 1].time || (last as any).startTime,
          };
        }
      }
    } catch (e) { console.log('HR read error:', e); }

    try {
      const steps = await readRecords('Steps', {
        timeRangeFilter: { operator: 'between', startTime: startOfDay.toISOString(), endTime: now.toISOString() },
      });
      data.steps = steps.records.reduce((sum, r) => sum + ((r as any).count || 0), 0);
    } catch (e) { console.log('Steps read error:', e); }

    try {
      const sleep = await readRecords('SleepSession', {
        timeRangeFilter: { operator: 'between', startTime: yesterday.toISOString(), endTime: now.toISOString() },
      });
      if (sleep.records.length > 0) {
        const last = sleep.records[sleep.records.length - 1] as any;
        const durationMs = new Date(last.endTime).getTime() - new Date(last.startTime).getTime();
        const totalMin = Math.floor(durationMs / 60000);
        data.sleep = { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
      }
    } catch (e) { console.log('Sleep read error:', e); }

    try {
      const spo2 = await readRecords('OxygenSaturation', {
        timeRangeFilter: { operator: 'between', startTime: yesterday.toISOString(), endTime: now.toISOString() },
      });
      if (spo2.records.length > 0) {
        data.spo2 = (spo2.records[spo2.records.length - 1] as any).percentage;
      }
    } catch (e) { console.log('SpO2 read error:', e); }

    try {
      const cal = await readRecords('ActiveCaloriesBurned', {
        timeRangeFilter: { operator: 'between', startTime: startOfDay.toISOString(), endTime: now.toISOString() },
      });
      data.calories = cal.records.reduce((sum, r) => sum + ((r as any).energy?.inKilocalories || 0), 0);
    } catch (e) { console.log('Calories read error:', e); }

    try {
      const dist = await readRecords('Distance', {
        timeRangeFilter: { operator: 'between', startTime: startOfDay.toISOString(), endTime: now.toISOString() },
      });
      data.distance = dist.records.reduce((sum, r) => sum + ((r as any).distance?.inMeters || 0), 0);
    } catch (e) { console.log('Distance read error:', e); }

    try {
      const bp = await readRecords('BloodPressure', {
        timeRangeFilter: { operator: 'between', startTime: yesterday.toISOString(), endTime: now.toISOString() },
      });
      if (bp.records.length > 0) {
        const last = bp.records[bp.records.length - 1] as any;
        data.bloodPressure = {
          systolic: last.systolic?.inMillimetersOfMercury || 0,
          diastolic: last.diastolic?.inMillimetersOfMercury || 0,
        };
      }
    } catch (e) { console.log('BP read error:', e); }

    return data;
  }

  async getStepsHistory(days: number = 7): Promise<{ date: string; steps: number }[]> {
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const result: { date: string; steps: number }[] = [];

    try {
      const steps = await readRecords('Steps', {
        timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: now.toISOString() },
      });

      // Group by day
      const byDay: Record<string, number> = {};
      for (const r of steps.records) {
        const day = new Date((r as any).startTime).toISOString().split('T')[0];
        byDay[day] = (byDay[day] || 0) + ((r as any).count || 0);
      }

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split('T')[0];
        result.push({ date: key, steps: byDay[key] || 0 });
      }
    } catch {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        result.push({ date: d.toISOString().split('T')[0], steps: 0 });
      }
    }

    return result;
  }
}

export const healthConnect = new HealthConnectService();
