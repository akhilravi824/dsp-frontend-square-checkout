<script lang="ts">
  import type { Tips } from '../../../../types/sanity.types';
  import { toHTML } from '@portabletext/to-html';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import { currentStepId } from '$lib/stores/lessonStore';

  // Parent passes { data } = array of tips
  const { data } = $props<{ data: Tips }>();

  // Portable Text serializers — adds <img> support (GIFs included)
  const ptComponents = {
    types: {
      image: ({ value }: any) => {
        const src = value?.src || value?.asset?.url; // src comes from GROQ in loader
        const alt = value?.alt ?? 'tip image';
        if (!src) return '';
        return `<img src="${src}" alt="${escapeHtml(alt)}" loading="lazy"
                style="max-width:100%;height:auto;border-radius:8px;margin-top:8px;" />`;
      },
    },
  };

  // minimal escaper for alt text
  function escapeHtml(str: string) {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('"', '&quot;');
  }

  // slider state
  let currentIndex = $state(0);
  function goToNext() { if (currentIndex < data.length - 1) currentIndex++; }
  function goToPrevious() { if (currentIndex > 0) currentIndex--; }
  function goToIndex(index: number) { currentIndex = index; }
</script>

<div class="tips" class:solid={$currentStepId === 'error'}>
  <h2 class="title type:h3">Tips for success</h2>
  <div class="wrapper">
    <div class="holder">
      <div class="slides">
        {#each data as tip, index (index)}
          <div class="slide" class:active={currentIndex === index}>
            <span class="number type:h4">{index + 1}. {tip.title}</span>
            <span class="copy type:lesson-title">
              {@html toHTML(tip.description, { components: ptComponents })}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <div class="controls">
      <button class="nav-button"
        onclick={goToPrevious}
        disabled={currentIndex === 0}
        aria-label="Previous tip">
        <Icon type={ICONS.ARROW_BACK} />
      </button>

      <ul class="buttons">
        {#each data as _, index}
          <li class="button-wrapper">
            <button
              class="dot-button"
              class:active={currentIndex === index}
              onclick={() => goToIndex(index)}
              aria-label={`Go to tip ${index + 1}`}>
              <span class="dot"></span>
            </button>
          </li>
        {/each}
      </ul>

      <button class="nav-button"
        onclick={goToNext}
        disabled={currentIndex === data.length - 1}
        aria-label="Next tip">
        <Icon type={ICONS.ARROW_FORWARD} />
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .tips {
    display: flex;
    flex-direction: column;

    &.solid .wrapper {
      background: var(--color-white-100);
    }
  }

  .title { margin-bottom: 1rem; }

  .wrapper {
    background: var(--color-dark-5);
    border-radius: var(--border-radius-sm);
  }

  .holder { position: relative; margin-bottom: 1rem; }

  .slides { display: grid; position: relative; }

  .slide {
    grid-area: 1 / 1;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
    padding: 24px;
    box-sizing: border-box;

    &.active { opacity: 1; transform: translateX(0); pointer-events: auto; }

    .number { margin-bottom: 12px; display: block; }

    .copy {
      flex: 1; overflow-y: auto;

      img {
        display: block;
        margin-top: 8px;
        border-radius: 8px;
        max-width: 100%;
      }
    }
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px 20px;
  }

  .nav-button {
    background: none; border: none; cursor: pointer;
    border-radius: var(--border-radius-sm);
    width: 32px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    background: var(--color-dark-10); --icon-size: 16px;

    &:disabled { opacity: 0.3; cursor: not-allowed; }
    &:not(:disabled):hover { background: var(--color-dark-10); }
  }

  .buttons {
    display: flex; gap: 3px; list-style: none; padding: 0; margin: 0;

    .button-wrapper { display: flex; justify-content: center; align-items: center; }
  }

  .dot-button {
    background: none; border: none; cursor: pointer; padding: 4px;

    .dot { display: block; width: 8px; height: 8px; border-radius: 50%; background: var(--color-dark-20); }
    &.active .dot { background: var(--color-primary-blue); }
    &:hover:not(.active) .dot { background: var(--color-primary-blue); }
  }
  
</style>
