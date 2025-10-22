<script lang="ts">
  import Invoices from '$lib/components/dashboard/settings/Invoices.svelte';
  import PaymentMethod from '$lib/components/dashboard/settings/PaymentMethod.svelte';
  import Accordion from '$lib/components/system/Accordion.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import Modal from '$lib/components/system/Modal.svelte';
  import SubscriptionCard from '$lib/components/system/SubscriptionCard.svelte';
  import { ROUTES } from '$lib/routes';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import { onMount } from 'svelte';
  import { subscriptionApi } from '$lib/api';
  import { updateSubscriptionStore } from '$lib/stores/updateSubscriptionStore';
  import { updateSubscriptionService } from '$lib/services/updateSubscriptionService';
  import type { SubscriptionSection } from '$lib/../types/sanity.types';

  const { profileData, componentData }: { profileData: any; componentData: SubscriptionSection } = $props();

  let modalOpened = $state(false);
  let modalType: 'cancel_subscription' | 'view_invoice' | 'manage_payment' | null = $state(null);
  let subscriptionCancellationDate: null | string = $state(null);
  let pendingPlanChange: {
    effective_date: string;
    new_plan_variation_id: string;
  } | null = $state(null);
  let toggleAccordion = $state(true);

  onMount(() => {
    fetchSubscription();
  });

  async function fetchSubscription() {
    updateSubscriptionStore.setLoading(true);

    try {
      // Initialize subscriptions with CMS plans if available
      const cmsPlans = componentData.plans || [];
      await updateSubscriptionService.initSubscriptions(cmsPlans);

      // Find user's current plan (handles free trial automatically)
      await updateSubscriptionService.findUserPlan();

      // Get user subscription details for cancellation info
      const response = await subscriptionApi.getUserSubscriptions();

      if (!response.success) {
        showError('Failed to fetch user subscriptions. Please try again.');
        return;
      }

      // Handle subscription cancellation date
      if (response.data.is_canceled && response.data.subscription_end_date) {
        subscriptionCancellationDate = response.data.subscription_end_date;
      } else {
        subscriptionCancellationDate = null;
      }

      // Handle pending plan change
      if (response.data.pending_plan_change) {
        pendingPlanChange = response.data.pending_plan_change;
      } else {
        pendingPlanChange = null;
      }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      showError('Failed to load subscription information');
    } finally {
      updateSubscriptionStore.setLoading(false);
    }
  }

  function onModalClose() {
    modalOpened = false;
  }

  async function onCancel() {
    try {
      const response = await subscriptionApi.cancelUserSubscription(profileData.square_subscription_id);
      if (!response.success) {
        showError('Failed to cancel subscription. Please try again.');
        return;
      }
      modalOpened = false;
      showSuccess(`Your subscription was successfully cancelled.`);
      await fetchSubscription();
    } catch (error) {
      showError('Failed to cancel subscription. Please try again.');
      console.error('Error cancelling subscription:', error);
    }
  }

  // Get the display label for the current plan
  function getPlanDisplayLabel() {
    return 'Current plan';
  }

  // Check if user is on free trial
  function isUserOnFreeTrial() {
    return $updateSubscriptionStore.userPlan?.variationId === '';
  }

  // Check if user has never had a subscription (new user on free trial)
  function isNewTrialUser() {
    return isUserOnFreeTrial() && !profileData?.had_subscription;
  }

  // Check if user has ever had a subscription (should see payment methods/invoices)
  function hasEverHadSubscription() {
    return profileData?.had_subscription || profileData?.squareCustomerId;
  }

  function handleSwapPaymentMethod(paymentMethodId: string) {
    console.log('🗒️ handleSwapPaymentMethod', paymentMethodId);
    modalOpened = true;
  }
</script>

