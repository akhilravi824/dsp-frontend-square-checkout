<script>
  import { fade } from 'svelte/transition';

  let {
    size = 36, // Size in pixels
    stroke = 5, // Stroke thickness as a percentage of size
    color = 'var(--color-primary-blue)',
    center = false
  } = $props();

  const containerStyle = $derived(`
    width: ${size}px;
    height: ${size}px;
    color: ${color};
  `);

  // Scale stroke width to be proportional to the actual rendered size
  // The viewBox is 200x200, so we scale the stroke relative to the size
  const scaledStroke = $derived(stroke * (200 / size));
</script>

<div class="spinner" class:center style={containerStyle} in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"
    ><radialGradient id="a12" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)"
      ><stop offset="0" stop-color="currentColor"></stop><stop offset=".3" stop-color="currentColor" stop-opacity=".9"
      ></stop><stop offset=".6" stop-color="currentColor" stop-opacity=".6"></stop><stop
        offset=".8"
        stop-color="currentColor"
        stop-opacity=".3"
      ></stop><stop offset="1" stop-color="currentColor" stop-opacity="0"></stop></radialGradient
    ><circle
      transform-origin="center"
      fill="none"
      stroke="url(#a12)"
      stroke-width={scaledStroke}
      stroke-linecap="round"
      stroke-dasharray="200 1000"
      stroke-dashoffset="0"
      cx="100"
      cy="100"
      r="70"
      ><animateTransform
        type="rotate"
        attributeName="transform"
        calcMode="spline"
        dur="2"
        values="360;0"
        keyTimes="0;1"
        keySplines="0 0 1 1"
        repeatCount="indefinite"
      ></animateTransform></circle
    ><circle
      transform-origin="center"
      fill="none"
      opacity=".2"
      stroke="currentColor"
      stroke-width={scaledStroke}
      stroke-linecap="round"
      cx="100"
      cy="100"
      r="70"
    ></circle></svg
  >
</div>

<style lang="scss">
  .spinner {
    &.center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
