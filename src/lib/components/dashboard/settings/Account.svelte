<script lang="ts">
  import { ICONS } from '$lib/components/system/icons/types.js';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import Accordion from '$lib/components/system/Accordion.svelte';
  import type { AccountSection } from '$lib/../types/sanity.types';
  import { ROUTES } from '$lib/routes';

  const { profileData, componentData }: { profileData: any; componentData: AccountSection } = $props();
  let toggleAccordion = $state(true);
</script>

<div class="section-settings settings-security">
  <Accordion isOpen={toggleAccordion}>
    {#snippet header()}
      <div class="section-header">
        <h2 class="type:h2 space:d6">{componentData.title}</h2>
        <p class="type:body text-color:dark-60">{componentData.description}</p>
      </div>
    {/snippet}
    {#snippet body()}
      <form class=" profile-form">
        <div class="input-fields layout:stack">
          <div class="cta-wrapper">
            <InputText label={profileData.email} icon={ICONS.EMAIL} disabled />
            <a href={ROUTES.UPDATE_EMAIL} class="cta-link type:label-medium">Change</a>
          </div>
          <div class="cta-wrapper">
            <InputText label="Password" icon={ICONS.PASSWORD} disabled />
            <a href={'/dashboard/reset-password'} class="cta-link type:label-medium">Change</a>
          </div>
        </div>
      </form>
    {/snippet}
  </Accordion>
</div>

<style lang="scss">
  .input-fields {
    --space: 6px;
  }

  .cta-wrapper {
    position: relative;

    :global(.input-component) {
      position: relative;
      z-index: 5;
    }

    .cta-link {
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      text-decoration: none;
      color: var(--color-primary-blue);
      cursor: pointer;
      z-index: 8;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
