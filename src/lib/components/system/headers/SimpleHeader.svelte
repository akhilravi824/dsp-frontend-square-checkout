<script lang="ts">
  import type { Snippet } from 'svelte';

  const {
    leftPart,
    middlePart,
    rightPart,
    showLogo = true,
    logoLinkUrl = '/',
    class: headerClass
  }: {
    leftPart?: Snippet;
    middlePart?: Snippet;
    rightPart?: Snippet;
    showLogo?: boolean;
    logoLinkUrl?: string;
    class?: string;
  } = $props();
</script>

<header class="header simple-header {headerClass}">
  <div class="header-inner layout:inline-flex">
    <div class="left-part">
      {#if showLogo}
        <a class="header-logo" href={logoLinkUrl}>
          <img alt="Logo" src="/images/logo.svg" />
        </a>
      {/if}
      {#if leftPart}
        {@render leftPart()}
      {/if}
    </div>
    {#if middlePart}
      <div class="middle-part">
        {@render middlePart()}
      </div>
    {/if}
    <div class="right-part">
      {#if rightPart}
        {@render rightPart()}
      {/if}
    </div>
  </div>
</header>

<style lang="scss">
  .header {
    position: relative;
    inline-size: 100%;
    z-index: 9;
  }

  .left-part {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  .header-inner {
    --inline-justify: space-between;
    margin-inline: auto;
    inline-size: 100%;
    padding-inline: 30px;
    padding-block: 30px;
  }

  .header-logo {
    align-items: center;
    gap: 10px;
    font-family: var(--font-primary);
    color: var(--color-dark-100);
    font-weight: 900;
    text-decoration: none;
    display: flex;
  }

  .header-cta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }
</style>
