<script lang="ts">
  import { subscriptionApi } from '$lib/api/subscription';
  import { showSuccess, showError } from '$lib/stores/toastStore';
  import Button from '$lib/components/system/Button.svelte';

  interface Props {
    planId: string;
    variationId: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
  }

  const { planId, variationId, onSuccess, onError }: Props = $props();

  let isLoading = $state(false);

  async function handleCheckout() {
    if (isLoading) return;
    
    isLoading = true;
    
    try {
      // Debug: Log the values being passed
      console.log('SquareCheckout Debug:');
      console.log('planId:', planId, '(type:', typeof planId, ')');
      console.log('variationId:', variationId, '(type:', typeof variationId, ')');
      console.log('planId empty?', !planId);
      console.log('variationId empty?', !variationId);
      
      // Get current URL for redirect URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/success`;
      const cancelUrl = `${baseUrl}/cancel`;
      
      // Create checkout session
      const response = await subscriptionApi.createCheckoutSession(
        planId,
        variationId,
        successUrl,
        cancelUrl
      );
      
      if (response.success && response.checkoutUrl) {
        // Redirect to Square Checkout
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(`Checkout failed: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      isLoading = false;
    }
  }
</script>

<Button
  onclick={handleCheckout}
  disabled={isLoading}
  variant="primary"
  size="large"
  class="w-full"
>
  {#if isLoading}
    Creating Checkout...
  {:else}
    Continue to Payment
  {/if}
</Button>
