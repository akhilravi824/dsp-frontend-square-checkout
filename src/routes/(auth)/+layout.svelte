<script lang="ts">
  import '../../styles/index.scss';
  import { beforeNavigate } from '$app/navigation';
  import OnlyDesktopScreen from '$lib/components/system/OnlyDesktopScreen.svelte';
  import { breakpoints } from '$lib/stores/mediaQueries.svelte';
  import { previousUrl } from '$lib/stores/navigationStore';
  import type { LayoutData } from './$types';

  beforeNavigate(() => {
    previousUrl.set(window.location.pathname);
  });

  let { data, children } = $props<{ data: LayoutData; children: any }>();
</script>

{#if breakpoints.desktop.mediaQuery}
  <div class="page-wrapper">
    {@render children()}
  </div>
{:else}
  <OnlyDesktopScreen data={data.globals.onlyDesktop} />
{/if}

<style lang="scss">
  .page-wrapper {
    --container-max-width: 1600px;
    min-block-size: 100vh;
    inline-size: 100%;
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

    @media (max-width: 1024px) {
      display: none;
    }
    :global(.offset-from-header) {
      padding-block-start: 36px;
    }

    :global(.layout\:form-wrapper) {
      block-size: calc(100vh - 120px - 36px - 42px);
      max-height: 680px;
      min-height: 450px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      :global(.step-bottom-bar) {
        align-items: center;
        text-align: center;
        --space: 12px;
      }
    }
  }
</style>
