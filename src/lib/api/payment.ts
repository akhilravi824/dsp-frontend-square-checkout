import { apiFetch } from './client';
import { payments } from '@square/web-sdk';
import { browser } from '$app/environment';

export const paymentApi = {
  createPayment: (sourceId: string, amount: number, currency = 'USD') =>
    apiFetch('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ sourceId, amount, currency })
    }),

  getLocations: () => apiFetch('/payments/locations'),

  listPayments: () => apiFetch('/payments')
};

export const squarePaymentApi = {
  // Initialize Square Web Payments SDK
  initializePayments: (applicationId: string, locationId: string) => {
    if (!browser) return null;

    try {
      return payments(applicationId, locationId);
    } catch (error) {
      console.error('Error initializing Square Web Payments SDK:', error);
      throw error;
    }
  },

  // Create a card payment method
  createCardPaymentMethod: async (paymentsInstance: any) => {
    if (!paymentsInstance) {
      throw new Error('Payments instance not initialized');
    }

    try {
      // Create a card payment method using the latest Square Web SDK approach
      const card = await paymentsInstance.card();

      // Check if card is properly initialized
      if (!card) {
        throw new Error('Failed to initialize Square card payment method');
      }

      // Attach the card to the DOM element - this is an async operation in the latest SDK
      await card.attach('#card-container');

      return card;
    } catch (error) {
      console.error('Error creating card payment method:', error);
      throw error;
    }
  }
};
