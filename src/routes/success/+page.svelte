<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { showSuccess } from '$lib/stores/toastStore';

  onMount(() => {
    // Show success message
    showSuccess('Payment successful! Your subscription is now active.');
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      goto('/dashboard');
    }, 3000);
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
    <div class="mb-6">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
    <p class="text-gray-600 mb-6">
      Thank you for subscribing! Your payment has been processed successfully.
    </p>
    
    <div class="text-sm text-gray-500">
      Redirecting to dashboard in a few seconds...
    </div>
    
    <div class="mt-6">
      <a href="/dashboard" class="text-blue-600 hover:text-blue-500 font-medium">
        Go to Dashboard →
      </a>
    </div>
  </div>
</div>
