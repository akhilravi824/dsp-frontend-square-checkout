<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import type { IconType } from '$lib/components/system/icons/types';
  import { onMount } from 'svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  interface InputProps {
    label?: string;
    required?: boolean;
    name?: string;
    focus?: boolean;
    small?: boolean;
    icon?: IconType;
    errorMessage?: string;
    selected?: string | number;
    children?: any;
  }

  let {
    label = '',
    required = false,
    name = `c-${Date.now().toString(36)}`,
    focus = false,
    small = false,
    icon,
    errorMessage,
    selected,
    children
  }: InputProps = $props();

  // Reference
  let ref: HTMLSelectElement;

  $effect(() => {
    // bind focus state
    if (focus) {
      ref?.focus();
    }
  });

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
</script>

<div class="input:wrapper">
  {#if icon}
    <div class="input-icon">
      <Icon type={icon} />
    </div>
  {/if}
  {#if label}<label for={name}>{label}</label>{/if}
  <div class="select" class:small>
    <select bind:this={ref} bind:value={selected} class="type:body-small" {name} on:blur={onBlur} on:focus={onFocus}>
      {@render children()}
    </select>
  </div>
  <div class="arrow">
    <Icon type={ICONS.DROPDOWN} />
  </div>
</div>

<style lang="scss">
  .wrapper {
    --padding: 1.333rem;

    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  label {
    font-variation-settings:
      'wght' 550,
      'wdth' 100;
    margin-block-start: 28px;
  }

  .select {
    cursor: pointer;
    display: grid;
    grid-template-areas: 'select';
    align-items: center;

    background-color: var(--color-white);
    border-radius: 90rem;
    block-size: 59px;
    border: 1px solid var(--color-white-100);

    &:focus,
    &:focus-within {
      border: 1px solid var(--color-blue-primary);
    }
  }

  select {
    // reset
    appearance: none;
    background-color: transparent;
    border: none;
    //padding: 0 1em 0 0;
    margin: 0;
    block-size: 100%;
    outline: none;
    font-family: inherit;
    font-size: inherit;
    cursor: inherit;
    line-height: inherit;
    // style
    grid-area: select;
    //padding-inline: var(--padding);
    inline-size: 100%;
  }

  .arrow {
    position: absolute;
    block-size: 100%;
    display: flex;
    align-items: center;
    top: 0;
    right: 24px;
  }
</style>
