import { writable } from 'svelte/store';

export const previousUrl = writable<string | null>(null);

export const comeFrom = (url: string, path: string) => {
  if (!url || !path) return false;
  const splitUrl = url.split('/');
  return splitUrl[splitUrl.length - 1] === path;
};
