<script>
  import { toHTML } from '@portabletext/to-html';
  import Button from '../system/Button.svelte';
  import { ICONS } from '../system/icons/types';
  import { ROUTES } from '$lib/routes.js';
  import Media from './Media.svelte';
  import GetStarterForFreeCta from '$lib/components/system/GetStarterForFreeCta.svelte';

  const { data, class: className = '' } = $props();
</script>

<section class="cloud-images {className}">
  <div class="cloud-images-wrapper">
    {#each data.media as media (media._key)}
      {#if media.media.mediaType === 'image'}
        <div class="image-wrapper box-rounded:md">
          <Media media={media.media} />
        </div>
      {/if}
    {/each}
  </div>
  <div class="layout:grid layout:max-width">
    <div class="bottom-cta">
      <img alt={data.largeCta.media.title} class="logo space:d24" src={data.largeCta.media.image.assetUrl} />
      <h2 class="title type:h1-display space:d60">{data.largeCta.title}</h2>
      <GetStarterForFreeCta data={data.largeCta} />
    </div>
  </div>
</section>

<style lang="scss">
  .cloud-images {
    position: relative;
    padding-inline: var(--landing-page-padding-inline);
  }

  .cloud-images-wrapper {
    aspect-ratio: 342 / 555;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(18, 1fr);
    inline-size: 100%;
    margin-inline: auto;
    max-inline-size: 1372px;
    position: relative;

    @media screen and (min-width: 768px) {
      aspect-ratio: 1372 / 872;
      grid-template-columns: repeat(24, 1fr);
    }
  }

  .cloud-images-wrapper {
    .image-wrapper:nth-child(1),
    .image-wrapper:nth-child(2),
    .image-wrapper:nth-child(3) {
      display: none;
      @media screen and (min-width: 768px) {
        display: block;
      }
    }

    .image-wrapper:nth-child(1) {
      grid-area: 3 / 1 / span 6 / span 4;
    }

    .image-wrapper:nth-child(2) {
      grid-area: 1 / 9 / span 5 / span 6;
    }

    .image-wrapper:nth-child(3) {
      grid-area: 3 / 17 / span 6 / span 5;
    }

    .image-wrapper:nth-child(4) {
      grid-area: 1 / 8 / span 5 / span 5;

      @media screen and (min-width: 768px) {
        grid-area: 8 / 7 / span 6 / span 5;
      }
    }

    .image-wrapper:nth-child(5) {
      grid-area: 5 / 1 / span 5 / span 5;
      @media screen and (min-width: 768px) {
        grid-area: 11 / 14 / span 4 / span 3;
      }
    }

    .image-wrapper:nth-child(6) {
      grid-area: 12 / 2 / span 5 / span 5;

      @media screen and (min-width: 768px) {
        grid-area: 14 / 22 / span 4 / span 3;
      }
    }

    .image-wrapper:nth-child(7) {
      grid-area: 9 / 8 / span 3 / span 5;

      @media screen and (min-width: 768px) {
        grid-area: 16 / 2 / span 3 / span 4;
      }
    }
  }

  .bottom-cta {
    grid-column: 2 / span 4;
    text-align: center;
    padding-block-start: 12px;

    @media screen and (min-width: 768px) {
      grid-column: 2 / span 10;
    }

    @media screen and (min-width: 1024px) {
      grid-column: 4 / span 6;
      margin-block-start: -80px;
    }
  }

  .logo {
    block-size: 140px;
    margin-inline: auto;
  }

  .title {
    max-inline-size: 340px;
    text-align: center;
    margin-inline: auto;

    @media screen and (min-width: 1024px) {
      max-inline-size: 560px;
    }
  }
</style>
