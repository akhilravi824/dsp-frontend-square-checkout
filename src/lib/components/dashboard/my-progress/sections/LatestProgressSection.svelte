<script lang="ts">
  import StatsPromo from '$lib/components/dashboard/my-progress/StatsPromo.svelte';
  import { levelsStore } from '$lib/stores/levels';
  import { getLastUncompletedLevel } from '$lib/utils/progress';

  const { data } = $props();

  let levelsData = $derived($levelsStore);
  const level = $derived(getLastUncompletedLevel($levelsStore.levels));
</script>

{#if levelsData.overallStats.totalCompletedLessons > 0}
  <div>
    <div class="space:d32 section-header">
      <h1 class="type:h2 space:d12">{data.title}</h1>
      <p class="type:body text-color:dark-60">{data.description}</p>
    </div>
    <StatsPromo {level} />
  </div>
{/if}
