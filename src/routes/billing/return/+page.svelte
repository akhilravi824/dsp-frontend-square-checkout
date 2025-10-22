<script lang="ts">
  import { onMount } from 'svelte';
  import { subscriptionApi } from '$lib/api';

  let message = $state('Processing your subscription…');

  async function check() {
    const r = await fetch('/api/proxy/subscriptions', { credentials: 'include' });
    if (!r.ok) return false;
    const j = await r.json();
    if (j?.data?.has_active_subscription || j?.data?.status === 'active' || j?.data?.status === 'trialing') {
      message = 'Subscription active! 🎉';
      return true;
    }
    return false;
  }

  onMount(async () => {
    const start = Date.now();
    while (Date.now() - start < 20000) {
      if (await check()) return;
      await new Promise(r => setTimeout(r, 2000));
    }
    message = 'Payment canceled or not completed.';
  });
</script>

<div class="billing-return-page">
  <div class="layout:max-width">
    <div class="return-content">
      <h1 class="type:h1 space:d32">{message}</h1>
      {#if message === 'Processing your subscription…'}
        <p class="type:body text-color:dark-60">Please wait while we verify your payment...</p>
      {:else if message === 'Subscription active! 🎉'}
        <p class="type:body text-color:dark-60">Your subscription is now active. You can access all premium features.</p>
        <a href="/dashboard" class="button primary">Go to Dashboard</a>
      {:else}
        <p class="type:body text-color:dark-60">If you completed payment, please contact support. Otherwise, you can try again.</p>
        <a href="/dashboard/settings" class="button secondary">Back to Settings</a>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .billing-return-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .return-content {
    text-align: center;
    max-width: 600px;
  }

  .button {
    display: inline-block;
    padding: 12px 24px;
    margin-top: 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;

    &.primary {
      background: var(--color-primary-blue);
      color: white;
      
      &:hover {
        background: var(--color-primary-blue-dark);
      }
    }

    &.secondary {
      background: transparent;
      color: var(--color-primary-blue);
      border: 1px solid var(--color-primary-blue);
      
      &:hover {
        background: var(--color-primary-blue);
        color: white;
      }
    }
  }
</style>
