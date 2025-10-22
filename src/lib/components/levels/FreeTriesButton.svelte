<script lang="ts">
  const { triesLeft } = $props<{ triesLeft: string }>();
</script>

<div class="free-tries-button type:label">
  {triesLeft} free lessons left
  <a class="subscribe-now type:label-bold" href="/dashboard/update-subscription">Subscribe now</a>
</div>

<style lang="scss">
  .subscribe-now {
    color: var(--color-dark-100);
    background-color: var(--color-white-100);
    border-radius: var(--border-radius-md);
    text-decoration: none;
    padding: 6px 17px;
    margin-left: 6px;
  }

  :global(.lesson-page .subscribe-now) {
    background: var(--color-dark-5);
  }
</style>
