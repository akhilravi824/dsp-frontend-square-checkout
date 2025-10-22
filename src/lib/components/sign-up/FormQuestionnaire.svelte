<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import InputRadio from '$lib/components/system/inputs/InputRadio.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import type { SignupQuestion } from '../../../types/sanity.types';

  import { ICONS } from '$lib/components/system/icons/types';
  const {
    finalStep,
    progress,
    formData
  }: {
    finalStep: (formData: FormData) => void;
    progress: (currentStep: number, totalSteps: number) => void;
    formData: SignupQuestion;
  } = $props();

  let steps = $state([formData]);
  let form = $state(null);
  let showUniversity = $state(false);

  let activeStep = $state(0);
  let selectedValue = $state('');
  let maximumSteps = $state(1); // Adjust this if you add more steps
  // Track history of steps for going back
  let history = $state<{ step: string; value: string }[]>([]);

  // Get the longest path length in the questionnaire for progress tracking
  function findLongestPathLength(answers) {
    if (!answers || answers.length === 0) return 0;
    let maxLength = 0;
    for (let answer of answers) {
      let currentLength = 1; //
      if (answer.signupQuestion && answer.signupQuestion.answers.length > 0) {
        currentLength += findLongestPathLength(answer.signupQuestion.answers);
      }
      maxLength = Math.max(maxLength, currentLength);
    }
    return maxLength;
  }

  $effect(() => {
    maximumSteps = findLongestPathLength(formData.answers);
  });

  export const goBack = () => {
    if (activeStep === 0) return;

    const lastStep = history.pop();
    activeStep--;
    selectedValue = lastStep.value || '';
    progress(activeStep, steps.length);
  };

  const handleSelection = (value) => {
    selectedValue = value;
    const answer = steps[activeStep].answers.find((a) => a.id === value);

    if (!answer) return;
    // Add/remove selected class for hand options
    if (steps[activeStep].name === 'dominant-hand') {
      // Remove selected class from all hand options
      document.querySelectorAll('.input-radio-square').forEach(el => {
        el.classList.remove('selected');
      });
      // Add selected class to the chosen option
      const selectedElement = document.querySelector(`input[value="${value}"]`)?.closest('.input-radio-square');
      if (selectedElement) {
        selectedElement.classList.add('selected');
      }
    }
    const newStep = [...steps.slice(0, activeStep + 1)];

    if (answer.signupQuestion) {
      newStep.push(answer.signupQuestion);
    }

    if (answer.isUniversity) {
      showUniversity = true;
    } else {
      showUniversity = false;
    }

    steps = newStep;
  };

  const handleContinue = () => {
    if (!selectedValue) return;
    if (activeStep < steps.length - 1) {
      history.push({
        step: steps[activeStep].name,
        value: selectedValue
      });

      activeStep++;
      selectedValue = '';
      progress(activeStep, steps.length);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();

    history.push({
      step: steps[activeStep].name,
      value: selectedValue
    });

    progress(activeStep, steps.length);
    finalStep(history, showUniversity);
  };

  export const getStepsLength = () => {
    return maximumSteps;
  };

  export const getActiveStep = () => {
    return activeStep;
  };
</script>

{#snippet renderBottomButton(isLastStep)}
  <Button
    type={isLastStep ? 'submit' : 'button'}
    hovered
    icon={ICONS.ARROW_FORWARD}
    alignment="center"
    onclick={isLastStep ? () => {} : handleContinue}
    disabled={!selectedValue}
  >
    <span>Continue</span>
  </Button>
{/snippet}

{#snippet questionIconList(step, index)}
  <div class="question-wrapper questions-list">
    <p class="question type:h1 space:d24 text:center">{step.title}</p>
    <div class="answers-list space:d16">
      <fieldset class="radio-group layout:stack" role="radiogroup">
        {#each step.answers as answer (answer.id)}
          <InputRadio group={step.name} data={answer} onSelect={handleSelection} />
        {/each}
      </fieldset>
    </div>
    <div class="step-bottom-bar layout:stack">
      {@render renderBottomButton(index === steps.length - 1)}
    </div>
  </div>
{/snippet}

{#snippet questionSquareList(step, index)}
  <div class="question-wrapper questions-square">
    <p class="question type:h1 space:d24 text:center">{step.title}</p>
    <div class="answers-list space:d16">
      <fieldset class="radio-group layout:grid" role="radiogroup" aria-labelledby="group-label">
        {#each step.answers as answer (answer.id)}
          <label class="input-radio input-radio-square type:body-large {selectedValue === answer.id ? 'selected' : ''}" for={answer.id}>
            <input
              id={answer.id}
              name={step.name}
              type="radio"
              value={answer.id}
              onchange={() => handleSelection(answer.id)}
            />
            {#if answer.icon && answer.icon.id && (answer.icon.id === 'HAND_LEFT' || answer.icon.id === 'HAND_RIGHT')}
              <div class="hand-icon {answer.id === 'left-hand' ? 'flipped' : ''}">
                <Icon type={ICONS[answer.icon.id]} />
              </div>
            {/if}
            <span>{answer.title}</span>
          </label>
        {/each}
      </fieldset>
    </div>
    <div class="step-bottom-bar layout:stack">
      {@render renderBottomButton(index === steps.length - 1)}
    </div>
  </div>
{/snippet}

<section class="form-questionnaire">
  <form bind:this={form} onsubmit={onSubmit}>
    <div class="step-inner layout:max-width layout:zstack">
      {#each steps as step, index (step._id)}
        <div class="step layout:grid" class:active={activeStep === index}>
          {#if step.composition === 'list'}
            {@render questionIconList(step, index)}
          {:else if step.composition === 'square'}
            {@render questionSquareList(step, index)}
          {/if}
        </div>
      {/each}
    </div>
  </form>
</section>

<style lang="scss">
  .step {
    background: white;
    position: relative;
    z-index: 6;
    opacity: 0;
    visibility: hidden;

    &.active {
      opacity: 1;
      visibility: visible;
    }

    &:nth-child(2) {
      z-index: 10;
    }
  }

  .question-wrapper {
    grid-column: 4 / span 6;
    block-size: calc(100vh - 120px - 56px - 42px);
    max-height: 680px;
    min-height: 520px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .step-inner {
    padding-block-start: 56px;
    padding-block-end: 42px;
  }

  .questions-list {
    --space: 6px;

    .answers-list {
      max-inline-size: 472px;
      margin-inline: auto;
      inline-size: 100%;
    }

    .question {
      text-align: center;
    }
  }

  .questions-square {
    .radio-group {
      --grid-columns-amount: 2;
      --grid-row-gap: 6px;
    }
  }

  .radio-group {
    appearance: none;
    border: none;
  }

  .input-radio {
    background: var(--color-dark-5);
    border-radius: var(--border-radius-sm);
    border: 2px solid transparent;
    transition:
      color 0.2s ease-in-out,
      border-color 0.2s ease-in-out;
    display: flex;
    position: relative;
    cursor: pointer;
    color: var(--color-dark-100);

    input {
      appearance: none;
      margin: 0;
      background-color: #fff;
      position: absolute;
      left: 0;
      top: 0;
    }

    &:hover {
      border-color: var(--color-dark-100);
    }

    &:has(input[type='radio']:checked) {
      border-color: var(--color-primary-blue);
      color: var(--color-primary-blue);
      --icon-color: var(--color-primary-blue);
    }
  }

  .input-radio-square {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-inline: 32px;
    block-size: 150px;
    text-align: center;
    gap: 8px;
  }
  
  /* Selected state styling - keep blue when selected */
  .input-radio-square input:checked + * + * {
    color: var(--color-primary);
  }

  /* Alternative approach - use class-based selection */
  .input-radio-square.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  .input-radio-square.selected .hand-icon {
    filter: none; /* Remove any filters to keep original blue color */
  }

  .input-radio-square.selected .hand-icon :global(img) {
    filter: brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1559%) hue-rotate(215deg) brightness(97%) contrast(101%);
  }
  
  .step-bottom-bar {
    align-items: center;
    text-align: center;
    --space: 12px;
  }

  /* Hand Icon Styling */
  .hand-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    transform-origin: center center;  /* Center pivot point */
    transition: transform 0.2s ease-in-out;
    margin-bottom: 8px;
    width: 100%;
    
    :global(svg),
    :global(img) {
      width: 64px;
      height: 64px;
      display: block;
      margin: 0 auto;
    }
    
    &.flipped {
      transform: scaleX(-1);
    }
  }

  /* Hover Animation Trigger - Only for hand icons */
  .input-radio-square:hover .hand-icon {
    animation: smoothWave 1.2s cubic-bezier(0.36, 0, 0.66, -0.56) infinite;
  }
  
  /* Keep the flip on the left hand during animation */
  .input-radio-square:hover .hand-icon.flipped {
    animation: smoothWaveFlipped 1.2s cubic-bezier(0.36, 0, 0.66, -0.56) infinite;
  }


  /* Wave Animation Keyframes */
  @keyframes smoothWave {
    0%, 100% {
      transform: rotate(0deg) translateY(0);
    }
    10% {
      transform: rotate(-10deg) translateY(-2px);
    }
    20% {
      transform: rotate(12deg) translateY(-4px);
    }
    30% {
      transform: rotate(-10deg) translateY(-2px);
    }
    40% {
      transform: rotate(12deg) translateY(-4px);
    }
    50% {
      transform: rotate(-10deg) translateY(-2px);
    }
    60% {
      transform: rotate(12deg) translateY(-4px);
    }
    70% {
      transform: rotate(-10deg) translateY(-2px);
    }
    80% {
      transform: rotate(5deg) translateY(-1px);
    }
    90% {
      transform: rotate(0deg) translateY(0);
    }
  }
  
  /* Wave animation for flipped (left) hand */
  @keyframes smoothWaveFlipped {
    0%, 100% {
      transform: scaleX(-1) rotate(0deg) translateY(0);
    }
    10% {
      transform: scaleX(-1) rotate(-10deg) translateY(-2px);
    }
    20% {
      transform: scaleX(-1) rotate(12deg) translateY(-4px);
    }
    30% {
      transform: scaleX(-1) rotate(-10deg) translateY(-2px);
    }
    40% {
      transform: scaleX(-1) rotate(12deg) translateY(-4px);
    }
    50% {
      transform: scaleX(-1) rotate(-10deg) translateY(-2px);
    }
    60% {
      transform: scaleX(-1) rotate(12deg) translateY(-4px);
    }
    70% {
      transform: scaleX(-1) rotate(-10deg) translateY(-2px);
    }
    80% {
      transform: scaleX(-1) rotate(5deg) translateY(-1px);
    }
    90% {
      transform: scaleX(-1) rotate(0deg) translateY(0);
    }
  }
</style>
