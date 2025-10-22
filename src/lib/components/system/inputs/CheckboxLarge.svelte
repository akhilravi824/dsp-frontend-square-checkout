<script lang="ts">
  import { onMount } from 'svelte';

  let {
    wrapperClass = '',
    label,
    checked = false,
    name = `c-${Date.now().toString(36)}`,
    focus = false,
    required = false,
    value = 'on',
    onChange = () => {
    }
  } = $props();

  $effect(() => {
    // bind focus state
    if (focus) {
      ref?.focus();
    }

    if (checked) {
      ref?.setAttribute('checked', 'checked');
    } else {
      ref?.removeAttribute('checked');
    }
  });

  // Reference
  let ref: HTMLInputElement;

  function onFocus() {
    if (document.activeElement !== ref || focus) return;
    focus = true;
  }

  function onBlur() {
    focus = false;
  }

  onMount(() => {
    if (focus) ref.focus();
  });

  function onInputChange() {
    onChange();
  }
</script>

<label class="type:body input-checkbox-large {wrapperClass}">
  <input
    bind:checked
    bind:this={ref}
    {name}
    onblur={onBlur}
    onchange={onInputChange}
    onfocus={onFocus}
    {required}
    type="checkbox"
    {value}
  />
  <span>{label}</span>
</label>

<style lang="scss">
  .input-checkbox-large {
    &:hover {
      border-color: var(--color-dark-100);

      input {
        border-color: var(--color-dark-100);
      }
    }
  }

  label {
    --_color: var(--checkbox-color, var(--color-dark-purple));
    display: flex;
    align-items: center;
    color: var(--color-dark-100);
    gap: 1.143em;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-dark-10);
    min-height: 76px;
    padding-inline: 24px 24px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  input {
    position: relative;
    appearance: none;
    background-color: var(--color-white-100);
    margin: 0;
    height: 20px;
    aspect-ratio: 1;
    border-radius: 6px;
    border: 1px solid var(--color-dark-20);
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  // checked
  input::before,
  input::after {
    content: '';
    position: absolute;
    inset: -1px;
  }

  input::before {
    background-color: var(--color-primary-blue);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    border-radius: 6px;
  }

  input::after {
    background-color: var(--color-white-100);
    -webkit-mask-image: url('/icons/check-white.svg');
    mask-image: url('/icons/check-white.svg');
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: contain;
    mask-size: contain;

    transition: transform 0.3s var(--ease-out-back);
    transform: scale(0);
  }

  // activate checked
  input:checked::before {
    opacity: 1;
  }

  input:checked::after {
    transform: scale(1);
  }
</style>
