import Cookies from 'universal-cookie';

const cookies = new Cookies();

type SetOptions = {
  expires?: number; // days
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

export function setCookie(name: string, value: any, options: SetOptions = {}) {
  const { expires, ...rest } = options;
  const finalOpts: any = { path: '/', ...rest };
  if (typeof expires === 'number') {
    const d = new Date();
    d.setDate(d.getDate() + expires);
    finalOpts.expires = d;
  }
  cookies.set(name, value, finalOpts);
}

export function getCookie(name: string): string | null {
  const v = cookies.get(name);
  return v === undefined ? null : v;
}

export function deleteCookie(name: string, options: { path?: string; domain?: string } = {}) {
  cookies.remove(name, { path: '/', ...options });
}
