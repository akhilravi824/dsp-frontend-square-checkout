<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { goto, afterNavigate, invalidateAll } from '$app/navigation';
  import { progressApi, profileApi, authApi } from '$lib/api';
  import { mergeAllLevelsData } from '$lib/utils/progress';
  import { userProfile } from '$lib/stores/userProfile';
  import Spinner from '$lib/components/system/Spinner.svelte';
  import { levelsDataStore } from '$lib/stores/levelsDataStore';
  import Tabs from '$lib/components/levels/Tabs.svelte';
  import OnlyDesktopScreen from '$lib/components/system/OnlyDesktopScreen.svelte';
  import { breakpoints } from '$lib/stores/mediaQueries.svelte';

  const { data, children } = $props<{ data: PageData; children: any }>();
  const { levels } = data;

  // Initialize store with the data we have
  levelsDataStore.set({ cmsData: data, apiData: {}, mergedData: {}, isLoaded: false });

  // Make store available via context for components that can't use imports
  setContext('levelData', levelsDataStore);

  let progressLoading = $state(true);
  let levelId = $derived($page.params.levelId || '1');

  let isLoggedIn = $state(false);
  let isCheckingAuth = $state(false);
  let profileData = $state(null);

  onMount(async () => {
    checkAuthStatus();
    const profileResponse = await profileApi.getProfile();
    profileData = profileResponse;
  });

  afterNavigate(() => {
    invalidateAll();
  });

  async function initProgress() {
    getProgress();
  }

  async function getProgress() {
    try {
      const response = await progressApi.getProgress();
      const apiData = response.data;
      const subscription_id = $userProfile?.square_subscription_id;
      const lockRest = subscription_id === null && apiData.freeTries === 0 ? true : false;
      const units = subscription_id !== null ? $userProfile?.signup_data.units : '';
      let updatedMergedData = mergeAllLevelsData(data, apiData, units, lockRest);

      // Get level from levels
      updatedMergedData = updatedMergedData.find((l) => l.levelId.toString() === levelId.toString());

      // Update store all at once to minimize re-renders
      levelsDataStore.update((state) => ({
        ...state,
        apiData,
        mergedData: updatedMergedData,
        isLoaded: true
      }));

      console.log('Store data updated with API data:', $levelsDataStore);
    } catch (error) {
      console.error('Error getting progress data:', error);
      // Still mark as loaded even if there's an error
      levelsDataStore.update((state) => ({ ...state, isLoaded: true }));
    } finally {
      progressLoading = false;
    }
  }

  async function checkAuthStatus() {
    const wasLoggedIn = isLoggedIn;
    isCheckingAuth = true;
    let hasSubscription = false;

    try {
      // Make a request to verify if the user is authenticated
      // The cookie will be sent automatically
      const verifyResponse = await authApi.verify();
      // console.log(verifyResponse);
      isLoggedIn = verifyResponse.authenticated;
    } catch (error) {
      console.log(error);
      isLoggedIn = false;
    } finally {
      isCheckingAuth = false;
    }

    if (!wasLoggedIn && isLoggedIn) {
      console.log($userProfile);
      if (!$userProfile) {
        try {
          const profileResponse = await profileApi.getProfile();
          // console.log('profile', profileResponse);

          if (profileResponse.success && profileResponse.data) {
            profileData = profileResponse.data;
          }
          userProfile.set(profileResponse.data);
        } catch (error) {
          profileData = null;
        }
      }
      // we can initialize the progress data
      // initProgress();
    } else if (!isLoggedIn) {
      console.log('bad');
      //   // If the user is not logged in, redirect to the login page
      goto('/login');
    }

    if ($userProfile) {
      if (!$userProfile.signed_up) {
        goto('/pick-your-plan');
        return;
      } else {
        initProgress();
      }
    } else {
      goto('/login');
    }
  }

  // Add this to handle URL changes without full remounting
  $effect(() => {
    const newLevelId = $page.params.levelId || '1';
    if (newLevelId !== levelId) {
      levelId = newLevelId;
      getProgress();
    }
  });
</script>

{#if breakpoints.desktop.mediaQuery}
  <Tabs />
  <div class={`level-page level-theme-${levelId}`}>
    {#if !progressLoading && $levelsDataStore.isLoaded}
      {@render children()}
    {:else}
      <Spinner size={54} stroke={7} color={'var(--color)'} center={true}></Spinner>
    {/if}
  </div>
{:else}
  <OnlyDesktopScreen data={data.globals.onlyDesktop} />
{/if}

<style lang="scss">
  :root {
    --container-max-width: 834px;
  }

  .level-page {
    min-height: 100vh;

    &.level-theme-1 {
      background: var(--color-theme-1-gradient-bg);
      --color: var(--color-spot-1);
      --btn-fill: var(--color-spot-1);
      --btn-disabled-fill: var(--color-theme-1-disabled);
      --overlay-loader-bg: var(--color-theme-1-gradient-loader);
    }

    &.level-theme-2 {
      background: var(--color-theme-2-gradient-bg);
      --color: var(--color-spot-2);
      --btn-fill: var(--color-spot-2);
      --btn-disabled-fill: var(--color-theme-2-disabled);
      --progress-color: var(--color-spot-2);
      --overlay-loader-bg: var(--color-theme-2-gradient-loader);
    }
    &.level-theme-3 {
      background: var(--color-theme-3-gradient-bg);
      --color: var(--color-spot-3);
      --btn-fill: var(--color-spot-3);
      --btn-disabled-fill: var(--color-theme-3-disabled);
      --progress-color: var(--color-spot-3);
      --overlay-loader-bg: var(--color-theme-3-gradient-loader);
    }
    &.level-theme-4 {
      background: var(--color-theme-4-gradient-bg);
      --color: var(--color-spot-1);
      --btn-fill: var(--color-spot-1);
      --btn-disabled-fill: var(--color-theme-4-disabled);
      --progress-color: var(--color-spot-1);
      --overlay-loader-bg: var(--color-theme-4-gradient-loader);
    }
    &.level-theme-5 {
      background: var(--color-theme-5-gradient-bg);
      --color: var(--color-spot-3);
      --btn-fill: var(--color-spot-3);
      --btn-disabled-fill: var(--color-theme-5-disabled);
      --progress-color: var(--color-spot-3);
      --overlay-loader-bg: var(--color-theme-5-gradient-loader);
    }
  }
</style>
