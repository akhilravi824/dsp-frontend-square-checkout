<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import CheckboxLarge from '$lib/components/system/inputs/CheckboxLarge.svelte';
  import { onMount } from 'svelte';
  import { paymentApi, profileApi, squarePaymentApi } from '$lib/api/index.js';

  const { buttonText, onCardLoaded, onPaymentSuccess } = $props();
  let cardWrapper;
  let cardFormMounted = $state(false);
  let squareAppId = $state(null);
  let squareLocationId = $state(null);
  let paymentError = $state(null);
  let paymentInProgress = $state(false);
  let userProfile = $state(null);
  let paymentsInstance;
  let card;

  onMount(() => {
    initializeSquarePayments();
  });

  export async function initializeSquarePayments() {
    try {
      // Reset any previous errors
      paymentError = null;
      paymentInProgress = true;

      try {
        const locationResponse = await paymentApi.getLocations();
        if (!locationResponse || !locationResponse.applicationId || !locationResponse.locationId) {
          throw new Error('Unable to get Square configuration from backend');
        }
        console.log('locationResponse', locationResponse);

        squareAppId = locationResponse.applicationId;
        squareLocationId = locationResponse.locationId;

        // Get user profile if needed
        if (!userProfile) {
          try {
            const profileResponse = await profileApi.getProfile();
            userProfile = profileResponse;
            console.log('userProfile', userProfile);
          } catch (profileErr) {
            console.error('Failed to load user profile:', profileErr);
            throw new Error('Unable to load your profile. Please try again.');
          }
        }

        paymentsInstance = await squarePaymentApi.initializePayments(squareAppId, squareLocationId);
        card = await squarePaymentApi.createCardPaymentMethod(paymentsInstance);
        cardFormMounted = true;
      } catch (error) {
        console.error('Error initializing Square payments', error);
      }
    } catch (err: any) {
      console.error('Error initializing Square payments:', err);
      paymentError = err.message || 'Unable to initialize payment form. Please try again.';
      paymentInProgress = false;
    }
  }

  async function processSubscription(e) {
    e.preventDefault();
    onPaymentSuccess(card);
  }
</script>

<div class="card-form">
  <form>
    <div bind:this={cardWrapper} id="card-container"></div>
    {#if cardFormMounted}
      <CheckboxLarge wrapperClass="space:d24" label="I consent to letting ASL Pal securely store my credit card. " />
      <Button type="submit" onclick={processSubscription}>{buttonText}</Button>
    {:else}
      <p>Loading payment method ...</p>
    {/if}
  </form>
</div>
