<script lang="ts">
  import LessonPreview from '$lib/components/dashboard/LessonPreview.svelte';
  import ProgressSummaryBar from '$lib/components/dashboard/my-progress/ProgressSummaryBar.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import type { LevelPage } from '$lib/../types/sanity.types';
  import { levelsStore } from '$lib/stores/levels';
  import { calculateOverallStats } from '$lib/utils/progress';
  import { userProfile } from '$lib/stores/userProfile';
  import RichText from '$lib/components/system/RichText.svelte';
  import { capitalizeFirstLetter, replaceDynamicContent } from '$lib/utils/copy';
  import LessonCtaManager from '$lib/components/dashboard/LessonCtaManager.svelte';

  const { data } = $props<{ data: PageData }>();
  let levelsData = $derived($levelsStore);
  let overallStats = $state<ReturnType<typeof calculateOverallStats> | null>(null);

  $effect(() => {
    if (!levelsData || levelsData.levels.length === 0) {
      levelsData.levels = data.levels as LevelPage[];
    }
  });

  onMount(async () => {
    overallStats = calculateOverallStats(levelsData);
  });
</script>

<div class="page-dashboard">
  <section class="dashboard-header space:d80">
    <div class="layout:max-width layout:grid header-wrapper">
      <div class="user-welcome-message">
        {#if $userProfile?.name}
          <RichText
            copy={replaceDynamicContent(
              data.page.welcomeMessage,
              'name',
              capitalizeFirstLetter($userProfile?.name.split(' ')[0])
            )}
            bodyTypeClass="type:h2"
          />
        {/if}
      </div>
      <div class="wrapper-cta">
        <LessonCtaManager />
      </div>
    </div>
  </section>

  {#if overallStats && overallStats.totalCompletedLessons > 0}
    <section class="progress-summary-wrapper space:d80">
      <div class="layout:max-width">
        <ProgressSummaryBar stats={overallStats} />
      </div>
    </section>
  {/if}

  <section class="lessons-gate">
    <div class="layout:max-width layout:stack">
      {#if levelsData && levelsData.levels.length > 0}
        {#each levelsData.levels as level (level._id)}
          <LessonPreview {level} />
        {/each}
      {:else}
        <p class="type:body text-color:dark-60">No lessons are currently available.</p>
      {/if}
    </div>
  </section>
</div>

<style lang="scss">
  .header-wrapper {
    align-items: center;
  }

  .user-welcome-message {
    grid-column: 1 / span 7;

    :global(p) {
      color: var(--color-dark-100);
    }

    :global(strong) {
      color: var(--color-dark-60);
      font-weight: 400;
    }
  }

  .wrapper-cta {
    grid-column: 10 / span 3;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .lessons-gate {
    padding-block-end: 80px;
    --space: 6px;
  }
</style>
