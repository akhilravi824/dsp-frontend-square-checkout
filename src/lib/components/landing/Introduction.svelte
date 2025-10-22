<script>
  import Media from './Media.svelte';

  const { data, class: className = '' } = $props();
</script>

<div class="introduction {className}">
  <div class="layout:grid layout:max-width">
    <div class="introduction-video space:d64">
      <Media media={data.media} />
    </div>
  </div>
  <div class="introduction-infos layout:grid layout:max-width">
    {#each data.quickFacts.facts as fact, index (index)}
      <div class="introduction-info layout:stack">
        <img class="introduction-info-icon" src={fact.icon.url} alt="" />
        <p class="introduction-info-description type:body">{fact.title}</p>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .introduction-video {
    grid-column: 1 / -1;
    @media (min-width: 768px) {
      grid-column: 2 / span 10;
    }

    @media (min-width: 768px) and (max-width: 1023px) {
      margin-block-end: 80px;
    }
  }

  .introduction-infos {
    --grid-row-gap: 50px;
  }

  .introduction-info {
    grid-column: span 3 / auto;
    align-items: center;
    text-align: center;
    --space: 14px;

    @media (min-width: 834px) {
      grid-column: span 2 / auto;

      &:first-child {
        grid-column: 3 / span 2;
      }
    }

    .introduction-info-icon {
      block-size: 48px;
    }
  }
</style>
