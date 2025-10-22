<script lang="ts">
  import Accordion from '$lib/components/system/Accordion.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import CheckboxLarge from '$lib/components/system/inputs/CheckboxLarge.svelte';
  import Modal from '$lib/components/system/Modal.svelte';
  import { profileService } from '$lib/services';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import type { NotificationsSection } from '$lib/../types/sanity.types';

  const { profileData, componentData }: { profileData: any; componentData: NotificationsSection } = $props();
  let blockSubmission = $state(true);
  let formRef: HTMLFormElement;
  let toggleAccordion = $state(true);
  let confirmationModalOpened = $state(false);

  function onInputChange() {
    const formData = new FormData(formRef);
    const tipsAndGuidance = formData.get('tips-and-guidance') ? true : false;
    const productUpdates = formData.get('product-updates') ? true : false;

    if (tipsAndGuidance === profileData.tipsAndGuidance && productUpdates === profileData.productUpdates) {
      blockSubmission = true;
    } else {
      blockSubmission = false;
    }
  }

  function getNotificationMessage(
    prevTips: boolean,
    prevProduct: boolean,
    newTips: boolean,
    newProduct: boolean
  ): string {
    const tipsChanged = prevTips !== newTips;
    const productChanged = prevProduct !== newProduct;
    const tipsAction = newTips ? 'subscribed to' : 'unsubscribed from';
    const productAction = newProduct ? 'subscribed to' : 'unsubscribed from';

    if (tipsChanged && productChanged) {
      if (newTips && newProduct) {
        return 'You have successfully subscribed to all marketing emails.';
      } else if (!newTips && !newProduct) {
        return 'You have successfully unsubscribed from all marketing emails.';
      } else {
        return 'Your notification preferences have been updated.';
      }
    } else if (tipsChanged) {
      return `You have successfully ${tipsAction} tips and guidance emails.`;
    } else if (productChanged) {
      return `You have successfully ${productAction} product updates emails.`;
    } else {
      return 'No changes made to your notification preferences.';
    }
  }

  async function submitPreference(tipsAndGuidance: boolean, productUpdates: boolean) {
    const previousTips = profileData.tipsAndGuidance;
    const previousProduct = profileData.productUpdates;
    try {
      const success = await profileService.updateNotificationPreferences({
        tipsAndGuidance,
        productUpdates
      });
      if (success) {
        const message = getNotificationMessage(previousTips, previousProduct, tipsAndGuidance, productUpdates);
        showSuccess(message, 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('Something went wrong', 5000);
    } finally {
      confirmationModalOpened = false;
    }
  }

  async function onFormSubmit(e: FormDataEvent) {
    e.preventDefault();
    if (!formRef || blockSubmission) return;
    const formData = new FormData(formRef);

    const tipsAndGuidance = formData.get('tips-and-guidance') ? true : false;
    const productUpdates = formData.get('product-updates') ? true : false;
    submitPreference(tipsAndGuidance, productUpdates);
  }

  function subscribeToAll() {
    if (profileData.tipsAndGuidance && profileData.productUpdates) {
      showError('You are already subscribed to all notifications.', 5000);
      return;
    }
    submitPreference(true, true);
  }

  function unsubscribeFromAll() {
    if (!profileData.tipsAndGuidance && !profileData.productUpdates) {
      showError('You are already unsubscribed from all notifications.', 5000);
      return;
    }
    submitPreference(false, false);
  }

  function confirmAllUpdates() {
    if (!profileData.tipsAndGuidance && !profileData.productUpdates) {
      subscribeToAll();
    } else if (profileData.tipsAndGuidance && profileData.productUpdates) {
      unsubscribeFromAll();
    }
  }
</script>

<div class="section-settings settings-security">
  <Modal
    modalClass="modal-confirmation"
    open={confirmationModalOpened}
    onClose={() => (confirmationModalOpened = false)}
  >
    <div class="modal-content">
      <p class="type:h2 space:d32">
        {#if !profileData.tipsAndGuidance && !profileData.productUpdates}
          <span>Subscribe to all notifications?</span>
        {:else if profileData.tipsAndGuidance && profileData.productUpdates}
          <span>Unsubscribe from all notifications?</span>
        {/if}
      </p>
      <div class="modal-actions">
        <Button onclick={confirmAllUpdates}>
          {#if !profileData.tipsAndGuidance && !profileData.productUpdates}
            <span>Subscribe to all</span>
          {:else if profileData.tipsAndGuidance && profileData.productUpdates}
            <span>Unsubscribe from all</span>
          {/if}
        </Button>
        <Button variant="secondary" onclick={() => (confirmationModalOpened = false)}>Cancel</Button>
      </div>
    </div>
  </Modal>
  <Accordion isOpen={toggleAccordion}>
    {#snippet header()}
      <div class="section-heaeder">
        <h2 class="type:h2 space:d6">{componentData.title}</h2>
        <p class="type:body text-color:dark-60">{componentData.description}</p>
      </div>
    {/snippet}
    {#snippet body()}
      <form class=" profile-form" onsubmit={onFormSubmit} bind:this={formRef}>
        <div class="input-fields layout:stack space:d32">
          <CheckboxLarge
            name="tips-and-guidance"
            label="Tips, tricks and helpful guidance"
            checked={profileData.tipsAndGuidance}
            onChange={onInputChange}
          />
          <CheckboxLarge
            name="product-updates"
            label="Product updates and learning tips"
            checked={profileData.productUpdates}
            onChange={onInputChange}
          />
        </div>
        <div class="layout:inline-flex">
          <Button disabled={blockSubmission} type="submit">Save changes</Button>
          {#if !profileData.tipsAndGuidance && !profileData.productUpdates}
            <Button
              variant="secondary"
              type="button"
              onclick={() => {
                confirmationModalOpened = true;
              }}><span>Subscribe to all</span></Button
            >
          {:else if profileData.tipsAndGuidance && profileData.productUpdates}
            <Button
              variant="secondary"
              type="button"
              onclick={() => {
                confirmationModalOpened = true;
              }}
              ><span>Unsubscribe from all</span>
            </Button>
          {/if}
        </div>
      </form>
    {/snippet}
  </Accordion>
</div>

<style lang="scss">
  .input-fields {
    --space: 6px;
  }

  :global(.modal-confirmation) {
    .modal-content {
      inline-size: 634px;
    }
  }
</style>
