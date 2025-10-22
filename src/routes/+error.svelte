<script lang="ts">
  import { page } from '$app/stores';
  import Button from '$lib/components/system/Button.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import Header from '$lib/components/Header.svelte';

  function getDefaultMessage(status: number): string {
    switch (status) {
      case 404:
        return "We couldn't find the page you're looking for.";
      case 500:
        return 'Sorry, our server encountered an error.';
      default:
        return 'Something went wrong.';
    }
  }
</script>

<div class="notfound-page">
  <Header />
  <main>
    <div class="error-container layout:max-width">
      <div class="error-content">
        <div class="status type:h1-display">404</div>
        <h1 class="type:h1-display">Page Not Found</h1>
        <p class="message type:body">It looks like the page you’re looking for doesn’t exist or was moved.</p>
        <div class="actions">
          <Button href="/" icon={ICONS.ARROW_BACK} hovered iconPosition="before">Back to home</Button>
        </div>
      </div>
    </div>
    <div class="background"></div>
  </main>
  <div class="background-gradient-bottom"></div>
</div>

<style lang="scss">
  :global(.notfound-page .header-cta) {
    display: none;
    visibility: hidden;
  }

  main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 2rem;
    z-index: 5;
    text-align: center;
    position: absolute;
    left: 0;
    width: 100%;
    top: 0;
    background:
      radial-gradient(
        182.11% 160.68% at 6.25% 130.49%,
        var(--theme-1-theme-1-gradient-tone, rgba(101, 150, 255, 0.65)) 0%,
        var(--theme-1-theme-1-gradient-base, rgba(213, 232, 253, 0)) 80.42%
      ),
      radial-gradient(
        192.45% 151.87% at 112.64% -12.28%,
        var(--theme-1-theme-1-gradient-tone, rgba(101, 150, 255, 0.3)) 0%,
        var(--theme-1-theme-1-gradient-base, rgba(213, 232, 253, 0)) 61.12%
      ),
      var(--theme-1-theme-1-bg, #d5e8fd);
  }

  .message {
    margin-top: 2em;
  }

  .actions {
    margin-top: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 42px;
    left: 0;
    width: 100%;

    :global(.button) {
      --btn-fill: var(--color-primary, #2563eb);
      --btn-fill-hover: var(--color-primary-dark, #1d4ed8);
      --btn-text: white;
    }
  }
</style>
