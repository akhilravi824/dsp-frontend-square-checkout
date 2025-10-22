<script lang="ts">
  import { authApi } from '$lib/api';
  import Accordion from '$lib/components/system/Accordion.svelte';
  import Button from '$lib/components/system/Button.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import Modal from '$lib/components/system/Modal.svelte';
  import { showError, showSuccess } from '$lib/stores/toastStore';
  import { onMount } from 'svelte';
  import InputText from '$lib/components/system/inputs/InputText.svelte';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import type { SecuritySection } from '$lib/../types/sanity.types';

  const { profileData, componentData }: { profileData: any; componentData: SecuritySection } = $props();

  let mfaLoading = $state(false);
  let showMfaDialog = $state(false);
  let isMfaEnabled = $state(false);
  let statusLoading = $state(true);
  let qrCode = $state(null);
  let factorId = $state(null);
  let mfaFeedback = $state('');
  let blockSubmission = $state(true);
  let totpCode = $state(null);
  let toggleAccordion = $state(true);

  onMount(() => {
    fetchMfaStatus();
  });

  async function getMfaStatus() {
    const response = await authApi.getUserMfaStatus();
    const { mfaEnabled, factors } = response.data;
    return {
      mfaEnabled,
      factors
    };
  }

  async function fetchMfaStatus() {
    const { mfaEnabled, factors } = await getMfaStatus();
    isMfaEnabled = mfaEnabled;
    if (mfaEnabled && factors && factors.length > 0) {
      const factor = factors[0];
      factorId = factor.id;
    } else {
      factorId = null;
    }

    qrCode = null;
    statusLoading = false;
  }

  async function enableTwoFactorAuthentication() {
    if (!profileData) return;
    showMfaDialog = true;
    mfaLoading = true;
    try {
      const response = await authApi.enrollMfa();
      if (response.success) {
        factorId = response.data.factorId;
        qrCode = response.data.qrCode;
        mfaFeedback = '';
      } else {
        mfaFeedback = response.data.message || 'Failed to enable 2FA.';
        showError(mfaFeedback, 5000);
        console.error('Failed to enable 2FA:', response.data.message);
      }
    } catch (error) {
      mfaFeedback = 'Error enabling 2FA.';
      showError(mfaFeedback, 5000);
      showMfaDialog = false;
      console.error('Error enabling 2FA:', error);
    } finally {
      mfaLoading = false;
    }
  }

  // Handle TOTP code submission (challenge + verify)
  const submitTotpCode = async () => {
    if (!factorId || !totpCode) return;
    mfaFeedback = '';

    try {
      // 1. Challenge
      if (!factorId) return;
      const challengeResp = await authApi.challengeMfa(factorId as string, '');

      if (challengeResp.success) {
        const challengeId = challengeResp.data.id;

        // 2. Verify
        const verifyResp = await authApi.verifyMfaChallenge(factorId as string, challengeId, totpCode);

        if (verifyResp.success) {
          mfaFeedback = 'Two-factor authentication enabled successfully!';
          showSuccess('Two-factor authentication enabled successfully!', 5000);
          await fetchMfaStatus();
          showMfaDialog = false;
        } else {
          mfaFeedback = verifyResp.message || 'Verification failed. Please try again.';
          showError(mfaFeedback, 5000);
        }
      } else {
        mfaFeedback = challengeResp.message || 'Challenge failed. Please try again.';
      }
    } catch (err) {
      mfaFeedback = 'Incorrect code entered. Please try again.';
      showError(mfaFeedback, 5000);
      console.error('Error verifying TOTP code:', err);
    }
  };

  function onMfaModalClose() {
    showMfaDialog = false;
  }

  function onInputChange(value: string | null, isValid: boolean) {
    if (!isValid) {
      blockSubmission = true;
      return;
    }
    totpCode = value;
    blockSubmission = false;
  }

  function onDisableMfaModalOpen() {
    showMfaDialog = true;
  }

  async function disableTwoFactorAuthentication() {
    try {
      if (!factorId || !isMfaEnabled) {
        const { mfaEnabled, factors } = await getMfaStatus();

        if (mfaEnabled && factors && factors.length > 0) {
          const factor = factors[0];
          factorId = factor.id;
          isMfaEnabled = mfaEnabled;
        } else {
          return;
        }
      }

      const disableResp = await authApi.disableMfa(factorId);
      if (disableResp.success) {
        await fetchMfaStatus();
        showMfaDialog = false;
      }
    } catch (error) {
      showError(error, 5000);
      console.error('Error disabling 2FA:', error);
    }
  }
