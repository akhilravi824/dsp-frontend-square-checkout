<script lang="ts">
  import SimpleHeader from '$lib/components/system/headers/SimpleHeader.svelte';
  import ProgressBar from '$lib/components/system/ProgressBar.svelte';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import EmailVerification from '$lib/components/sign-up/EmailVerification.svelte';
  import FormQuestionnaire from '$lib/components/sign-up/FormQuestionnaire.svelte';
  import FormSignup from '$lib/components/sign-up/FormSignup.svelte';

  const { data } = $props<{ data: PageData }>();

  let currentProgress = $state(0);
  let formulaire: FormQuestionnaire | null = $state(null);
  let showSignupForm = $state(false);
  let questionnaireResult = $state<Record<string, string>>({});
  let signedUp = $state(false);
  let emailToVerify = $state<string | null>(null);
  let signupForm: FormSignup | null = $state(null);
  let isFirstStep = $state(true);
  let showUniversity = $state(false);
  const FIXED_STEP_COUNT = 4; // Adjust this if you add more steps

  function extractQuestionNames(obj) {
    const result = {};

    // Add the root name if present
    if (obj.name) {
      result[obj.name] = '';
    }

    // Check for nested questions in answers
    if (Array.isArray(obj.answers)) {
      for (const answer of obj.answers) {
        if (answer.signupQuestion && answer.signupQuestion.name) {
          result[answer.signupQuestion.name] = '';
        }
      }
    }

    return result;
  }

  onMount(() => {
    // Set up first progress step
    if (!formulaire) return;
    currentProgress = 1 / (formulaire.getStepsLength() + FIXED_STEP_COUNT);
    questionnaireResult = extractQuestionNames(data.page[0].formEntryPoint);
  });

  // Progress function to update the progress bar based on the current step
  function progress(currentStep: number, totalSteps: number) {
    if (currentStep === 0) {
      isFirstStep = true;
      currentProgress = 1 / (totalSteps + FIXED_STEP_COUNT);
      return;
    }
    if (isFirstStep) {
      isFirstStep = false;
    }
    currentProgress = (currentStep + 1) / (totalSteps + FIXED_STEP_COUNT);
  }

  // Function to handle the final step of the questionnaire
  function goToSignup(history, hasUniversity: boolean) {
    if (!formulaire) return;
    if (!history) return;
    showUniversity = hasUniversity;
    const initialResult = { ...questionnaireResult };
    questionnaireResult = history.reduce((acc, item) => {
      acc[item.step] = item.value;
      return acc;
    }, initialResult);
    showSignupForm = true;
    progress(formulaire.getStepsLength(), formulaire.getStepsLength());
  }

  // Function to handle going back to the previous step
  function onPreviousStep() {
    if (!formulaire) return;
    // Case where the user already signed up and wants to change the form information
    if (signedUp) {
      signedUp = false;
      signupForm?.resetPassword();
      progress(formulaire.getStepsLength(), formulaire.getStepsLength());
      return;
    }

    // case where the user is on the signup form and wants to go back to the questionnaire
    if (showSignupForm) {
      showSignupForm = false;
      progress(formulaire.getActiveStep(), formulaire.getStepsLength());
      return;
    }

    // The user is on the questionnaire and wants to go back to the previous step
    formulaire?.goBack();
  }

  // User has submitted the signup form and is ready to verify their email
  function onSignupSubmit(formResponse: SignUpSuccessResponse) {
    if (!formulaire) return;
    emailToVerify = formResponse.data.user.email;
    progress(formulaire.getStepsLength() + 1, formulaire.getStepsLength());

    signedUp = true;
  }
</script>

<div class="page">
  <SimpleHeader>
    {#snippet leftPart()}
      {#if !isFirstStep}
        <button onclick={onPreviousStep} class="link:underlined type:label" type="button">Previous step</button>
      {/if}
    {/snippet}
    {#snippet middlePart()}
      <ProgressBar progress={currentProgress} />
    {/snippet}
    {#snippet rightPart()}
      <a class="link:underlined type:label" href="/login">Sign in</a>
    {/snippet}
  </SimpleHeader>
  <div class="background" class:blue={showSignupForm}></div>
  {#if data.page && data.page.length > 0}
    <div class="steps-wrapper layout:zstack layout:max-width">
      {#if data.page[0].formEntryPoint}
        <div class="main-step" class:hide={showSignupForm}>
          <FormQuestionnaire
            formData={data.page[0].formEntryPoint}
            bind:this={formulaire}
            finalStep={goToSignup}
            {progress}
          />
        </div>
      {/if}
      {#if showSignupForm}
        <div class="sign-up-step" class:hide={signedUp}>
          <FormSignup
            bind:this={signupForm}
            {showUniversity}
            {questionnaireResult}
            onFormSubmit={onSignupSubmit}
            formCopy={data.page[0].signupFormCopy}
            verificationCopy={data.page[0].signupVerifyCopy}
          />
        </div>
      {/if}

      {#if signedUp}
        <EmailVerification {emailToVerify} />
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .page {
    min-height: 100vh;
    inline-size: 100%;
    position: relative;
  }

  :global(.sign-up-step) {
    position: relative;
    z-index: 6;
  }

  :global(.email-verification) {
    position: relative;
    z-index: 8;
  }

  .main-step {
    position: relative;
    z-index: 4;
  }

  .hide {
    opacity: 0;
    visibility: hidden;
  }

  .steps-wrapper {
    position: relative;
    z-index: 5;
  }

  .background {
    position: absolute;
    inset: 0;
    background: var(--color-white-100);
    z-index: 1;

    &.blue {
      background:
        radial-gradient(
          182.11% 160.68% at 6.25% 130.49%,
          var(--theme-1-theme-1-gradient-tone, rgba(101, 150, 255, 0.65)) 0%,
          var(--theme-1-theme-1-gradient-base, rgba(213, 232, 253, 0)) 80.42%
        ),
        radial-gradient(
          192.45% 151.87% at 112.64% -12.28%,
          var(--theme-1-theme-1-gradient-tone, rgba(101, 150, 255, 0.3)) 0%,
          var(--theme-1-theme-1-gradient-base, rgba(213, 232, 253, 0)) 61.12%
        ),
        var(--theme-1-theme-1-bg, #d5e8fd);
    }
  }
</style>
