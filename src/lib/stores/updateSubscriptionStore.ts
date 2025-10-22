import { writable, type Writable, get } from 'svelte/store';

interface Plan {
  variationId: string;
  label: string;
  title: string;
  copy: string;
  price: string;
  totalPrice: string;
  interval: string;
  details: any;
  perks: string[];
  billingDetails?: string;
}

interface UserSubscription {
  square_subscription_variation_id: string;
  // Add other properties as needed based on your API response
}

interface UpdateSubscriptionState {
  allPlans: Plan[];
  userSubscription: UserSubscription | null;
  userPlan: Plan | null;
  isLoading: boolean;
  squarePlanId: string | null;
}

function createUpdateSubscriptionStore() {
  const initialState: UpdateSubscriptionState = {
    allPlans: [],
    userSubscription: null,
    userPlan: null,
    isLoading: false,
    squarePlanId: null
  };

  const { subscribe, set, update } = writable<UpdateSubscriptionState>(initialState);

  return {
    subscribe,
    set: (state: UpdateSubscriptionState) => {
      set(state);
    },
    update,

    // Pure state operations only
    setAllPlans: (plans: Plan[]) => {
      update((state) => {
        const newState = { ...state, allPlans: plans };
        return newState;
      });
    },

    setUserSubscription: (subscription: UserSubscription | null) => {
      update((state) => {
        const newState = { ...state, userSubscription: subscription };
        return newState;
      });
    },

    setUserPlan: (plan: Plan | null) => {
      update((state) => {
        const newState = { ...state, userPlan: plan };
        return newState;
      });
    },

    setLoading: (loading: boolean) => {
      update((state) => ({ ...state, isLoading: loading }));
    },

    setSquarePlanId: (squarePlanId: string | null) => {
      update((state) => ({ ...state, squarePlanId }));
    },

    reset: () => {
      set(initialState);
    },

    // Helper methods
    isEmpty: () => {
      const state = get({ subscribe });
      const isEmpty = state.allPlans.length === 0;
      return isEmpty;
    },

    hasActiveSubscription: () => {
      const state = get({ subscribe });
      const hasActive = state.userSubscription !== null;
      return hasActive;
    },

    getUserPlan: () => {
      const state = get({ subscribe });
      return state.userPlan;
    },

    resetUserPlan: () => {
      set(initialState);
    }
  };
}

export const updateSubscriptionStore = createUpdateSubscriptionStore();
