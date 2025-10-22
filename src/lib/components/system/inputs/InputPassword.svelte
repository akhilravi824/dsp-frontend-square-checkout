<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { type IconType, ICONS } from '$lib/components/system/icons/types';
  import { onMount } from 'svelte';

  interface InputProps {
    value?: string;
    disabled?: boolean;
    label?: string;
    required?: boolean;
    name?: string;
    focus?: boolean;
    pattern?: string | RegExp;
    minlength?: number;
    maxlength?: number;
    hideLabel?: boolean;
    small?: boolean;
    icon?: IconType;
    errorMessage?: string;
    passwordToMatch?: string;
    onChange?: (value: string) => void;
    onInput?: (value?: string) => void;
    autocomplete?: string;
  }

  let {
    value = '',
    disabled = false,
    label = '',
    required = false,
    name = `c-${Date.now().toString(36)}`,
    focus = false,
    pattern = '',
    minlength = 8,
    maxlength = undefined,
    hideLabel = false,
    small = false,
    icon,
    errorMessage,
    onChange = () => {},
    onInput = () => {},
    autocomplete = 'off'
  }: InputProps = $props();

  // Reference
  let ref: HTMLInputElement;

  let inputState: 'ghost-message' | 'typing' | 'filled' | 'error' | 'disabled' | 'empty' = $state('empty');
  let showPassword = $state(false);
  let inputType = $state('password');

  let valid = $derived.by(() => {
    if (value.length > 0 && !focus) {
      const regex = new RegExp(pattern);
      return ref.checkValidity() && regex.test(value);
    }
    return true;
  });

  $effect(() => {
    // bind focus state
    if (focus) {
      ref?.focus();
    }

    if (value.length > 0 && !focus && valid) inputState = 'filled';
    if (value.length > 0 && !focus && !valid) inputState = 'error';
    if (value.length === 0 && !focus) inputState = 'empty';
    if (disabled) inputState = 'disabled';
    if (focus) inputState = 'typing';
    if (value.length === 0 && focus) inputState = 'ghost-message';

    ref.checkValidity();
  });

  function onFocus() {
    if (document.activeElement !== ref || focus) return;
    focus = true;
  }

  function onBlur() {
    focus = false;
  }

  function toggleVisibility() {
    showPassword = !showPassword;
    inputType = showPassword ? 'text' : 'password';
  }

  onMount(() => {
    if (focus) ref.focus();
  });

  export const reset = () => {
    if (ref) {
      ref.value = '';
      inputState = 'empty';
    }
  };

  export const isValid = () => {
    if (value.length > 0) {
      const regex = new RegExp(pattern);
      return ref.checkValidity() && regex.test(value);
    }
    return false;
  };
</script>

<div
  class="input:wrapper input-password"
  class:hideLabel
  class:is-focuses={focus}
  class:small
  data-required={required ? required : undefined}
  data-state={inputState}
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
      onChange(value);
    }}
    onfocus={onFocus}
    oninput={() => {
      onInput(value);
    }}
    {required}
    type={inputType}
  />
  {#if errorMessage}
    <p class="input-error type:label">
      {errorMessage}
    </p>
  {/if}
  <button class="toggle-visibility" onclick={toggleVisibility} type="button">
    <Icon type={showPassword ? ICONS.SHOW_INPUT : ICONS.HIDE_INPUT} />
  </button>
</div>

<style lang="scss">
  .input-password {
    input {
      padding-right: 50px;
    }
  }

  .toggle-visibility {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 10;

    &:hover {
      --icon-color: var(--color-primary-blue);
    }
  }
</style>
