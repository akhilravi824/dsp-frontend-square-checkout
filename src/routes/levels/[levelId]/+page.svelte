<script lang="ts">
  import { fade, crossfade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { userProfile } from '$lib/stores/userProfile';

  import { findCurrentLesson } from '$lib/utils/lessonSelection';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import CircleProgress from '$lib/components/system/CircleProgress.svelte';
  import { getCurrentUnitAccuracy, getCurrentUnitProgress } from '$lib/utils/progress';
  import LessonButton from '$lib/components/levels/LessonButton.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import { levelsDataStore } from '$lib/stores/levelsDataStore';
  import ModalLogout from '$lib/components/system/ModalLogout.svelte';
  import FreeTriesButton from '$lib/components/levels/FreeTriesButton.svelte';
  import { showError } from '$lib/stores/toastStore';

  const unitId = $derived(parseInt($page.params.unitId || '1'));
  const highlightedUnitIndex = $derived(unitId - 1);
  const level = $derived($levelsDataStore.mergedData || {});
  const unit = $derived(level.units?.[highlightedUnitIndex] || { lessons: [] });

  let currentLesson: any = $state(null);
  let currentLessonUnitIndex: number = $state(-1);

  // Detect warning param
  $effect(() => {
    const warningParam = $page.url.searchParams.get('warning');
    if (warningParam === 'locked') {
      console.log('WARNING: Attempting to access a locked lesson. User redirected.');
      showError('Lesson is locked', 5000);
    }
  });

  // Replace the complex effect with a simpler one using our utility
  $effect(() => {
    const result = findCurrentLesson(level);
    currentLesson = result.currentLesson;
    currentLessonUnitIndex = result.currentLessonUnitIndex;
  });

  let isLoggingOut = $state(false);

  const loading = $derived(!level || !Object.keys(level).length);

  const [send, receive] = crossfade({
    duration: 300,
    fallback(node) {
      return {
        duration: 300,
        css: (t) => `opacity: ${t}`
      };
    }
  });

  function handleClose() {
    isLoggingOut = false;
  }
</script>

<main>
  <ModalLogout {isLoggingOut} on:close={handleClose} />
  {#if loading}
    <p>Loading level...</p>
  {:else}
    <div class="top-bar">
      <div class="action">
        <Button href={`/dashboard`} noAnimation icon={ICONS.CLOSE} iconPosition="before" variant="secondary" />

        <div class="action-info type:label">
          {#if $userProfile?.square_subscription_id === null}
            <FreeTriesButton triesLeft={$levelsDataStore.apiData.freeTries} />
          {:else if level.stats.completedPercentage === 100}
            <span class="label">
              <Icon type={ICONS.CHECK} /> Level Completed
            </span>
          {:else if level.locked}
            <span class="label"><Icon type={ICONS.LOCK} /> Unlocked after Level {level.levelId - 1}</span>
          {:else}
            <span class="label">
              <CircleProgress
                strokeWidth={6}
                size={36}
                progress={level.stats.completedLessons / level.stats.totalLessons}
              />
              <div>
                <div>Level Progress</div>
                <div>
                  {level.stats.completedLessons}/{level.stats.totalLessons}
                </div>
              </div>
            </span>
          {/if}
        </div>
      </div>
      <div class="center"></div>
      <div class="profile">
        <button class="sign-out" onclick={() => (isLoggingOut = true)}>Log Out</button>
      </div>
    </div>

    <div class="top">
      <div class="layout:max-width layout:grid layout:max-width">
        <div class="copy">
          <h1 class="title type:h3-medium">Level {level.levelId}</h1>
          <p class="description type:h3">{level.title}</p>
          {#if !level.locked}
            <div class="button-next">
              {#if currentLesson}
                <Button
                  href={`/levels/${level.levelId}/units/${currentLessonUnitIndex + 1}/lessons/${currentLesson.id}`}
                  icon={ICONS.PLAY}
                  iconPosition="after"
                  noAnimation
                >
                  {#if level.stats.completedPercentage === 100}
                    <span>Practice again</span>
                  {:else if level.units[0].lessons[0].current || level.stats.completedPercentage === 0}
                    <span>Start now</span>
                  {:else}
                    <span>Continue {level.units[0].lessons[0].current}</span>
                  {/if}
                </Button>
              {/if}
            </div>
          {:else if $userProfile?.square_subscription_id === null && $userProfile?.progress.freeTries === 0}
            <div class="button-next">
              <Button href={`/dashboard/update-subscription`} icon={ICONS.PLAY} iconPosition="after" noAnimation>
                <span>Subscribe to continue</span>
              </Button>
            </div>
          {:else}
            <div class="button-locked">
              <Button icon={ICONS.PLAY} iconPosition="before" disabled>
                <span>Locked</span>
              </Button>
            </div>
          {/if}
        </div>
        {#if level.image}
          <div class="image">
            <img class="img" src={level.image.url} alt={level.image.alt} />
          </div>
        {/if}
      </div>
    </div>

    <div class="unit">
      {#key highlightedUnitIndex}
        <div class="unit-details layout:grid layout:max-width" in:fade={{ duration: 300 }} out:fade={{ duration: 150 }}>
          <div class="unit-title">
            <span class="type:title type:label-large">Unit {unit.unitId} </span>
            <span class="title type:lesson-title">{unit.title}</span>
          </div>
          <div class="unit-progress type:label">
            {#if level?.units?.length > 0}
              {@const progress = getCurrentUnitProgress(level, highlightedUnitIndex)}
              {#if progress.percentage === 100}
                <span class="icon">
                  <Icon type={ICONS.CHECK} />
                </span>
                <span class="progress-text">Completed</span>
              {:else}
                <CircleProgress color="var(--color)" strokeWidth={4} size={24} progress={progress.percentage / 100} />
                {#if progress.completed > 0}
                  <span class="progress-text">{progress.completed}/{progress.total}</span>
                {:else}
                  <span class="progress-text">Unit progress</span>
                {/if}
              {/if}
            {/if}
          </div>
          <div class="unit-accuracy type:label">
            {#if level?.units?.length > 0}
              {@const accuracy = getCurrentUnitAccuracy(level, highlightedUnitIndex)}
              <CircleProgress color="var(--color)" strokeWidth={4} size={24} progress={accuracy.accuracy / 100} />
              {#if accuracy.completedLessons > 0}
                <div class="accuracy-value">{accuracy.accuracy}% Accuracy</div>
              {:else}
                <div class="accuracy-value">Unit accuracy</div>
              {/if}
            {/if}
          </div>
        </div>

        <div class="layout:grid layout:max-width" in:fade={{ duration: 300 }} out:fade={{ duration: 150 }}>
          {#each unit.lessons as lesson, index (`lesson-${index}-${lesson._id}`)}
            <div class="lesson">
              <LessonButton levelId={level.levelId} unitId={unit.unitId} lessonData={lesson}></LessonButton>
            </div>
          {/each}
        </div>
      {/key}
    </div>
  {/if}
  <div class="background"></div>
</main>

<style lang="scss">
  .top-bar {
    display: flex;
    padding: 30px 0;
    align-items: center;

    .action {
      display: flex;
      align-items: center;
      --icon-color: var(--color-dark-60);

      .action-info {
        margin-left: 28px;
        color: var(--color-dark-60);

        .label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      --btn-fill: transparent;
      --btn-fill-hover: var(--color-dark-10);

      :global(.icon) {
        --icon-color: var(--color-dark-60);
      }

      :global(.button:hover .icon) {
        --icon-color: var(--color-dark-100);
      }
    }

    .center {
      flex: 1;
    }
  }

  .top {
    min-height: 400px;

    .copy {
      margin-block-start: 90px;
      grid-column: 1 / span 6;

      .description {
        margin-block-end: 24px;
      }
    }

    .image {
      grid-column: 7 / span 6;

      .img {
        width: 100%;
        transform: translateX(calc(-100% / 24));
      }
    }
  }

  :global(.level-page .top .button-locked .icon) {
    --icon-color: var(--color-dark-20);
  }

  .unit {
    padding-block-end: 100px;
  }

  .unit-details {
    margin-block-end: 32px;
  }

  .unit-title {
    grid-column: 1 / span 3;

    .title {
      color: var(--color-dark-60);
      display: block;
    }
  }

  .unit-progress,
  .unit-accuracy {
    color: var(--color-dark-60);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .unit-progress {
    grid-column: 7 / span 3;
  }

  .unit-accuracy {
    grid-column: 10 / span 3;
  }

  .lesson {
    margin-bottom: 6px;

    &:nth-child(even) {
      grid-column: 7 / span 6;
    }

    &:nth-child(odd) {
      grid-column: 1 / span 6;
    }
  }

  main {
    position: relative;
    z-index: 5;
    padding-inline: 34px;
  }

  .profile .sign-out {
    all: unset;
    text-decoration: underline;
    cursor: pointer;
    color: var(--color-dark-60);
  }

  .background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: -1;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      transform-origin: center center;
      aspect-ratio: 1;

      @media screen and (orientation: portrait) {
        width: auto;
      }

      @media screen and (orientation: landscape) {
        height: auto;
      }
    }
    &::before {
      background: var(--overlay-loader-bg);
      animation: rotate-gradient-1 15s linear infinite;
    }
  }

  @keyframes rotate-gradient-1 {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
</style>
