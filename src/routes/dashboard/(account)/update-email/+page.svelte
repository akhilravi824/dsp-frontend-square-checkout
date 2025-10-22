<script lang="ts">
  import { ICONS } from '$lib/components/system/icons/types.js';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import { authApi } from '$lib/api/index.js';
  import { ROUTES } from '$lib/routes';
  import { profileService } from '$lib/services/index.js';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import { headerBackLink } from '$lib/stores/appStore';
  import { onMount } from 'svelte';
  import type { PageProps } from './$types';

  let blockSubmission = $state(true);
  let formRef: HTMLFormElement | null = $state(null);
  let email = $state('');
  let showConfirmation = $state(false);
  let emailToVerify = $state('');
  let { data }: PageProps = $props();
  let inputPassword: InputText | null = $state(null);
  let inputConfirmPassword: InputText | null = $state(null);
  let isProcessing = $state(false);

  onMount(() => {
    headerBackLink.set({ label: 'Back to settings', href: ROUTES.SETTINGS });
  });

  function isFormValid() {
    if (!formRef) return false;
    if (!inputPassword || !inputConfirmPassword) return false;

    const inputsToTest = [inputPassword, inputConfirmPassword];

    return inputsToTest.every((input) => {
      return input.isValid();
    });
  }

  function checkFormValidity() {
    blockSubmission = !isFormValid();
  }

  function onInputChange() {
    checkFormValidity();
  }

  async function onFormSubmit(e: Event) {
    e.preventDefault();
    if (blockSubmission) return;
    if (!formRef) return;

    const formData = new FormData(formRef);
    const newEmail = formData.get('new-email') as string;
    const confirmEmail = formData.get('new-email-confirm') as string;

    if (!newEmail || newEmail === '' || newEmail === null) {
      showError('Email is required');
      return;
    }

    if (newEmail !== confirmEmail) {
      showError("Emails don't match");
      return;
    }

    isProcessing = true;
    const response = await profileService.updateEmail(newEmail);
    if (response) {
      emailToVerify = newEmail;
      showConfirmation = true;
    } else {
      showConfirmation = false;
    }
    isProcessing = false;
  }

  function createExactMatchRegex(string) {
    const escapedString = string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    return new RegExp('^' + escapedString + '$');
  }

  function emailType(value: string) {
    email = value;
    onInputChange();
  }

  let confirmEmailPattern = $derived(createExactMatchRegex(email));

  async function onResentClick() {
    if (!emailToVerify) return;

    try {
      const response = await authApi.resentEmail({ email: emailToVerify });
      showSuccess('Verification email has been resent.', 5000);
      if (!response.success) {
        throw new Error('Failed to resend email');
      }
    } catch (error) {
      showError('Failed to resend email', 5000);
    }
  }

  function previousStep() {
    showConfirmation = false;
  }
</script>

<div class="page-reset-password">
  <div class="page-inner layout:zstack">
    {#if !showConfirmation}
      <div class="request-step layout:grid">
        <form bind:this={formRef} class="form layout:form-wrapper" onsubmit={onFormSubmit}>
          <div class="page-header">
            <h1 class="type:h1">Change your email used to login to your ASL Pal account</h1>
          </div>
          <div class="layout:input-group">
            <InputText
              bind:this={inputPassword}
              errorMessage="Enter a valid email"
              icon={ICONS.EMAIL}
              label="New email"
              name="new-email"
              type="email"
              onChange={emailType}
              required
            />
            <InputText
              bind:this={inputConfirmPassword}
              errorMessage="Email do not match"
              icon={ICONS.EMAIL}
              label="Confirm new email"
              name="new-email-confirm"
              type="email"
              onInput={onInputChange}
              pattern={confirmEmailPattern}
              required
            />
          </div>
          <div class="step-bottom-bar layout:stack">
            <Button
              alignment="center"
              class="space:d16"
              disabled={blockSubmission}
              icon={ICONS.ARROW_FORWARD}
              type="submit"
              hovered
              loading={isProcessing}
            >
              <span>Change email</span>
            </Button>
          </div>
        </form>
      </div>
    {/if}
    {#if showConfirmation}
      <div class="confirmation-step">
        <div class="layout:form-wrapper">
          <span></span>
          <div class="page-header type:h1">
            <p>Verify your email!</p>
            <p>Click the link we sent to {email} to continue.</p>
          </div>
          <div class="step-bottom-bar layout:stack">
            <Button
              alignment="center"
              class="space:d16"
              icon={ICONS.ARROW_FORWARD}
              onclick={onResentClick}
              type="submit"
            >
              <span>Resend email</span>
            </Button>
            <p class="type:label text-color:dark-60 text-link">Didn’t receive one? Check your spam, or send again.</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .page-inner {
    padding-block-start: max(4.5vh, 24px);
    padding-block-end: 42px;
    --input-background-color: var(--color-white-100);

    .page-header {
      text-align: center;
    }

    .form {
      grid-column: 5 / span 4;
    }
  }
</style>
