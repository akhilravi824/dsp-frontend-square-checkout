<script lang="ts">
  import { currentStepId } from '$lib/stores/lessonStore';
  import { fade } from 'svelte/transition';
</script>

{#if $currentStepId === 'submitting'}
  <div class="facts" in:fade={{ duration: 300, delay: 200 }} out:fade={{ duration: 200 }}>
    <div class="inner">
      <h4 class="title type:h4">Did you know that</h4>
      <p class="copy type:lesson-title">
        Just like spoken languages, ASL has regional dialects and variations that can differ based on location?
      </p>
    </div>
  </div>
{/if}

<style lang="scss">
  .facts {
    position: fixed;
    bottom: 40px;
    text-align: center;
  }

  .inner {
    max-width: 400px;
  }

  .title {
    margin-bottom: 6px;
  }

  .copy {
    color: var(--color-dark-60);
  }
</style>
