<script lang="ts">
  import { fade } from 'svelte/transition';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from './icons/types';

  const { open, children, onClose, modalClass = '' } = $props();
  let modalOpen = $state(open);

  $effect(() => {
    modalOpen = open;
  });

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }
</script>

{#if modalOpen}
  <div class="dialog {modalClass}" transition:fade={{ duration: 100 }}>
    <div
      class="dialog-backdrop"
      role="button"
      tabindex="0"
      onclick={handleClose}
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
    ></div>
    <div class="dialog-inner">
      <div class="dialog-content">
        {@render children()}
        <button class="dialog-button-close" onclick={handleClose}>
          <Icon type={ICONS.CLOSE} />
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .dialog {
    max-inline-size: none;
    max-block-size: none;
    border: none;
    padding: 0;
    background: transparent;
    block-size: 100%;
    inline-size: 100%;
    color: inherit;
    position: fixed;
    z-index: 99;
    top: 0;
    left: 0;

    .dialog-backdrop {
      position: absolute;
      inset: 0;
      outline: none;
      background: var(--color-dark-60);
    }

    .dialog-inner {
      display: flex;
      place-items: center;
      justify-content: center;
      position: relative;
      inline-size: 100%;
      block-size: 100%;
      pointer-events: none;

      & > * {
        pointer-events: auto;
      }
    }

    .dialog-content {
      background: var(--dialog-background, #f2f3f6);
      border-radius: var(--modal-radius, var(--border-radius-sm));
      padding-inline: var(--modal-padding-inline, 32px);
      padding-block: var(--modal-padding-block, 32px);
      position: relative;
      max-block-size: var(--modal-max-height, 574px);
      overflow: auto;

      & > * {
        position: relative;
        z-index: 5;
      }
    }

    .dialog-button-close {
      position: absolute;
      background: transparent;
      border: none;
      top: 26px;
      right: 30px;
      z-index: 8;
      cursor: pointer;
    }
  }

  :global(.dialog .modal-actions) {
    display: flex;
    gap: 6px;
  }

  :global(.dialog.error .error-wrapper) {
    text-align: center;
  }

  :global(.dialog.error .title) {
    margin-bottom: 6px;
  }

  :global(.dialog.error .copy) {
    color: var(--color-dark-60);
    margin-bottom: 24px;
  }

  :global(.dialog.error .error-wrapper .btn-cancel),
  :global(.dialog.error .error-wrapper .btn-error) {
    color: var(--color-white-60);
    background: var(--color-dark-100);
    display: flex;
    height: 48px;
    min-height: 48px;
    padding: 10px 24px;
    justify-content: center;
    align-items: center;
    gap: 6px;
    align-self: stretch;
    border-radius: var(--border-radius-md);
    text-decoration: none;
    cursor: pointer;
    border: 0;
    width: 100%;

    &:hover {
      color: var(--color-white-100);
    }
  }

  :global(.dialog.error .error-wrapper .btn-cancel) {
    color: var(--color-dark-100);
    background: var(--color-white-60);
    border: 1px solid var(--color-dark-10);

    &:hover {
      color: var(--color-dark-100);
    }
  }
  :global(.dialog.error .dialog-button-close) {
    display: none;
  }
</style>
