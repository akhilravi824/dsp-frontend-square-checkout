<script lang="ts">
  import Hero from '$lib/components/landing/Hero.svelte';
  import Introduction from '$lib/components/landing/Introduction.svelte';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Faq from '$lib/components/landing/Faq.svelte';
  import CloudImages from '$lib/components/landing/CloudImages.svelte';
  import PricingsAndPlans from '$lib/components/landing/PricingsAndPlans.svelte';
  import LargeCta from '$lib/components/landing/LargeCta.svelte';
  import SideBySide from '$lib/components/landing/SideBySide.svelte';
  import MediaSlider from '$lib/components/landing/MediaSlider.svelte';
  import MediaBlock from '$lib/components/landing/MediaBlock.svelte';
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { clearToasts } from '$lib/stores/toastStore.js';

  import IntersectionObserver from '$lib/components/utils/IntersectionObserver.svelte';

  const { page: pageData, globals } = $page.data;

  let introIntersecting = $state(false);
  let heroIntersecting = $state(false);

  function updateThemeColor(color: string) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    }
  }

  function onIntroIntersect() {
    updateThemeColor('#ffffff');
  }

  function onHeroIntersect() {
    updateThemeColor('#f1eaff');
  }

  $effect(() => {
    if (introIntersecting) {
      onIntroIntersect();
    }
  });

  $effect(() => {
    if (heroIntersecting) {
      onHeroIntersect();
    }
  });

  onMount(() => {
    clearToasts();
  });
</script>

<div class="landing-page">
  <div class="background-gradient-top"></div>
  <Header />
  <main>
    {#each pageData.components || [] as component}
      {#if component}
        {#if component.componentType === 'hero'}
          <IntersectionObserver top={200} bind:intersecting={heroIntersecting}>
            <Hero data={component} class="landing-hero" />
          </IntersectionObserver>
        {:else if component.componentType === 'intro'}
          <Introduction data={component} {...component} class="space:d176" />
        {:else if component.componentType === 'sideBySide'}
          <IntersectionObserver threshold={0.5} bind:intersecting={introIntersecting}>
            <SideBySide data={component} {...component} class="space:d176" />
          </IntersectionObserver>
        {:else if component.componentType === 'mediaSlider'}
          <MediaSlider data={component} {...component} class="space:d176" />
        {:else if component.componentType === 'largeCta'}
          <LargeCta data={component} {...component} class="space:d176" />
        {:else if component.componentType === 'mainCtaSection'}
          <LargeCta data={component} {...component} class="space:d64" />
        {:else if component.componentType === 'choosePlan'}
          <PricingsAndPlans data={component} {...component} class="space:d176" />
        {:else if component.componentType === 'faq'}
          <Faq data={component} {...component} class="space:d176" />
        {:else if component.componentType === 'imageCloud'}
          <CloudImages data={component} {...component} class="space:d176" />
        {:else if component.componentType === 'mediaBlock'}
          <MediaBlock data={component} {...component} class="space:d176" />
        {/if}
      {/if}
    {/each}
  </main>
  <Footer data={globals.footer} />
  <div class="background-gradient-bottom"></div>
</div>

<style lang="scss">
  .landing-page {
    background-color: var(--color-white);
    --container-max-width: 1200px;
    // padding-block-end: 42px;
    position: relative;
    --landing-page-padding-inline: 16px;

    @media (min-width: 768px) {
      --landing-page-padding-inline: 34px;
    }
  }

  :global(.landing-hero) {
    margin-block-end: 64px;
  }

  [class^='background-gradient'] {
    inline-size: 100%;
    left: 0;
    position: absolute;
    z-index: 1;
  }

  .background-gradient-top {
    background:
      radial-gradient(
        182.11% 160.68% at 6.25% 130.49%,
        var(--theme-2-theme-2-gradient-tone, rgba(131, 131, 247, 0.65)) 0%,
        var(--theme-2-theme-2-gradient-base, rgba(241, 234, 255, 0)) 80.42%
      ),
      radial-gradient(
        192.45% 151.87% at 112.64% -12.28%,
        var(--theme-2-theme-2-gradient-tone, rgba(131, 131, 247, 0.3)) 0%,
        var(--theme-2-theme-2-gradient-base, rgba(241, 234, 255, 0)) 61.12%
      ),
      var(--theme-2-theme-2-bg, #f1eaff);
    block-size: 850px;
    inline-size: 100%;
    top: 0;

    @media (min-width: 768px) {
      block-size: 1200px;
    }

    &:before {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 100%);
      block-size: 386px;
      bottom: 0;
      content: '';
      inline-size: 100%;
      left: 0;
      position: absolute;
    }
  }

  .background-gradient-bottom {
    background:
      radial-gradient(
        182.11% 160.68% at 6.25% 130.49%,
        var(--theme-2-theme-2-gradient-tone, rgba(131, 131, 247, 0.65)) 0%,
        var(--theme-2-theme-2-gradient-base, rgba(241, 234, 255, 0)) 80.42%
      ),
      radial-gradient(
        192.45% 151.87% at 112.64% -12.28%,
        var(--theme-2-theme-2-gradient-tone, rgba(131, 131, 247, 0.3)) 0%,
        var(--theme-2-theme-2-gradient-base, rgba(241, 234, 255, 0)) 61.12%
      ),
      var(--theme-2-theme-2-bg, #f1eaff);
    block-size: 926px;
    bottom: 0;
    inline-size: 100%;

    &:before {
      background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
      block-size: 386px;
      content: '';
      inline-size: 100%;
      left: 0;
      position: absolute;
      top: 0;
    }
  }

  main {
    --container-padding-inline: var(--landing-page-padding-inline);
    position: relative;
    z-index: 5;
  }
</style>
