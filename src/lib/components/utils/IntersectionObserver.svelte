<script lang="ts">
  import { onMount } from 'svelte';

  let container: HTMLDivElement;

  interface Props {
    once?: boolean;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    threshold?: number; // 0 = top of element at top of viewport, 1 = bottom of element at bottom of viewport
    intersecting?: boolean;
    children?: () => any;
    onEnter?: (intersecting: boolean) => void;
  }

  let {
    children,
    once = false,
    top = 0,
    bottom = 0,
    left = 0,
    right = 0,
    threshold = 0, // Default to 0 (top of element at top of viewport)
    intersecting = $bindable(),
    onEnter = () => {}
  }: Props = $props();

  onMount(() => {
    if (typeof IntersectionObserver !== 'undefined') {
      const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`;

      const observer = new IntersectionObserver(
        (entries) => {
          intersecting = entries[0].isIntersecting;
          onEnter?.(intersecting);
          if (intersecting && once) {
            observer.unobserve(container);
          }
        },
        {
          rootMargin,
          threshold
        }
      );

      observer.observe(container);
      return () => observer.unobserve(container);
    }
  });
</script>

<div bind:this={container}>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
