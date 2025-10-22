<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { authApi, profileApi } from '$lib/api';
  import { profileService } from '$lib/services/profileService';
  import { updateSubscriptionStore } from '$lib/stores/updateSubscriptionStore';
  import Modal from '$lib/components/system/Modal.svelte';
  import Button from '$lib/components/system/Button.svelte';

  let { isLoggingOut } = $props<{ isLoggingOut: boolean }>();

  const dispatch = createEventDispatcher();

  async function logOut() {
    try {
      await authApi.logout();
      updateSubscriptionStore.resetUserPlan();
      profileService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<Modal modalClass="modal-logout" open={isLoggingOut} onClose={handleClose}>
  <div class="modal-content">
    <p class="type:h2 space:d32">Log out of your account?</p>
    <div class="modal-actions">
      <Button onclick={logOut}>Log Out</Button>
      <Button variant="secondary" onclick={handleClose}>Cancel</Button>
    </div>
  </div>
</Modal>

<style lang="scss">
  .modal-logout {
  }

  :global(.modal-logout) {
    .modal-content {
      inline-size: 634px;
    }
  }

  :global(.modal-logout .button.secondary) {
    --btn-fill: transparent;
    --btn-fill-hover: var(--color-dark-10);
  }
</style>
