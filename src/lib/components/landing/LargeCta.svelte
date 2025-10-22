<script lang="ts">
  import GetStarterForFreeCta from '$lib/components/system/GetStarterForFreeCta.svelte';
  import Media from './Media.svelte';

  const { data, class: className = '' } = $props();
</script>

<section class="large-cta {className}">
  <div class="layout:grid layout:max-width">
    <div class="section-inner">
      {#if data.media}
        <div class="media-wrapper space:d32">
          <Media media={data.media}></Media>
        </div>
      {/if}
      <div class="section-title space:d64">
        <h2 class="type:h1-display">{data.title}</h2>
      </div>
      <GetStarterForFreeCta data={data} />
    </div>
  </div>
</section>

<style lang="scss">
  .large-cta {
    --_headline-max-w: var(--section-headline-max-width, 760px);
  }

  .section-inner {
    grid-column: 1 / -1;

    @media screen and (min-width: 768px) {
      grid-column: 3 / span 8;
    }
  }

  .section-title {
    text-align: center;
    max-width: var(--_headline-max-w);
  }

  .media-wrapper {
    width: 100%;
  }

</style>
