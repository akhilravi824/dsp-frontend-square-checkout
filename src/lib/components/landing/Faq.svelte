<script lang="ts">
  import { toHTML } from '@portabletext/to-html';
  import Accordion from '../system/Accordion.svelte';

  const { data, class: className = '' } = $props();
</script>

<div class="faq {className}">
  <div class="faq-inner layout:max-width layout:grid">
    <h2 class="faq-title type:h1 space:d60">{data.title}</h2>
    <div class="faq-wrapper layout:stack">
      {#each data.items as item (item._key)}
        <Accordion>
          {#snippet header()}
            <p class="type:body-large-medium">{item.question}</p>
          {/snippet}
          {#snippet body()}
            <div class="type:body-large text-color:dark-60">
              {@html toHTML(item.answer)}
            </div>
          {/snippet}
        </Accordion>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .faq {
    --space: 6px;
  }

  .faq-wrapper {
    grid-column: 1 / -1;

    @media screen and (min-width: 834px) {
      grid-column: 2 / span 10;
    }
  }

  .faq-title {
    text-align: center;
    grid-column: 1 / -1;

    @media screen and (min-width: 834px) {
      grid-column: 2 / span 10;
    }
  }
</style>
