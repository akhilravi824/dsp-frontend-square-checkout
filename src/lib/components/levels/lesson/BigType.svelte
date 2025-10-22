<script lang="ts">
  import { currentStepId } from '$lib/stores/lessonStore';
  const { type } = $props<{ type: string }>();
</script>

<div class="big-type" class:reveal={$currentStepId === 'submitting' || $currentStepId === 'success'}>
  {#key $currentStepId}
    {#if $currentStepId === 'submitting' && type === 'back'}
      <span>Checking<br />&nbsp;</span>
    {:else if $currentStepId === 'submitting' && type === 'front'}
      <span>&nbsp;<br />sign</span>
    {:else if $currentStepId === 'success' && type === 'back'}
      <span>Excellent<br />&nbsp;</span>
    {:else if $currentStepId === 'success' && type === 'front'}
      <span>&nbsp;<br />job!</span>
    {/if}
  {/key}
</div>

<style lang="scss">
  .big-type {
    color: var(--color);
    font-size: 12.5vw;
    position: absolute;
    text-align: center;
    top: 50%;
    left: 50%;
    line-height: 1;
    transform: translate(-50%, -50%);
    font-weight: bold;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    pointer-events: none;
    line-height: 0.85;

    &.reveal {
      opacity: 1;
    }
  }
</style>
