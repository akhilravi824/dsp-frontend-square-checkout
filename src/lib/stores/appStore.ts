import { writable } from 'svelte/store';

export const headerBackLink = writable<{ label: string; href: string } | null>(null);
export const globalLoading = writable(false);
export const showDashboardNav = writable(false);
