<script lang="ts">
  import type { SwapSubscriptionPage } from '$lib/../types/sanity.types';
  import { subscriptionApi } from '$lib/api';
  import SubscriptionPicker from '$lib/components/dashboard/SubscriptionPicker.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import SquarePayment from '$lib/components/system/SquarePayment.svelte';
  import { onMount } from 'svelte';
  import { updateSubscriptionStore } from '$lib/stores/updateSubscriptionStore';
  import { updateSubscriptionService } from '$lib/services/updateSubscriptionService';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import Modal from '$lib/components/system/Modal.svelte';
  import RichText from '$lib/components/system/RichText.svelte';
  import { userProfile } from '$lib/stores/userProfile';
  import { profileService } from '$lib/services';
  import { goto } from '$app/navigation';
  import { replaceDynamicContent } from '$lib/utils/copy';
  import { ROUTES } from '$lib/routes';
  import { headerBackLink } from '$lib/stores/appStore';

  interface PageData {
    page: SwapSubscriptionPage;
  }

  const { data }: { data: PageData } = $props();
  const pageData = data.page;

  let blockSubmission = $state(true);
  let showConfirmationModal = $state(false);
  let showPaymentModal = $state(false);
  let selectedPlan: any = $state(null);
  let swapingInProgress = $state(false);

  onMount(() => {
    headerBackLink.set({
      href: ROUTES.SETTINGS,
      label: 'Back to settings'
    });

    init();
  });

  async function init() {
    await initProfile();
    await getSubscriptions();
  }

  async function initProfile() {
    const profile = await profileService.initProfile();

    if (profile) {
      if (profile.pending_plan_change || profile.square_subscription_canceled_date) {
        const message = profile.pending_plan_change
          ? 'You have a pending plan change. Please wait for it to complete.'
          : 'You have a pending subscription cancellation. Please wait for it to complete.';
        showError(message, 5000);
        goto(ROUTES.SETTINGS);
      }
    }
  }

  async function getSubscriptions() {
    try {
      // Initialize subscriptions with CMS plans
      await updateSubscriptionService.initSubscriptions(pageData.plans);
      await updateSubscriptionService.findUserPlan();
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    }
  }

  function onSelectPlan(plan: any) {
    if (!plan) {
      blockSubmission = true;
      return;
    }

    const currentUserPlan = $updateSubscriptionStore.userPlan;
    if (plan.variationId === currentUserPlan?.variationId) {
      blockSubmission = true;
      return;
    }

    blockSubmission = false;
    selectedPlan = plan;
  }

  async function submitSelection() {
    // Check if user never had a subscription and has no current subscription
    const currentUserProfile = $userProfile;
    const isNewSubscriber =
      !currentUserProfile?.had_subscription && currentUserProfile?.square_subscription_variation_id === null;

    if (isNewSubscriber) {
      // Show payment modal for new subscribers
      showPaymentModal = true;
    } else {
      // Show confirmation modal for existing subscribers
      showConfirmationModal = true;
    }
  }

  function closeConfirmationModal() {
    showConfirmationModal = false;
  }

  function handlePaymentSuccess() {
    showPaymentModal = false;
    window.location.href = '/dashboard/settings';
  }

  function handlePaymentError(error: string) {
    console.error('Payment error:', error);
    showError(error);
  }

  function handlePaymentClose() {
    showPaymentModal = false;
  }

  async function handleSwapPlan() {
    if (swapingInProgress) {
      return;
    }

    swapingInProgress = true;
    try {
      const userCustomerId = $userProfile?.squareCustomerId;
      const userSubscriptionId = $userProfile?.square_subscription_id;
      if (!userCustomerId || !userSubscriptionId) {
        throw new Error('User customer ID or subscription ID not found');
      }
      const success = await updateSubscriptionService.swapSubscription(
        userSubscriptionId,
        selectedPlan,
        userCustomerId
      );
      if (success) {
        showSuccess(`Successfully updated to ${selectedPlan.title}`, 5000);
        goto(ROUTES.SETTINGS);
      } else {
        showError('Failed to swap plan');
      }
    } catch (error) {
      console.error('Error swapping plan:', error);
      showError('Failed to swap plan');
      showConfirmationModal = false;
    } finally {
      swapingInProgress = false;
      showConfirmationModal = false;
    }
  }

  async function onCancel() {
    swapingInProgress = true;
    try {
      const userSubscriptionId = $userProfile?.square_subscription_id;
      if (!userSubscriptionId) {
        throw new Error('User customer ID or subscription ID not found');
      }
      const response = await subscriptionApi.cancelUserSubscription(userSubscriptionId);
      if (!response.success) {
        showError('Failed to cancel subscription. Please try again.', 5000);
        return;
      }
      showSuccess(`Successfully updated to ${selectedPlan.title}`, 5000);
      goto(ROUTES.SETTINGS);
    } catch (error) {
      showError('Failed to cancel subscription. Please try again.', 5000);
      console.error('Error cancelling subscription:', error);
    } finally {
      swapingInProgress = false;
      showConfirmationModal = false;
    }
  }

  function confirmAndUpdatePlan() {
    if (!selectedPlan) return;

    if (selectedPlan.variationId === '') {
      onCancel();
    } else {
      handleSwapPlan();
    }
  }

  function handleKeepCurrentPlan() {
    showConfirmationModal = false;
  }
