<script>
  // Props using Svelte 5 $props rune
  let {
    progress = 0, // 0 to 1 (e.g., 0.5 = 50%)
    size = 36, // Size in pixels
    strokeWidth = 6, // Stroke width in pixels
    color = 'var(--color-primary-blue)', // Progress bar color
    backgroundColor = '#e0e0e0', // Background circle color
    duration = 500 // Animation duration in ms
  } = $props();

  // Constants - adjust for stroke width to prevent clipping
  const viewBoxSize = 100;

  // Calculate stroke width in viewBox coordinates to match pixel size
  const svgStrokeWidth = $derived((strokeWidth / size) * viewBoxSize);

  // Adjust radius to account for stroke width (stroke extends both inward and outward)
  const radius = $derived(50 - svgStrokeWidth / 2 - 1); // -1 for small padding
  const circumference = $derived(2 * Math.PI * radius);

  // Derived reactive values using Svelte 5 $derived rune
  const clampedProgress = $derived(Math.max(0, Math.min(progress, 1)));
  const progressDash = $derived(clampedProgress * circumference);

  // Derived styles with CSS variables
  const containerStyle = $derived(`
    width: ${size}px;
    height: ${size}px;
    --progress-color: ${color};
    --progress-bg-color: var(--color-dark-10);
    --transition-duration: ${duration}ms;
  `);
</script>

<div class="progress-container" style={containerStyle}>
  <svg class="progress-svg" height={size} viewBox="0 0 100 100" width={size}>
    <!-- Background circle -->
    <circle cx="50" cy="50" fill="none" r={radius} stroke="var(--progress-bg-color)" stroke-width={svgStrokeWidth} />

    {#if clampedProgress > 0}
      <!-- Progress circle -->
      <circle
        class="progress-bar"
        cx="50"
        cy="50"
        fill="none"
        r={radius}
        stroke="var(--progress-color)"
        stroke-dasharray="{progressDash} {circumference}"
        stroke-linecap="round"
        stroke-width={svgStrokeWidth}
      />
    {/if}
  </svg>
</div>

<style>
  .progress-container {
    display: inline-block;
    position: relative;
  }

  .progress-svg {
    transform: rotate(-90deg);
  }

  .progress-bar {
    transition: stroke-dasharray var(--transition-duration) ease;
  }
</style>
