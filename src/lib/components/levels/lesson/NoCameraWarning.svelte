<script lang="ts">
  import Modal from '$lib/components/system/Modal.svelte';
  import { createEventDispatcher } from 'svelte';

  let modalOpened = $state(false);

  const dispatch = createEventDispatcher<{
    retry: void;
  }>();

  let { error = false, errorMessage } = $props<{
    error?: boolean;
    errorMessage?: string;
  }>();

  function retryAccess() {
    dispatch('retry');
  }

  function onModalClose() {
    error = null;
    retryAccess();
  }
</script>

<div class="no-camera">
  <Modal onClose={onModalClose} open={error} modalClass="error">
    <div class="error-wrapper">
      <div class="inner">
        <h3 class="title type:h4">Camera access</h3>
        <p class="copy type:body">It seems you denied camera access in your browser. Please allow it to continue.</p>
        <button class="btn-error type:label-large" onclick={retryAccess}>Allow camera access</button>
      </div>
    </div>
  </Modal>

  <div class="inner">
    <div class="title">
      <h1 class="type:h1">Allow Camera Access</h1>
    </div>
    <div class="image">
      <img src="/images/no-camera.svg" alt="No active camera" />
    </div>
    <div class="message">
      <h3 class="subtitle type:body-large">No active camera</h3>
      <p class="copy type:label">Please turn it on or allow camera access to practice lessons.</p>
    </div>
  </div>
</div>

<style lang="scss">
  .no-camera {
    height: 100%;
  }

  .inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  .title {
    height: 38%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image {
    flex: 1;
  }

  .message {
    max-width: 220px;

    .subtitle {
      margin-bottom: 0.7em;
    }

    .copy {
      margin-bottom: 32px;
    }
  }

  .copy {
    max-width: 220px;
  }
</style>
