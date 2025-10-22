<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { levelsDataStore } from '$lib/stores/levelsDataStore';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  // Route params and state
  let levelId = $derived($page.params.levelId || '1');
  let unitId = $derived(parseInt($page.params.unitId || '1'));
  let highlightedUnitId = $derived((unitId || 1) - 1);
  let isLessonPage = $derived($page.url.pathname.includes('/lessons/'));

  // Level data
  let level = $derived($levelsDataStore.mergedData || { units: [] });
  let units = $derived(level.units || []);

  function selectUnit(index: number) {
    goto(`/levels/${levelId}/units/${index + 1}`, {
      replaceState: false,
      noScroll: true
    });
  }
</script>

{#if $levelsDataStore.isLoaded && units.length > 0 && !isLessonPage}
  <div class="persistent-tabs">
    <div class="tabs type:label-large">
      <div class="tabs-inner">
        {#each units as unit, index (`unit-${index}-${unit.unitId}`)}
          <button class="tab" class:active={index === highlightedUnitId} onclick={() => selectUnit(index)}>
            {#if unit.locked}
              <span class="icon">
                <Icon type={ICONS.LOCK} />
              </span>
            {:else if unit.stats.completedPercentage === 100}
              <span class="icon">
                <Icon type={ICONS.CHECK} />
              </span>
            {/if}
            <span class="copy">Unit</span>
            <span class="number">{unit.unitId}</span>
          </button>
        {/each}
        <div class="background" style="transform: translateX({highlightedUnitId * 68}px)"></div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .persistent-tabs {
    position: fixed;
    top: 30px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    z-index: 100;
    pointer-events: none;
  }

  .tabs {
    display: inline-block;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    background-color: var(--color-dark-10);
    border-radius: 60px;
    backdrop-filter: blur(14px);
    pointer-events: all;

    &-inner {
      display: flex;
      height: 100%;
      padding: 6px;
      gap: 4px;
      position: relative;
    }

    .tab {
      padding: 0 24px;
      display: flex;
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: var(--border-radius-md);
      color: var(--color-dark-60);
      transition: background-color 0.2s ease;
      cursor: pointer;
      justify-content: center;
      width: 64px;
      position: relative;
      z-index: 1;

      .icon,
      .copy {
        width: 0px;
        overflow: hidden;
        transition: 0.3s opacity;
        opacity: 0;
      }

      &:hover:not(.active) {
        background-color: var(--color-dark-10);
      }

      &.active {
        color: var(--color-dark-100);
        width: 120px;
        .icon,
        .copy {
          width: auto;
          margin-right: 6px;
          opacity: 1;
        }
      }
    }
  }

  .background {
    position: absolute;
    border-radius: var(--border-radius-md);
    background-color: var(--color-white-100);
    width: 120px;
    left: 6px;
    top: 6px;
    height: 48px;
    z-index: 0;
    transition: transform 0.2s cubic-bezier(0.34, 1.46, 0.64, 1);
  }
</style>
