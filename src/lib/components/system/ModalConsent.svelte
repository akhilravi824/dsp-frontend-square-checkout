<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { profileService } from '$lib/services';
  import Modal from '$lib/components/system/Modal.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import { goto } from '$app/navigation';

  let { isConsentVideos, nextLesson } = $props<{ isConsentVideos: boolean; nextLesson: string | null }>();

  const dispatch = createEventDispatcher();

  async function consentVideoHandler(consent: boolean) {
    await profileService.updateVideoUsageConsent(consent);
    console.log('goto', nextLesson);
    goto(nextLesson || '/levels/1');
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<Modal modalClass="modal-consent-video" open={isConsentVideos} onClose={handleClose}>
  <div class="inner">
    <h3 class="title type:h2">Help us make the platform more accurate and useful for everyone</h3>
    <ul>
      <li class="copy type:body">
        We’d like to use your uploaded videos to help improve the language recognition in ASL Pal.
      </li>
      <li class="copy type:body">
        Your videos will never be shared publicly and you can always change your mind in settings later.<a
          href="https://dawnsign.com/privacy-policy-1"
          target="_blank"
        >
          Learn more</a
        >
      </li>
    </ul>
    <p class="copy type:body-large-medium">Allow ASL Pal to use my videos to improve the platform technology</p>
    <div class="modal-actions">
      <Button onclick={() => consentVideoHandler(true)}>Yes</Button>
      <Button variant="secondary" onclick={() => consentVideoHandler(false)}>No thanks</Button>
    </div>
  </div>
</Modal>

<style lang="scss">
  :global(.modal-consent-video) {
    .title {
      margin-bottom: 32px;
    }

    .copy {
      margin-bottom: 24px;
    }
  }

  :global(.modal-consent-video .dialog-content) {
    max-width: 630px;
  }

  :global(.modal-consent-video .dialog-button-close) {
    display: none;
  }

  :global(.modal-consent-video .button.secondary) {
    --btn-fill: transparent;
    --btn-fill-hover: var(--color-dark-10);
  }
</style>
