<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount, getContext, createEventDispatcher } from 'svelte';
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import { userProfile } from '$lib/stores/userProfile';
  import { getNextItems, updateLessonInProgress, mergeAllLevelsData } from '$lib/utils/progress';

  import Header from '$lib/components/levels/lesson/Header.svelte';
  import Sidebar from '$lib/components/levels/lesson/Sidebar.svelte';
  import RecordVideo from '$lib/components/levels/lesson/RecordVideo.svelte';
  import VideoPlayer from '$lib/components/system/VideoPlayer.svelte';

  import { progressApi } from '$lib/api';
  import { currentStepId } from '$lib/stores/lessonStore';
  import { levelsDataStore } from '$lib/stores/levelsDataStore';
  import BigType from '$lib/components/levels/lesson/BigType.svelte';
  import Facts from '$lib/components/levels/lesson/Facts.svelte';
  import Title from '$lib/components/levels/lesson/Title.svelte';
  import CompletedUnit from '$lib/components/levels/lesson/CompletedUnit.svelte';
  import { levelsStore } from '$lib/stores/levels';
  import Modal from '$lib/components/system/Modal.svelte';
  import ModalConsent from '$lib/components/system/ModalConsent.svelte';
  import { goto } from '$app/navigation';

  const dispatch = createEventDispatcher();
  const { data } = $props<{ data: PageData }>();
  const { lesson } = data;

  if (!data || !lesson) {
    goto('/404');
  }

  // Reactive route params
  const levelId = $derived($page.params.levelId);
  const unitId = $derived(parseInt($page.params.unitId, 10));
  const lessonId = $derived($page.params.lessonId);

  // Core reactive data
  let level = $derived($levelsDataStore.mergedData || {});
  let progressData = $derived($levelsDataStore.apiData || {});
  let loading = $derived(!$levelsDataStore.isLoaded);

  // Current lesson (reactive)
  const currentLesson = $derived(() => {
    const units = level?.units;
    if (!units || !unitId || unitId < 1) return {};
    return units[unitId - 1]?.lessons?.find((l) => l.id === lessonId) || {};
  });

  // Make every value that depends on unitId a $derived so it updates when unitId changes
  const unitStats = $derived(() => {
    return level?.units?.[unitId - 1]?.stats || { completedLessons: 0, totalLessons: 1 };
  });

  const lastLessonToComplete = $derived(() => unitStats.completedLessons >= unitStats.totalLessons - 1);

  const nextItems = $derived(() => {
    if (!level?.units) return { nextLesson: null, nextLevel: null, nextUnit: null };
    return getNextItems(level, data.levelId, data.unitId, data.lesson.id);
  });

  const nextLesson = $derived(() =>
    nextItems().nextLesson
      ? `/levels/${nextItems().nextLevel.levelId}/units/${nextItems().nextUnit.unitId}/lessons/${nextItems().nextLesson.id}`
      : ''
  );

  const nextLessonLink = $derived(nextLesson());

  let instructionsMode = checkInstructionsMode();

  let contentDiv: HTMLElement | null = $state(null);
  let sidebarOpen = $state(instructionsMode);
  let currentStep = $state(0);
  let currentProgress = $state(0.1);
  let isConsentVideos = $state(false);

  let instructionVideoPlayer: VideoPlayer | null = $state(null);
  let recordVideoComponent: RecordVideo | null = $state(null);

  const baseTerminalSteps = [
    { id: 'submitting', title: '' },
    { id: 'success', title: '' },
    { id: 'success-unit', title: '' },
    { id: 'error', title: '' }
  ];

  const stepsInstructions = [
    { id: 'camera', title: '' },
    { id: 'position', title: 'Adjust your position' },
    { id: 'instructor', title: 'Follow Instructor to practice' },
    { id: 'ready', title: 'When ready, record' },
    { id: 'review', title: 'Great job on recording' }
  ];

  const stepsLesson = [
    { id: 'ready', title: 'Practice and record signing' },
    { id: 'review', title: 'Review and submit' }
  ];

  const steps = $derived((instructionsMode ? stepsInstructions : stepsLesson).concat(baseTerminalSteps));
  currentStepId.set(steps[currentStep].id);

  $effect(() => {
    if (steps[currentStep]) currentStepId.set(steps[currentStep].id);
  });

  // Enhanced synchronization tracking with simplified implementation
  let isSyncingVideos = false;
  let lastSyncData = { timestamp: 0, id: '' };
  const SYNC_DEBOUNCE_MS = 500;

  /**
   * Universal sync handler that works for both directions
   * @param source Source of the sync event ('instruction' or 'recording')
   * @param target Target to sync to ('instruction' or 'recording')
   * @param action Action to perform ('play', 'pause', 'seek', 'restart')
   * @param time Time to seek to (if applicable)
   */
  function syncVideos(source: string, target: string, action: string, time?: number) {
    // Special case: allow restart action regardless of current step
    const isRestartAction = action === 'restart';

    // Skip if already syncing or components aren't ready
    // Modified to allow restart action in any step
    if (isSyncingVideos || (!isRestartAction && $currentStepId !== 'review')) return false;

    // Create a unique ID for this sync event
    const syncId = `${source}:${target}:${action}:${time?.toFixed(3) || ''}`;
    const now = Date.now();

    // Skip if this is a duplicate event (same action within debounce time)
    if (syncId === lastSyncData.id && now - lastSyncData.timestamp < SYNC_DEBOUNCE_MS) {
      console.log(`Skipping duplicate sync: ${syncId}`);
      return false;
    }

    lastSyncData = { timestamp: now, id: syncId };

    try {
      isSyncingVideos = true;

      if (target === 'recording' && recordVideoComponent) {
        recordVideoComponent.handleSyncEvent({ action, time, source });
        return true;
      } else if (target === 'instruction' && instructionVideoPlayer) {
        switch (action) {
          case 'play':
            instructionVideoPlayer.playVideo();
            break;
          case 'pause':
            instructionVideoPlayer.pauseVideo();
            break;
          case 'seek':
            if (typeof time === 'number') instructionVideoPlayer.seekVideo(time);
            break;
          case 'restart':
            instructionVideoPlayer.restart();
            break;
        }
        return true;
      }
    } catch (err) {
      console.error(`Error syncing ${target} video:`, err);
      return false;
    } finally {
      isSyncingVideos = false;
    }

    return false;
  }

  const handleInstructionVideoPlay = () => syncVideos('instruction', 'recording', 'play');
  const handleInstructionVideoPause = () => syncVideos('instruction', 'recording', 'pause');
  const handleInstructionVideoSeeked = (event: CustomEvent) =>
    syncVideos('instruction', 'recording', 'seek', event.detail.currentTime);

  function handleSyncInstructionVideo(event: CustomEvent) {
    const { action, time, source } = event.detail;
    syncVideos('recording', 'instruction', action, time);
  }

  // Split into two separate effects with clear, focused purposes
  $effect(() => {
    // First effect only for data loading
    if ($levelsDataStore.isLoaded) {
      level = $levelsDataStore.mergedData;
      progressData = $levelsDataStore.apiData;
    }
  });

  // Second effect dedicated just to step changes
  $effect(() => {
    if (steps && steps[currentStep]) {
      currentStepId.set(steps[currentStep].id);
    }

    // Open sidebar when changing to error
    if ($currentStepId === 'success' || $currentStepId === 'error') {
      toggleSidebar(true);
    }
  });

  onMount(() => {
    if ($levelsDataStore.isLoaded) {
      level = $levelsDataStore.mergedData;
      progressData = $levelsDataStore.apiData;
    }

    console.log('Page URL parameters:', {
      levelId,
      unitId,
      lessonId
    });
  });

  function checkInstructionsMode() {
    if ($levelsDataStore.mergedData.stats.completedLessons === 0 && $levelsDataStore.mergedData.levelId === 1) {
      return true;
    } else {
      return false;
    }
  }

  function progress(step: number) {
    currentProgress = step === 0 ? 0.1 : (step + 1) / steps.length;
  }

  function onPreviousStep() {
    if (currentStep > 0) {
      currentStep--;
      progress(currentStep);
    }
  }

  function onNextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      progress(currentStep);
    }
  }

  function toggleSidebar(isOpen: boolean) {
    sidebarOpen = isOpen;
  }

  function updateLesson(complete: boolean, timeSpent: number) {
    if (currentLesson().locked) return false;
    const ids = { levelId, unitId, lessonId };
    const updateProps = { complete, timeSpent };

    try {
      const progressData = JSON.parse(JSON.stringify($levelsDataStore.apiData));
      let updatedProgressData = updateLessonInProgress(progressData, ids, updateProps);
      const updatedJson = { ...updatedProgressData };
      delete updatedJson.default;
      updatedProgressData = updatedJson;

      const subscription_id = $userProfile?.square_subscription_id;
      const freeTriesLeft = $levelsDataStore.apiData.freeTries;
      const triesleft = subscription_id === null && freeTriesLeft === 1 && complete ? false : true;
      const lockRest = (subscription_id === null && freeTriesLeft === 0) || !triesleft ? true : false;
      const units = subscription_id !== null ? $userProfile?.signup_data.units : '';
      let updatedMergedData = mergeAllLevelsData(data, updatedProgressData, units, lockRest);
      updatedMergedData = updatedMergedData.find((l) => l.levelId.toString() === levelId.toString());

      // Update store all at once to minimize re-renders
      levelsDataStore.update((state) => ({
        ...state,
        apiData: updatedProgressData,
        mergedData: updatedMergedData,
        isLoaded: true
      }));
      levelsStore.set(updatedProgressData);
      $userProfile.progress = updatedProgressData;

      progressApi
        .updateProgress({ progress: updatedProgressData })
        .then((response) => {
          console.log('Lesson progress updated:', response);
        })
        .catch((error) => {
          console.error('Error updating lesson progress:', error);
        });

      return updatedProgressData;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  }

  function handleContinue() {
    onNextStep();
  }

  function handlePrevious() {
    onPreviousStep();
  }

  async function handleSubmit() {
    try {
      // Set state to submitting first
      gotoStep('submitting');

      // Check if component exists before trying to call its method
      if (!recordVideoComponent) {
        console.error('Record video component not found');
        gotoStep('error');
        return;
      }

      const result = await recordVideoComponent.uploadSubmit();

      // Improved result handling with detailed logging
      if (result && result.success === true) {
        console.log('Video upload successful, transitioning to success state');
        gotoStep('success');
      } else {
        console.error('Video upload failed:', result?.error || 'Unknown error');
        gotoStep('error');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      gotoStep('error');
    }
  }

  /**
   * Navigate to a specific step by ID
   * @param stepId - The ID of the step to navigate to (e.g. 'error', 'success', 'submitting')
   */
  function gotoStep(stepId: string) {
    // Update lesson
    if (stepId === 'success') {
      updateLesson(true, lesson.video?.duration || 5);
    } else if (stepId === 'error') {
      updateLesson(false, lesson.video?.duration || 5);
    }

    // Show success unit page when next unit is available
    if (
      (nextItems.nextUnit === null || (nextItems.nextUnit && nextItems.nextUnit.unitId > unitId)) &&
      stepId === 'success' &&
      lastLessonToComplete()
    ) {
      stepId = 'success-unit';
    }

    // Find the index of the requested step in the steps array
    const stepIndex = steps.findIndex((step) => step.id === stepId);

    if (stepIndex !== -1) {
      // Update state
      currentStep = stepIndex;
      currentStepId.set(stepId);
      progress(currentStep, steps.length);
      console.log(`Navigated to ${stepId} state at index:`, stepIndex);
    } else {
      console.error(`Step with ID "${stepId}" not found in steps array`);
    }
  }

  // Guard locked lesson redirect (reactive)
  $effect(() => {
    if (currentLesson().locked) {
      goto(`/levels/${levelId}/units/${unitId}/?warning=locked`);
    }
  });
</script>

{#snippet debug()}
  <div class="debug">
    <!-- WIP remove this debug panel -->
    <!-- <div class="step-indicator title-holder">Step [{currentStep}] {$currentStepId}</div>
    <div style="display: flex;align-items: center; text-align: center; margin-bottom: 6px;">
      {#if currentStep > 0}
        <button onclick={onPreviousStep}>Previous</button>
      {/if}
      {#if currentStep < steps.length - 1}
        <button onclick={onNextStep}>Next</button>
      {/if}
    </div> -->
    <div>
      <button onclick={() => gotoStep('error')}>Error</button>
      <button onclick={() => gotoStep('success')}>Success</button>
    </div>
    <!-- <div class="button" style="margin-top: 20px;">
      <button onclick={() => updateLesson(true, 88)}>Complete</button>
      <button onclick={() => updateLesson(false, 88)}>Uncomplete</button>
    </div> -->
  </div>
{/snippet}

{#snippet btnNext(variant: any = 'primary')}
  {#if $userProfile?.square_subscription_id || ($levelsDataStore.apiData.freeTries > 0 && !$userProfile?.square_subscription_id)}
    <Button
      class="next"
      href={nextLessonLink}
      icon={ICONS.PLAY}
      iconPosition="after"
      {variant}
      hovered
      alignment="left"
    >
      <span>Next lesson</span>
    </Button>
  {/if}
{/snippet}

{#if instructionsMode}
  <ModalConsent {isConsentVideos} nextLesson={nextLessonLink}></ModalConsent>
{/if}

{#snippet btnModalNext(variant: any = 'primary')}
  <Button
    class="next"
    onclick={() => (isConsentVideos = true)}
    icon={ICONS.PLAY}
    iconPosition="after"
    {variant}
    hovered
    alignment="left"
  >
    <span>Next lesson</span>
  </Button>
{/snippet}

{#snippet btnsSuccessTrialEnded()}
  <Button
    class="next"
    href={'/dashboard/update-subscription'}
    iconPosition="after"
    variant={'primary'}
    hovered
    alignment="left"
  >
    <span>Subscribe to continue</span>
  </Button>

  <Button class="back-to-level" href={'/levels/1'} iconPosition="after" variant={'primary'} hovered alignment="left">
    <span>Back to Level 1</span>
  </Button>
{/snippet}

{#snippet btnsError()}
  <Button onclick={() => gotoStep('ready')} icon={ICONS.RETRY} iconPosition="after" hovered alignment="left">
    <span>Try again</span>
  </Button>
  {#if nextLessonLink && $userProfile?.square_subscription_id !== null}
    {@render btnNext('secondary')}
  {/if}
{/snippet}

{#snippet btnsReview()}
  <Button noAnimation icon={ICONS.ARROW_FORWARD} iconPosition="after" alignment="center" onclick={handleSubmit}>
    <span>Check my sign</span>
  </Button>
  <button class="restart type:label" onclick={handlePrevious}>Start new recording</button>
{/snippet}

<div class="lesson-page state-{$currentStepId}">
  {#if currentLesson().locked}
    <Modal onClose={() => {}} open={() => {}} modalClass="error">
      <div class="error-wrapper">
        <div class="inner">
          <h3 class="title type:h4">Lesson locked</h3>
          <p class="copy type:body">This lesson is locked. Start the next unlocked lesson to continue.</p>
          <a class="btn-error type:label-large" href="/levels/{levelId}">Go to Level {levelId}</a>
        </div>
      </div>
    </Modal>
  {/if}
  <div class="color-layer"></div>
  {#if !loading}
    <div class="page">
      <div class="content-wrapper">
        <Header
          {onPreviousStep}
          progress={currentProgress}
          openSidebar={() => toggleSidebar(true)}
          {sidebarOpen}
          {instructionsMode}
          progressTitle={!instructionsMode ? steps[currentStep].title : ''}
        />

        <div class="content" bind:this={contentDiv}>
          {#if $currentStepId === 'success-unit'}
            <CompletedUnit nextItems={nextItems()}></CompletedUnit>
          {:else}
            <div class="content-inner" out:fade={{ duration: 100 }}>
              <Title {instructionsMode} title={steps[currentStep].title} lessonTitle={lesson.title} {currentStep} />
              <div class="videos-holder" class:disable={$currentStepId === 'submitting'}>
                <BigType type={'back'}></BigType>
                <div
                  class="instruction-video--wrapper"
                  class:camera-step={$currentStepId === 'camera'}
                  class:hide={$currentStepId === 'success'}
                >
                  {#if lesson.video}
                    <VideoPlayer
                      bind:this={instructionVideoPlayer}
                      playerId="instruction-player"
                      playbackId={lesson.video.playbackId || 'Pi4pb1l3xmiJimXqPZRhOK02mdr02JNz000101PxyuSjdHqQ'}
                      aspectRatio={'4:3'}
                      loop={true}
                      autoplay={true}
                      enableSpeedControl={true}
                      speedOptions={{ speeds: [0.5, 1, 1.5, 2], defaultRate: 1 }}
                      on:play={handleInstructionVideoPlay}
                      on:pause={handleInstructionVideoPause}
                      on:seeked={handleInstructionVideoSeeked}
                    />
                  {/if}
                </div>
                <div class="record-video--wrapper" class:hide={$currentStepId === 'success'}>
                  <RecordVideo
                    bind:this={recordVideoComponent}
                    on:continue={handleContinue}
                    on:syncInstructionVideo={handleSyncInstructionVideo}
                    on:syncRecordingVideo={(e) => recordVideoComponent?.handleSyncEvent(e.detail)}
                    duration={lesson.video.duration || 5}
                    {contentDiv}
                  />
                </div>
                <BigType type={'front'}></BigType>
              </div>
              <div class="controls controls-review" class:reveal={$currentStepId === 'review'}>
                {@render btnsReview()}
              </div>
              <div class="controls controls-success" class:reveal={$currentStepId === 'success'}>
                {#if instructionsMode}
                  {@render btnModalNext()}
                {:else if $levelsDataStore.apiData.freeTries === 0 && !$userProfile?.square_subscription_id}
                  {@render btnsSuccessTrialEnded()}
                {:else if nextLessonLink}
                  {@render btnNext()}
                {/if}
              </div>
              <div class="controls controls-error" class:reveal={$currentStepId === 'error'}>
                {@render btnsError()}
              </div>
              <Facts />
            </div>
          {/if}
        </div>
      </div>
      <div class="sidebar-holder" class:open={sidebarOpen}>
        <Sidebar closeSidebar={() => toggleSidebar(false)} data={lesson} />
      </div>
    </div>
  {:else}
    <div class="loading">Loading lesson data...</div>
  {/if}
  <!-- {#if $currentStepId === 'submitting'} -->
  <!-- WIP remove this debug panel -->
  {@render debug()}
  <!-- {/if} -->
</div>

<style lang="scss">
  .lesson-page {
    width: 100%;
    overflow: hidden;

    &.state-submitting,
    &.state-success,
    &.state-success-unit,
    &.state-error {
      .color-layer {
        opacity: 0;
      }
    }

    &.state-submitting,
    &.state-success {
      .content {
        :global(.title .title-holder) {
          transform: translateY(-26vh);
        }

        .videos-holder {
          transform: translateY(calc(-50vh + 50%));
          width: 37%;
          pointer-events: none;
        }

        :global(.title .title-holder .overflow) {
          width: 0%;
          margin-right: 0;
        }

        .instruction-video--wrapper {
          animation: float-up-down 6s ease-in-out infinite;
        }
      }
    }

    &.state-review,
    &.state-error {
      .content {
        :global(.title .title-holder) {
          transform: translateY(-95px);
        }

        .videos-holder {
          width: 66vw;
          transform: translateY(-170px);
        }
      }
    }
  }

  :global(.state-submitting .record-video) {
    animation: float-down-up 6s ease-in-out infinite;
  }

  .color-layer {
    background: var(--color-white-100);
    z-index: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 1;
    transition: opacity 0.3s;
  }

  .page {
    display: flex;
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .content {
    position: relative;
    height: 100%;
  }

  .content-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    flex: 1;
    padding: 6px;
    position: relative;
    height: 100%;
  }

  .videos-holder {
    aspect-ratio: 8/3;
    width: 100%;
    position: relative;
    will-change: width;
    transition:
      0.6s width cubic-bezier(0.4, 0, 0.2, 1),
      0.6s transform cubic-bezier(0.4, 0, 0.2, 1);

    &.disable {
      pointer-events: none;

      :global(.vds-controls) {
        visibility: hidden;
        display: none;
        pointer-events: none !important;
      }
    }
  }

  .controls {
    position: absolute;
    bottom: 59px;
    z-index: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: center;
    align-items: center;
    transform: translateY(75px);
    opacity: 0;
    pointer-events: none;
    transition:
      0.3s opacity ease-out,
      0.3s transform ease-out;
    --btn-fill: var(--color-dark-100);

    &.reveal {
      transform: translateY(0px);
      opacity: 1;
      pointer-events: auto;
    }

    &.controls-success,
    &.controls-error {
      --btn-fill: var(--color);
      flex-direction: row;
      gap: 9px;
    }

    &.controls-error {
      :global(.button.next) {
        --btn-fill: transparent;
      }

      :global(.button.next .btn-icon),
      :global(.button.next .btn-text) {
        background: transparent;
        border: 0;
      }
    }

    &.controls-review {
      --icon-color: red;
    }

    .restart {
      margin-top: 0.8em;
      background: transparent;
      text-decoration: underline;
      color: var(--color-dark-60);
      cursor: pointer;
    }
  }

  .instruction-video--wrapper,
  .record-video--wrapper {
    transition: 0.3s opacity;
    &.hide {
      opacity: 0;
    }
  }
  .instruction-video--wrapper {
    border-radius: var(--border-radius-lg);
    position: absolute;
    left: 0;
    bottom: 0;
    width: calc(50% - 3px);
    aspect-ratio: 4/3;
    background: black;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(0);
    transition:
      transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.4s ease-out;
    transition-delay: 0.1s;

    &.camera-step {
      opacity: 0;
      transform: translateY(50px);
    }
  }

  .record-video--wrapper {
  }

  .sidebar-holder {
    width: 0px;
    transition: width 0.4s ease-out;
    will-change: width;

    &.open {
      width: 300px;
    }
  }

  button {
    border: 0;
  }

  @keyframes rotate360 {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  :global(.state-submitting .video-wrapper) {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;

    &:after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--overlay-loader-bg);
      z-index: 1;
      width: 180%;
      height: 180%;
      left: -40%;
      top: -40%;
      overflow: hidden;

      animation: rotate360 10s linear infinite;
      will-change: transform;
      transform-origin: center center;
    }
  }

  // overwrite modal
  .lesson-page {
    --modal-radius: var(--border-radius-md);
    --modal-padding-inline: 6px;
    --modal-padding-block: 6px;

    :global(.dialog-content) {
      width: 300px;
    }

    :global(.dialog-content .title) {
      color: var(--color-warning);
      margin: 24px 0 6px;
    }
  }

  // overwrite
  :global(.state-submitting [data-media-player][data-view-type='video'][data-started]:not([data-controls])) {
    pointer-events: none;
  }

  :global(.lesson-page .button.back-to-level) {
    --btn-fill: transparent;
    color: black;
    border: 1px solid var(--color-dark-10);
  }

  :global(.controls-error .btn-icon .button-hover-effect) {
    margin-left: 1px;
  }

  // temp

  .debug {
    display: block;
    position: fixed;
    right: 0px;
    bottom: 0;
    background: var(--color-dark-100);
    padding: 12px;
    border-top-left-radius: 4px;
    z-index: 100;
    text-align: center;

    div {
      display: flex;
      align-items: center;
      text-align: center;
      gap: 5px;
    }

    button {
      padding: 0.5rem 0.5rem;
      border-radius: 4px;
      background: var(--color-primary, #0066cc);
      color: white;
      border: none;
      cursor: pointer;
    }
  }

  .step-indicator {
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 100;
    font-size: 14px;
    margin-bottom: 10px;
    text-align: center;
  }
</style>
