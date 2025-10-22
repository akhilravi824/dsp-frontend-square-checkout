<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import Tips from './Tips.svelte';
  import { currentStepId } from '$lib/stores/lessonStore';

  const { closeSidebar, data } = $props<{
    closeSidebar: () => void;
    data: any;
  }>();

  // Store instruction lines in a JSON object
  const instructions = {
    steps: [
      {
        id: 'camera',
        text: 'To get started, allow camera access in your browser.'
      },
      {
        id: 'position',
        text: 'Great! Now, ensure your body and arms are visible through the camera when moving your body around.'
      },
      {
        id: 'instructor',
        text: 'Now, let’s practice your first sign. Watch the instructor carefully, and try to sign along with her. Make sure your hand is in the right start position!'
      },
      {
        id: 'ready',
        text: `Record yourself signing “${data.title}”, following the instructor speed and position. The recording stops automatically`
      },
      // {
      //   id: 'go',
      //   text: 'Go for it!'
      // },
      {
        id: 'review',
        title:
          "Great job! Review your recording, and if you're happy with it, submit – otherwise, feel free to try again."
      },
      {
        id: 'processing',
        text: 'Great job on recording. We are processing your sign.'
      },
      {
        id: 'complete',
        text: 'Well done! You did awesome!'
      },
      {
        id: 'success',
        text: 'Well done! You did awesome!'
      },
      {
        id: 'success-unit',
        text: 'Congratulations! You’ve done it! Another unit completed!'
      },

      {
        id: 'error',
        text: 'You almost had it! Ready to try again?'
      }
      // success / errors
    ]
  };

  // Function to get the current instruction text based on ID
  function getCurrentInstructionText() {
    const currentStep = instructions.steps.find((step) => step.id === $currentStepId);
    return currentStep ? currentStep.text || currentStep.title : '';
  }
</script>

<div class="sidebar">
  <div class="top">
    <Button icon={ICONS.CLOSE_BAR} iconPosition="before" variant="secondary" onclick={closeSidebar}>
      <span>Hide Instructions</span>
    </Button>
  </div>
  <div class="content">
    <div class="instruction-wrapper type:body-large">
      <p class="instruction">{getCurrentInstructionText()}</p>
    </div>
    {#if data.tips && ($currentStepId === 'instructor' || $currentStepId === 'ready' || $currentStepId === 'error')}
      <Tips data={data.tips}></Tips>
    {/if}
  </div>
</div>

<style lang="scss">
  .sidebar {
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    border-left: 1px solid var(--color-dark-10);
    display: flex;
    flex-direction: column;

    :global(.btn-text),
    :global(.btn-text span) {
      transform: none !important;
    }
  }

  .top {
    display: flex;
    justify-content: space-between;
    inline-size: 100%;
    align-items: center;
    padding-inline: 30px;
    padding-block: 30px;
    --icon-size: 15px;
    --btn-fill: transparent;
    --btn-fill-hover: transparent;
    --btn-hover-layer-bg: transparent;

    :global(.button) {
      border: 0;
      margin-left: -20px;

      &:hover {
        --icon-color: var(--color-dark-100);
      }
    }
  }

  .content {
    display: flex;
    flex: 1;
    align-items: center;
    padding: 32px;
    flex-direction: column;
  }

  .instruction-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: start;
  }
</style>
