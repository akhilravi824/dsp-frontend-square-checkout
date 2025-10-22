<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import RichText from '../system/RichText.svelte';
  import Media from './Media.svelte';

  type Composition = 'text-media' | 'media-text';

  const {
    data,
    composition = 'media-text',
    class: className
  }: { data: any; composition: Composition; class: string } = $props();
  const copy = data.copy;

  function getButtonHref() {
    const button = copy.button;
    if (!button) return null;
    if (button.linkType === 'internal' && button.internalLinkSlug) {
      return `/${button.internalLinkSlug}`;
    } else if (button.linkType === 'external' && button.externalUrl) {
      return button.externalUrl;
    }
    return '/';
  }
</script>

<section class="side-by-side {composition} {className}">
  <div class="layout:max-width layout:grid section-inner">
    <h2 class="type:h1 section-title mobile">{data.title}</h2>
    <div class="media-wrapper box-rounded:lg">
      {#if data.media}
        <Media media={data.media} />
      {/if}
    </div>
    <div class="text-wrapper">
      <h2 class="type:h1 space:d24 section-title desktop">{data.title}</h2>
      <RichText bodyTypeClass="type:body-large" copy={copy.copy} />
      {#if copy.button}
        <Button hovered icon={ICONS.ARROW_FORWARD} href={getButtonHref()}>
          {copy.button.title}
        </Button>
      {/if}
    </div>
  </div>
</section>

<style lang="scss">
  .side-by-side {
    --text-padding: 68px;
    --grid-row-gap: 32px;

    @media (min-width: 1024px) {
      --grid-row-gap: 0;
    }

    .section-inner {
      align-items: center;
    }

    .text-wrapper {
      :global(.rich-text:has(+ .button)) {
        margin-block-end: var(--space-d48);
      }
    }

    .media-wrapper,
    .text-wrapper {
      grid-column: 1 / -1;
      @media (min-width: 1024px) {
        grid-row: 1;
      }
    }

    .section-title {
      grid-column: 1 / -1;
      padding-inline-end: 24px;
      max-inline-size: 350px;

      @media (min-width: 1024px) {
        padding-inline-end: 0;
        max-inline-size: 100%;
      }

      &.mobile {
        display: block;

        @media (min-width: 1024px) {
          display: none;
        }
      }

      &.desktop {
        display: none;

        @media (min-width: 1024px) {
          display: block;
        }
      }
    }

    @media (min-width: 1024px) {
      &.media-text {
        .media-wrapper {
          grid-column: 1 / span 8;
        }

        .text-wrapper {
          grid-column: 9 / span 4;
          padding-inline-start: var(--text-padding);
        }
      }

      &.text-media {
        .media-wrapper {
          grid-column: 5 / span 8;
        }

        .text-wrapper {
          grid-column: 1 / span 4;
          padding-inline-end: var(--text-padding);
        }
      }
    }
  }
</style>
