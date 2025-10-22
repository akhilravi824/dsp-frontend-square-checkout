import { writable } from 'svelte/store';

export const currentStepId = writable<string | null>(null);
