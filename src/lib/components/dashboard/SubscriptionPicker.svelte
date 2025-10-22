<script lang="ts">
  import SubscriptionCard from '$lib/components/system/SubscriptionCard.svelte';
  import { onMount } from 'svelte';

  let plans = $state([]);
  let selectedPlan = $state(null);
  let { onSelectPlan, plansData, userVariation = null } = $props();

  function getPlanData(planId: any, key: string) {
    planId = planId === 'trial' ? null : planId;
    const planInfo = plansData.plans.find((plan) => plan.variationId === planId);
    if (planInfo) {
      return planInfo[key];
    }
    return '';
  }

  onMount(() => {
    if (userVariation) {
      selectedPlan = userVariation;
    }
  });

  function selectPlan(subscription: SubscriptionPlan) {
    if (!subscription) return;

    if (selectedPlan && subscription.variationId === selectedPlan.variationId) {
      return;
    } else {
      selectedPlan = subscription;
    }

    onSelectPlan(selectedPlan);
  }

  function formatBillingDetails(totalPrice: string, billingDetails: string) {
    if (!totalPrice || !billingDetails) return '';
    return `${totalPrice} ${billingDetails}`;
  }

  export const getAllPlans = () => {
    return plans;
  };
</script>

<section class="subscription-picker">
  <div class="subscription-list">
    {#each plansData as subscription (subscription.variationId)}
      <button class="plan-picker" onclick={() => selectPlan(subscription)}>
        <SubscriptionCard
          plan={{
            ...subscription,
            label: userVariation?.variationId === subscription.variationId ? 'Current plan' : subscription.label
          }}
          dimmed={selectedPlan && selectedPlan.variationId !== subscription.variationId}
          selected={selectedPlan && selectedPlan.variationId === subscription.variationId}
        />
      </button>
    {/each}
  </div>
</section>

<style lang="scss">
  .subscription-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(6, auto);
    gap: 6px;
    --card-background: var(--color-white-100);
  }

  .plan-picker {
    all: unset;
    cursor: pointer;
    display: grid;
    grid-template-rows: subgrid;
    grid-row: 1/-1;
  }
</style>
