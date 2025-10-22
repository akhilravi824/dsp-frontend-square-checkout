import { writable } from 'svelte/store';

interface SubscriptionData {
  description?: string;
  id?: string;
  variations?: any[];
}

function createSubscriptionsStore() {
  const { subscribe, set, update } = writable<SubscriptionData>({});

  return {
    subscribe,
    set: (data: SubscriptionData) => {
      const variationCount = data.variations?.length || 0;
      set(data);
    },
    update: (updater: (data: SubscriptionData) => SubscriptionData) => {
      update((currentData) => {
        const newData = updater(currentData);
        return newData;
      });
    }
  };
}

export const subscriptionsStore = createSubscriptionsStore();
