import { useEffect, useRef } from 'react';
import { ScanDeviceType } from '../types';
import { playScannerBeep } from '../utils/audio';

interface ScannerListenerOptions {
  onScan: (code: string, deviceType: ScanDeviceType) => void;
  enabled?: boolean;
  minChars?: number;
  maxIntervalMs?: number;
}

export function useHardwareScanner({
  onScan,
  enabled = true,
  minChars = 3,
  maxIntervalMs = 60,
}: ScannerListenerOptions) {
  const bufferRef = useRef<string>('');
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is intentionally typing into standard multiline textarea or contenteditable
      const target = event.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      
      // If user is focused on an input that isn't designated for scanner, allow default typing unless it matches scanner burst speed
      const now = Date.now();
      const interval = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (event.key === 'Enter') {
        const scannedText = bufferRef.current.trim();
        // Check if buffer contains characters accumulated in rapid sequence
        if (scannedText.length >= minChars) {
          playScannerBeep('success');
          // If rapid timing, consider it USB or Bluetooth scanner
          onScan(scannedText, 'Scanner USB');
          bufferRef.current = '';
          // Don't submit form if inside an input
          if (isInput) {
            event.preventDefault();
          }
        }
        bufferRef.current = '';
        return;
      }

      // If key is a printable character
      if (event.key.length === 1) {
        if (interval > maxIntervalMs && bufferRef.current.length > 0) {
          // Reset buffer if delay too long (manual slow typing)
          bufferRef.current = '';
        }
        bufferRef.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onScan, minChars, maxIntervalMs]);
}
