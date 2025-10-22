<script lang="ts">
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';

  import { userProfile } from '$lib/stores/userProfile';
  import { levelsDataStore } from '$lib/stores/levelsDataStore';
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import { currentStepId } from '$lib/stores/lessonStore';
  import FreeTriesButton from '../FreeTriesButton.svelte';
  import Modal from '$lib/components/system/Modal.svelte';

  type HeaderProps = {
    progress?: number;
    openSidebar?: boolean;
    sidebarOpen?: boolean;
    instructionsMode?: boolean;
    progressTitle?: string;
    onPreviousStep?: (event: MouseEvent) => void;
  };

  const {
    progress = 0,
    openSidebar = false,
    sidebarOpen = false,
    instructionsMode = false,
    progressTitle = '',
    onPreviousStep = () => {}
  }: HeaderProps = $props();

  const currentLevelId = $page.params.levelId;
  const currentUnitId = $page.params.unitId;

  let isExiting = $state(false);

  const handlePreviousStep = () => {
    if (onPreviousStep) {
      onPreviousStep();
    }
  };

  function handleExit() {
    isExiting = true;
  }

  function handleClose() {
    isExiting = false;
  }
</script>

<Modal open={isExiting} onClose={handleClose} modalClass="error">
  <div class="error-wrapper">
    <div class="inner">
      <h3 class="title type:h4">Exit lesson</h3>
      <p class="copy type:body">Are you sure you want to exit this lesson?</p>
      <div class="modal-actions">
        <a class="btn-error type:label-large" href={`/levels/${currentLevelId}/units/${currentUnitId}`}>Exit</a>
        <button onclick={handleClose} class="btn-cancel type:label-large">Cancel</button>
      </div>
    </div>
  </div>
</Modal>
<header class="progress-header" data-instructionsMode={instructionsMode}>
  <div class="header-inner">
    <div class="left-block">
      <Button onclick={handleExit} icon={ICONS.CLOSE} iconPosition="before" variant="secondary" noAnimation />
      {#if progress > 0.1}
        <button
          onclick={handlePreviousStep}
          class="previous underlined-link type:label"
          type="button"
          class:hide={['submitting', 'success', 'success-unit', 'error', 'review'].includes($currentStepId)}
          >Previous step</button
        >
      {/if}
      {#if $userProfile?.square_subscription_id === null && !instructionsMode}
        <FreeTriesButton triesLeft={$levelsDataStore.apiData.freeTries} />
      {/if}
    </div>

    <div
      class="progress-wrapper"
      class:hide={['submitting', 'success', 'success-unit', 'error'].includes($currentStepId)}
    >
      {#if progressTitle}
        {#key progressTitle}
          <span class="type:body-large" in:fade={{ duration: 150 }}>{progressTitle}</span>
        {/key}
      {:else}
        <div class="step-progress" style="--progress: {Math.max(progress, 0.1)}">
          <div class="progress-bar"></div>
        </div>
      {/if}
    </div>

    <div class="right-block">
      {#if !sidebarOpen}
        <div class="button-wrapper">
          <Button
            icon={ICONS.INSTRUCTIONS}
            iconPosition="before"
            alignment="right"
            variant="secondary"
            onclick={openSidebar}
            noAnimation
          ></Button>
        </div>
      {/if}
    </div>
  </div>
</header>

<style lang="scss">
  .progress-header {
    position: relative;
    inline-size: 100%;
    z-index: 9;

    .header-inner {
      display: flex;
      justify-content: space-between;
      inline-size: 100%;
      align-items: center;
      padding-inline: 30px;
      padding-block: 30px;
    }

    .left-block {
      display: flex;
      align-items: center;
      gap: 30px;
      --btn-fill: transparent;
    }

    .left-block,
    .right-block {
      --btn-fill: transparent;
      --btn-fill-hover: var(--color-dark-10);

      :global(.icon) {
        --icon-color: var(--color-dark-60);
      }

      :global(.button:hover .icon) {
        --icon-color: var(--color-dark-100);
      }
    }

    .previous {
      color: var(--color-dark-60);

      &.hide {
        display: none;
      }
    }
  }

  .progress-wrapper {
    inline-size: 100%;
    max-inline-size: 233px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    opacity: 1;

    &.hide {
      opacity: 0;
    }

    .step-progress {
      inline-size: 100%;
      block-size: 12px;
      background: var(--color-dark-10);
      border-radius: 99em;
      overflow: hidden;

      .progress-bar {
        background: var(--color-primary-blue);
        block-size: 12px;
        inline-size: 100%;
        border-radius: 99em;
        transform: translateX(calc((1 - var(--progress, 0.3)) * -100%));
        transition: transform 0.2s;
      }
    }
  }

  .underlined-link {
    appearance: none;
    background-color: transparent;
    border: none;
    color: var(--color-dark-100);
    text-decoration: underline;
    cursor: pointer;
  }
</style>
