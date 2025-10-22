<script>
  import Toast from '$lib/components/system/Toast.svelte';
  import toastStore, { removeToast } from '$lib/stores/toastStore.js';

  function closeToast(toastId) {
    removeToast(toastId);
  }
</script>

<div class="toast-manager">
  <div class="toast-wrapper layout:stack">
    {#each $toastStore as toast (toast.id)}
      <Toast id={toast.id} message={toast.message} onClose={closeToast} type={toast.type} />
    {/each}
  </div>
</div>

<style lang="scss">
  .toast-manager {
    position: fixed;
    z-index: 999;
    top: 0;
    left: 0;
    inline-size: 100%;
    display: flex;
    justify-content: center;
    padding-block-start: 30px;
    pointer-events: none;

    .toast-wrapper {
      --space: 6px;
    }
  }
</style>
