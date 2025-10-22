import { mediaQuery } from '../molecules/mediaQuery';

export const choosePlanQuery = `
  _type == "choosePlan" => {
    title,
    "plans": plans[]->{
      _id,
      variationId,
      title,
      label,
      copy,
      price,
      details,
      perks,
      billingDetails,
      priceDetails
    }
  }
`;
