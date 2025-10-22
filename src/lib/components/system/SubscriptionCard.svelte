<script lang="ts">
  import { toHTML } from '@portabletext/to-html';
  import Icon from '$lib/components/system/icons/Icon.svelte';
  import { ICONS } from '$lib/components/system/icons/types';

  interface PlanProps {
    label: string;
    title: string;
    copy: string;
    price: string;
    totalPrice: string;
    interval: string;
    details: Array<any>;
    perks: string[];
    billingDetails?: string;
  }
  const {
    plan,
    selected = false,
    dimmed = false,
    disableHover = false
  }: {
    plan: PlanProps;
    selected?: boolean;
    dimmed?: boolean;
    disableHover?: boolean;
  } = $props();
</script>

<div class="plan" class:disabled-hover={disableHover} class:is-dimmed={dimmed} class:is-selected={selected}>
  {#if plan.label}
    <p class="plan-label type:label-medium">{plan.label}</p>
  {/if}
  <p class="plan-title type:body-large-medium space:d6">{plan.title}</p>
  <p class="plan-copy type:body text-color:dark-60">{plan.copy}</p>
  <p class="plan-price type:h1-large">
    <span>{plan.price}</span>
    {#if plan.interval}
      <span class="type:body text-color:dark-60">{plan.interval}</span>
    {/if}
  </p>
  {#if plan.billingDetails}
    <div class="plan-billed-details">
      <p class="text-color:dark-60 type:body">{plan.billingDetails}</p>
    </div>
  {/if}
  {#if plan.details}
    <p class="plan-details type:body text-color:dark-60">{@html toHTML(plan.details)}</p>
  {/if}
  <ul class="plan-perks-list layout:stack">
    {#each plan.perks as perk (perk)}
      <li class="plan-perk type:body">
        <Icon type={ICONS.CHECK} />{perk}
      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  .plan {
    display: grid;
    padding-block: 32px;
    padding-inline: 16px;
    grid-template-rows: subgrid;
    grid-column: span 1 / auto;
    position: relative;
    grid-row: 1/-1;
    background: var(--card-background, var(--color-dark-5));
    border-radius: 28px;
    row-gap: 0;
    block-size: 100%;
    border: 1px solid transparent;
    transition:
      border-color 0.2s,
      background-color 0.2s;

    &:not(.disabled-hover) {
      cursor: pointer;
    }

    &.is-selected {
      border-color: var(--color-primary-blue);

      .plan-label {
        background-color: var(--color-primary-blue);
      }
    }

    &:hover:not(.disabled-hover, .is-selected) {
      border-color: var(--color-dark-100);
      background-color: var(--color-white-100);
    }

    &.is-dimmed {
      background: var(--color-white-60);
    }

    .plan-label {
      position: absolute;
      background: var(--color-dark-100);
      color: var(--color-white-100);
      border-radius: 99em;
      padding-inline: 14px;
      padding-block: 6px;
      top: 0;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
    }

    .plan-title {
      grid-row: 1 / 2;
    }

    .plan-copy {
      grid-row: 2 / 3;
    }

    .plan-price {
      grid-row: 3 / 4;
      padding-block-start: 40px;
      padding-block-end: 24px;
    }

    .plan-billed-details {
      grid-row: 4 / 5;
      padding-block-start: 16px;
      padding-block-end: 16px;
      border-top: 1px solid var(--color-dark-20);
    }

    .plan-details {
      grid-row: 5 / 6;
      padding-block-start: 16px;
      border-top: 1px solid var(--color-dark-20);
      --strong-color: var(--color-primary-blue);

      :global(span) {
        color: var(--color-primary-blue);
        font-weight: 500;
      }
    }

    .plan-perks-list {
      grid-row: 6 / 7;
      --space: 6px;
      justify-content: flex-end;
      padding-block-start: 56px;

      .plan-perk {
        display: flex;
        --icon-size: 16px;
        --icon-color: var(--color-dark-60);
        color: var(--color-dark-60);
        gap: 6px;
        align-items: center;
      }
    }
  }
</style>
