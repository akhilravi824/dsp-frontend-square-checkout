export function mergeSubscriptions(
  cmsPlans: CmsPlan[],
  apiPlans: { description: string; id: string; variations: ApiPlan[] }
) {
  const plans: Plan[] = [];
  const variationsMap: Record<string, ApiPlan> = {};
  apiPlans.variations.forEach((variation: ApiPlan) => {
    variationsMap[variation.variationId] = variation;
  });

  for (const cmsPlan of cmsPlans as Array<CmsPlan>) {
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
      formattedTotalPrice: apiPlan?.formattedTotalPrice || '',
      billingDetails: cmsPlan.billingDetails || '',
      details: cmsPlan.details && cmsPlan.details.length > 0 ? cmsPlan.details : '',
      perks: cmsPlan.perks || []
    };

    plans.push(transformedPlan);
  }

  return plans;
}

export function getUserSubscription(transformedPlans: Plan[], userVariationId: string) {
  return transformedPlans.find((plan) => plan.variationId === userVariationId);
}
