<script lang="ts">
  import { userProfile } from '$lib/stores/userProfile';
  import { levelsStore } from '$lib/stores/levels';
  import { calculateOverallStats, getLastUncompletedLevel, getLastUncompletedUnit } from '$lib/utils/progress';
  import { onMount } from 'svelte';
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  let levelsData = $derived($levelsStore);
  let overallStats = $state<ReturnType<typeof calculateOverallStats> | null>(null);
  let scenarioHovered = $state(false);
  const lastUnlocked = $derived(getLastUncompletedLevel(levelsData.levels));
  const lastUncompletedUnit = $derived(getLastUncompletedUnit(lastUnlocked));

  onMount(async () => {
    overallStats = calculateOverallStats(levelsData);
  });
</script>

{#snippet dashboardScenarioCta(
  type: 'trial' | 'plan',
  title: string,
  description: string,
  cta: string,
  link: string,
  freeTriesLeft: number | null = null
)}
  <a
    class="lesson-cta link:reset box-rounded:lg"
    href={link}
    onmouseenter={() => {
      scenarioHovered = true;
    }}
    onmouseleave={() => {
      scenarioHovered = false;
    }}
  >
    {#if type === 'trial' && typeof freeTriesLeft === 'number'}
      <div class="free-tries-left">
        {#each Array(3) as _, index}
          <div class="tries {index < 3 - freeTriesLeft ? 'active' : ''}"></div>
        {/each}
      </div>
    {:else}
      <p class="type:h4 space:d6">{title}</p>
    {/if}
    <p class="space:d24 type:body text-color:dark-60">{description}</p>
    <Button
      size="small"
      variant="primary"
      icon={freeTriesLeft && freeTriesLeft < 3 ? ICONS.ARROW_FORWARD : ICONS.PLAY}
      iconPosition="after"
      hovered={scenarioHovered}
    >
      {cta}
    </Button>
  </a>
{/snippet}

<!-- Paid planContinue learningCTA links to next lesson in line: Continue: DONE -->
<!-- Paid planNot started: First lesson:  DONE -->
<!-- Free trialNot started: First lesson -->
<!-- Free trial 2 free lessons remaining: Subscribe now -->
<!-- Free trialAll 3 free lessons completed: Subscribe now -->

{#if $userProfile}
  <!-- Paid plan: Not started -->
  {#if overallStats && overallStats.totalCompletedLessons < 1 && $userProfile.has_active_subscription}
    {@render dashboardScenarioCta(
      'plan',
      'Start learning',
      "Let's get started with your first lesson.",
      'First lesson',
      '/levels/1/units/1'
    )}
    <!-- Paid plan: Next lesson in line -->
  {:else if lastUncompletedUnit && lastUnlocked && lastUnlocked.stats.completedLessons < lastUnlocked.stats.totalLessons && $userProfile.has_active_subscription}
    {@render dashboardScenarioCta(
      'plan',
      'Continue learning',
      "Let's get started with your next lesson.",
      'Continue',
      `/levels/${lastUnlocked.levelId}/units/${lastUncompletedUnit.unitId}`
    )}
    <!-- Free trial: Not started -->
  {:else if !$userProfile.has_active_subscription}
    {#if $userProfile.progress.freeTries === 0}
      {@render dashboardScenarioCta(
        'trial',
        'Start learning',
        'Free lessons complete. Subscribe to unlock all.',
        'Subscribe now',
        '/dashboard/update-subscription',
        $userProfile.progress.freeTries
      )}
    {:else if $userProfile.progress.freeTries === 3}
      {@render dashboardScenarioCta(
        'plan',
        'Start learning',
        "Let's get started with your first free lesson.",
        'First lesson',
        '/levels/1/units/1'
      )}
    {:else}
      {@render dashboardScenarioCta(
        'trial',
        'Subscribe now',
        `${levelsData.freeTries} free lessons left – unlock all today!`,
        'Subscribe now',
        '/dashboard/update-subscription',
        $userProfile.progress.freeTries
      )}
    {/if}
  {/if}
{/if}

<style lang="scss">
  .lesson-cta {
    background: var(--color-dark-5);
    padding-inline: 16px;
    padding-block: 24px 16px;
    overflow: hidden;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--color-dark-10);
    }
  }

  .free-tries-left {
    display: flex;
    gap: 4px;
    margin-block-end: 10px;

    .tries {
      width: 10px;
      height: 8px;
      background: var(--color-dark-20);
      border-radius: 8px;

      &.active {
        background: var(--color-dark-100);
      }
    }
  }
</style>
