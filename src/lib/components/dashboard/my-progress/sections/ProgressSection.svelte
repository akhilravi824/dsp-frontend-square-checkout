<script lang="ts">
  import { ICONS } from '$lib/components/system/icons/types';
  import CircleStackedProgress from '$lib/components/dashboard/my-progress/CircleStackedProgress.svelte';
  import { levelsStore, type SingleLevel } from '$lib/stores/levels';
  import LevelBox from '$lib/components/dashboard/my-progress/LevelBox.svelte';

  const { data } = $props();
  let levelsData = $derived($levelsStore);

  function getLevelLabel(level: SingleLevel) {
    if (level.stats.completedLessons === level.stats.totalLessons) {
      return 'Completed';
    }
    if (level.locked) {
      return 'Unlocked after Level ' + (level.levelId - 1);
    }
    return `${level.stats.completedLessons}/${level.stats.totalLessons}`;
  }

  function getLevelIcon(level: SingleLevel) {
    if (level.stats.completedLessons === level.stats.totalLessons) {
      return 'check';
    }
    if (level.locked) {
      return ICONS.LOCK;
    }
    return undefined;
  }

  function keepFirstTwoDigits(num) {
    const numStr = Math.abs(num).toString();
    const firstTwo = numStr.slice(0, 2);
    const result = Number(firstTwo);

    return num < 0 ? -result : result;
  }

  function secondsToTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours === 0) {
      return `${minutes}m ${keepFirstTwoDigits(remainingSeconds)}s`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }
</script>

<div>
  <div class="space:d32 section-header">
    <h1 class="type:h2 space:d12">{data.title}</h1>
    <p class="type:body text-color:dark-60">{data.description}</p>
  </div>

  <div class="progress layout:grid">
    <div class="levels layout:stack">
      {#each levelsData.levels as level (level._id)}
        <LevelBox
          completed={level.stats.completedLessons === level.stats.totalLessons}
          icon={getLevelIcon(level)}
          label={getLevelLabel(level)}
          level={level.levelId}
          progress={level.stats.completedLessons / level.stats.totalLessons}
        />
      {/each}
    </div>
    <div class="layout:stack data-stack">
      <div class="time layout:inline-flex">
        <div class="box box-rounded:md">
          <div class="type:body space:d6">Active days</div>
          <div class="type:h2">
            {levelsData.activeDays.length}
            {levelsData.activeDays.length > 365
              ? levelsData.activeDays.length > 730
                ? 'years'
                : 'year'
              : levelsData.activeDays.length === 1
                ? 'day'
                : 'days'}
          </div>
        </div>
        <div class="box box-rounded:md">
          <div class="type:body space:d6">Total Time spend</div>
          <div class="type:h2">{secondsToTime(levelsData.overallStats.totalTimeSpent)}</div>
        </div>
      </div>
      <div class="box box-rounded:md">
        <div class="type:body">Lessons completed</div>
        <div class="layout:inline-flex circle-progress-wrapper">
          <div class="circle-progress layout:zstack">
            <p class="type:h3">
              {#if levelsData.overallStats.totalCompletedLessons === 0}
                <span class="text-color:dark-60">—</span>
              {:else}
                {levelsData.overallStats.totalCompletedLessons}<span class="text-color:dark-20"
                  >/{levelsData.overallStats.totalLessons}</span
                >
              {/if}
            </p>
            <CircleStackedProgress
              icon={true}
              progress={levelsData.overallStats.completionPercentage / 100}
              size={102}
              strokeWidth={16}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .levels {
    --space: var(--space-d6);
  }

  .box {
    background-color: var(--color-dark-5);
    padding-inline: var(--space-d24);
    padding-block: var(--space-d32);
    flex-grow: 1;
  }

  .progress {
    --grid-columns-amount: 2;
  }

  .time {
    > * {
      flex-grow: 1;
    }
  }

  .data-stack {
    --space: var(--space-d6);
  }

  .circle-progress-wrapper {
    --inline-justify: center;
    height: 100%;
  }

  .circle-progress {
    width: 200px;
    height: 200px;
    place-items: center;
  }
</style>
