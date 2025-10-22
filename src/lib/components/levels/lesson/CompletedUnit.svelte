<script lang="ts">
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { ICONS } from '$lib/components/system/icons/types';
  import Button from '$lib/components/system/Button.svelte';

  // Props (expect full nextItems object)
  type NextItems = {
    nextLesson?: any;
    nextLevel?: { levelId: number };
    nextUnit?: { unitId: number };
  };
  const { nextItems } = $props<{ nextItems: NextItems }>();

  // Make param-derived values reactive
  const levelId = $derived(() => $page.params.levelId);
  const currentUnitId = $derived(() => $page.params.unitId);

  // Reactive success type
  const typeSuccess = $derived(nextItems?.nextUnit ? 'unit' : levelId ? 'level' : 'course');

  const nextUnitHref = $derived(() =>
    nextItems?.nextUnit && nextItems?.nextLevel
      ? `/levels/${nextItems.nextLevel.levelId}/units/${nextItems.nextUnit.unitId}`
      : null
  );

  const nextLevelHref = $derived(() => (levelId ? `/levels/${parseInt(levelId, 10) + 1}` : null));
</script>

<div class="completed-unit" transition:fade={{ duration: 300, delay: 0 }}>
  <div class="wrapper">
    <img class="image" src="/images/checkmark-big.svg" alt="Completed" />
    {#if typeSuccess === 'unit'}
      <div class="main"></div>
      <h1 class="title type:h3-medium" transition:fade={{ duration: 400 }}>
        You've completed Unit {currentUnitId}!
      </h1>
      <p class="copy type:h3">Way to go! You're making great progress on your ASL journey. Keep going!</p>
      {#if nextUnitHref}
        <Button icon={ICONS.PLAY} alignment="center" iconPosition="after" href={nextUnitHref}>
          <span>Continue</span>
        </Button>
      {/if}
    {:else if typeSuccess === 'level'}
      <div class="main"></div>
      <h1 class="title type:h3-medium" transition:fade={{ duration: 400 }}>
        You've completed Level {levelId}!
      </h1>
      <p class="copy type:h3">Way to go! You're making great progress on your ASL journey. Keep going!</p>
      {#if nextLevelHref}
        <Button icon={ICONS.PLAY} alignment="center" iconPosition="after" href={nextLevelHref}>
          <span>Continue</span>
        </Button>
      {/if}
    {:else}
      <div class="main"></div>
      <h1 class="title type:h3-medium" transition:fade={{ duration: 400 }}>You've completed all levels!</h1>
      <p class="copy type:h3">Way to go!</p>
    {/if}
  </div>
</div>

<style lang="scss">
  .completed-unit {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: center;

    .wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .main {
      margin: 45px 0 60px;
    }

    .image {
      width: 360px;
      height: auto;
    }

    .title {
      margin-bottom: 0.5rem;
    }

    .copy {
      color: var(--color-dark-60);
      max-width: 470px;
      margin-bottom: 74px;
    }
  }
</style>
