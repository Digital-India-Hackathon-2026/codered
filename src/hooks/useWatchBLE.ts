// LifeLens - useWatchBLE Hook
// React hook for connecting to smartwatch via BLE and reading heart rate

import { useState, useEffect, useCallback, useRef } from 'react';
import { bleWatchService, HeartRateData, WatchDevice, BLEServiceState } from '../services/bleWatchService';

export function useWatchBLE() {
  const [state, setState] = useState<BLEServiceState>(bleWatchService.getState());
  const [devices, setDevices] = useState<WatchDevice[]>([]);
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRateData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<HeartRateData[]>([]);

  useEffect(() => {
    const unsubState = bleWatchService.onStateChange(setState);
    const unsubHR = bleWatchService.onHeartRate((data) => {
      historyRef.current = [...historyRef.current.slice(-59), data]; // Keep last 60 readings
      setHeartRateHistory([...historyRef.current]);
    });

    return () => {
      unsubState();
      unsubHR();
    };
  }, []);

  const scan = useCallback(async () => {
    try {
      setError(null);
      const found = await bleWatchService.scanAllDevices(10000);
      setDevices(found);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const connect = useCallback(async (deviceId: string) => {
    try {
      setError(null);
      const success = await bleWatchService.connect(deviceId);
      if (success) {
        await bleWatchService.startHeartRateMonitoring();
      } else {
        setError('Failed to connect');
      }
      return success;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await bleWatchService.disconnect();
    historyRef.current = [];
    setHeartRateHistory([]);
  }, []);

  const getAverageHR = useCallback(() => {
    if (heartRateHistory.length === 0) return 0;
    const sum = heartRateHistory.reduce((acc, d) => acc + d.bpm, 0);
    return Math.round(sum / heartRateHistory.length);
  }, [heartRateHistory]);

  const getMinMaxHR = useCallback(() => {
    if (heartRateHistory.length === 0) return { min: 0, max: 0 };
    const values = heartRateHistory.map(d => d.bpm);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [heartRateHistory]);

  return {
    ...state,
    devices,
    heartRateHistory,
    error,
    scan,
    connect,
    disconnect,
    getAverageHR,
    getMinMaxHR,
  };
}
