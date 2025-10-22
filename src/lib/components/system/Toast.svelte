<script>
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  const { onClose, message, type = 'success', id = '' } = $props();

  function handlerClose(e) {
    e.preventDefault();
    if (onClose) {
      onClose(id);
    }
  }
</script>

<div
  class="toast {type}"
  in:fly={{ x: 0, y: -300, duration: 300, easing: quintOut }}
  out:fade={{ duration: 200, easing: quintOut }}
>
  <Icon type={type === 'success' ? ICONS.CHECK : ICONS.ERROR} />
  <p class="toast-message type:body">{message}</p>
  <button class="toast-close" onclick={handlerClose} type="button">
    <Icon type={ICONS.CLOSE} />
  </button>
</div>

<style lang="scss">
  .toast {
    width: 473px;
    background: var(--color-dark-60);
    border-radius: var(--border-radius-sm);
    block-size: 74px;
    display: flex;
    align-items: center;
    padding-inline: 22px;
    gap: 16px;
    --icon-color: var(--color-white-100);
    color: var(--color-white-100);

    &.success {
      background: var(--color-approved);
    }

    &.error {
      background: var(--color-warning);
    }

    .toast-close {
      background: transparent;
      border: none;
      margin-left: auto;
      cursor: pointer;
      pointer-events: all;
    }
  }
</style>
