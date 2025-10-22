<script lang="ts">
  import DashboardNav from '$lib/components/dashboard/DashboardNav.svelte';
  import ProtectedRouteWrapper from '$lib/components/ProtectedRouteWrapper.svelte';
  import OnlyDesktopScreen from '$lib/components/system/OnlyDesktopScreen.svelte';
  import { headerBackLink, showDashboardNav } from '$lib/stores/appStore';
  import { breakpoints } from '$lib/stores/mediaQueries.svelte';
  import { previousUrl } from '$lib/stores/navigationStore';
  import type { LayoutData } from './$types';
  import { beforeNavigate } from '$app/navigation';
  import SimpleHeader from '$lib/components/system/headers/SimpleHeader.svelte';
  import { profileService } from '$lib/services/profileService';
  import { updateSubscriptionStore } from '$lib/stores/updateSubscriptionStore';
  import ModalLoggout from '$lib/components/Modals/ModalLoggout.svelte';
  import { fade } from 'svelte/transition';
  let { data, children } = $props<{ data: LayoutData; children: any }>();
  let isLoggingOut = $state(false);

  beforeNavigate(() => {
    previousUrl.set(window.location.pathname);
  });

  async function logOut() {
    try {
      updateSubscriptionStore.resetUserPlan();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      await profileService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
</script>

{#if breakpoints.desktop.mediaQuery}
  <div class="dashboard-layout">
    <ModalLoggout
      {isLoggingOut}
      {logOut}
      onClose={() => {
        isLoggingOut = false;
      }}
    />
    <SimpleHeader logoLinkUrl="/dashboard">
      {#snippet leftPart()}
        {#if $headerBackLink}
          <a href={$headerBackLink.href} class="type:header-link type:label-medium" transition:fade={{ duration: 200 }}
            >{$headerBackLink.label}</a
          >
        {/if}
      {/snippet}
      {#snippet rightPart()}
        <button
          class="sign-out type:header-link"
          onclick={() => {
            console.log('clicked');
            isLoggingOut = true;
          }}
        >
          Log Out
        </button>
      {/snippet}
    </SimpleHeader>
    <ProtectedRouteWrapper {data}>
      {@render children()}
    </ProtectedRouteWrapper>
    {#if $showDashboardNav}
      <DashboardNav />
    {/if}
  </div>
{:else}
  <OnlyDesktopScreen data={data.globals.onlyDesktop} />
{/if}

<style lang="scss">
  :root {
    --container-max-width: 834px;
  }

  .sign-out {
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    text-decoration: underline;
    cursor: pointer;
  }

  .dashboard-layout {
    display: none;
    --container-max-width: 834px;

    @media screen and (min-width: 1024px) {
      display: block;
    }

    :global(.simple-header) {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
</style>
