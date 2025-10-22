import { apiFetch } from './client';

export const subscriptionApi = {
  getAllPlans: async () =>
    apiFetch('/subscriptions/plans', {
      method: 'GET'
    }),

  getUserSubscriptions: () => apiFetch('/subscriptions'),

  createSubscription: (planId: string, sourceId: string, userId: string, variationId?: string) =>
    apiFetch('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        planId,
        sourceId,
        userId,
        variationId
      })
    }),
  
  createCheckoutSession: (planId: string, variationId: string, successUrl: string, cancelUrl: string) =>
    apiFetch('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({
        planId,
        variationId,
        successUrl,
        cancelUrl
      })
    }),

  createCheckoutLink: (planId: string) =>
    apiFetch('/subscriptions/checkout-link', {
      method: 'POST',
      body: JSON.stringify({ planId })
    }),

  getInvoices: () =>
    apiFetch('/subscriptions/invoices', {
      method: 'GET'
    }),

  updateUserPaymentMethod: (subscriptionId: string, sourceId: string) =>
    apiFetch(`/subscriptions/${subscriptionId}/payment-method`, {
      method: 'PATCH',
      body: JSON.stringify({ sourceId })
    }),

  getUserPaymentMethods: (customerId: string) =>
    apiFetch(`/subscriptions/payment-method/${customerId}`, {
      method: 'GET'
    }),

  cancelUserSubscription: (subscriptionId: string) =>
    apiFetch(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE'
    }),

  swapPlan: (subscriptionId: string, newPlanVariationId: string, squareCustomerId: string) => {
    return apiFetch(`/subscriptions/${subscriptionId}/swap-plan`, {
      method: 'PATCH',
      body: JSON.stringify({ newPlanVariationId, squareCustomerId })
    });
  }
};
