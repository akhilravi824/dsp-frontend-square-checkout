<script lang="ts">
  import { onMount } from 'svelte';

  let show = $state(false);
  let width = $state(750);
  let height = $state(1200);

  onMount(() => {
    show = true;
    handleResize();
    document.addEventListener('keydown', (event) => {
      if (event.key === 'f' && event.ctrlKey) {
        toggleResponsiveVisualizer();
      }
    });
  });

  function toggleResponsiveVisualizer() {
    show = !show;
  }

  function handleResize() {
    width = window.innerWidth;
    height = window.innerHeight;
  }
</script>

<svelte:window onresize={handleResize} />
<div class="responsive-visualizer" class:hidden={!show}>
  <p class="type:label-large">{width}x{height}</p>
</div>

<style lang="scss">
  .responsive-visualizer {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 9999;
    display: flex;
    background: var(--color-dark-100);
    padding: 12px;
    border-top-right-radius: 4px;

    p {
      color: var(--color-white-100);
    }

    &.hidden {
      display: none;
    }
  }
</style>
