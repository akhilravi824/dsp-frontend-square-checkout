<script lang="ts">
  import LessonCard from '$lib/components/dashboard/my-progress/LessonCard.svelte';
  import CircleStackedProgress from '$lib/components/dashboard/my-progress/CircleStackedProgress.svelte';
  import { levelsStore } from '$lib/stores/levels';

  const { data } = $props();
  let levelsData = $derived($levelsStore);

  const lessonPracticeLabel = $derived.by(() => {
    if (!levelsData.overallStats.mostLessonWithAttempts.length) {
      return 'No lessons yet to practice yet —start exploring to begin practicing.';
    }
    return 'Practice some of the lessons that you have been struggling with.';
  });

  const averageAttempts = $derived.by(() => {
    if (!levelsData.overallStats.totalAttempts) {
      return 0;
    }
    return Math.round(levelsData.overallStats.averageAttempts * 10) / 10;
  });
</script>

<div>
  <div class="space:d32 section-header">
    <h1 class="type:h2 space:d12">{data.title}</h1>
    <p class="type:body text-color:dark-60">{data.description}</p>
  </div>

  <div class="progress layout:grid">
    <div class="layout:stack data-stack">
      <div class="box box-rounded:md lessons">
        <div class="type:body">Average accuracy</div>
        <div class="layout:inline-flex circle-progress-wrapper">
          <div class="circle-progress layout:zstack">
            <p class="type:h3">
              {levelsData.overallStats.accuracy && levelsData.overallStats.accuracy > 0
                ? Math.ceil(levelsData.overallStats.accuracy) + '%'
                : '—'}
            </p>
            <CircleStackedProgress
              icon={false}
              progress={levelsData.overallStats.accuracy / 100}
              size={100}
              strokeWidth={16}
            />
          </div>
        </div>
      </div>
      <div class="time layout:inline-flex">
        <div class="box box-rounded:md">
          <div class="type:body space:d6">Total attempts</div>
          <div class="type:h2">
            {@html levelsData.overallStats.totalAttempts || '<span class="text-color:dark-60">—</span>'}
          </div>
        </div>
        <div class="box box-rounded:md">
          <div class="type:body space:d6">Avg. attempts</div>
          <div class="type:h2">
            {@html averageAttempts && averageAttempts > 0
              ? averageAttempts
              : '<span class="text-color:dark-60">—</span>'}
          </div>
        </div>
      </div>
    </div>
    <div class="levels box box-rounded:md">
      <div class="type:body space:d24">{lessonPracticeLabel}</div>
      <div class="lessons layout:stack">
        {#each levelsData.overallStats.mostLessonWithAttempts as lesson}
          <LessonCard {lesson} />
        {/each}
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
