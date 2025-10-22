<script lang="ts">
  import DashboardFooter from '$lib/components/dashboard/DashboardFooter.svelte';
  import { headerBackLink, showDashboardNav } from '$lib/stores/appStore';
  import { onMount } from 'svelte';

  const { children } = $props<{ children: any }>();

  onMount(() => {
    showDashboardNav.set(true);
  });
</script>

<div class="user-dashboard-layout">
  {@render children()}
  <DashboardFooter />
</div>

<style lang="scss">
  .user-dashboard-layout {
    padding-block-start: 120px;
    padding-block-end: 64px;
  }
</style>
