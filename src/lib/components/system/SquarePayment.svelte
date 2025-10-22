<script lang="ts">
  import Modal from '$lib/components/system/Modal.svelte';
  import Spinner from '$lib/components/system/Spinner.svelte';
  import { onMount } from 'svelte';
  import { subscriptionApi } from '$lib/api';
  import { showSuccess, showError } from '$lib/stores/toastStore';
  import Button from '$lib/components/system/Button.svelte';

  interface Props {
    selectedPlan: any;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onClose?: () => void;
    show?: boolean;
    processingText?: string;
    payButtonText?: string;
    squarePlanId?: string;
  }

  let {
    selectedPlan,
    onSuccess = () => {},
    onError = () => {},
    onClose = () => {},
    show = false,
    processingText = 'Processing',
    payButtonText = 'Pay',
    squarePlanId
  }: Props = $props();

  let paymentError = $state(null);
  let paymentInProgress = $state(false);
  let processingPayment = $state(false);

  onMount(() => {
    // No initialization needed for hosted checkout
  });

  async function processPayment() {
    if (processingPayment) {
      return;
    }
    if (!selectedPlan) {
      return;
    }

    console.log('🗺️ processPayment called with selectedPlan:', selectedPlan);

    paymentInProgress = true;
    processingPayment = true;

    try {
      // Map plan variation to planId for hosted checkout
      let planId = 'pro_monthly'; // default
      if (selectedPlan.interval === 'yearly') {
        planId = 'pro_yearly';
      }

      // Create hosted checkout link
      const checkoutResponse = await subscriptionApi.createCheckoutLink(planId);

      if (!checkoutResponse?.checkoutUrl) {
        throw new Error('Failed to create checkout link');
      }

      // Redirect to Square hosted checkout
      window.location.href = checkoutResponse.checkoutUrl;
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment failed';
      showError(errorMessage);
      onError(errorMessage);
    } finally {
      paymentInProgress = false;
      processingPayment = false;
    }
  }

  function closeCardForm() {
    onClose();
  }

  function onConsentChange() {
    // No longer needed for hosted checkout
  }
</script>

<Modal modalClass="dialog card-dialog" open={show} onClose={closeCardForm}>
  <div class="dialog-inner">
    <div class="dialog-content card-form">
      <h3 class="type:h2 space:d32">Complete your subscription</h3>
      <p class="type:body space:d32">You'll be redirected to Square's secure checkout page to complete your subscription.</p>
      <Button onclick={processPayment} disabled={processingPayment}>
        {#if processingPayment}
          <span>{processingText}</span>
        {:else}
          <span>{payButtonText} {selectedPlan?.formattedTotalPrice || ''}</span>
        {/if}
      </Button>
      {#if paymentError}
        <div class="error-message">
          {paymentError}
        </div>
      {/if}
    </div>
  </div>
</Modal>

<style lang="scss">
  .card-form {
    background: #f2f3f6;
    border-radius: var(--border-radius-sm);
    inline-size: 720px;
  }

  .error-message {
    color: var(--color-error);
    margin-top: 16px;
    padding: 12px;
    background: var(--color-error-bg);
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-error);
  }
</style>
