<script lang="ts">
  import { authApi } from '$lib/api';
  import { ICONS } from '$lib/components/system/icons/types.js';
  import Button from '$lib/components/system/Button.svelte';
  import { showError, showSuccess } from '$lib/stores/toastStore';

  const {
    emailToVerify = 'test@gmail.com'
  }: {
    emailToVerify: string | null;
  } = $props();

  let isProcessing = $state(false);

  async function resentEmail() {
    if (!emailToVerify) return;
    if (isProcessing) return;
    isProcessing = true;

    try {
      const data = {
        email: emailToVerify
      };
      const response = await authApi.resentEmail({ email: data.email });
      showSuccess('Verification email has been resent.', 5000);
      if (!response.success) {
        throw new Error('Failed to resend email');
      }
    } catch (error) {
      showError('Failed to resend email', 5000);
    } finally {
      isProcessing = false;
    }
  }
</script>

<section class="email-verification">
  <div class="email-verification-inner layout:grid">
    <div class="step-wrapper">
      <span></span>
      <div class="verification-message type:h1">
        <p>Verify your email!</p>
        <p>Click the link we sent to</p>
        <p>{emailToVerify} to continue.</p>
      </div>

      <div class="step-bottom-bar layout:stack">
        <Button
          alignment="center"
          hovered
          icon={ICONS.ARROW_FORWARD}
          onclick={resentEmail}
          type="submit"
          loading={isProcessing}
        >
          <span>Resend email</span>
        </Button>
        <p class="type:label">Didn’t receive one? Check your spam, or send again.</p>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  .verification-message {
    text-align: center;
  }

  .step-wrapper {
    grid-column: 3 / span 8;
    block-size: calc(100vh - 120px - 56px - 42px);
    max-height: 680px;
    min-height: 450px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .step-bottom-bar {
    align-items: center;
    text-align: center;
    --space: 12px;
  }
</style>
