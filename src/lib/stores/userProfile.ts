import { writable, type Writable, get } from 'svelte/store';
import type { UserProfile } from '../../types/userProfile';

function createUserProfileStore() {
  const { subscribe, set, update } = writable<UserProfile | null>(null);

  return {
    subscribe,
    set: (profile: UserProfile | null) => {
      console.log('👤 User Profile Store: Setting profile', profile);
      set(profile);
    },
    update,

    // Pure state operations only
    updateEmail: (email: string) => {
      update((profile) => {
        if (profile) {
          const updatedProfile = { ...profile, email };
          return updatedProfile;
        }
        return profile;
      });
    },

    updateVideoUsageConsent: (videoUsageConsent: boolean) => {
      update((profile) => {
        if (profile) {
          const updatedProfile = { ...profile, allow_video_usage: videoUsageConsent };
          return updatedProfile;
        }
        return profile;
      });
    },

    updateName: (name: string) => {
      update((profile) => {
        if (profile) {
          const updatedProfile = { ...profile, name };
          return updatedProfile;
        }
        return profile;
      });
    },

    reset: () => {
      set(null);
    },

    // Helper to check if profile exists
    isEmpty: () => {
      const currentProfile = get({ subscribe });
      const isEmpty = currentProfile === null;
      return isEmpty;
    }
  };
}

export const userProfile = createUserProfileStore();
