<script>
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import { page } from '$app/state';

  const dashboardNavItems = [
    { id: 1, icon: ICONS.GRID_VIEW, link: '/dashboard', text: 'Dashboard' },
    { id: 2, icon: ICONS.STATS, link: '/dashboard/my-progress', text: 'My progress' },
    { id: 3, icon: ICONS.SETTINGS, link: '/dashboard/settings', text: 'Settings' }
  ];
</script>

<div class="dashboard-nav">
  <div class="dashboard-nav-inner layout:stack">
    {#each dashboardNavItems as navItem (navItem.id)}
      <a href={navItem.link} class="nav-item" class:active={navItem.link === page.url.pathname}>
        <Icon type={navItem.icon} />
        <span class="nav-label type:label-medium">{navItem.text}</span>
      </a>
    {/each}
  </div>
</div>

<style lang="scss">
  .dashboard-nav {
    position: fixed;
    height: 100%;
    display: flex;
    align-items: center;
    top: 0;
    left: 36px;
    z-index: 8;
  }

  .dashboard-nav-inner {
    --gap: 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    block-size: 64px;
    inline-size: 48px;
    border-radius: 99em;
    position: relative;

    .nav-label {
      white-space: nowrap;
      position: absolute;
      left: calc(100% + 8px);
      text-decoration: none;
      color: var(--color-dark-100);
      pointer-events: none;
      background: var(--color-white-100);
      padding: 4px 8px;
      border-radius: 99em;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover {
      --icon-color: var(--color-primary-blue);

      .nav-label {
        opacity: 1;
      }
    }

    &.active {
      background: #f2f2f6;
    }
  }
</style>
