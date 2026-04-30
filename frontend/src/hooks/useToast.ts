import { useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();
const removeListeners: Set<(id: string) => void> = new Set();

export const useToast = () => {
  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${++toastId}`;
    const toast: Toast = { id, message, type, duration };
    
    listeners.forEach(listener => listener(toast));
    
    if (duration > 0) {
      setTimeout(() => {
        removeListeners.forEach(listener => listener(id));
      }, duration);
    }
    
    return id;
  }, []);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error', 4000), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  return { showToast, success, error, info, warning };
};

export const addToastListener = (listener: (toast: Toast) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const addRemoveToastListener = (listener: (id: string) => void) => {
  removeListeners.add(listener);
  return () => removeListeners.delete(listener);
};
