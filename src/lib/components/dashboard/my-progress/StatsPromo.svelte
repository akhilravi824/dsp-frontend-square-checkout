<script lang="ts">
  import CircleProgress from '$lib/components/system/CircleProgress.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import type { SingleLevel } from '$lib/stores/levels';
  import { getLastUncompletedUnit } from '$lib/utils/progress';

  interface Props {
    level: SingleLevel;
  }

  const { level }: Props = $props();
  const id = $derived(level.levelId);
  const totalLessons = $derived(level.stats.totalLessons);
  const completedLessons = $derived(level.stats.completedLessons);
  const lastUncompletedUnit = $derived(getLastUncompletedUnit(level));

  let promoHovered = $state(false);

  function onPreviewFocus() {
    promoHovered = true;
  }

  function onPreviewBlur() {
    promoHovered = false;
  }
</script>

<div
  aria-hidden="true"
  aria-roledescription="level promo"
  class="stats-promo level-{id} box-rounded:md layout:grid"
  onmouseenter={onPreviewFocus}
  onmouseleave={onPreviewBlur}
>
  <div>
    <div class="latest-level-progress layout:inline-flex space:d48">
      <CircleProgress progress={completedLessons / totalLessons} />
      <div class="type:label text-color:dark-60">
        <div>Level progress</div>
        <div>{completedLessons}/{totalLessons}</div>
      </div>
    </div>
    <div class="space:d24">
      <h3 class="type:h3-medium">Level {id}</h3>
      <div class="type:h3">{level.title}</div>
    </div>
    <div class="continue-button">
      <Button
        alignment="left"
        hovered={promoHovered}
        href={`/levels/${id}/units/${lastUncompletedUnit.unitId}`}
        icon={ICONS.PLAY}
      >
        <span>Continue</span>
      </Button>
    </div>
  </div>

  <div class="thumbnail-wrapper layout:inline-flex">
    <div class="thumbnail">
      {#if level.image && level.image.url}
        <img alt={level.title || ''} src={level.image.url} />
      {:else}
        <img alt="" src="/images/level-hand-lesson-1.png" />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .stats-promo {
    padding: var(--space-d60);
    --grid-columns-amount: 2;
  }

  .level-1 {
    background: var(--color-theme-1-gradient-bg);
    --btn-fill: var(--color-spot-1);

    :global {
      .progress-bar {
        --progress-color: var(--color-spot-1);
      }
    }
  }

  .level-2 {
    background: var(--color-theme-2-gradient-bg);
    --btn-fill: var(--color-spot-2);

    :global {
      .progress-bar {
        --progress-color: var(--color-spot-2);
      }
    }
  }

  .level-3 {
    background: var(--color-theme-3-gradient-bg);
    --btn-fill: var(--color-spot-3);

    :global {
      .progress-bar {
        --progress-color: var(--color-spot-3);
      }
    }
  }

  .level-4 {
    background: var(--color-theme-4-gradient-bg);
    --btn-fill: var(--color-spot-1);

    :global {
      .progress-bar {
        --progress-color: var(--color-spot-1);
      }
    }
  }

  .level-5 {
    background: var(--color-theme-5-gradient-bg);
    --btn-fill: var(--color-spot-3);

    :global {
      .progress-bar {
        --progress-color: var(--color-dark-100);
      }
    }
  }

  .latest-level-diagram {
    place-self: center;
  }

  .latest-level-progress {
    --gap: var(--space-d12);
  }

  .circle-progress-wrapper {
    --inline-justify: center;
    height: 100%;
  }

  .thumbnail-wrapper {
    --inline-justify: flex-end;
  }

  .thumbnail {
    width: 300px;

    img {
      width: 100%;
      height: 100%;
    }
  }
</style>
