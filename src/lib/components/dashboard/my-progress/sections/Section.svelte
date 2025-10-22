<script lang="ts">
  import ProgressSection from '$lib/components/dashboard/my-progress/sections/ProgressSection.svelte';
  import PerformanceSection from '$lib/components/dashboard/my-progress/sections/PerformanceSection.svelte';
  import LatestProgressSection from '$lib/components/dashboard/my-progress/sections/LatestProgressSection.svelte';

  interface Props {
    data: {
      id: {
        current: string;
      };
      title: string;
      description: string;
    };
  }
  const { data }: Props = $props();
</script>

{#if data.id.current === 'progress'}
  <ProgressSection {data} />
{/if}

{#if data.id.current === 'performance'}
  <PerformanceSection {data} />
{/if}

{#if data.id.current === 'latest-progress'}
  <LatestProgressSection {data} />
{/if}
