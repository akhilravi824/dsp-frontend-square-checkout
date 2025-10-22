import { profileApi } from '../api/profile';
import { showError } from '../stores/toastStore';
import { goto } from '$app/navigation';
import { userProfile } from '../stores/userProfile';
import { get } from 'svelte/store';
import type { UserProfile } from '../../types/userProfile';
import { authApi } from '$lib/api';
import { setCookie, deleteCookie } from '$lib/utils/cookies';

class ProfileService {
  private isFetching = false;

  async initProfile(): Promise<UserProfile | null> {
    // Check if profile already exists
    const currentProfile = get(userProfile);
    if (currentProfile) {
      return currentProfile;
    }

    // Prevent race conditions
    if (this.isFetching) {
      return this.waitForFetch();
    }

    this.isFetching = true;

    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        userProfile.set(response.data);

        // Set learning type cookie if available
        if (response.data.learningType) {
          setCookie('user_learning_type', response.data.learningType, { expires: 365, sameSite: 'lax' });
        }

        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error getting profile data:', error);
      showError('Error getting profile data');
      await this.logout();
      return null;
    } finally {
      this.isFetching = false;
    }
  }

  async updateEmail(email: string, updateStore = false): Promise<boolean> {
    if (!email) return false;
    try {
      // If there was an updateEmail API endpoint, we'd call it here
      const response = await authApi.updateEmail({
        newEmail: email
      });
      if (response.success) {
        if (updateStore) {
          userProfile.updateEmail(email);
        }
        return true;
      }
      return false;
    } catch (error) {
      showError('Failed to update email');
      return false;
    }
  }

  async updateName(name: string): Promise<boolean> {
    try {
      const response = await profileApi.updateProfileName(name);
      if (response.success) {
        userProfile.updateName(name);
        return true;
      }
      return false;
    } catch (error) {
      showError('Failed to update name');
      return false;
    }
  }

  async updateUniversity(university: string): Promise<boolean> {
    try {
      const response = await profileApi.updateProfileUniversity(university);
      if (response.success) {
        // Update the store with the new university
        const currentProfile = get(userProfile);
        if (currentProfile) {
          userProfile.set({ ...currentProfile, university });
        }
        return true;
      }
      return false;
    } catch (error) {
      showError('Failed to update university');
      return false;
    }
  }

  async updateVideoUsageConsent(consent: boolean): Promise<boolean> {
    try {
      const response = await profileApi.updateProfileVideoUsageConsent(consent.toString());
      if (response.success) {
        // Update the store with the new consent
        const currentProfile = get(userProfile);
        if (currentProfile) {
          userProfile.set({ ...currentProfile, allow_video_usage: consent });
        }
        return true;
      }
      return false;
    } catch (error) {
      showError('Failed to update video usage consent');
      return false;
    }
  }

  async updateSignUpStatus(signedUp: boolean): Promise<boolean> {
    try {
      const response = await profileApi.updateProfileSignUp(signedUp);
      if (response.success) {
        // Update the store with the new status
        const currentProfile = get(userProfile);
        if (currentProfile) {
          userProfile.set({ ...currentProfile, signed_up: signedUp });
        }
        return true;
      }
      return false;
    } catch (error) {
      showError('Failed to update sign up status');
      return false;
    }
  }

  async updateNotificationPreferences(preferences: {
    tipsAndGuidance: boolean;
    productUpdates: boolean;
  }): Promise<boolean> {
    try {
      const response = await profileApi.updateNotificationPreferences(preferences);
      if (response.success) {
        // Update the store with the new preferences
        const currentProfile = get(userProfile);
        if (currentProfile) {
          userProfile.set({
            ...currentProfile,
            tipsAndGuidance: preferences.tipsAndGuidance,
            productUpdates: preferences.productUpdates
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.log(error.message);
      showError('Failed to update notification preferences', 5000);
      return false;
    }
  }

  async updateLearningType(learningType: string): Promise<boolean> {
    try {
      // Update the store with the new learning type
      const currentProfile = get(userProfile);
      if (currentProfile) {
        userProfile.set({ ...currentProfile, learningType });

        // Set server-side cookie using a form action
        const formData = new FormData();
        formData.append('learningType', learningType);

        await fetch('/login?/setLearningType', {
          method: 'POST',
          body: formData
        });

        return true;
      }
      return false;
    } catch (error) {
      showError('Failed to update learning type preference');
      return false;
    }
  }

  async addToMailchimp(contactData: {
    email: string;
    name?: string;
    tipsAndGuidance?: boolean;
    productUpdates?: boolean;
  }): Promise<boolean> {
    try {
      const response = await profileApi.addToMailchimp(contactData);
      return response.success;
    } catch (error) {
      showError('Failed to add to mailing list');
      return false;
    }
  }

  async addCurrentUserToMailchimp(): Promise<boolean> {
    try {
      const response = await profileApi.addCurrentUserToMailchimp();
      return response.success;
    } catch (error) {
      showError('Failed to add to mailing list');
      return false;
    }
  }

  async logout() {
    userProfile.reset();
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // showError('Failed to log out');
    } finally {
      this.clearAuth();
      goto('/login');
    }
  }

  unverified() {
    this.clearAuth();
    goto('/login');
  }

  clearAuth() {
    userProfile.reset();
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    deleteCookie('user_learning_type');
  }

  // Helper methods
  isProfileLoaded(): boolean {
    return !userProfile.isEmpty();
  }

  getCurrentProfile(): UserProfile | null {
    return get(userProfile);
  }

  private async waitForFetch(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
      const unsubscribe = userProfile.subscribe((profile) => {
        if (profile !== null || !this.isFetching) {
          unsubscribe();
          resolve(profile);
        }
      });
    });
  }
}

export const profileService = new ProfileService();
