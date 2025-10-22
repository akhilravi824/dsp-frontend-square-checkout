<script>
  import Button from './system/Button.svelte';
  import { breakpoints } from '$lib/stores/mediaQueries.svelte.js';
  import { ROUTES } from '$lib/routes.js';
</script>

<header class="header">
  <div class="header-inner">
    {#if !breakpoints.mobile.mediaQuery}
      <a href="/" class="header-logo">
        <img src="/images/logo.svg" alt="Logo" />
        <span class="header-logo-text">ASL Pal</span>
      </a>
    {/if}
    <div class="header-cta">
      <Button href={ROUTES.LOGIN} size="small" variant="tertiary">Sign in</Button>
      {#if breakpoints.desktop.mediaQuery}
        <Button href={ROUTES.SIGN_UP} variant="primary" size="small">Get started for free</Button>
      {/if}
    </div>
  </div>
</header>

<style lang="scss">
  .header {
    position: relative;
    z-index: 10;
  }

  .header-inner {
    margin-inline: auto;
    padding-inline: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    z-index: 10;
    inline-size: 100%;
    padding-block-start: 24px;

    @media screen and (min-width: 768px) {
      padding-inline: 42px;
      padding-block: 24px;
    }
  }

  .header-logo {
    display: none;
    align-items: center;
    gap: 10px;
    font-family: var(--font-primary);
    color: var(--color-dark-100);
    font-weight: 900;
    text-decoration: none;

    @media screen and (min-width: 768px) {
      display: flex;
    }
  }

  .header-cta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }
</style>
