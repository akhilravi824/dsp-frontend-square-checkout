<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import CircleProgress from '$lib/components/system/CircleProgress.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  let unitHovered = $state(false);
  let { unit, levelId, previewHovered } = $props<{ unit: any; levelId: string; previewHovered: boolean }>();

  function getUnitUrl() {
    return `/levels/${levelId}/units/${typeof unit === 'object' ? unit.unitId : unit}`;
  }

  function onUnitHover() {
    unitHovered = true;
  }

  function onUnitLeave() {
    unitHovered = false;
  }
</script>

<a
  href={getUnitUrl()}
  class="unit"
  class:highlighted={previewHovered}
  onmouseenter={onUnitHover}
  onmouseleave={onUnitLeave}
>
  <div class="unit-inner">
    <p class="space:d6 type:h4">Unit {typeof unit === 'object' ? unit.unitId : unit}</p>
    <p class="type:body space:d32 text-color:dark-60">{unit.title}</p>
    {#if unit.stats.completedLessons === unit.stats.totalLessons}
      <div class="unit-status unit-finished">
        <Button iconPosition="before" size="small" hovered={unitHovered} icon={ICONS.CHECK}>
          <span>Completed</span>
        </Button>
      </div>
    {:else if unit.locked}
      <div class="unit-status unit-lock layout:inline-flex">
        <Icon type={ICONS.LOCK} />
        <span class="type:label locked-warning">Finish previous units</span>
      </div>
    {:else if unit.stats && unit.stats.totalLessons > 0}
      <div class="unit-status unit-progress layout:inline-flex">
        <CircleProgress
          size={24}
          strokeWidth={4}
          color="var(--btn-fill)"
          progress={unit.stats.completedLessons / unit.stats.totalLessons}
        />
        <p class="type:label text-color:dark-60">{unit.stats.completedLessons}/{unit.stats.totalLessons}</p>
      </div>
    {/if}
  </div>
</a>

<style lang="scss">
  .unit {
    //grid-column: span 3 / auto;
    padding: 28px 28px 16px 0;
    //border-radius: var(--border-radius-lg);
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: currentColor;
    align-items: flex-start;
    position: relative;

    .unit-inner {
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      height: 100%;
    }

    &:before {
      position: absolute;
      content: '';
      background: var(--_background);
      inset: 0 -16px 0 -16px;
      z-index: 1;
      border-radius: var(--border-radius-lg);
      transition: background 0.2s;
    }

    .unit-status {
      margin-top: auto;
      --inline-align: center;
    }

    &.highlighted {
      --_background: var(--unit-background, var(--color-white-30));
      //background: var(--color-white-30);
    }

    &:hover {
      --_background: var(--unit-background-hover, var(--color-white-100));

      .unit-lock .locked-warning {
        opacity: 1;
        transform: translateX(0);
      }

      .unit-finished {
        --btn-fill: var(--color-approved);

        :global(.button.primary) {
          --icon-color: var(--color-white-100);
        }
      }
    }

    .unit-progress {
      --gap: 8px;
    }

    .unit-lock {
      --size: 20px;
      --icon-color: var(--color-dark-60);
      --gap: 6px;
      --inline-align: center;

      .locked-warning {
        opacity: 0;
        transform: translateX(-10px);
        transition:
          opacity 0.2s,
          transform 0.3s;
        flex-shrink: 0;
      }
    }

    .unit-finished {
      --icon-size: 16px;
      --btn-fill: var(--unit-completed-icon-bg);

      :global(.button.primary) {
        --icon-color: var(--color-dark-100);
      }
    }
  }
</style>
