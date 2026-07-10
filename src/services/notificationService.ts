// LifeLens - Notification Service
// Handles push notifications, medication reminders, and health alerts

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { Medication, VitalSign, NotificationPreferences } from '../types';

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  scheduledAt?: string;
  priority: 'low' | 'default' | 'high' | 'critical';
  sound?: boolean;
  vibrate?: boolean;
  badge?: number;
}

export type NotificationType =
  | 'medication_reminder'
  | 'medication_missed'
  | 'vital_alert'
  | 'vital_critical'
  | 'appointment_reminder'
  | 'insight_new'
  | 'weekly_report'
  | 'goal_achieved'
  | 'streak_reminder'
  | 'hydration_reminder';

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'low' | 'default' | 'high' | 'max';
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    id: 'medication_reminders',
    name: 'Medication Reminders',
    description: 'Reminders to take your medications on time',
    importance: 'high',
    sound: true,
    vibration: true,
    badge: true,
  },
  {
    id: 'vital_alerts',
    name: 'Vital Sign Alerts',
    description: 'Alerts when vital signs are abnormal',
    importance: 'max',
    sound: true,
    vibration: true,
    badge: true,
  },
  {
    id: 'health_insights',
    name: 'Health Insights',
    description: 'Personalized health recommendations',
    importance: 'default',
    sound: false,
    vibration: false,
    badge: true,
  },
  {
    id: 'appointments',
    name: 'Appointment Reminders',
    description: 'Upcoming doctor appointment reminders',
    importance: 'high',
    sound: true,
    vibration: true,
    badge: true,
  },
  {
    id: 'general',
    name: 'General',
    description: 'General app notifications',
    importance: 'low',
    sound: false,
    vibration: false,
    badge: false,
  },
];

class NotificationService {
  private initialized = false;
  private preferences: NotificationPreferences | null = null;
  private scheduledNotifications: Map<string, NotificationPayload> = new Map();
  private notificationHistory: NotificationPayload[] = [];

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Request notification permissions
      const permission = await this.requestPermission();
      if (!permission) return false;

      // Create notification channels (Android)
      if (Platform.OS === 'android') {
        await this.createChannels();
      }

      // Load preferences
      await this.loadPreferences();

