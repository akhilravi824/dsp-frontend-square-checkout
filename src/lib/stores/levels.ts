import { writable } from 'svelte/store';
import type { LevelPage } from '$lib/../types/sanity.types';

export interface SingleLevel {
  _id: string;
  image: {
    assetId: string;
    dimensions: {
      aspectRatio: number;
      height: number;
      width: number;
    };
    lqip: string;
    metadata: {
      blurHash: string;
    };
  };
  levelId: number;
  units: any[];
  title: string;
  stats: {
    totalLessons: number;
    completedLessons: number;
    completedPercentage: number;
  };
  locked: boolean;
}

// Create a writable store for levels data that components can subscribe to
export const levelsStore = writable<{
  levels: SingleLevel[];
  freeTries: number;
  activeDays: string[];
  totalAttempts: number;
  totalTimeSpent: number;
  overallStats: any;
}>({
  levels: [],
  freeTries: 0,
  activeDays: [],
  totalAttempts: 0,
  totalTimeSpent: 0,
  overallStats: null
});
