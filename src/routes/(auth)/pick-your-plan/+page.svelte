<script lang="ts">
  import SimpleHeader from '$lib/components/system/headers/SimpleHeader.svelte';
  import SubscriptionPicker from '$lib/components/dashboard/SubscriptionPicker.svelte';
  import SquareCheckout from '$lib/components/payment/SquareCheckout.svelte';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import Button from '$lib/components/system/Button.svelte';
  import { profileService } from '$lib/services';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { updateSubscriptionStore } from '$lib/stores/updateSubscriptionStore';
  import { updateSubscriptionService } from '$lib/services/updateSubscriptionService';
  import { showError } from '$lib/stores/toastStore';
  import type { Plan } from '$lib/../types/sanity.types';
  import Spinner from '$lib/components/system/Spinner.svelte';

  const { page: pageData } = $page.data;

  let blockSubmission = $state(true);
  let activeSubscription = $state<Plan | null>(null);

  onMount(() => {
    init();
  });

  async function init() {
    updateSubscriptionStore.setLoading(true);
    const profile = await profileService.initProfile();

    if (profile) {
      if (profile.signed_up) {
        goto('/dashboard');
        return;
      }
    }

    await getSubscriptions();
  }

  async function getSubscriptions() {
    updateSubscriptionStore.setLoading(true);
    try {
      // Initialize subscriptions with CMS plans from page data
      const cmsPlans = pageData.components?.[0]?.plans || [];
      await updateSubscriptionService.initSubscriptions(cmsPlans);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      showError('Failed to load subscription plans');
    } finally {
      updateSubscriptionStore.setLoading(false);
    }
  }

  function onSelectPlan(subscription: Plan) {
    if (!subscription) {
      blockSubmission = true;
      return;
    }
    blockSubmission = false;
    activeSubscription = subscription;
    
    // Debug: Log the selected subscription data
    console.log('Selected Subscription Debug:', {
      id: subscription._id,
      variationId: subscription.variationId,
      title: subscription.title,
      price: subscription.price,
      fullObject: subscription
    });
  }

  async function completeSignUp() {
    try {
      const response = await profileService.updateSignUpStatus(true);
      if (response) {
        goto('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error completing sign up:', error);
    }
  }

  function handleCheckoutError(error: string) {
    console.error('Checkout error:', error);
    showError(error);
  }
</script>

<div class="page-pick-your-plan">
  <SimpleHeader></SimpleHeader>
  <div class="background blue"></div>

  <div class="page-inner layout:max-width layout:grid">
    <div class="wrapper">
      <div class="page-header space:d24">
        <h1 class="type:h1">{pageData.title}</h1>
      </div>

      {#if $updateSubscriptionStore.isLoading}
        <div class="space:d24">
          <Spinner size={54} stroke={7} color={'var(--color)'} center={true}></Spinner>
        </div>
      {:else if $updateSubscriptionStore.allPlans.length > 0}
        <div class="space:d24">
          <SubscriptionPicker {onSelectPlan} plansData={$updateSubscriptionStore.allPlans} />
        </div>
      {:else}
        <div class="space:d24">
          <p>No subscription plans available</p>
        </div>
      {/if}

      <div class="step-bottom-bar layout:stack">
        {#if activeSubscription && activeSubscription.variationId === ''}
          <Button
            alignment="center"
            class="space:d16"
            disabled={blockSubmission}
            hovered
            icon={ICONS.ARROW_FORWARD}
            onclick={completeSignUp}
            type="submit"
          >
            <span>Continue with Trial</span>
          </Button>
        {:else if activeSubscription}
          <SquareCheckout
            planId={activeSubscription._id}
            variationId={activeSubscription.variationId || ''}
            onError={handleCheckoutError}
          />
        {:else}
          <Button
            alignment="center"
            class="space:d16"
            disabled={true}
            hovered
            icon={ICONS.ARROW_FORWARD}
            type="submit"
          >
            <span>Select a Plan</span>
          </Button>
        {/if}
        <p class="type:label text-color:dark-60 text-link">You can always change your plan at a later point.</p>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .page-pick-your-plan {
    .wrapper {
      grid-column: 2 / span 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-block-end: 40px;
    }

    .page-header {
      text-align: center;
      margin-block-end: 40px;
    }

    .page-inner {
      position: relative;
      z-index: 5;
    }

    .step-bottom-bar {
      align-items: center;
      text-align: center;
      --space: 12px;
      margin-block-start: 32px;
    }

    .background {
      position: absolute;
      inset: 0;
      background: var(--color-white-100);
      z-index: 1;

      &.blue {
        background:
          radial-gradient(
            182.11% 160.68% at 6.25% 130.49%,
            var(--theme-1-theme-1-gradient-tone, rgba(101, 150, 255, 0.65)) 0%,
            var(--theme-1-theme-1-gradient-base, rgba(213, 232, 253, 0)) 80.42%
          ),
          radial-gradient(
            192.45% 151.87% at 112.64% -12.28%,
            var(--theme-1-theme-1-gradient-tone, rgba(101, 150, 255, 0.3)) 0%,
            var(--theme-1-theme-1-gradient-base, rgba(213, 232, 253, 0)) 61.12%
          ),
          var(--theme-1-theme-1-bg, #d5e8fd);
      }
    }
  }
</style>
