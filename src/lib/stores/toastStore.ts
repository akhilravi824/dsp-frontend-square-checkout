import { writable, type Writable } from 'svelte/store';
import type { Toast, ToastType } from '../../types/toast';

// Create a writable store with initial empty array of toasts
const toastStore: Writable<Toast[]> = writable([]);

// Generate a unique ID for each toast
const generateId = (): string => `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Add a toast to the store
export const addToast = (message: string, type: ToastType = 'default', duration: number | null = null): string => {
  const id = generateId();

  // Add the new toast to the store
  toastStore.update((toasts) => [
    ...toasts,
    {
      id,
      message,
      type,
      duration
    }
  ]);

  // If duration is provided, auto-close the toast after that time
  if (duration) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

// Shorthand methods for success and error toasts
export const showSuccess = (message: string, duration: number | null = null): string =>
  addToast(message, 'success', duration);

export const showError = (message: string, duration: number | null = null): string =>
  addToast(message, 'error', duration);

// Remove a toast by ID
export const removeToast = (id: string): void => {
  toastStore.update((toasts) => toasts.filter((toast) => toast.id !== id));
};

// Clear all toasts
export const clearToasts = (): void => {
  toastStore.set([]);
};
export default toastStore;
