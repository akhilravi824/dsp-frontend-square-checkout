<script lang="ts">
  import { onMount } from 'svelte';

  let show = $state(false);
  let cssGridColumns = $state(0);

  onMount(() => {
    cssGridColumns = Number(getComputedStyle(document.documentElement).getPropertyValue('--grid-default-columns'));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'g' && event.ctrlKey) {
        toggleGridVisualizer();
      }
    });
  });

  function toggleGridVisualizer() {
    show = !show;
  }
</script>

<div class="grid-visualizer" class:hidden={!show}>
  <div class="layout:grid layout:max-width">
    {#each Array.from({ length: cssGridColumns }) as _, index}
      <div class="grid-visualizer-column"></div>
    {/each}
  </div>
</div>

<style lang="scss">
  .grid-visualizer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    padding-inline: var(--container-padding-inline, 0);
    pointer-events: none;

    &.hidden {
      display: none;
    }

    & > div {
      block-size: 100%;
      inline-size: 100%;
    }
  }

  .grid-visualizer-column {
    background-color: rgba(255, 0, 0, 0.1);
    block-size: 100%;
  }
</style>
