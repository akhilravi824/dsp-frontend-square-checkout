<script lang="ts">
  import Button from '$lib/components/system/Button.svelte';
  import { ROUTES } from '$lib/routes';
  import { subscriptionApi } from '$lib/api';
  import SubscriptionCard from '$lib/components/system/SubscriptionCard.svelte';
  import { ICONS } from '../system/icons/types';
  import { breakpoints } from '$lib/stores/mediaQueries.svelte';
  import { onMount } from 'svelte';
  import emblaCarouselSvelte from 'embla-carousel-svelte';

  const { data, class: className = '' } = $props();
  const plans = $state<Plan[]>([]);

  onMount(() => {
    getSubscriptions();
  });

  let emblaApi;
  let options = {
    loop: false,
    duration: 10,
    dragFree: false,
    inViewThreshold: 0.7,
    watchSlides: false,
    watchDrags: false
  };
  let selectedIndex = $state(0);

  function onInit(event) {
    emblaApi = event.detail;
    emblaApi.on('select', onSelect);
  }

  async function getSubscriptions() {
    try {
      const response = await subscriptionApi.getAllPlans();
      const variationsMap: Record<string, ApiPlan> = {};
      response.objects[0].variations.forEach((variation: ApiPlan) => {
        variationsMap[variation.variationId] = variation;
      });

      for (const cmsPlan of data.plans as Array<CmsPlan>) {
        const apiPlan = cmsPlan.variationId ? variationsMap[cmsPlan.variationId] : undefined;

        if (cmsPlan.variationId && !apiPlan) {
          console.warn(`No matching API plan found for CMS plan with variationId: ${cmsPlan.variationId}`);
          continue;
        }

        const transformedPlan: Plan = {
          variationId: apiPlan?.variationId || '',
          label: cmsPlan.label || '',
          title: cmsPlan.title || '',
          copy: cmsPlan.copy || '',
          price: cmsPlan.price,
          totalPrice: apiPlan?.totalPrice || '',
          interval: cmsPlan.priceDetails || '',
          billingDetails: cmsPlan.billingDetails || '',
          details: cmsPlan.details && cmsPlan.details.length > 0 ? cmsPlan.details : '',
          perks: cmsPlan.perks || []
        };

        plans.push(transformedPlan);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      //console.log('done');
    }
  }

  function scrollTo(index: number) {
    selectedIndex = index;
    emblaApi.scrollTo(index);
  }

  const onSelect = () => {
    if (!emblaApi) return;
    selectedIndex = emblaApi.selectedScrollSnap();
  };
</script>

<div class="pricings-and-plans {className}" id="choose-your-plan">
  <div class="layout:grid layout:max-width">
    <div class="section-header">
      <h2 class="type:h1 space:d60">Choose your plan</h2>
    </div>
    <div class="pricings-and-plans-inner space:d64">
      {#if breakpoints.desktop.mediaQuery}
        {#each plans as plan (plan.variationId)}
          <SubscriptionCard {plan} disableHover />
        {/each}
      {/if}

      {#if !breakpoints.desktop.mediaQuery && plans.length > 0}
        <div class="embla" use:emblaCarouselSvelte={{ options }} onemblaInit={onInit}>
          <div class="embla-container">
            {#each plans as plan (plan.variationId)}
              <div class="embla-slide">
                <SubscriptionCard {plan} disableHover />
              </div>
            {/each}
          </div>

          <!-- Dots Navigation -->
          <div class="embla-dots">
            {#each Array.from({ length: plans.length }) as dot, index}
              <button
                class="embla-dot"
                class:embla-dot-selected={index === selectedIndex}
                onclick={() => scrollTo(index)}
                aria-label="Go to slide {index + 1}"
              ></button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    <div class="cta-wrapper">
      <Button hovered href={ROUTES.SIGN_UP} icon={ICONS.ARROW_FORWARD}><span>Get started for free</span></Button>
    </div>
  </div>
</div>

<style lang="scss">
  .embla-container {
    display: flex;
    padding-block: 14px;
  }

  .embla-slide {
    flex: 0 0 80%;
    min-width: 0;

    @media screen and (min-width: 475px) {
      flex: 0 0 50%;
    }

    @media screen and (min-width: 600px) {
      flex: 0 0 40%;
    }
  }

  .embla-slide {
    margin-right: 6px;
  }

  .embla-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    padding-bottom: 4px;
  }

  .section-header {
    grid-column: 1 / -1;
    text-align: center;

    @media screen and (min-width: 768px) {
      grid-column: 2 / span 10;
    }
  }

  .pricings-and-plans-inner {
    grid-column: 1 / -1;

    @media screen and (min-width: 1024px) {
      grid-column: 1 / span 12;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(6, auto);
      gap: 6px;
      overflow: visible;
    }
  }

  .pricings-and-plans {
    overflow: hidden;

    .embla-dot {
      block-size: 8px;
      inline-size: 8px;
      appearance: none;
      border-radius: 50%;
      border: none;
      background-color: var(--color-dark-20);
      cursor: pointer;
    }

    .embla-dot-selected {
      background-color: var(--color-primary-blue);
      transform: scale(1);
    }
  }

  .cta-wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    grid-column: 1 / -1;
  }
</style>
