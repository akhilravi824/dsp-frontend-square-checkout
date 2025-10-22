<script lang="ts">
  import { fade } from 'svelte/transition';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import { currentStepId } from '$lib/stores/lessonStore';

  const { instructionsMode, title, lessonTitle, currentStep } = $props<{
    instructionsMode: boolean;
    title: string;
    lessonTitle: string;
    currentStep: number;
  }>();

  const errorMessage = $state('was not recognized. Try again!');
</script>

<div class="title" transition:fade={{ duration: 400 }}>
  <h1 class="title-holder type:h1" transition:fade={{ duration: 400 }}>
    {#key currentStepId}
      {#if instructionsMode && $currentStepId !== 'error'}
        <span class="overflow">{title} </span>
      {/if}
    {/key}
    {#if !instructionsMode || currentStep > 1}
      <div
        class="title-box type:lesson-title-bold"
        class:submitting={$currentStepId === 'submitting'}
        class:success={$currentStepId === 'success'}
        class:error={$currentStepId === 'error'}
      >
        <span>{lessonTitle}</span>
        <span class="icon icon-check"><Icon type={ICONS.CHECK} /></span>
        <span class="icon icon-priority"><Icon type={ICONS.PRIORITY_HIGH} /></span>
      </div>
    {/if}
    {#key currentStepId}
      {#if $currentStepId === 'error'}
        <span class="overflow">{errorMessage} </span>
      {/if}
    {/key}
  </h1>
</div>

<style lang="scss">
  .title {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    display: grid;
    text-align: center;

    .title-holder {
      display: flex;
      justify-content: center;
      align-items: center;
      grid-column: 1 / -1;
      grid-row: 1 / -1;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

      .overflow {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        transition:
          0.3s width ease-out,
          0.3s margin-right ease-out;

        &:first-child {
          margin-right: 10px;
        }

        &:last-child {
          margin-left: 16px;
        }
      }
    }
  }

  .title-box {
    padding: 24px;
    text-transform: lowercase;
    margin-left: 5px;
    border-radius: 12px; /* Less round */
    background: transparent;
    position: relative;
    z-index: 0;
    display: flex;
    align-items: center;
    transition: padding-right 0.3s ease-out;

    &.submitting::before {
      background: linear-gradient(to top right, transparent 0%, transparent 30%, var(--color) 100%);
      background-size: 200% 200%;
      background-position: center;
      animation: pulse 4s linear infinite;
    }

    &.success .icon.icon-check {
      display: flex;
    }

    &.error .icon.icon-priority {
      display: flex;
      --icon-size: 17px;
    }

    &.success,
    &.error {
      &::before {
        background: var(--color-dark-10);
        background-size: 200% 200%;
        background-position: center;
        animation: pulse 4s linear infinite;
      }

      padding-right: 65px;

      .icon {
        opacity: 1;
        transform: scale(1);
        transition: all 0.3s;
        transition-delay: 0.1s;
        display: none;
      }
    }
  }

  .title-box::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 1.5px; /* Thinner border */
    background: var(--color-dark-100);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;

    pointer-events: none;
    z-index: -1;
  }

  .icon {
    background: var(--color-dark-10);
    border-radius: var(--border-radius-sm);
    width: 31px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: absolute;
    right: 24px;
    transition: all 0.1s ease-out;
    transition-delay: 0s;
    transform: scale(0.4);
    opacity: 0;
  }

  @keyframes pulse {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>
