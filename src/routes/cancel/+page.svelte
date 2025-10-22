<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { showError } from '$lib/stores/toastStore';

  onMount(() => {
    // Show cancellation message
    showError('Payment was cancelled. You can try again anytime.');
    
    // Redirect to plans page after 3 seconds
    setTimeout(() => {
      goto('/pick-your-plan');
    }, 3000);
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
    <div class="mb-6">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
        <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
    <p class="text-gray-600 mb-6">
      Your payment was cancelled. No charges have been made to your account.
    </p>
    
    <div class="text-sm text-gray-500">
      Redirecting to plans page in a few seconds...
    </div>
    
    <div class="mt-6 space-y-3">
      <a href="/pick-your-plan" class="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
        Try Again
      </a>
      <a href="/dashboard" class="block w-full text-gray-600 hover:text-gray-800 font-medium">
        Go to Dashboard
      </a>
    </div>
  </div>
</div>
