<script lang="ts">
  import { ICONS } from '$lib/components/system/icons/types.js';
  import InputPassword from '$lib/components/system/inputs/InputPassword.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import SimpleHeader from '$lib/components/system/headers/SimpleHeader.svelte';
  import { authApi } from '$lib/api/index.js';
  import { ROUTES } from '$lib/routes';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import type { PageProps } from './$types';
  import { goto } from '$app/navigation';

  let blockSubmission = $state(true);
  let formRef: HTMLFormElement;
  let password = $state('');
  let { data }: PageProps = $props();
  let inputPassword: InputPassword | null = $state(null);
  let inputConfirmPassword: InputPassword | null = $state(null);

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
    if (!formRef) return;
    if (blockSubmission) return;
    if (!data.accessToken) {
      showError('Access token missing');
    }

    const formData = new FormData(formRef);

    if (formData.get('password') !== formData.get('confirmPassword')) {
      showError("Passwords don't match");
      return;
    }

    try {
      const response = await authApi.resetPassword({
        hash: data.hash,
        password: formData.get('password')
      });

      if (response.success) {
        try {
          const isConnected = await authApi.verify();
          if (isConnected) {
            await authApi.logout();
          }
        } catch (error) {
          showError(error, 5000);
          console.error('Logout failed:', error);
        } finally {
          showSuccess('Password reset successfully');
          goto(ROUTES.LOGIN);
        }
      }
    } catch (error) {
      showError(error, 5000);
      console.error('Login failed:', error);
    }
  }

  function createExactMatchRegex(string) {
    const escapedString = string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    return new RegExp('^' + escapedString + '$');
  }

  function passwordType(value?: string) {
    password = value;
    onInputChange();
  }

  const passwordPattern = "(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=[\\]{};':,./<>?]).{8,}";
  let confirmPasswordPattern = $derived(createExactMatchRegex(password));
</script>

<div class="page-reset-password">
  <SimpleHeader>
    {#snippet leftPart()}
      <a href="/login" class="type:header-link">Back to sign in</a>
    {/snippet}
  </SimpleHeader>
  <div class="page-inner layout:grid">
    <form bind:this={formRef} class="form layout:form-wrapper" onsubmit={onFormSubmit}>
      <div class="page-header">
        <h1 class="type:h1">Reset password</h1>
      </div>
      <div class="layout:stack">
        <InputPassword
          bind:this={inputPassword}
          errorMessage="Password must be 8 characters, with a number and special character."
          icon={ICONS.PASSWORD}
          label="Enter password"
          name="password"
          onInput={passwordType}
          pattern={passwordPattern}
          required
        />
        <InputPassword
          bind:this={inputConfirmPassword}
          errorMessage="Passwords do not match"
          icon={ICONS.PASSWORD}
          label="Confirm password"
          name="confirmPassword"
          onInput={onInputChange}
          pattern={confirmPasswordPattern}
          required
        />
      </div>
      <div class="step-bottom-bar layout:stack">
        <Button
          alignment="center"
          class="space:d16"
          disabled={blockSubmission}
          hovered
          icon={ICONS.ARROW_FORWARD}
          type="submit"
        >
          <span>Reset password</span>
        </Button>
        <p class="type:label text-color:dark-60 text-link">
          No account? <a href={ROUTES.SIGN_UP} style="color: currentColor">Create one</a>
        </p>
      </div>
    </form>
  </div>
</div>

<style lang="scss">
  .page-inner {
    padding-block-start: max(4.5vh, 24px);
    padding-block-end: 42px;

    .page-header {
      text-align: center;
    }

    .form {
      grid-column: 5 / span 4;
      --space: 6px;
      --input-background-color: var(--color-white-100);
    }
  }
</style>
