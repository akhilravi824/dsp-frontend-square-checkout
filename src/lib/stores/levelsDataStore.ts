import { writable } from 'svelte/store';

export const levelsDataStore = writable<{
  apiData: any;
  cmsData: any;
  mergedData: any;
  isLoaded: boolean;
}>({
  apiData: {},
  cmsData: {},
  mergedData: {},
  isLoaded: false
});
