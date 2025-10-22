declare module 'svelte-cookie' {
  export function setCookie(name: string, value: string, options?: {
    expires?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }): void;
  
  export function getCookie(name: string): string | null;
  
  export function deleteCookie(name: string, options?: {
    path?: string;
    domain?: string;
  }): void;
}