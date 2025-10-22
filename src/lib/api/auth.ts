import { apiFetch } from './client';

export const authApi = {
  signup: (data: { email: string; password: string; name: string; consent: boolean; university: string }) =>
    apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  resentEmail: (data: { email: string }) =>
    apiFetch('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  requestPasswordReset: (data: { email: string }) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  resetPassword: (data: { token: string; password: string }) =>
    apiFetch('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateEmail: (data: { newEmail: string }) =>
    apiFetch('/auth/update-email', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  checkEmailChange: () =>
    apiFetch('/auth/check-email-change', {
      method: 'GET'
    }),
  syncEmailChange: () =>
    apiFetch('/auth/sync-email-change', {
      method: 'POST'
    }),
  completeEmailChange: (data: { token: string }) =>
    apiFetch('/auth/complete-email-change', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  verify: () => apiFetch('/auth/verify', { method: 'GET' }),
  getUserMfaStatus: () => apiFetch('/auth/mfa/status', { method: 'GET' }),
  enrollMfa: () => apiFetch('/auth/mfa/enroll', { method: 'POST' }),
  challengeMfa: (factorId: string, accessToken: string) =>
    apiFetch('/auth/mfa/challenge', {
      method: 'POST',
      body: JSON.stringify({ factorId, accessToken }),
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    }),
  verifyMfaChallenge: (factorId: string, challengeId: string, code: string) =>
    apiFetch('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ factorId, challengeId, code })
    }),
  loginMfa: (factorId: string, challengeId: string, code: string, accessToken: string) =>
    apiFetch('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ factorId, challengeId, code, accessToken }),
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    }),
  verifyMfa: (factorId: string, code: string) =>
    apiFetch('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ factorId, code })
    }),
  disableMfa: (factorId: string) =>
    apiFetch('/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({ factorId })
    })
};
