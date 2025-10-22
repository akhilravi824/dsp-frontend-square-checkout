<script>
  import GetStarterForFreeCta from '$lib/components/system/GetStarterForFreeCta.svelte';

  const { data, class: className = '' } = $props();
</script>

<div class="hero {className}">
  <div class="hero-content layout:grid layout:max-width">
    <div class="hero-inner">
      <div class="mobile-logo">
        <img alt="Logo" src="/images/logo.svg" />
        <span class="header-logo-text">ASL Pal</span>
      </div>
      <h1 class="hero-title type:h1-display">{data.title}</h1>
      <GetStarterForFreeCta className="hero-ctas" data={data} />
    </div>
  </div>
</div>

<style lang="scss">
  .hero {
    padding-block-start: 0;
    position: relative;
    z-index: 5;

    @media screen and (min-width: 768px) {
      padding-block-start: 40px;
    }

    @media screen and (min-width: 1024px) {
      padding-block-start: 100px;
    }
  }

  .hero-inner {
    grid-column: 1 / -1;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    @media screen and (min-width: 768px) {
      grid-column: 3 / span 8;
    }

    .mobile-logo {
      display: block;
      @media screen and (min-width: 768px) {
        display: none;
      }
    }
  }

  .hero-content {
    position: relative;
    z-index: 5;
  }

  .hero-title {
    margin-block-end: 32px;
    text-align: center;
    max-inline-size: 500px;

    @media screen and (min-width: 768px) {
      margin-block-end: 60px;
      max-inline-size: 100%;
    }
  }

  .mobile-logo {
    margin-block-end: 32px;
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