      // Restore scheduled notifications
      await this.restoreScheduledNotifications();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  private async requestPermission(): Promise<boolean> {
    try {
      // In production, use @react-native-firebase/messaging or notifee
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.notificationPermission);
      return stored === 'granted';
    } catch {
      return false;
    }
  }

  private async createChannels(): Promise<void> {
    // Create Android notification channels
    for (const channel of NOTIFICATION_CHANNELS) {
      // notifee.createChannel(channel) would be called here
      console.log(`Channel created: ${channel.id}`);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      if (stored) {
        this.preferences = JSON.parse(stored);
      } else {
        this.preferences = {
          medicationReminders: true,
          vitalAlerts: true,
          insightNotifications: true,
          weeklyReport: true,
          appointmentReminders: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        };
      }
    } catch {
      this.preferences = null;
    }
  }

  private async restoreScheduledNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('scheduled_notifications');
      if (stored) {
        const notifications: NotificationPayload[] = JSON.parse(stored);
        notifications.forEach(n => this.scheduledNotifications.set(n.id, n));
      }
    } catch {
      // Ignore restore errors
    }
  }

  private isQuietHours(): boolean {
    if (!this.preferences?.quietHoursStart || !this.preferences?.quietHoursEnd) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = this.preferences.quietHoursStart.split(':').map(Number);
    const [endH, endM] = this.preferences.quietHoursEnd.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Overnight quiet hours (e.g., 22:00 - 07:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  async scheduleNotification(payload: NotificationPayload): Promise<string> {
    // Check quiet hours for non-critical notifications
    if (this.isQuietHours() && payload.priority !== 'critical') {
      console.log('Notification suppressed during quiet hours:', payload.title);
      return payload.id;
    }

    // Check preferences
    if (!this.shouldSendNotification(payload.type)) {
      return payload.id;
    }

    this.scheduledNotifications.set(payload.id, payload);
    await this.persistScheduledNotifications();

    // In production: notifee.createTriggerNotification(...)
    console.log(`Notification scheduled: ${payload.title}`);
    return payload.id;
  }

  async cancelNotification(id: string): Promise<void> {
    this.scheduledNotifications.delete(id);
    await this.persistScheduledNotifications();
    // In production: notifee.cancelNotification(id)
  }

  async cancelAllNotifications(): Promise<void> {
    this.scheduledNotifications.clear();
    await AsyncStorage.removeItem('scheduled_notifications');
    // In production: notifee.cancelAllNotifications()
  }

  private shouldSendNotification(type: NotificationType): boolean {
    if (!this.preferences) return true;

    switch (type) {
      case 'medication_reminder':
      case 'medication_missed':
        return this.preferences.medicationReminders;
      case 'vital_alert':
      case 'vital_critical':
        return this.preferences.vitalAlerts;
      case 'insight_new':
        return this.preferences.insightNotifications;
      case 'weekly_report':
        return this.preferences.weeklyReport;
      case 'appointment_reminder':
        return this.preferences.appointmentReminders;
      default:
        return true;
    }
  }

  private async persistScheduledNotifications(): Promise<void> {
    const notifications = Array.from(this.scheduledNotifications.values());
    await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(notifications));
  }

  // Schedule medication reminders for the day
  async scheduleMedicationReminders(medications: Medication[]): Promise<void> {
    const activeMeds = medications.filter(m => m.isActive);

    for (const med of activeMeds) {
      for (const slot of med.timeSlots) {
        const [hours, minutes] = slot.split(':').map(Number);
        const now = new Date();
        const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Skip if time has passed
        if (reminderTime.getTime() < now.getTime()) continue;

        const notificationId = `med_${med.id}_${slot}`;

        await this.scheduleNotification({
          id: notificationId,
          title: 'Medication Reminder',
          body: `Time to take ${med.name} (${med.dosage})`,
          type: 'medication_reminder',
          data: { medicationId: med.id, time: slot },
          scheduledAt: reminderTime.toISOString(),
          priority: 'high',
          sound: true,
          vibrate: true,
        });

        // Schedule missed dose notification (30 min after)
        const missedTime = new Date(reminderTime.getTime() + 30 * 60000);
        await this.scheduleNotification({
          id: `missed_${med.id}_${slot}`,
          title: 'Missed Medication',
          body: `You haven't taken ${med.name} yet. Don't forget!`,
          type: 'medication_missed',
          data: { medicationId: med.id, time: slot },
          scheduledAt: missedTime.toISOString(),
          priority: 'high',
          sound: true,
          vibrate: true,
        });
      }
    }
  }

  // Send vital sign alert
  async sendVitalAlert(vital: VitalSign, severity: 'warning' | 'critical'): Promise<void> {
    const isCritical = severity === 'critical';

    await this.scheduleNotification({
      id: `vital_${vital.id}`,
      title: isCritical ? '⚠️ Critical Vital Alert' : 'Vital Sign Warning',
      body: this.getVitalAlertMessage(vital, severity),
      type: isCritical ? 'vital_critical' : 'vital_alert',
      data: { vitalId: vital.id, type: vital.type, value: vital.value },
      priority: isCritical ? 'critical' : 'high',
      sound: true,
      vibrate: true,
    });
  }

  private getVitalAlertMessage(vital: VitalSign, severity: string): string {
    const typeLabels: Record<string, string> = {
      heart_rate: 'Heart Rate',
      blood_pressure: 'Blood Pressure',
      spo2: 'SpO2',
      temperature: 'Temperature',
      respiratory_rate: 'Respiratory Rate',
      blood_glucose: 'Blood Glucose',
    };

    const label = typeLabels[vital.type] || vital.type;

    if (severity === 'critical') {
      return `Your ${label} is at a critical level (${vital.value} ${vital.unit}). Please seek medical attention immediately.`;
    }
    return `Your ${label} reading (${vital.value} ${vital.unit}) is outside the normal range. Please monitor closely.`;
  }

  // Schedule hydration reminders
  async scheduleHydrationReminders(): Promise<void> {
    const startHour = 8;
    const endHour = 20;
    const intervalHours = 2;

    const now = new Date();

    for (let hour = startHour; hour <= endHour; hour += intervalHours) {
      const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0);
      if (reminderTime.getTime() < now.getTime()) continue;

      await this.scheduleNotification({
        id: `hydration_${hour}`,
        title: '💧 Hydration Reminder',
        body: 'Remember to drink a glass of water. Stay hydrated!',
        type: 'hydration_reminder',
        scheduledAt: reminderTime.toISOString(),
        priority: 'low',
        sound: false,
        vibrate: false,
      });
    }
  }

  // Schedule weekly health report
  async scheduleWeeklyReport(): Promise<void> {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(9, 0, 0, 0);

    await this.scheduleNotification({
      id: 'weekly_report',
      title: '📊 Weekly Health Report',
      body: 'Your weekly health summary is ready. Tap to view your progress.',
      type: 'weekly_report',
      scheduledAt: nextSunday.toISOString(),
      priority: 'default',
      sound: true,
      vibrate: false,
    });
  }

  // Get notification history
  getHistory(): NotificationPayload[] {
    return [...this.notificationHistory].reverse();
  }

  // Update preferences
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...prefs } as NotificationPreferences;
    await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
  }

  // Get current preferences
  getPreferences(): NotificationPreferences | null {
    return this.preferences;
  }

  // Get pending notifications count
  getPendingCount(): number {
    return this.scheduledNotifications.size;
  }

  // Handle notification tap
  async handleNotificationPress(notification: NotificationPayload): Promise<{ screen: string; params?: any }> {
    switch (notification.type) {
      case 'medication_reminder':
      case 'medication_missed':
        return { screen: 'Medications', params: { medicationId: notification.data?.medicationId } };
      case 'vital_alert':
      case 'vital_critical':
        return { screen: 'Vitals', params: { type: notification.data?.type } };
      case 'appointment_reminder':
        return { screen: 'Timeline' };
      case 'insight_new':
        return { screen: 'Insights' };
      case 'weekly_report':
        return { screen: 'Insights', params: { tab: 'weekly' } };
      default:
        return { screen: 'Home' };
    }
  }
}

export const notificationService = new NotificationService();
