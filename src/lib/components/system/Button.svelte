<script lang="ts">
  import type { IconType } from './icons/types';
  import Icon from './icons/Icon.svelte';
  import type { Snippet } from 'svelte';

  type ButtonProps = {
    href?: string | null;
    icon?: IconType;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'cancel';
    iconPosition?: 'before' | 'after';
    alignment?: 'left' | 'center' | 'right';
    children?: Snippet;
    hovered?: boolean;
    size?: 'default' | 'small';
    class?: string;
    type?: 'button' | 'submit' | null;
    onclick?: (event: MouseEvent) => void;
    noAnimation?: boolean;
    loading?: boolean;
  };

  const {
    href = null,
    icon,
    disabled = false,
    variant = 'primary',
    iconPosition = 'after',
    alignment = 'left',
    children,
    hovered = false,
    size = 'default',
    class: className = '',
    type = null,
    onclick = () => {},
    noAnimation = false,
    loading = false
  }: ButtonProps = $props();

  const buttonType = size === 'small' ? 'type:label-medium' : 'type:label-large';
  const tagType = href ? 'a' : 'button';
</script>

{#snippet buttonIcon(icon: IconType)}
  <span class="btn-icon">
    <div class="button-hover-effect"></div>
    {#if !loading}
      <span class="icon-wrapper">
        <Icon type={icon} />
      </span>
    {/if}
  </span>
{/snippet}

<svelte:element
  this={tagType}
  class={`button ${variant} ${icon && children ? `with-icon icon-${iconPosition}` : ''} align-${alignment}  ${size === 'small' ? 'small' : ''} ${className}`}
  class:disabled
  class:hovered
  class:no-animation={noAnimation}
  class:only-icon={!children && icon}
  class:loading
  disabled={disabled || loading}
  {href}
  {onclick}
  role="button"
  tabindex="0"
  {type}
>
  {#if icon && iconPosition === 'before'}
    {@render buttonIcon(icon)}
  {/if}
  {#if children}
    <span class="btn-text">
      <div class="button-hover-effect"></div>
      <span class={buttonType}>
        {#if loading}
          Processing...
        {:else}
          {@render children()}
        {/if}
      </span>
    </span>
  {/if}
  {#if icon && iconPosition === 'after'}
    {@render buttonIcon(icon)}
  {/if}
</svelte:element>

<style lang="scss">
  // Base button styles
  .button {
    --_background: var(--btn-fill, transparent);
    --_background-hover: var(--btn-fill-hover, var(--btn-fill));
    --_size: var(--btn-size, 48px);
    --_inline-padding: var(--btn-inline-padding, 22px);
    // The size between the two radius sides
    --_base-size: 20px;
    //Avoid white space between the icon and text
    --_extra-gap: 1px;
    --_gap: calc(6px + var(--_extra-gap, 1px));
    --_hover-layer-bg: var(--btn-hover-layer-bg, rgba(255, 255, 255, 0.1));
    --_disabled-background: var(--btn-disabled-fill, #e6e7ee);
    --_translate-x-base: calc(var(--_base-size) + var(--_inline-padding) * 2);
    --_border-radius: var(--btn-radius, 24px);

    --_expand-transition-ease: var(--ease-in-out-circ);
    --_expand-transition-duration: 0.2s;

    block-size: var(--_size);
    border: none;
    border-radius: var(--_border-radius);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    width: fit-content;
    transform: translateX(var(--_translate-x, 0));

    //// Common element styles
    .btn-text,
    .btn-icon {
      position: relative;
      background: var(--_background);
      transition:
        background 0.3s ease 0.05s,
        transform var(--_expand-transition-duration) var(--_expand-transition-ease);
      block-size: 100%;

      display: flex;
      align-items: center;
    }

    &:not(.no-animation) {
      .btn-text {
        display: flex;
        align-items: center;
        z-index: 3;
        white-space: nowrap;
        transform: translateX(var(--text-translate-x, 0));

        span {
          position: relative;
          z-index: 5;
          display: block;
          transition:
            opacity 0.2s ease,
            var(--_expand-transition-duration) var(--_expand-transition-ease);
        }
      }

      .btn-icon {
        line-height: 0;
        block-size: 100%;
        display: flex;
        align-items: center;
        z-index: 5;
        position: relative;
        inline-size: var(--_inline-padding);

        .icon-wrapper {
          position: absolute;
          block-size: 100%;
          display: flex;
          align-items: center;
          z-index: 5;
          top: 0;
        }
      }
    }

    &.only-icon {
      .btn-icon {
        padding-inline: var(--_inline-padding);
      }
    }

    // Button without icon
    &:not(.with-icon) {
      .btn-text {
        padding-inline: var(--_inline-padding);
        border-radius: 24px;
      }
    }

    // Button with icon but not animated
    &.no-animation {
      &.secondary {
        border: 1px solid var(--_border-color, var(--color-dark-10));
      }

      &.icon-before {
        .btn-text {
          padding-inline-end: var(--_inline-padding);
          padding-inline-start: 6px;
        }

        .btn-icon {
          padding-inline-start: var(--_inline-padding);
        }
      }

      &.icon-after {
        .btn-text {
          padding-inline-start: var(--_inline-padding);
          padding-inline-end: 6px;
        }

        .btn-icon {
          padding-inline-end: var(--_inline-padding);
        }
      }
    }

    &.with-icon:not(.no-animation) {
      transition: transform var(--_expand-transition-duration) var(--_expand-transition-ease);
      .btn-text {
        span {
          opacity: 0;
          transform: translateX(calc(var(--text-translate-x) * -0.8));
        }
      }

      &.icon-before {
        .btn-text {
          --text-translate-x: calc(-100% + var(--_inline-padding) + var(--_base-size));
          --_hover-x: calc(var(--_extra-gap) * -1);
          border-radius: 0 var(--_border-radius) var(--_border-radius) 0;
          padding-inline-end: var(--_inline-padding);
          padding-inline-start: calc(var(--_base-size) + var(--_gap));
        }

        .icon-wrapper {
          left: var(--_inline-padding);
        }
      }

      &.icon-after {
        .btn-text {
          --text-translate-x: calc(100% - var(--_inline-padding) - var(--_base-size));
          --_hover-x: calc(var(--_extra-gap) * 1);
          border-radius: var(--_border-radius) 0 0 var(--_border-radius);
          padding-inline-start: var(--_inline-padding);
          padding-inline-end: calc(var(--_base-size) + var(--_gap));
        }

        .icon-wrapper {
          right: var(--_inline-padding);
        }
      }
    }

    &.small {
      --_size: 30px;
      --icon-size: 16px;
      --_inline-padding: var(--btn-inline-padding, 11px);
      --_base-size: 16px;
      --_gap: 4px;

      &:not(.with-icon) .btn-text {
        --_inline-padding: var(--btn-inline-padding, 14px);
      }

      &.icon-before {
        .btn-text span {
          padding-right: 4px;
        }
      }

      &.icon-after {
        .btn-text span {
          padding-left: 4px;
        }
      }

      &.secondary {
        --_background: var(--btn-fill, var(--color-dark-10));
        --_background-hover: var(--btn-fill-hover, var(--color-dark-5));
      }
    }

    .button-hover-effect {
      position: absolute;
      inset: 0;
      background: var(--_hover-layer-bg);
      z-index: 2;
      opacity: 0;
      transition: opacity 0.2s;
      backface-visibility: hidden;
      transform: translateZ(0);
    }

    &.align-center:not(.no-animation) {
      --_translate-x: calc(-50% + var(--_translate-x-base) * 0.5);
    }

    &.align-left:not(.no-animation) {
      &.icon-after {
        --_translate-x: calc(-100% + var(--_translate-x-base));
        --_translate-x-hover: calc(var(--_extra-gap) * -1);
      }
    }
    //
    //&.small {
    //  --_size: 30px;
    //  --icon-size: 16px;
    //  --_inline-padding: var(--btn-inline-padding, 14px);
    //
    //  &.secondary {
    //    --_background: var(--btn-fill, var(--color-dark-10));
    //    --_background-hover: var(--btn-fill-hover, var(--color-dark-5));
    //  }
    //
    //  &.align-left {
    //    &.icon-after {
    //      --_translate-x-base: 38px;
    //    }
    //  }
    //
    //  &.with-icon.icon-before {
    //    .btn-text {
    //      transform: translateX(calc(-100% + 14px));
    //    }
    //  }
    //}
    //
    //

    &:hover:not(.disabled),
    &:focus:not(.disabled) {
      .button-hover-effect {
        opacity: 1;
      }
    }
    &:hover:not(.disabled),
    &:focus:not(.disabled),
    &.hovered:not(.disabled) {
      .btn-text,
      .btn-icon {
        background: var(--_background-hover);
      }

      &.with-icon {
        transform: translateX(var(--_translate-x-hover));

        .btn-text {
          transform: translateX(var(--_hover-x, 0));

          span {
            opacity: 1;
            transform: translateX(0);
          }
        }
      }
    }
    //
    // Variant: Primary
    &.primary {
      color: var(--color-white-100);
      --icon-color: var(--btn-icon-color, var(--color-white-100));
      --_background: var(--btn-fill, var(--color-primary-blue));
      --_background-hover: var(--btn-fill-hover, var(--_background));

      &:disabled {
        --_background: var(--btn-disabled-fill, #e6e7ee);
      }
    }

    //// Variant: Secondary
    &.secondary {
      color: var(--color-dark-100);
      --icon-color: var(--color-dark-100);
      --_background: var(--btn-fill, transparent);
      --_background-hover: var(--btn-fill-hover, #f2f2f6);
      --_border-color: var(--color-dark-10);
      --_hover-layer-bg: var(--btn-hover-layer-bg, var(--color-dark-5));
      border: 1px solid var(--_border-color);

      &.icon-after {
        .btn-text {
          border: 1px solid var(--color-dark-10);
          border-right: 0;
        }

        .btn-icon {
          border: 1px solid var(--color-dark-10);
          border-left: none;
        }
      }

      //.btn-text {
      //  border: 1px solid var(--color-dark-10);
      //}
      //
      //.btn-icon {
      //  border: 1px solid var(--color-dark-10);
      //  //border-left: none;
      //}
    }

    // Variant: tertiary
    &.tertiary {
      color: var(--color-dark-100);
      --icon-color: var(--color-dark-100);
      --_background: var(--btn-fill, var(--color-white-100));
      --_background-hover: var(--btn-fill-hover, var(--color-dark-10));
    }

    // Variant: cancel
    &.cancel {
      color: var(--color-white-100);
      --icon-color: var(--color-white-100);
      --_background: var(--btn-fill, var(--color-warning));
      --_background-hover: var(--btn-fill-hover, var(--color-warning));

      &:disabled {
        --_background: var(--btn-disabled-fill, var(--color-warning-dimmed));
      }
    }

    // Disabled state
    &:disabled {
      cursor: not-allowed;
      color: var(--color-dark-20);
      --icon-color: var(--color-dark-20);
    }
  }
</style>
