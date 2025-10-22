<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { type IconType } from '$lib/components/system/icons/types';
  import { onMount } from 'svelte';

  interface InputProps {
    value?: string | null;
    disabled?: boolean;
    label?: string;
    required?: boolean;
    name?: string;
    focus?: boolean;
    hovered?: boolean;
    pattern?: string | RegExp;
    minlength?: number;
    maxlength?: number;
    hideLabel?: boolean;
    small?: boolean;
    type?: 'text' | 'email' | 'password';
    icon?: IconType;
    errorMessage?: string;
    onChange?: (value: string | null, isValid: boolean) => void;
    onInput?: (value: string, isValid: boolean) => void;
    wrapperClass?: string;
    autocomplete?: string;
  }

  let {
    value = '',
    disabled = false,
    label = '',
    required = false,
    name = `c-${Date.now().toString(36)}`,
    focus = false,
    hovered = false,
    pattern = undefined,
    minlength = 2,
    maxlength = undefined,
    hideLabel = false,
    small = false,
    type = 'text',
    icon,
    errorMessage,
    onChange = () => {},
    onInput = () => {},
    wrapperClass = '',
    autocomplete = 'off'
  }: InputProps = $props();

  // Reference
  let ref: HTMLInputElement;

  let state: 'ghost-message' | 'typing' | 'filled' | 'error' | 'disabled' | 'empty' = $state('empty');
  // let valid = true;

  let valid = $derived.by(() => {
    if (ref && value && value.length > 0) {
      if (pattern) {
        const regex = new RegExp(pattern);
        return ref.checkValidity() && regex.test(value);
      }
      return ref.checkValidity();
    }
    return true;
  });

  $effect(() => {
    // bind focus state
    if (focus) {
      ref?.focus();
    }

    if (value.length > 0 && !focus && valid) state = 'filled';
    if (value.length > 0 && !focus && !valid) state = 'error';
    if (value.length === 0 && !focus) state = 'empty';
    if (focus) state = 'typing';
    if (value.length === 0 && focus) state = 'ghost-message';
    if (disabled) state = 'disabled';

    ref.checkValidity();
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

  export const isValid = () => {
    if (value.length > 0) {
      if (pattern) {
        const regex = new RegExp(pattern);
        return ref.checkValidity() && regex.test(value);
      }
      return ref.checkValidity();
    }
    return false;
  };
</script>

<div
  class="input-component input:wrapper {wrapperClass}"
  class:hideLabel
  class:is-disabled={disabled}
  class:is-focused={focus}
  class:small
  data-required={required ? required : undefined}
  data-state={state}
>
  {#if icon}
    <div class="input-icon">
      <Icon type={icon} />
    </div>
  {/if}
  {#if !hideLabel}
    <label for={name}
      >{label}
      {#if required}*{/if}
    </label>
  {/if}
  <input
    {autocomplete}
    bind:this={ref}
    bind:value
    {disabled}
    {maxlength}
    {minlength}
    {name}
    onblur={onBlur}
    onchange={() => {
      onChange(value, ref.checkValidity());
    }}
    onfocus={onFocus}
    oninput={() => {
      onInput(value, ref.checkValidity());
    }}
    {required}
    {type}
  />
  {#if errorMessage}
    <p class="input-error type:label-small">
      {errorMessage}
    </p>
  {/if}
</div>

<style lang="scss">
  label {
  }
</style>