</script>

<div class="section-settings settings-security">
  {#if !statusLoading}
    {#if !isMfaEnabled}
      <Modal onClose={onMfaModalClose} open={showMfaDialog}>
        <div class="mfa-dialog">
          <p class="type:h2 space:d6">Enable Two Factor Authentication</p>
          <p class="type:body text-color:dark-60 space:d32 modal-copy">
            Scan this QR code, using your authenticator app.
          </p>
          {#if qrCode && !mfaLoading}
            <div class="qr-code-wrapper space:d32">
              <div class="qr-code">
                <img src={qrCode} alt="QR Code" />
              </div>
            </div>
            <div class="input-wrapper space:d32">
              <InputText
                icon={ICONS.SECURITY}
                label="Enter code from app"
                maxlength={10}
                minlength={4}
                onInput={onInputChange}
                required
                errorMessage="Please enter a valid code"
              />
            </div>

            <Button disabled={blockSubmission} onclick={submitTotpCode} hovered loading={mfaLoading}
              ><span>Verify</span></Button
            >
          {:else}
            <p class="type:body">Loading QR code...</p>
          {/if}
        </div>
      </Modal>
    {:else}
      <Modal onClose={onMfaModalClose} open={showMfaDialog}>
        <div class="mfa-dialog disable-mfa-dialog">
          <p class="type:h2 space:d6">Disable Two Factor Authentication</p>
          <p class="type:body space:d32 text-color:dark-60">Are you sure you want to disable 2FA?</p>
          <div class="button-wrapper">
            <Button onclick={disableTwoFactorAuthentication}>Yes</Button>
            <Button variant="secondary" onclick={onMfaModalClose}>No</Button>
          </div>
        </div>
      </Modal>
    {/if}
  {/if}
  {#if !statusLoading}
    <Accordion isOpen={toggleAccordion}>
      {#snippet header()}
        <div class="section-heaeder">
          <h2 class="type:h2 space:d6">Security</h2>
          {#if !statusLoading}
            {#if !isMfaEnabled}
              <p class="type:body text-color:dark-60">
                Enable two-factor authentication and enhance the security of your account.
              </p>
            {:else}
              <p class="type:body text-color:dark-60">
                2FA is currently <span class="text-color:primary-blue">enabled</span> on your account.
              </p>
            {/if}
          {/if}
        </div>
      {/snippet}
      {#snippet body()}
        {#if !statusLoading}
          <div class="section-content">
            {#if !isMfaEnabled}
              <p class="type:body space:d6">Secure your account with 2FA</p>
            {:else}
              <p class="type:body space:d6">Your account is secure with 2FA</p>
            {/if}
            <ul class="space:d32 layout:stack perk-list">
              {#each componentData.perks as perk, index (index)}
                <li class="security-perk type:body">
                  <Icon type={ICONS.CHECK} />
                  {perk}
                </li>
              {/each}
            </ul>

            {#if !isMfaEnabled}
              <Button onclick={enableTwoFactorAuthentication}>
                <span>Enable Two Factor Authentication</span>
              </Button>
            {:else}
              <Button onclick={onDisableMfaModalOpen} variant="secondary">
                <span>Disable Two Factor Authentication</span>
              </Button>
            {/if}
          </div>
        {/if}
      {/snippet}
    </Accordion>
  {/if}
</div>

<style lang="scss">
  .perk-list {
    --space: 6px;
  }

  .mfa-dialog {
    min-width: 700px;

    .modal-copy {
      max-inline-size: 300px;
    }

    .qr-code-wrapper {
      display: flex;
      justify-content: center;
    }

    .qr-code {
      background: var(--color-white-100);
      max-inline-size: 175px;
      border-radius: var(--border-radius-sm);
      padding: 2px;
    }
  }

  .section-content {
    & > p:first-of-type {
      font-weight: 700;
    }

    .security-perk {
      display: flex;
      align-items: center;
      --icon-size: 16px;
      gap: 6px;
    }
  }

  .disable-mfa-dialog {
    .button-wrapper {
      display: flex;
      gap: 6px;
    }
  }
</style>
