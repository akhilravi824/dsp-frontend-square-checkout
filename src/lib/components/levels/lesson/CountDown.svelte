<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  onMount(() => {
    start();
  });

  const startFrom: number = 5;
  const visibleTime: number = 1000;

  let currentNumber = $state(0);

  function start() {
    currentNumber = startFrom;

    let countdownInterval = setInterval(() => {
      currentNumber -= 1;

      if (currentNumber <= 0) {
        clearInterval(countdownInterval);

        // Allow a brief moment to see the "1"
        setTimeout(() => {
          completed(); // Call the callback instead of dispatching event
        }, 500);
      }
    }, visibleTime); // Show each number for 1 seconds
  }

  function completed() {
    dispatch('completed');
  }
</script>

<div class="countdown">
  <div class="number-container">
    <div class="number">{currentNumber}</div>
  </div>
  <div class="text-container">
    <span class="type:label-large">Get ready...</span>
  </div>
</div>

<style lang="scss">
  @font-face {
    font-family: 'Ambit';
    src: url('/fonts/Ambit-Thin.woff') format('woff');
    font-display: block;
  }

  .countdown {
    background: var(--color-dark-20);
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    transition: opacity 0.3s ease;
    color: var(--color-white-100);
  }

  .number-container {
    align-self: flex-end;
    margin: 32px;
    line-height: 1;
    font-family: 'Ambit';
  }

  .text-container {
    align-self: flex-start;
    margin: 32px;
    padding: 10px 24px;
  }

  .number {
    font-size: 13vw;
    color: var(--color-white-100);
    font-weight: normal;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.8);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(0.8);
      opacity: 0.7;
    }
  }
</style>
