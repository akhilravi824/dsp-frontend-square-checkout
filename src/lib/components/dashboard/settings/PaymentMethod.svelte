<script lang="ts">
  import { subscriptionApi } from '$lib/api';
  import CardForm from '$lib/components/system/CardForm.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { isExpired, leadingZero, trimYear } from '$lib/utils/date.js';
  import { onMount } from 'svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import { userProfile } from '$lib/stores/userProfile';

  const { customerId, onSwapPaymentMethod } = $props();
  let paymentMethodLoading = $state(false);
  let paymentMethod: PaymentCard | null = $state(null);

  onMount(() => {
    if (!customerId) {
      console.error('Customer ID is not available');
      return;
    }

    fetchPaymentMethods(customerId);
  });

  async function fetchPaymentMethods(customerId: string) {
    // Logic to fetch payment methods
    console.log('Fetching payment methods...');
    paymentMethodLoading = true;
    try {
      const response: PaymentMethodResponse = await subscriptionApi.getUserPaymentMethods(customerId);
      if (response.success) {
        paymentMethod = response.card;
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      paymentMethodLoading = false;
    }
  }

  function onCardLoaded() {
    console.log('Card loaded');
  }

  async function onPaymentSuccess(card) {
    const tokenResult = await card.tokenize();
    if (tokenResult.status !== 'OK') {
      throw new Error(tokenResult.errors || 'Card tokenization failed');
    }
    const userSubscriptionId = $userProfile.square_subscription_id;

    try {
      const response = await subscriptionApi.updateUserPaymentMethod(userSubscriptionId, tokenResult.token);
      console.log('🗒️ response', response);

      if (response.success) {
        showSuccess('Payment method updated successfully');
        onSwapPaymentMethod(response.paymentMethodId);
      } else {
        showError('Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      showError('Failed to update payment method');
    }
  }
</script>

<div class="user-payment-method">
  {#if customerId}
    {#if paymentMethodLoading}
      <p>Loading payment methods...</p>
    {:else if paymentMethod}
      <p class="type:h2 space:d24">Current payment method</p>
      <div class="payment-method space:d32">
        <p>{paymentMethod.brand} ({paymentMethod.last4})</p>
        <p>Expire {leadingZero(paymentMethod.expMonth)}/{trimYear(`${paymentMethod.expYear}`)}</p>
        {#if isExpired(new Date(`${paymentMethod.expYear}-${paymentMethod.expMonth}-01`))}
          <p class="expired-warning text-color:warning layout:inline-flex">
            Card expired
            <Icon type={ICONS.ERROR} />
          </p>
        {/if}
      </div>
      <div class="new-payment-details">
        <p class="type:h2 space:d32">New payment details</p>
        <CardForm buttonText="Update payment method" {onCardLoaded} {onPaymentSuccess} />
      </div>
    {:else}
      <p>No payment method found.</p>
    {/if}
  {:else}
    <p>Something went wrong</p>
  {/if}
</div>

<style lang="scss">
  .payment-method {
    background: var(--color-dark-5);
    border-radius: var(--border-radius-sm);
    padding-inline: 24px;
    padding-block: 28px;
    position: relative;
  }

  .expired-warning {
    position: absolute;
    right: 24px;
    top: 28px;
  }
</style>
