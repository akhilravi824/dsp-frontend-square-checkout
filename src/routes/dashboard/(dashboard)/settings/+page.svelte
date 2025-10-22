<script lang="ts">
  import { goto } from '$app/navigation';
  import { profileApi } from '$lib/api/';
  import Account from '$lib/components/dashboard/settings/Account.svelte';
  import Notifications from '$lib/components/dashboard/settings/Notifications.svelte';
  import Profile from '$lib/components/dashboard/settings/Profile.svelte';
  import Security from '$lib/components/dashboard/settings/Security.svelte';
  import Subscription from '$lib/components/dashboard/settings/Subscription.svelte';
  import { userProfile } from '$lib/stores/userProfile';
  import { onMount } from 'svelte';
  import type { SettingsPage } from '$lib/../types/sanity.types';

  interface PageData {
    globals: any;
    levels: any;
    page: SettingsPage;
  }

  const { data } = $props<{ data: PageData }>();
  let isLoading = $state(true);
  let profileData: any = $state(null);
  let error: string | null = $state(null);

  onMount(() => {
    fetchProfileData();
  });

  // Fetch user profile data
  async function fetchProfileData() {
    isLoading = true;

    if (!$userProfile) {
      try {
        const response = await profileApi.getProfile();
        if (response.success) {
          profileData = response.data;
        } else {
          console.error('Error fetching profile:', response.message);
          error = 'Failed to load profile data';
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        console.log(err.message);
        if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
          console.log('Auth token invalid or expired, redirecting to login');
          goto('/login');
        }
        error = 'Failed to load profile data';
      } finally {
        isLoading = false;
      }
    } else {
      isLoading = false;
    }
  }
</script>

<div class="dashboard-settings-page">
  <div class="layout:max-width layout:grid">
    <div class="page-inner">
      <h1 class="page-title type:h1 space:d80 text:center">Settings</h1>

      {#if isLoading}
        <div class="loading-container">
          <div class="loading-spinner"></div>
        </div>
      {:else}
        <div class="settings-blocks layout:stack">
          {#each data.page.components as component}
            {#if component._type === 'profileSection'}
              <Profile profileData={$userProfile} componentData={component} />
            {:else if component._type === 'accountSection'}
              <Account profileData={$userProfile} componentData={component} />
            {:else if component._type === 'notificationsSection'}
              <Notifications profileData={$userProfile} componentData={component} />
            {:else if component._type === 'securitySection'}
              <Security profileData={$userProfile} componentData={component} />
            {:else if component._type === 'subscriptionSection'}
              <Subscription profileData={$userProfile} componentData={component} />
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .dashboard-settings-page {
    --accordion-body-offset: -32px;
    --accordion-content-padding: 0 32px 32px 32px;
    --accordion-inner-padding: 32px var(--space-d16);
    --accordion-header-padding: 32px;
    --accordion-icon-right: 32px;
    padding-block-end: 180px;

    :global(.section-settings) {
      :global(.section-header p) {
        max-inline-size: 354px;
      }
    }
  }

  .page-inner {
    grid-column: 1 / -1;
  }

  .settings-blocks {
    --space: 6px;
  }
</style>
