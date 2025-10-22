export type ToastType = 'default' | 'success' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number | null;
}
