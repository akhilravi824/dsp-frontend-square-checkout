<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import RichText from './RichText.svelte';
  import type { LayoutData } from '../../../routes/(auth)/$types';

  let { data } = $props<{ data: LayoutData['globals']['onlyDesktop'] }>();
</script>

<section class="only-desktop-screen">
  <div class="mobile-logo space:d64">
    <img alt="Logo" src="/images/logo.svg" />
    <span class="header-logo-text">ASL Pal</span>
  </div>

  <div class="visual space:d32">
    {#if data.image?.url}
      <img src={data.image.url} alt={data.image.alt || ''} />
    {/if}
  </div>

  <div class="content layout:stack space:d32">
    <h1 class="type:h1-large">{data.title}</h1>
    <RichText copy={data.description} bodyTypeClass="type:body" />
  </div>

  <div class="cta">
    <Button hovered href="/" icon={ICONS.ARROW_BACK} iconPosition="before">
      <span>Back</span>
    </Button>
  </div>
</section>

<style lang="scss">
  .only-desktop-screen {
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
    block-size: 100%;
    width: 100vw;
    z-index: 99;
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
    padding-block-start: 54px;
    padding-block-end: 36px;
    min-height: 100vh;
    justify-content: center;

    @media screen and (min-width: 1024px) {
      display: none;
    }
  }

  .content {
    --stack-align: center;
    --space: 24px;

    h1 {
      max-inline-size: 343px;

      @media screen and (min-width: 768px) {
        max-inline-size: 500px;
      }
    }

    :global(p) {
      max-inline-size: 230px;

      @media screen and (min-width: 768px) {
        max-inline-size: 230px;
      }
    }
  }

  .visual {
    img {
      max-inline-size: 190px;
    }
  }

  .cta {
    margin-top: auto;

    @media screen and (min-width: 768px) {
      margin-top: 60px;
    }
  }

  .mobile-logo {
    font-family: var(--font-primary);
    color: var(--color-dark-100);
    font-weight: 900;
    font-size: 14px;
    text-align: center;

    img {
      width: 60px;
    }
  }
</style>
