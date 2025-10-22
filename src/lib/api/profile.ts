import { apiFetch } from './client';

// Profile API
export const profileApi = {
  getProfile: () => {
    // Cookie will be automatically sent with the request
    return apiFetch('/profiles');
  },

  updateNotificationPreferences: (preferences: { tipsAndGuidance: boolean; productUpdates: boolean }) => {
    return apiFetch('/profiles/notifications', {
      method: 'POST',
      body: JSON.stringify(preferences)
    });
  },

  addToMailchimp: (contactData: {
    email: string;
    name?: string;
    tipsAndGuidance?: boolean;
    productUpdates?: boolean;
  }) => {
    return apiFetch('/profiles/mailchimp/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  },

  addCurrentUserToMailchimp: () => {
    return apiFetch('/profiles/mailchimp/current-user', {
      method: 'POST'
    });
  },
  updateProfileUniversity: (university: string) => {
    return apiFetch('/profiles/university', {
      method: 'POST',
      body: JSON.stringify({ university })
    });
  },
  updateProfileVideoUsageConsent: (content: string) => {
    return apiFetch('/profiles/video-usage', {
      method: 'POST',
      body: JSON.stringify({ allow_video_usage: content })
    });
  },
  updateProfileName: (name: string) => {
    return apiFetch('/profiles/name', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },
  updateProfileSignUp: (value: boolean) => {
    return apiFetch('/profiles/signed-up', {
      method: 'POST',
      body: JSON.stringify({ signed_up: value })
    });
  }
};
