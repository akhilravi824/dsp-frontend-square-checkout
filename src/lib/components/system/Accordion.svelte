<script lang="ts">
  import Icon from './icons/Icon.svelte';
  import { ICONS } from './icons/types';
  import type { Snippet } from 'svelte';

  type AccordionProps = {
    body: Snippet;
    header: Snippet;
    isOpen?: boolean;
  };

  const { body, header, isOpen = false }: AccordionProps = $props();
  let accordionOpen = $state(isOpen);

  function toggle() {
    accordionOpen = !accordionOpen;
  }
</script>

<div class="accordion" class:open={accordionOpen}>
  <button class="accordion-header" onclick={toggle}>
    <span class="header-wrapper">
      {@render header()}
    </span>
    <span class="accordion-icon">
      <Icon type={ICONS.PLUS} />
    </span>
  </button>
  <div class="accordion-content">
    <div class="content-inner">
      {@render body()}
    </div>
  </div>
</div>

<style lang="scss">
  .accordion {
    --_border-radius: var(--_accordion-border-radius, 12px);
    --_background: var(--_accordion-background, var(--color-dark-5));
    --_hover-bg: var(--_accordion-hover-bg, var(--color-dark-5));
    --_title-color-hover: var(--accordion-title-color-hover, var(--color-primary-blue));
    --_content-padding: var(--accordion-content-padding, 0 60px 32px 24px);
    --_header-padding: var(--accordion-header-padding, 32px 60px 32px 24px);
    --_icon-right: var(--accordion-icon-right, 24px);
    background: var(--_background);
    border-radius: var(--_border-radius);
    overflow: hidden;

    @media screen and (min-width: 768px) {
      --_header-padding: var(--accordion-header-padding, 32px 24px);
    }

    .accordion-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      background: transparent;
      border: none;
      transition: background-color 0.3s ease;
      padding: var(--_header-padding);
      position: relative;
      z-index: 5;
      text-align: left;
      color: var(--color-dark-100);

      .accordion-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
        --icon-color: var(--color-dark-60);
        position: absolute;
        top: 32px;
        right: var(--_icon-right);
      }

      &:hover {
        .accordion-icon {
          --icon-color: var(--color-dark-100);
        }

        .header-wrapper {
          color: var(--_title-color-hover);
          transition: color 0.2s ease;
        }
      }
    }

    .accordion-content {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.3s ease;
      overflow: hidden;
      padding: var(--_content-padding);
      margin-top: var(--accordion-body-offset, -32px);
      position: relative;
      z-index: 4;

      .content-inner {
        overflow: hidden;
        min-height: 0;

        & > :global(*) {
          padding-block: var(--accordion-inner-padding, var(--space-16) 0);
        }
      }
    }

    &.open {
      .accordion-header .accordion-icon {
        transform: rotate(45deg);
      }

      .accordion-content {
        grid-template-rows: 1fr;
      }
    }
  }
</style>
