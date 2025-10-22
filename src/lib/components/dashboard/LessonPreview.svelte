<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import CircleProgress from '$lib/components/system/CircleProgress.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import type { LevelPage } from '$lib/../types/sanity.types';
  import Unit from '$lib/components/system/dashboard/Unit.svelte';

  const {
    level
  }: {
    level: LevelPage;
  } = $props();
  const units_data = level.units?.map((unit) => unit) || [1, 2, 3, 4];
  let previewHovered = $state(false);
  let isCompleted = $derived(level.locked || level.stats.completedPercentage === 100);
  let isLocked = $derived(level.locked);
  let notStarted = $derived(!level.locked && level.stats.completedLessons === 0);

  function onPreviewFocus() {
    previewHovered = true;
  }

  function onPreviewBlur() {
    previewHovered = false;
  }
</script>

<section
  aria-hidden="true"
  aria-roledescription="lesson preview"
  class="lesson-preview level-theme-{level.levelId}"
  onmouseenter={onPreviewFocus}
  onmouseleave={onPreviewBlur}
  tabindex="-1"
>
  <div class="lesson-preview-background"></div>
  <div class="lesson-preview-inner layout:stack">
    <div class="layout:grid">
      <div class="lesson-preview-header">
        {#if level.locked && level.levelId > 1}
          <div class="level-locked space:d56 layout:inline-flex">
            <Icon type={ICONS.LOCK} />
            <span class="type:label text-color:dark-60">Unlocked after Level {level.levelId - 1}</span>
          </div>
        {:else if level.stats.completedLessons === level.stats.totalLessons}
          <div class="level-finished space:d56 layout:inline-flex">
            <Icon type={ICONS.CHECK} />
            <p class="text-color:dark-60 type:label">Level completed</p>
          </div>
        {:else}
          <div class="level-progress space:d56 layout:inline-flex">
            <CircleProgress
              color="var(--btn-fill)"
              progress={level.stats.completedLessons / level.stats.totalLessons}
            />
            <p class="type:label text-color:dark-60">
              <span>Level Progress</span>
              <span>{level.stats.completedLessons}/{level.stats.totalLessons}</span>
            </p>
          </div>
        {/if}
        <h2 class="type:h3-medium">Level {level.levelId || '1'}</h2>
        <p class="type:h3 space:d24">{level.title || 'Foundations, Interactions & Basic Questions'}</p>
        <Button
          href={`/levels/${level.levelId}`}
          hovered={previewHovered}
          icon={isCompleted || isLocked || notStarted ? ICONS.ARROW_FORWARD : ICONS.PLAY}
          iconPosition="after"
        >
          {#if isCompleted || isLocked || notStarted}
            <span>See details</span>
          {:else}
            <span>Continue</span>
          {/if}
        </Button>
      </div>
      <div class="lesson-visual-image">
        {#if level.image && level.image.url}
          <img alt={level.title || ''} src={level.image.url} />
        {:else}
          <img alt="" src="/images/level-hand-lesson-1.png" />
        {/if}
      </div>
    </div>
    <div class="unit-list layout:inline-flex">
      {#each units_data as unit (typeof unit === 'object' ? unit._id : unit)}
        <Unit {unit} levelId={level.levelId} {previewHovered} />
      {/each}
    </div>
  </div>
</section>

<style lang="scss">
  .lesson-preview {
    position: relative;

    &.level-theme-1 {
      --preview-background: var(--color-theme-1-gradient-bg);
      --btn-fill: var(--color-spot-1);
      --btn-disabled-fill: var(--color-theme-1-disabled);
      --unit-completed-icon-bg: #c0d1ef;
      //--btn-fill-hover: var(--color-spot-1);
    }

    &.level-theme-2 {
      --preview-background: var(--color-theme-2-gradient-bg);
      --btn-fill: var(--color-spot-2);
      --btn-disabled-fill: var(--color-theme-2-disabled);
      --unit-completed-icon-bg: #cecaeb;
    }

    &.level-theme-3 {
      --preview-background: var(--color-theme-3-gradient-bg);
      --btn-fill: var(--color-spot-3);
      --btn-disabled-fill: var(--color-theme-3-disabled);
      --unit-completed-icon-bg: #c2e4da;
    }

    &.level-theme-4 {
      --preview-background: var(--color-theme-4-gradient-bg);
      --btn-fill: var(--color-spot-1);
      --btn-disabled-fill: var(--color-theme-4-disabled);
      --unit-completed-icon-bg: #e9dcb3;
    }

    &.level-theme-5 {
      --preview-background: var(--color-theme-5-gradient-bg);
      --btn-fill: var(--color-spot-3);
      --btn-disabled-fill: var(--color-theme-5-disabled);
      --unit-completed-icon-bg: #e1beac;
    }

    &:hover {
      .level-locked span {
        opacity: 1;
      }
    }
  }

  .unit-list {
    --gap: 36px;
    --inline-align: stretch;

    & > :global(*) {
      //flex: 1;
      flex-basis: calc((100% - 36px * 3) / 4);
    }
  }

  .lesson-preview-background {
    position: absolute;
    inset: 0 -60px;
    background: var(--preview-background, --color-theme-1-base);
    z-index: 1;
    border-radius: var(--border-radius-lg);
  }

  .lesson-preview-inner {
    position: relative;
    z-index: 5;
    padding-block: 0 44px;
  }

  .lesson-preview-header {
    grid-column: 1 / span 5;
  }

  .lesson-visual-image {
    grid-column: 6 / span 7;
  }

  .level-locked {
    --icon-size: 20px;
    --icon-color: var(--color-dark-60);
    --inline-align: center;
    padding-block-start: 60px;

    span {
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  .level-finished {
    --icon-size: 16px;
    padding-block-start: 60px;
  }

  .level-progress {
    --gap: 8px;
    padding-block-start: 60px;

    span {
      display: block;
    }
  }
</style>
