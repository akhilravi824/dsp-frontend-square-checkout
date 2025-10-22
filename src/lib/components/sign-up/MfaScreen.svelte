<script lang="ts">
  import { authApi } from '$lib/api';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import { ROUTES } from '$lib/routes.js';
  import Button from '$lib/components/system/Button.svelte';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import { showError } from '$lib/stores/toastStore';
  import { goto } from '$app/navigation';

  const { mfaAccessToken, mfaFactorId, mfaFactors, mfaUserId } = $props<{
    mfaAccessToken: string;
    mfaFactorId: string;
    mfaFactors?: unknown[];
    mfaUserId?: string;
  }>();

  let blockSubmission = $state(true);
  let mfaCode = $state('');
  let loading = $state(false);

  async function onLoginSubmit(e: Event) {
    e.preventDefault();
    if (blockSubmission) return;
    loading = true;

    try {
      // 1. Request a challengeId first
      const challengeRes = await authApi.challengeMfa(mfaFactorId, mfaAccessToken);
      const challengeId = challengeRes.data.id;
      // 2. Verify the MFA code with the challengeId
      const response = await authApi.loginMfa(mfaFactorId, challengeId, mfaCode, mfaAccessToken);
      if (response.success) {
        goto(ROUTES.DASHBOARD);
      } else {
        showError('Invalid MFA code. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'MFA verification failed';
      showError('Incorrect code. Please try again.', 5000);
    } finally {
      loading = false;
    }
  }

  function onInputChange(value?: string) {
    const v = value ?? '';
    mfaCode = v;
    blockSubmission = v.length < 4 || v.length > 10;
  }
</script>

<section class="mfa-screen">
  <div class="page-inner layout:grid">
    <form class="wrapper layout:form-wrapper" onsubmit={onLoginSubmit}>
      <div class="page-header">
        <h2 class="type:h1 space:d16">Two-factor authentication</h2>
        <p class="type:h3 text-color:dark-60">Enter the code from your authenticator app below to login.</p>
      </div>
      <div class="mfa-screen-content">
        <InputText
          errorMessage="Please enter a valid code"
          hovered
          icon={ICONS.SECURITY}
          label="MFA Code"
          maxlength={10}
          minlength={4}
          name="mfa-code"
          onInput={onInputChange}
          required
          type="text"
        />
      </div>

      <div class="step-bottom-bar layout:stack">
        <Button
          alignment="center"
          disabled={blockSubmission}
          hovered
          icon={ICONS.ARROW_FORWARD}
          onclick={onLoginSubmit}
          {loading}
          type="submit"
        >
          <span>Confirm</span>
        </Button>
        <p>No account? <a href={ROUTES.SIGN_UP} style="color: currentColor">Create one</a></p>
      </div>
    </form>
  </div>
</section>

<style lang="scss">
  .wrapper {
    grid-column: 5 / span 4;
  }

  .page-header {
    text-align: center;
  }
</style>