<!-- Render cancel subscription -->
{#snippet renderCancelSubscription()}
  <div class="subscription-inner cancel-subscription">
    <p class="type:h2 space:d12">Are you sure you want to cancel?</p>
    <p class="modal-copy space:d32 type:body">
      Your access to your current subscription will continue until the end of your current billing period.
      <br />
      <br />
      Once cancelled you'll be downgraded to the <span class="type:label-large">Trial Plan.</span>
    </p>
    <div class="layout:inline-flex">
      <Button variant="cancel" onclick={onCancel}>Confirm and cancel</Button>
      <Button
        variant="secondary"
        onclick={() => {
          modalOpened = false;
        }}
        >Keep subscription
      </Button>
    </div>
  </div>
{/snippet}

<!-- Render invoices -->
{#snippet renderInvoices()}
  <div class="subscription-inner invoices">
    <p class="type:h2 space:d24">Your invoices</p>
    <Invoices />
  </div>
{/snippet}

<!-- Render payment method -->
{#snippet renderPaymentMethod()}
  <div class="subscription-inner invoices">
    <PaymentMethod customerId={profileData.squareCustomerId} onSwapPaymentMethod={handleSwapPaymentMethod} />
  </div>
{/snippet}

<section class="section-settings section-subscriptions">
  <Modal onClose={onModalClose} open={modalOpened}>
    {#if modalType === 'cancel_subscription'}
      {@render renderCancelSubscription()}
    {:else if modalType === 'view_invoice'}
      {@render renderInvoices()}
    {:else if modalType === 'manage_payment'}
      {@render renderPaymentMethod()}
    {/if}
  </Modal>
  <Accordion isOpen={toggleAccordion}>
    {#snippet header()}
      <div class="section-header">
        <h2 class="type:h2 space:d6">{componentData.title}</h2>
        <p class="type:body text-color:dark-60">{componentData.description}</p>
      </div>
    {/snippet}
    {#snippet body()}
      <div class="">
        {#if $updateSubscriptionStore.isLoading}
          <p>Loading user subscription</p>
        {:else}
          {#if subscriptionCancellationDate}
            <div class="subscription-cancellation space:d32">
              <p class="type:body text-color:dark-100">
                <span>Pending Cancellation:</span> Your subscription is scheduled to end on
                <span
                  >{new Date(subscriptionCancellationDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span
                >. Your payment method will not be charged again, and you’ll be downgraded to <span>Trial</span>.
              </p>
            </div>
          {:else if pendingPlanChange}
            <div class="subscription-swap-pending space:d32">
              <p class="type:body text-color:dark-100">
                <span>Pending Plan Change:</span> Your subscription will change to
                <span>{updateSubscriptionService.getSpecificPlan(pendingPlanChange.new_plan_variation_id)?.title}</span>
                on
                <span
                  >{new Date(pendingPlanChange.effective_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span
                >. Your current billing plan will continue until this date, when the new plan will take effect.
              </p>
            </div>
          {/if}
          <div class="subscription-wrapper space:d32">
            {#if $updateSubscriptionStore.userPlan}
              <div class="card-wrapper">
                <SubscriptionCard
                  plan={{
                    ...$updateSubscriptionStore.userPlan,
                    label: getPlanDisplayLabel($updateSubscriptionStore.userPlan)
                  }}
                  selected
                  disableHover
                />
              </div>
            {:else}
              <p>No subscription found</p>
            {/if}
          </div>
          <div class="subscription-ctas">
            <ul class="ctas-list layout:inline-flex">
              {#if !subscriptionCancellationDate && !pendingPlanChange}
                <li>
                  <a class="subscription-cta link:underlined type:label-large" href={ROUTES.UPDATE_SUBSCRIPTION}
                    >{isUserOnFreeTrial() ? 'Upgrade subscription' : 'Update subscription'}</a
                  >
                </li>
              {/if}
              {#if hasEverHadSubscription()}
                <li>
                  <button
                    class="subscription-cta link:underlined type:label-large"
                    onclick={() => {
                      modalOpened = true;
                      modalType = 'manage_payment';
                    }}
                  >
                    Manage payment
                  </button>
                </li>
                <li>
                  <button
                    class="subscription-cta link:underlined type:label-large"
                    onclick={() => {
                      modalOpened = true;
                      modalType = 'view_invoice';
                    }}
                    >View invoices
                  </button>
                </li>
              {/if}
              {#if !isUserOnFreeTrial() && !subscriptionCancellationDate}
                <li>
                  <button
                    class="subscription-cta link:underlined cancel-link type:label-large"
                    onclick={() => {
                      modalOpened = true;
                      modalType = 'cancel_subscription';
                    }}
                    >Cancel subscription
                  </button>
                </li>
              {/if}
            </ul>
          </div>
        {/if}
      </div>
    {/snippet}
  </Accordion>
</section>

<style lang="scss">
  .subscription-wrapper {
    margin-block-start: 12px;
    --card-background: var(--color-white-100);

    .card-wrapper {
      min-height: 470px;
      inline-size: 253px;
      display: flex;
      flex-direction: column;

      & > :global(.plan) {
        flex: 1;
      }
    }
  }

  .subscription-ctas {
    --gap: 24px;
  }

  .subscription-inner {
    min-width: 694px;
  }

  .cancel-subscription {
    --gap: 6px;

    .modal-copy {
      max-inline-size: 300px;
    }
  }

  .subscription-cancellation {
    padding: 32px;
    border-radius: var(--border-radius-sm);
    background: var(--color-white-100);

    span {
      color: var(--color-warning);
      font-weight: 500;
    }
  }

  .subscription-swap-pending {
    padding: 32px;
    border-radius: var(--border-radius-sm);
    background: var(--color-white-100);

    span {
      color: var(--color-primary-blue);
      font-weight: 500;
    }
  }
</style>
