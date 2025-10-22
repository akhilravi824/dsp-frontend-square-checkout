<script lang="ts">
  import { ICONS } from '$lib/components/system/icons/types.js';
  import Button from '$lib/components/system/Button.svelte';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import Accordion from '$lib/components/system/Accordion.svelte';
  import CheckboxLarge from '$lib/components/system/inputs/CheckboxLarge.svelte';
  import { profileService } from '$lib/services';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import type { ProfileSection } from '$lib/../types/sanity.types';

  const { profileData, componentData }: { profileData: any; componentData: ProfileSection } = $props();
  let blockSubmission = $state(true);
  let formRef: HTMLFormElement;
  let toggleAccordion = $state(true);
  let isStudent = $derived(profileData.signup_data.description === 'student');

  async function onFormSubmit(e) {
    e.preventDefault();
    if (blockSubmission) return;
    try {
      const formData = new FormData(formRef);
      const name = formData.get('name');
      const university = formData.get('university');
      const videoConsent = formData.get('video-consent');
      const videoConsentChecked = videoConsent === 'on';

      if (!name) {
        throw new Error('Name is required');
      }

      if (isStudent && !university) {
        throw new Error('University is required for students');
      }

      if (name !== profileData.name) {
        await profileService.updateName(name as string);
      }
      if (isStudent && university !== profileData.university) {
        await profileService.updateUniversity(university as string);
      }
      if (videoConsentChecked !== profileData.allow_video_usage) {
        await profileService.updateVideoUsageConsent(videoConsentChecked);
      }

      showSuccess('Profile changes successfully saved.', 5000);
    } catch (error) {
      showError('Something went wrong. Please try again.', 5000);
      console.error('Error submitting form:', error);
    }
  }

  function onInputChange() {
    const formData = new FormData(formRef);
    const name = formData.get('name');
    const university = formData.get('university');
    const videoConsent = formData.get('video-consent');
    const videoConsentChecked = videoConsent === 'on';

    if (!name || (!university && isStudent)) {
      blockSubmission = true;
      return;
    }

    if (name === '' || university === '') {
      blockSubmission = true;
      return;
    }

    const sameName = name === profileData.name;
    const sameUniversity = isStudent ? university === profileData.university : true;
    const sameVideoConsent = videoConsentChecked === profileData.allow_video_usage;

    blockSubmission = sameName && sameUniversity && sameVideoConsent;
  }
</script>

<div class="section-settings settings-security">
  <Accordion isOpen={toggleAccordion}>
    {#snippet header()}
      <div class="section-heaeder">
        <h2 class="type:h2 space:d6">{componentData.title}</h2>
        <p class="type:body text-color:dark-60">{componentData.description}</p>
      </div>
    {/snippet}
    {#snippet body()}
      {#if profileData}
        <form class=" profile-form" onsubmit={onFormSubmit} bind:this={formRef}>
          <div class="input-fields layout:stack space:d32">
            <InputText
              name="name"
              label="Full name"
              value={profileData.name}
              icon={ICONS.PERSON}
              required
              onInput={onInputChange}
            />

            {#if isStudent || profileData.university !== ''}
              <InputText
                name="university"
                label="University"
                value={profileData.university}
                icon={ICONS.UNIVERSITY}
                required
                onInput={onInputChange}
              />
            {/if}
            <CheckboxLarge
              name="video-consent"
              label={componentData.consentText}
              onChange={onInputChange}
              checked={profileData.allow_video_usage}
            />
            <p class="learn-more">
              * <a href={componentData.learnMoreAboutTermsUrl} target="_blank" class="link:underlined type:body"
                >{componentData.learnMoreAboutTermsText}</a
              >
            </p>
          </div>
          <Button disabled={blockSubmission}>Save changes</Button>
        </form>
      {:else}
        <p>Loading profile...</p>
      {/if}
    {/snippet}
  </Accordion>
</div>

<style lang="scss">
  .section-settings {
    --link-color: var(--color-dark-60);
    --link-hover-color: var(--color-dark-100);

    .input-fields {
      --space: 6px;
    }

    .learn-more {
      margin-block-start: 10px;
    }
  }
</style>
