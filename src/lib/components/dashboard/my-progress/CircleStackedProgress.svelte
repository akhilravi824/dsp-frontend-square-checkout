<script lang="ts">
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  export function clamp(input: number, min: number, max: number): number {
    return input < min ? min : input > max ? max : input;
  }

  export function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
    const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
    return clamp(mapped, out_min, out_max);
  }

  import { onMount } from 'svelte';

  interface Props {
    size: number;
    strokeWidth: number;
    progress: number;
    icon: boolean;
  }

  let { size, strokeWidth, progress, icon }: Props = $props();

  const viewBoxSize = 100;

  // Calculate stroke width in viewBox coordinates to match pixel size
  const svgStrokeWidth = $derived((strokeWidth / size) * viewBoxSize);

  const radius = $derived(50 - strokeWidth / 2);
  const circumference = $derived(2 * Math.PI * radius + strokeWidth);

  const length = $derived(radius * 2 * Math.asin(svgStrokeWidth / 2 / radius));

  const progress1 = $derived.by(() => {
    if (progress >= 1) {
      return circumference - length * 2;
    }

    return map(progress, 0, 0.99, 0, circumference - length * 3);
  });

  const offset = $derived(2 * Math.asin(svgStrokeWidth / 2 / radius) * (180 / Math.PI));

  const progress2 = $derived(circumference - progress1 - length * 3 + 0.1);
  const offset2 = $derived(offset + map(progress, 0, 0.99, 0, 360 - offset * 2));

  const completed = $derived(progress === 1);

  const dashArray2 = $derived.by(() => {
    if (progress <= 0) {
      return '0';
    }

    return `${progress2} ${circumference}`;
  });
</script>

<div class="progress-container layout:zstack {completed ? 'completed' : ''}" style="--size: {strokeWidth * 2}px;">
  {#if icon && progress > 0}
    <div class="icon layout:inline-flex">
      <Icon type={ICONS.CHECK} />
    </div>
  {/if}
  <svg class="progress-svg" viewBox="0 0 100 100" style="--offset: {offset}deg;">
    <g>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke-width={svgStrokeWidth}
        stroke-dasharray="{progress1} {circumference}"
        class="progress-bar"
        opacity={progress <= 0 ? 0 : 1}
      ></circle>

      <circle
        style="--rotation: {offset2}deg;"
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke-dasharray={dashArray2}
        stroke-width={svgStrokeWidth}
        class="progress-bg"
        opacity={Number(progress !== 1)}
      ></circle>
    </g>
  </svg>
</div>

<style lang="scss">
  .progress-container {
    --progress-color: var(--color-primary-blue);
    width: 100%;
    height: 100%;
    place-items: start center;

    --icon-color: var(--color-dark-60);

    &.completed {
      --icon-color: var(--color-white-100);
    }
  }

  .icon {
    width: var(--size);
    height: var(--size);
    z-index: 5;
  }

  .progress-svg {
    stroke: var(--progress-color);
    stroke-linecap: round;
    transform: rotate(calc(-90deg + var(--offset)));
    z-index: 4;
    overflow: visible;
  }

  .progress-bar {
    --progress-color: var(--color-primary-blue);
    // --progress-color: black;
    // stroke: black;

    transform: rotate(var(--rotation));
    transform-origin: center;
  }

  .progress-bg {
    --progress-color: var(--color-dark-10);

    stroke: var(--progress-color);
    transform-origin: center;
    transform: rotate(var(--rotation));
  }
</style>
