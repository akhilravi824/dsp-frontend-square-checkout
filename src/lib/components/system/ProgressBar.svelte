<script lang="ts">
  const { progress = 0 } = $props();
</script>

<div class="progress-wrapper">
  <div class="step-progress" style="--progress: {Math.max(progress, 0)}">
    <div class="progress-bar"></div>
  </div>
</div>

<style lang="scss">
  .progress-wrapper {
    inline-size: 100%;
    max-inline-size: 233px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .step-progress {
      inline-size: 100%;
      block-size: 12px;
      background: var(--color-dark-10);
      border-radius: 99em;
      overflow: hidden;

      .progress-bar {
        background: var(--color-primary-blue);
        block-size: 12px;
        inline-size: 100%;
        border-radius: 99em;
        transform: translateX(calc((1 - var(--progress, 0.3)) * -100%));
        transition: transform 0.2s;
      }
    }
  }
</style>
