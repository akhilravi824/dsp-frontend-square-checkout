<script lang="ts">
  import { ICONS } from '$lib/components/system/icons/types.js';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import SimpleHeader from '$lib/components/system/headers/SimpleHeader.svelte';
  import { authApi } from '$lib/api/index.js';
  import { showError } from '$lib/stores/toastStore';

  let blockSubmission = $state(true);
  let formRef: HTMLFormElement | null = $state(null);
  let emailRequested: string | null = $state(null);
  let showConfirmation = $state(false);

  function isFormValid() {
    if (!formRef) return false;

    const inputs: NodeListOf<HTMLInputElement | HTMLSelectElement> = formRef.querySelectorAll('input, select');

    for (let input of inputs) {
      if (!input.checkValidity()) {
        return false;
      }
    }
    return true;
  }

  function checkFormValidity() {
    blockSubmission = !isFormValid();
  }

  function onInputChange() {
    checkFormValidity();
  }

  async function onFormSubmit(e: Event) {
    e.preventDefault();
    if (!formRef) return;

    const formData = new FormData(formRef);

    const email = `${formData.get('email')}`;

    if (!email) {
      console.error('Email is required');
      return;
    }

    await requestReset(email);
  }

  async function requestReset(email: string) {
    try {
      const response = await authApi.requestPasswordReset({
        email: email
      });

      emailRequested = email;
      showConfirmation = true;
    } catch (error) {
      console.error('Reset password failed:', error);
      showError(error as string, 5000);
      return;
    }
  }

  function onResentClick() {
    showConfirmation = false;
  }
</script>

<div class="page-reset-password">
  <SimpleHeader>
    {#snippet leftPart()}
      <a href="/login" class="type:header-link">Back to sign in</a>
    {/snippet}
  </SimpleHeader>
  <div class="page-inner layout:zstack">
    {#if !showConfirmation}
      <div class="request-step layout:grid">
        <form bind:this={formRef} class="form layout:form-wrapper" onsubmit={onFormSubmit}>
          <div class="page-header offset-from-header">
            <h1 class="type:h1 space:d16">Reset password</h1>
            <p class="type:h3 text-color:dark-60">We will send instruction on how to reset your password by email.</p>
          </div>
          <InputText
            errorMessage="Please enter a valid email address"
            icon={ICONS.EMAIL}
            label="Email"
            name="email"
            onInput={onInputChange}
            required
            value={emailRequested || ''}
            type="email"
          />
          <div class="step-bottom-bar layout:stack">
            <Button
              alignment="center"
              class="space:d16"
              disabled={blockSubmission}
              icon={ICONS.ARROW_FORWARD}
              type="submit"
              hovered
            >
              <span>Send instruction</span>
            </Button>
            <p class="type:label text-color:dark-60 text-link">Make sure to check your inbox and spam folder.</p>
          </div>
        </form>
      </div>
    {/if}
    {#if showConfirmation}
      <div class="confirmation-step">
        <div class="layout:form-wrapper">
          <span></span>
          <div class="page-header type:h1">
            <p>Great!</p>
            <p>Please click the link in your email to continue.</p>
          </div>
          <div class="step-bottom-bar layout:stack">
            <Button
              alignment="center"
              class="space:d16"
              icon={ICONS.ARROW_FORWARD}
              onclick={onResentClick}
              type="submit"
              hovered
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
