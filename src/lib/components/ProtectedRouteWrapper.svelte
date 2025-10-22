<script lang="ts">
  import { authApi } from '$lib/api';
  import Spinner from '$lib/components/system/Spinner.svelte';
  import { profileService } from '$lib/services';
  import { protectedRouteService } from '$lib/services/protectedRouteService';
  import { onMount, type Snippet } from 'svelte';
  import { beforeNavigate, goto } from '$app/navigation';
  import { userProfile } from '$lib/stores/userProfile';
  import { progressService } from '$lib/services/progressService';
  import type { UserProfile } from '../../types/userProfile';
  import { headerBackLink } from '$lib/stores/appStore';
  let progressLoading = $state(true);

  let { children, data } = $props<{ children: Snippet }>();
  let isLoggedIn = $state(false);

  async function checkAndSyncEmailChange() {
    try {
      const checkResponse = await authApi.checkEmailChange();
      if (checkResponse.success && checkResponse.data.needsSync) {
        const syncResponse = await authApi.syncEmailChange();
        if (syncResponse.success && syncResponse.synced) {
          if (syncResponse.newEmail) {
            userProfile.updateEmail(syncResponse.authEmail);
          }
        }
      }
    } catch (err) {
      console.error('Error checking/syncing email:', err);
    }
  }

  async function checkAuthStatus() {
    progressLoading = true;

    // Auth check (handles redirect on failure internally)
    isLoggedIn = await protectedRouteService.checkAuthorization();
    if (!isLoggedIn) {
      progressLoading = false;
      return;
    }

    // Ensure profile is loaded and sync email change before plan checks
    try {
      await Promise.all([profileService.initProfile(), checkAndSyncEmailChange()]);
    } catch (error) {
      console.error('Error initializing profile or syncing email:', error);
      progressLoading = false;
      return;
    }

    const currentProfile = $userProfile;
    if (!currentProfile) {
      progressLoading = false;
      return;
    }

    // Redirect to plan if needed; stop any further work
    const canProceed = checkPlan(currentProfile);
    if (!canProceed) {
      progressLoading = false;
      return;
    }

    // Fetch progress
    try {
      await progressService.getProgress(currentProfile, data);
    } catch (error) {
      console.error('Error during protected route initialization:', error);
    } finally {
      progressLoading = false;
    }
  }

  // Progress loading handled directly in checkAuthStatus via Promise.all

  function checkPlan(userProfile: UserProfile): boolean {
    if (!userProfile.signed_up) {
      goto('/pick-your-plan');
      return false;
    }
    return true;
  }

  async function onRouteChange() {
    try {
      await checkAuthStatus();
    } catch (error) {
      return;
    }
  }

  async function init() {
    await onRouteChange();
  }

  onMount(() => {
    init();
  });

  beforeNavigate(() => {
    headerBackLink.set(null);
    onRouteChange();
  });
</script>

{#if !progressLoading}
  {@render children()}
{:else}
  <Spinner size={54} stroke={7} center={true}></Spinner>
{/if}
