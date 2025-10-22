<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import CheckboxLarge from '$lib/components/system/inputs/CheckboxLarge.svelte';
  import InputPassword from '$lib/components/system/inputs/InputPassword.svelte';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import RichText from '$lib/components/system/RichText.svelte';
  import { authApi } from '$lib/api';
  import { showError } from '$lib/stores/toastStore';

  let { showUniversity = false, onFormSubmit, formCopy, questionnaireResult } = $props();

  let formRef: HTMLFormElement;
  let blockSubmission = $state(true);
  let password = $state('');
  let inputPassword: HTMLInputElement;
  let inputConfirmPassword: HTMLInputElement;
  let isProcessing = $state(false);

  function isFormValid() {
    if (!formRef) return false;

    const inputs = formRef.querySelectorAll('input, select');

    const formData = new FormData(formRef);
    const password = formData.get('password');
    const passwordConfirm = formData.get('confirmPassword');

    if (!password || !passwordConfirm) return false;

    for (let input of inputs) {
      if (!input.checkValidity()) {
        return false;
      }
    }

    if (password !== passwordConfirm) {
      return false;
    }

    return true;
  }

  async function onSubmit(e: FormDataEvent) {
    e.preventDefault();
    if (isProcessing) return;
    if (!formRef) return;
    if (!isFormValid()) return;
    //

    isProcessing = true;
    const url = formRef?.getAttribute('action');
    if (!url) return;
    const formData = new FormData(formRef);
    //
    try {
      const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        consent: formData.get('consent') === 'on',
        university: '',
        allow_video_usage: false,
        signup_data: questionnaireResult
      };

      if (showUniversity && formData.get('university')) {
        data.university = formData.get('university');
      }

      const response = await authApi.signup(data);
      if (!response.success) {
        throw new Error(`Response status: ${response.status}`);
      }

      if (onFormSubmit) onFormSubmit(response);
    } catch (error) {
      showError(error.message, 5000);
      console.error(error.message);
    } finally {
      isProcessing = false;
    }
  }

  function checkFormValidity() {
    blockSubmission = !isFormValid();
  }

  function onInputChange() {
    checkFormValidity();
  }

  function passwordType(value: string) {
    password = value;
    onInputChange();
  }

  function createExactMatchRegex(string) {
    const escapedString = string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    return new RegExp('^' + escapedString + '$');
  }

  const passwordPattern = "(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=[\\]{};':,./<>?]).{8,}";
  let confirmPasswordPattern = $derived(createExactMatchRegex(password));

  export const resetPassword = () => {
    if (inputPassword) {
      inputPassword.reset();
    }
    if (inputConfirmPassword) {
      inputConfirmPassword.reset();
    }
    blockSubmission = true;
  };
</script>

<section class="sign-up-step">
  <div class="layout:grid">
    <div class="sign-up-form-wrapper">
      <form
        action="https://dsp-backend-three.vercel.app/api/auth/signup"
        bind:this={formRef}
        class="form"
        onsubmit={onSubmit}
      >
        {#if formCopy}
          <h2 class="type:h1 form-title space:d48">
            {formCopy.title || ''}
          </h2>
        {/if}
        <div class="fields-group layout:stack">
          <div class="form-field-row">
            <InputText
              errorMessage="Please enter a valid name"
              icon={ICONS.PERSON}
              label="Name"
              name="name"
              onInput={onInputChange}
              required
              type="text"
            />
            {#if showUniversity}
              <InputText
                errorMessage="Please enter an university name"
                icon={ICONS.UNIVERSITY}
                label="University"
                name="university"
                onInput={onInputChange}
                required
                type="text"
              />
            {/if}
          </div>
          <InputText
            errorMessage="Please enter a valid email address"
            icon={ICONS.EMAIL}
            label="Email"
            name="email"
            onInput={onInputChange}
            required
            type="email"
          />
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
          {#if formCopy.consent}
            <CheckboxLarge label={formCopy.consent} name="consent" />
          {/if}
          <div class="step-bottom-bar">
            <Button
              alignment="center"
              class="space:d16"
              disabled={blockSubmission}
              loading={isProcessing}
              hovered={true}
              icon={ICONS.ARROW_FORWARD}
              type="submit"
            >
              <span>Register</span>
            </Button>
            <RichText bodyTypeClass="type:label text-color:dark-60 text-link" copy={formCopy.agreement} />
          </div>
        </div>
      </form>
    </div>
  </div>
</section>

<style lang="scss">
  .sign-up-step {
    inline-size: 100%;
    padding-block-start: 40px;
    padding-block-end: 42px;
  }

  .form-title {
    text-align: center;
    max-inline-size: 720px;
    margin-inline: auto;
  }

  .sign-up-form-wrapper {
    grid-column: 4 / span 6;
  }

  .fields-group {
    --space: 6px;
    flex: 1;
    display: flex;
    flex-direction: column;
    --input-background-color: var(--color-white-100);
  }

  .form-field-row {
    display: flex;
    gap: 6px;
    align-items: center;

    & > :global(*) {
      flex: 1;
    }
  }

  .step-bottom-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: auto;
    padding-top: var(--space-d16);
    margin-top: 40px;
  }
</style>
