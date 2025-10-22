<script lang="ts">
  import Media from './Media.svelte';

  const { data } = $props();
</script>

{#if data.mediaBlock}
  <section class="media-block {data.width} space:d176">
    <div class="layout:max-width layout:grid">
      <div class="media-wrapper">
        <Media media={data.mediaBlock} />
      </div>
    </div>
  </section>
{/if}

<style lang="scss">
  .media-wrapper {
    grid-column: 1 / -1;

    @media screen and (min-width: 768px) {
      grid-column: 2 / span 10;
    }
  }
</style>
