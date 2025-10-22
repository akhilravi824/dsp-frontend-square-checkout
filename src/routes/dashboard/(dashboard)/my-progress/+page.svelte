<script lang="ts">
  import { userProfile } from '$lib/stores/userProfile';
  import { replaceDynamicContent } from '$lib/utils/copy';
  import type { PageData } from './$types';
  import Section from '$lib/components/dashboard/my-progress/sections/Section.svelte';

  const { data } = $props<{ data: PageData }>();
</script>

<div class="layout:max-width">
  <div class="header space:d80">
    <h1 class="type:h1 space:d12">{data.page.title}</h1>
    {#if $userProfile?.createdAt}
      <p class="type:body text-color:dark-60">
        {replaceDynamicContent(
          data.page.description,
          'date',
          new Date($userProfile?.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        )}
      </p>
    {/if}
  </div>
  <div class="layout:stack components">
    {#each data.page.components || [] as component}
      <Section data={component} />
    {/each}
  </div>
</div>

<style lang="scss">
  .header {
    text-align: center;
  }

  .components {
    --space: var(--space-80);
    padding-block-end: var(--space-80);

    :global(.section-header p) {
      max-inline-size: 360px;
    }
  }
</style>
