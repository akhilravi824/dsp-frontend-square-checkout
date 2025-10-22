<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import Modal from '$lib/components/system/Modal.svelte';

  let { isLoggingOut, logOut, onClose } = $props<{ isLoggingOut: boolean; logOut: () => void; onClose: () => void }>();
</script>

<Modal modalClass="modal-logout" open={isLoggingOut} {onClose}>
  <div class="modal-content">
    <p class="type:h2 space:d32">Log out of your account?</p>
    <div class="modal-actions">
      <Button onclick={logOut}>Log Out</Button>
      <Button variant="secondary" onclick={() => (isLoggingOut = false)}>Cancel</Button>
    </div>
  </div>
</Modal>

<style lang="scss">
  :global(.modal-logout) {
    .modal-content {
      inline-size: 634px;
    }

    .modal-actions {
      display: flex;
      gap: 6px;
    }
  }
</style>
