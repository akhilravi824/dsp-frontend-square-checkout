<script lang="ts">
  import CircleProgress from '$lib/components/system/CircleProgress.svelte';
  import { getTimeSpent } from '$lib/utils/date';

  const { stats } = $props();
</script>

{#snippet summaryItem(label: string, value: number | string, progress: number)}
  <div class="summary-item layout:inline-flex">
    <div class="progress-wrapper layout:zstack">
      <CircleProgress {progress} size={56} strokeWidth={8} />
      {#if value === 0}
        <span class="progress-value type:label-medium text-color:dark-60">-</span>
      {:else}
        <span class="progress-value type:label-medium">{value}</span>
      {/if}
    </div>
    <p class="summary-title type:label text-color:dark-60">{label}</p>
  </div>
{/snippet}

<div class="layout:inline-flex">
  {@render summaryItem(
    'completed lessons',
    stats?.totalCompletedLessons,
    stats?.totalCompletedLessons / stats?.totalLessons
  )}
  {@render summaryItem('completed units', stats?.completedUnits, stats?.completedUnits / stats?.totalUnits)}
  {@render summaryItem('Average accuracy', stats?.accuracy + '%', stats?.accuracy / 100)}
  {@render summaryItem('total hours spent', getTimeSpent(stats?.totalTimeSpent), 0)}
</div>

<style lang="scss">
  .summary-item {
    position: relative;
    --gap: 12px;

    .summary-title {
      max-inline-size: 100px;
    }

    .progress-wrapper {
      place-items: center;
    }
  }
</style>