</script>

<div class="swap-subscription-page">
  <Modal onClose={closeConfirmationModal} open={showConfirmationModal}>
    <div class="confirmation-modal">
      <p class="type:h2 space:d12">
        {replaceDynamicContent(pageData.swapConfirmationTitle || '', 'plan', selectedPlan?.title || '')}
      </p>
      <div class="type:body space:d32 modal-copy">
        <RichText
          copy={replaceDynamicContent(pageData.swapConfirmationCopy || [], 'plan', selectedPlan?.title || '')}
        />
      </div>
      <div class="layout:inline-flex">
        <Button disabled={swapingInProgress} onclick={confirmAndUpdatePlan} loading={swapingInProgress}>
          <span>Confirm and update</span>
        </Button>
        <Button onclick={handleKeepCurrentPlan} variant="secondary">
          <span>Keep current plan</span>
        </Button>
      </div>
    </div>
  </Modal>

  <SquarePayment
    onClose={handlePaymentClose}
    onError={handlePaymentError}
    onSuccess={handlePaymentSuccess}
    payButtonText="Subscribe for"
    processingText="Processing subscription"
    {selectedPlan}
    show={showPaymentModal}
    squarePlanId={$updateSubscriptionStore.squarePlanId}
  />

  <div class="page-inner layout:max-width layout:grid">
    <div class="wrapper layout:form-wrapper-d">
      <div class="page-header space:d48">
        {#if pageData?.title}
          <h1 class="type:h1">{pageData.title}</h1>
        {/if}
      </div>

      {#if $updateSubscriptionStore.allPlans.length > 0 && $updateSubscriptionStore.userPlan}
        <div class="subscription-picker-section space:d32">
          <SubscriptionPicker
            {onSelectPlan}
            plansData={$updateSubscriptionStore.allPlans}
            userVariation={$updateSubscriptionStore.userPlan}
          />
        </div>
      {:else if $updateSubscriptionStore.isLoading}
        <p>Loading subscriptions...</p>
      {:else}
        <p>No plans found</p>
      {/if}

      <div class="step-bottom-bar layout:stack">
        <Button
          alignment="center"
          class="space:d16"
          disabled={blockSubmission}
          hovered
          icon={ICONS.ARROW_FORWARD}
          onclick={submitSelection}
          type="submit"
        >
          {#if selectedPlan && selectedPlan.variationId === ''}
            <span>Update to Trial</span>
          {:else if $userProfile && !$userProfile.had_subscription && $userProfile.square_subscription_variation_id === null}
            <span>Subscribe to {selectedPlan?.title}</span>
          {:else}
            <span>Update to {selectedPlan?.title}</span>
          {/if}
        </Button>
        <p class="type:label text-color:dark-60 text-link">You can always change your plan at a later point.</p>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .wrapper {
    grid-column: 2 / span 10;
    padding-block-end: 40px;
  }

  .page-header {
    text-align: center;
  }

  .step-bottom-bar {
    align-items: center;
    text-align: center;
    --space: 12px;
    margin-block-start: 40px;
  }

  .confirmation-modal {
    min-inline-size: 620px;

    .modal-copy {
      --strong-color: var(--color-primary-blue);
      --rich-text-copy-color: var(--color-dark-100);
      max-width: 300px;
    }
  }
</style>
