<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import MfaScreen from '$lib/components/sign-up/MfaScreen.svelte';
  import { ROUTES } from '$lib/routes';
  import { onMount } from 'svelte';
  import { showError, showSuccess } from '$lib/stores/toastStore.js';
  import { page } from '$app/state';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import InputPassword from '$lib/components/system/inputs/InputPassword.svelte';
  import { ICONS } from '$lib/components/system/icons/types';
  import Button from '$lib/components/system/Button.svelte';
  import SimpleHeader from '$lib/components/system/headers/SimpleHeader.svelte';
  import { authApi, profileApi } from '$lib/api';
  import { fade } from 'svelte/transition';
  const { data } = $props<{ data: PageData }>();

  type MfaFactor = { id: string; type?: string };

  let blockSubmission = $state(true);
  let formRef = $state<HTMLFormElement | null>(null);
  let mfaRequired = $state(false);
  let mfaUserId = $state('');
  let mfaAccessToken = $state('');
  let mfaFactors = $state<MfaFactor[]>([]);
  let mfaFactorId = $state('');
  let loading = $state(true);
  let pageTitle = $state(data.page.title || "Welcome back! </br> It's great to see you again.");
  let loggingIn = $state(false);

  onMount(() => {
    checkStatus();
  });

  async function checkStatus() {
    const params = new URLSearchParams(page.url.hash.slice(1));

    if (params.has('access_token') || params.has('error')) {
      try {
        await authApi.logout();
      } catch (e) {
        console.error('Error logging out:', e);
      }
    }

    try {
      const response = await authApi.verify();
      if (response.authenticated) {
        goto(ROUTES.DASHBOARD);
        return;
      }
    } catch (e) {
      showError('Failed to verify authentication status. Please try again.', 3000);
    }
    parsePageUrl(params);
  }

  function parsePageUrl(params: URLSearchParams) {
    if (params.has('access_token')) {
      const emailType = params.get('type') as 'signup' | 'email_change' | null;
      if (emailType === 'signup') {
        pageTitle = data.page.afterSignUpTitle || 'Login to complete setting up your account';
        showSuccess('Your email was successfully verified!', 5000);
      } else if (emailType === 'email_change') {
        pageTitle = data.page.afterEmailUpdateTitle || 'Welcome back! <br> Login with your new email';
        showSuccess('Your email was successfully updated!', 5000);
      }
    } else if (params.has('error')) {
      const description = params.get('error_description');
      if (description) {
        showError(description, 5000);
      } else {
        showError('There was an error verifying your email. Please try again.', 5000);
      }
    }
    loading = false;
  }

  async function onLoginSubmit(e: Event) {
    e.preventDefault();

    if (loggingIn) {
      return;
    }

    if (!formRef) return;
    const formData = new FormData(formRef);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      showError('Email and password are required', 5000);
      return;
    }

    loggingIn = true;

    try {
      const loginResponse = await authApi.login({ email: email.toString(), password: password.toString() });

      if (loginResponse.mfaRequired) {
        mfaRequired = true;
        mfaFactors = loginResponse.factors || [];
        mfaUserId = loginResponse.userId;
        mfaAccessToken = loginResponse.accessToken || '';
        if (mfaFactors.length > 0) {
          mfaFactorId = mfaFactors[0].id;
        }
        return;
      }

      if (loginResponse.success && loginResponse.data?.user) {
        showSuccess('Login successful!', 5000);
        const profileResponse = await profileApi.getProfile();

        if (profileResponse.data?.signup_data?.description) {
          const learningTypeForm = new FormData();
          learningTypeForm.append('learningType', profileResponse.data.signup_data.description);
          try {
            await fetch('?/setLearningType', {
              method: 'POST',
              body: learningTypeForm
            });
          } catch (e) {
            console.error('Failed to persist learning type:', e);
          }
        }

        goto(ROUTES.DASHBOARD);
      } else {
        showError('Authentication failed after login. Please try again.', 5000);
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      showError(message, 5000);
      return;
    } finally {
      loggingIn = false;
    }
  }

  function isFormValid() {
    if (!formRef) return false;

    const inputs = formRef.querySelectorAll('input, select');

    for (let input of inputs) {
      if (!input.checkValidity()) {
        return false;
      }
    }
    return true;
  }

  function checkFormValidity(): void {
    blockSubmission = !isFormValid();
  }

  function onInputChange(): void {
    checkFormValidity();
  }
</script>

<div class="login-page">
  <SimpleHeader>
    {#snippet leftPart()}
      {#if mfaRequired}
        <button
          class="type:header-link back-link"
          onclick={() => (mfaRequired = false)}
          transition:fade={{ duration: 200 }}
        >
          Back to login
        </button>
      {/if}
    {/snippet}
  </SimpleHeader>
  {#if !loading}
    <div class="layout:zstack">
      {#if !mfaRequired}
        <div class="page-inner layout:grid">
          <form bind:this={formRef} class="form" onsubmit={onLoginSubmit}>
            <h1 class="type:h1 form-title">{@html pageTitle}</h1>
            <div class="form-group layout:stack">
              <InputText
                errorMessage="Please enter a valid email address"
                icon={ICONS.EMAIL}
                label="Email"
                name="email"
                onInput={onInputChange}
                required
                type="email"
                autocomplete="email"
              />
              <InputPassword
                errorMessage="Password must be 8 characters"
                icon={ICONS.PASSWORD}
                label="Password"
                name="password"
                onInput={onInputChange}
                required
                autocomplete="current-password"
              />
              <div class="reset-password-link">
                <a href="/reset-password/request" class="form-link link:underlined">Forgot password?</a>
              </div>
            </div>
            <div class="bottom-bar layout:stack">
              <Button
                alignment="center"
                disabled={blockSubmission}
                hovered
                icon={ICONS.ARROW_FORWARD}
                onclick={onLoginSubmit}
                type="submit"
                loading={loggingIn}
              >
                <span>Login</span>
              </Button>
              <p class="text-color:dark-60">
                No account? <a href={ROUTES.SIGN_UP} class="form-link link:underlined">Create one</a>
              </p>
            </div>
          </form>
        </div>
      {/if}
      {#if mfaRequired}
        <MfaScreen {mfaAccessToken} {mfaFactorId} {mfaFactors} {mfaUserId} />
      {/if}
    </div>
  {:else}{/if}
</div>

<style lang="scss">
  .login-page {
    position: relative;
    min-block-size: 100vh;
    inline-size: 100%;
    --input-background-color: var(--color-white-100);

    .back-link {
      appearance: none;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
    }

    .page-inner {
      padding-block-start: max(4.5vh, 24px);
      padding-block-end: 42px;
    }

    .form-title {
      text-align: center;
    }

    .form {
      grid-column: 5 / span 4;
      block-size: calc(100vh - 120px - 56px - 42px);
      max-height: 680px;
      min-height: 520px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;

      .form-group {
        inline-size: 100%;
        --space: 6px;
      }
    }

    .reset-password-link {
      text-align: right;
      margin-top: 10px;
    }

    .form-link {
      --link-hover-color: var(--color-dark-100);
      --link-color: var(--color-dark-60);
    }

    .bottom-bar {
      align-items: center;
      text-align: center;
    }
  }
</style>
