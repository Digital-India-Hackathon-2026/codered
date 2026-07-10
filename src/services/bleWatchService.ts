// LifeLens - BLE Watch Service
// Connects to boAt/smartwatch via BLE for live heart rate data
// Uses standard Heart Rate Service (0x180D) + Heart Rate Measurement (0x2A37)

import { BleManager, Device, Characteristic, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

// Standard BLE UUIDs
const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_LEVEL = '00002a19-0000-1000-8000-00805f9b34fb';
const DEVICE_INFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb';

// boAt watch - discovered via nRF Connect
// Service: F618, Write: B002, Notify: B001
const BOAT_CUSTOM_SERVICE = '0000f618-0000-1000-8000-00805f9b34fb';
const BOAT_CUSTOM_WRITE = '0000b002-0000-1000-8000-00805f9b34fb';
const BOAT_CUSTOM_NOTIFY = '0000b001-0000-1000-8000-00805f9b34fb';

// Common HR start commands to try (brute-force for unknown protocol)
const HR_START_COMMANDS = [
  [0x01],                                    // Simple enable
  [0x01, 0x00],                              // Enable with padding
  [0xA0, 0x01],                              // Common Chinese wearable
  [0x55, 0x01],                              // Another common pattern
  [0xAB, 0x00, 0x04, 0xFF, 0x31, 0x09, 0x01], // boAt Wave pattern
  [0x15, 0x01, 0x01],                        // HR continuous mode
  [0x16, 0x01, 0x01],                        // Alt HR command
  [0x69, 0x01],                              // Realtek chipset
  [0x23, 0x01, 0x01],                        // JieLi chipset
];

const HR_STOP_COMMANDS = [
  [0x00],
  [0x01, 0x00],
  [0xA0, 0x00],
  [0x55, 0x00],
  [0xAB, 0x00, 0x04, 0xFF, 0x31, 0x09, 0x00],
  [0x15, 0x01, 0x00],
  [0x16, 0x01, 0x00],
  [0x69, 0x00],
  [0x23, 0x01, 0x00],
];

export interface HeartRateData {
  bpm: number;
  timestamp: Date;
  contactDetected: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}

export interface WatchDevice {
  id: string;
  name: string;
  rssi: number;
  isConnectable: boolean;
}

export interface BLEServiceState {
  isScanning: boolean;
  isConnected: boolean;
  connectedDevice: WatchDevice | null;
  bluetoothState: State;
  lastHeartRate: HeartRateData | null;
  batteryLevel: number | null;
}

type HeartRateCallback = (data: HeartRateData) => void;
type StateCallback = (state: BLEServiceState) => void;

class BLEWatchService {
  private manager: BleManager;
  private device: Device | null = null;
  private heartRateListeners: HeartRateCallback[] = [];
  private stateListeners: StateCallback[] = [];
  private state: BLEServiceState = {
    isScanning: false,
    isConnected: false,
    connectedDevice: null,
    bluetoothState: State.Unknown,
    lastHeartRate: null,
    batteryLevel: null,
  };

  constructor() {
    this.manager = new BleManager();
    this.manager.onStateChange((state) => {
      this.updateState({ bluetoothState: state });
    }, true);
  }

  // Request BLE permissions (Android 12+)
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') return true;

    if (Number(Platform.Version) >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // Scan for nearby watches/bands
  async scanForDevices(timeoutMs: number = 10000): Promise<WatchDevice[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error('BLE permissions not granted');

    const devices: WatchDevice[] = [];
    this.updateState({ isScanning: true });

    return new Promise((resolve) => {
      this.manager.startDeviceScan(
        [HEART_RATE_SERVICE], // Only show devices with HR service
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.warn('BLE scan error:', error.message);
            return;
          }
          if (device && device.name) {
            const existing = devices.find(d => d.id === device.id);
            if (!existing) {
              devices.push({
                id: device.id,
                name: device.name || 'Unknown Device',
                rssi: device.rssi || -100,
                isConnectable: device.isConnectable ?? true,
              });
            }
          }
        }
      );

      setTimeout(() => {
        this.manager.stopDeviceScan();
        this.updateState({ isScanning: false });
        resolve(devices);
      }, timeoutMs);
    });
  }

  // Scan ALL named BLE devices nearby
  async scanAllDevices(timeoutMs: number = 10000): Promise<WatchDevice[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error('BLE permissions not granted');

    const devices: WatchDevice[] = [];
    this.updateState({ isScanning: true });

    return new Promise((resolve) => {
      this.manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device) => {
          if (error) return;
          if (device && device.name) {
            const existing = devices.find(d => d.id === device.id);
            if (!existing) {
              devices.push({
                id: device.id,
                name: device.name,
                rssi: device.rssi || -100,
                isConnectable: device.isConnectable ?? true,
              });
            }
          }
        }
      );

      setTimeout(() => {
        this.manager.stopDeviceScan();
        this.updateState({ isScanning: false });
        resolve(devices.sort((a, b) => b.rssi - a.rssi));
      }, timeoutMs);
    });
  }

  // Scan specifically for boAt devices
  async scanForBoatDevices(timeoutMs: number = 10000): Promise<WatchDevice[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error('BLE permissions not granted');

    const devices: WatchDevice[] = [];
    this.updateState({ isScanning: true });

    return new Promise((resolve) => {
      this.manager.startDeviceScan(
        null, // Scan all - boAt may not advertise standard HR service
        { allowDuplicates: false },
        (error, device) => {
          if (error) return;
          if (device && device.name) {
            const name = device.name.toLowerCase();
            // Match boAt watch names
            if (name.includes('boat') || name.includes('wave') ||
                name.includes('storm') || name.includes('xtend') ||
                name.includes('blaze') || name.includes('lunar')) {
              const existing = devices.find(d => d.id === device.id);
              if (!existing) {
                devices.push({
                  id: device.id,
                  name: device.name,
                  rssi: device.rssi || -100,
                  isConnectable: device.isConnectable ?? true,
                });
              }
            }
          }
        }
      );

      setTimeout(() => {
        this.manager.stopDeviceScan();
        this.updateState({ isScanning: false });
        resolve(devices);
      }, timeoutMs);
    });
  }

  // Connect to a device
  async connect(deviceId: string): Promise<boolean> {
    try {
      this.manager.stopDeviceScan();

      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: true,
        timeout: 10000,
      });

      await device.discoverAllServicesAndCharacteristics();
      this.device = device;

      // Monitor disconnection
      device.onDisconnected((error, dev) => {
        this.updateState({
          isConnected: false,
          connectedDevice: null,
          lastHeartRate: null,
        });
        // Auto-reconnect after 3 seconds
        setTimeout(() => this.connect(deviceId), 3000);
      });

      this.updateState({
        isConnected: true,
        connectedDevice: {
          id: device.id,
          name: device.name || 'Watch',
          rssi: device.rssi || -100,
          isConnectable: true,
        },
      });

      // Read battery level
      await this.readBatteryLevel();

      return true;
    } catch (error: any) {
      console.error('BLE connect error:', error.message);
      return false;
    }
  }

  // Start receiving heart rate notifications (standard BLE HR profile)
  async startHeartRateMonitoring(): Promise<boolean> {
    if (!this.device) throw new Error('No device connected');

    try {
      this.device.monitorCharacteristicForService(
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT,
        (error, characteristic) => {
          if (error) {
            console.warn('HR monitor error:', error.message);
            return;
          }
          if (characteristic?.value) {
            const hrData = this.parseHeartRateData(characteristic.value);
            this.updateState({ lastHeartRate: hrData });
            this.notifyHeartRateListeners(hrData);
          }
        }
      );
      return true;
    } catch (error: any) {
      // If standard service not available, try boAt custom protocol
      console.warn('Standard HR service not found, trying custom protocol...');
      return this.startBoatCustomHR();
    }
  }

  // boAt custom protocol - Service F618, Write B002, Notify B001
  private async startBoatCustomHR(): Promise<boolean> {
    if (!this.device) return false;

    try {
      // First subscribe to notifications on B001
      this.device.monitorCharacteristicForService(
        BOAT_CUSTOM_SERVICE,
        BOAT_CUSTOM_NOTIFY,
        (error, characteristic) => {
          if (error) return;
          if (characteristic?.value) {
            const hrData = this.parseBoatCustomHR(characteristic.value);
            if (hrData) {
              this.updateState({ lastHeartRate: hrData });
              this.notifyHeartRateListeners(hrData);
            }
          }
        }
      );

      // Try each known command until we get HR notifications
      const success = await this.bruteForceHRCommand();
      return success;
    } catch (error: any) {
      console.error('Custom HR protocol failed:', error.message);
      return false;
    }
  }

  // Try multiple commands to find the one that starts HR measurement
  private async bruteForceHRCommand(): Promise<boolean> {
    if (!this.device) return false;

    for (const cmd of HR_START_COMMANDS) {
      try {
        const base64Cmd = Buffer.from(cmd).toString('base64');
        console.log(`Trying HR command: [${cmd.map(b => b.toString(16)).join(', ')}]`);

        // Try write with response first, fallback to without response
        try {
          await this.device.writeCharacteristicWithResponseForService(
            BOAT_CUSTOM_SERVICE,
            BOAT_CUSTOM_WRITE,
            base64Cmd
          );
        } catch {
          await this.device.writeCharacteristicWithoutResponseForService(
            BOAT_CUSTOM_SERVICE,
            BOAT_CUSTOM_WRITE,
            base64Cmd
          );
        }

        // Wait 3 seconds to see if notifications start
        const gotHR = await this.waitForHRNotification(3000);
        if (gotHR) {
          console.log(`HR command found: [${cmd.map(b => b.toString(16)).join(', ')}]`);
          this.workingHRCommand = cmd;
          return true;
        }
      } catch {
        continue;
      }
    }

    console.warn('No HR command worked. Capture HCI snoop log for protocol discovery.');
    return false;
  }

  // Wait for a HR notification to confirm command worked
  private waitForHRNotification(timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const startBpm = this.state.lastHeartRate?.bpm;
      const check = setInterval(() => {
        if (this.state.lastHeartRate && this.state.lastHeartRate.bpm !== startBpm) {
          clearInterval(check);
          resolve(true);
        }
      }, 500);

      setTimeout(() => {
        clearInterval(check);
        resolve(false);
      }, timeoutMs);
    });
  }

  private workingHRCommand: number[] | null = null;

  // Parse standard BLE Heart Rate Measurement (0x2A37)
  private parseHeartRateData(base64Value: string): HeartRateData {
    const buffer = Buffer.from(base64Value, 'base64');
    const flags = buffer[0];

    const is16Bit = (flags & 0x01) !== 0;
    const hasContact = (flags & 0x02) !== 0;
    const contactDetected = (flags & 0x04) !== 0;
    const hasEnergy = (flags & 0x08) !== 0;
    const hasRR = (flags & 0x10) !== 0;

    let offset = 1;
    let bpm: number;

    if (is16Bit) {
      bpm = buffer.readUInt16LE(offset);
      offset += 2;
    } else {
      bpm = buffer[offset];
      offset += 1;
    }

    let energyExpended: number | undefined;
    if (hasEnergy) {
      energyExpended = buffer.readUInt16LE(offset);
      offset += 2;
    }

    let rrIntervals: number[] | undefined;
    if (hasRR) {
      rrIntervals = [];
      while (offset < buffer.length) {
        const rr = buffer.readUInt16LE(offset);
        rrIntervals.push(rr / 1024 * 1000); // Convert to ms
        offset += 2;
      }
    }

    return {
      bpm,
      timestamp: new Date(),
      contactDetected: hasContact ? contactDetected : true,
      energyExpended,
      rrIntervals,
    };
  }

  // Parse boAt custom HR response from B001 notifications
  private parseBoatCustomHR(base64Value: string): HeartRateData | null {
    const buffer = Buffer.from(base64Value, 'base64');
    console.log('B001 notify raw:', Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join(' '));

    if (buffer.length < 2) return null;

    // Strategy: scan all bytes for a plausible HR value (40-200 bpm)
    // Common response formats:
    // [header, type, bpm]
    // [header, type, length, bpm]
    // [header, cmd_echo, status, bpm]
    // [bpm] (single byte)

    // Try known positions first
    const candidates = [
      buffer[0],  // Single byte response
      buffer[1],  // Second byte
      buffer[2],  // Third byte
      buffer[3],  // Fourth byte
      buffer[4],  // Fifth byte
    ].filter(v => v !== undefined);

    for (const bpm of candidates) {
      if (bpm >= 40 && bpm <= 200) {
        return {
          bpm,
          timestamp: new Date(),
          contactDetected: true,
        };
      }
    }

    // Check for 16-bit value (unlikely for HR but possible)
    if (buffer.length >= 2) {
      const val16 = buffer.readUInt16LE(0);
      if (val16 >= 40 && val16 <= 200) {
        return { bpm: val16, timestamp: new Date(), contactDetected: true };
      }
    }

    return null;
  }

  // Read battery level
  async readBatteryLevel(): Promise<number | null> {
    if (!this.device) return null;

    try {
      const char = await this.device.readCharacteristicForService(
        BATTERY_SERVICE,
        BATTERY_LEVEL
      );
      if (char.value) {
        const buffer = Buffer.from(char.value, 'base64');
        const level = buffer[0];
        this.updateState({ batteryLevel: level });
        return level;
      }
    } catch {
      // Battery service may not be available
    }
    return null;
  }

  // Stop heart rate monitoring
  async stopHeartRateMonitoring(): Promise<void> {
    if (!this.device) return;

    try {
      // Use the matching stop command for whatever start command worked
      if (this.workingHRCommand) {
        const idx = HR_START_COMMANDS.findIndex(c =>
          c.length === this.workingHRCommand!.length &&
          c.every((v, i) => v === this.workingHRCommand![i])
        );
        const stopCmd = idx >= 0 ? HR_STOP_COMMANDS[idx] : [0x00];
        const base64Cmd = Buffer.from(stopCmd).toString('base64');

        try {
          await this.device.writeCharacteristicWithResponseForService(
            BOAT_CUSTOM_SERVICE, BOAT_CUSTOM_WRITE, base64Cmd
          );
        } catch {
          await this.device.writeCharacteristicWithoutResponseForService(
            BOAT_CUSTOM_SERVICE, BOAT_CUSTOM_WRITE, base64Cmd
          ).catch(() => {});
        }
      }
    } catch {}
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    if (this.device) {
      await this.stopHeartRateMonitoring();
      await this.manager.cancelDeviceConnection(this.device.id);
      this.device = null;
      this.updateState({
        isConnected: false,
        connectedDevice: null,
        lastHeartRate: null,
        batteryLevel: null,
      });
    }
  }

  // Discover all services (for reverse engineering)
  async discoverServices(): Promise<{ serviceUUID: string; characteristics: string[] }[]> {
    if (!this.device) throw new Error('No device connected');

    const services = await this.device.services();
    const result: { serviceUUID: string; characteristics: string[] }[] = [];

    for (const service of services) {
      const chars = await service.characteristics();
      result.push({
        serviceUUID: service.uuid,
        characteristics: chars.map(c => `${c.uuid} [${c.isReadable ? 'R' : ''}${c.isWritableWithResponse ? 'W' : ''}${c.isNotifiable ? 'N' : ''}]`),
      });
    }

    return result;
  }

  // Event listeners
  onHeartRate(callback: HeartRateCallback): () => void {
    this.heartRateListeners.push(callback);
    return () => {
      this.heartRateListeners = this.heartRateListeners.filter(cb => cb !== callback);
    };
  }

  onStateChange(callback: StateCallback): () => void {
    this.stateListeners.push(callback);
    callback(this.state); // Emit current state immediately
    return () => {
      this.stateListeners = this.stateListeners.filter(cb => cb !== callback);
    };
  }

  getState(): BLEServiceState {
    return { ...this.state };
  }

  private updateState(partial: Partial<BLEServiceState>) {
    this.state = { ...this.state, ...partial };
    this.stateListeners.forEach(cb => cb(this.state));
  }

  private notifyHeartRateListeners(data: HeartRateData) {
    this.heartRateListeners.forEach(cb => cb(data));
  }

  // Cleanup
  destroy() {
    this.disconnect();
    this.manager.destroy();
    this.heartRateListeners = [];
    this.stateListeners = [];
  }
}

// Singleton instance
export const bleWatchService = new BLEWatchService();
