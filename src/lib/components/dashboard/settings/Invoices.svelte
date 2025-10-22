<script lang="ts">
  import { subscriptionApi } from '$lib/api';
  import Button from '$lib/components/system/Button.svelte';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { onMount } from 'svelte';

  import { ICONS } from '$lib/components/system/icons/types';

  interface Invoice {
    createdAt: string;
    description: string;
    formattedAmount: string;
    id: string;
    invoiceNumber: string;
    paymentRequestedAt: string;
    status: string;
    totalAmount: {
      amount: number;
      currency: string;
    };
    url: string;
  }

  let invoices: Invoice[] = $state([]);
  let invoicesLoading = $state(true);
  let invoiceError = $state(false);

  onMount(() => {
    fetchInvoices();
  });

  async function fetchInvoices() {
    invoicesLoading = true;
    try {
      const response = await subscriptionApi.getInvoices();
      invoices = response.invoices || [];
    } catch (error) {
      invoiceError = true;
      console.error('Error fetching invoices:', error);
    } finally {
      invoicesLoading = false;
    }
  }

  function formatInvoiceDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="user-invoices">
  {#if invoicesLoading}
    <p>Loading invoices...</p>
  {:else if invoiceError}
    <div class="invoices-error">
      <p class="type:body-large layout:inline-flex space:d16">
        <Icon type={ICONS.ERROR} />
        <span>Error while loading invoices</span>
      </p>
      <Button onclick={fetchInvoices}>Try again</Button>
    </div>
  {:else if invoices.length === 0}
    <p class="type:body-large">No invoices found</p>
  {:else}
    <div class="invoices-list layout:input-group">
      {#each invoices as invoice (invoice.id)}
        <div class="invoice-item layout:inline-flex">
          <p class="type:body invoice-date">{formatInvoiceDate(invoice.paymentRequestedAt)}</p>
          <p class="type:body">{invoice.formattedAmount}</p>
          <a class="type:body link:underlined" href={invoice.url} target="_blank">View</a>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .invoices-error {
    --icon-color: var(--color-warning);
    color: var(--color-warning);
  }

  .invoice-item {
    --gap: 16px;
    --inline-justify: flex-end;
    padding-block: 28px;
    padding-inline: 24px;
    background: var(--color-dark-5);
    border-radius: var(--border-radius-sm);

    .invoice-date {
      margin-right: auto;
    }
  }
</style>
