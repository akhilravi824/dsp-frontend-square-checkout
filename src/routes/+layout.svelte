<script lang="ts">
  import '../styles/index.scss';
  import ToastManager from '$lib/components/system/ToastManager.svelte';
  import type { SiteSettings } from '../types/sanity.types';

  const { children, data }: { children: any; data: { siteSettings: SiteSettings } } = $props();
</script>

<svelte:head>
  <title>{data.siteSettings.siteTitle}</title>
  <meta name="description" content={data.siteSettings.description} />
  <meta name="keywords" content={data.siteSettings.siteKeywords?.join(', ')} />
  <meta property="og:title" content={data.siteSettings.siteTitle} />
  <meta property="og:description" content={data.siteSettings.description} />
  <meta property="og:image" content={data.siteSettings.ogImage?.asset?.url} />
  <meta property="og:url" content={data.siteSettings.siteUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content={data.siteSettings.siteTitle} />
  <meta content="#f1eaff" name="theme-color" />
</svelte:head>
<ToastManager />
{@render children()}
