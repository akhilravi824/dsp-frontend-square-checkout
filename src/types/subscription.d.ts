type SubscriptionVariation = {
  variationId: string;
  name?: string;
  price: number;
  formattedPrice: string;
  formattedMonthlyPrice: string;
  formattedTotalPrice: string;
  interval: string;
  formattedInterval: string;
  basePrice?: number;
  monthlyPrice?: number;
  totalPrice?: number;
  discountPercent?: number;
  hasDiscount?: boolean;
  currency?: string;
  formattedBasePrice?: string;
  phases?: any[];
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  active?: boolean;
  variations?: SubscriptionVariation[];
  price?: number;
  formattedPrice?: string;
  formattedMonthlyPrice?: string;
  formattedTotalPrice?: string;
  interval?: string;
  formattedInterval?: string;
  trial?: boolean;
  originalPlanId?: string;
  variation?: SubscriptionVariation;
};

type PaymentCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

type PaymentMethodResponse = {
  success: boolean;
  card: PaymentCard;
};

interface ApiPlan {
  variationId: string;
  price: string;
  totalPrice: string;
  interval: string;
  formattedMonthlyPrice: string;
  formattedTotalPrice: string;
}

interface CmsPlan {
  variationId: string | null;
  label?: string;
  title: string;
  price: string;
  copy: string;
  details?: string;
  perks?: string[];
  billingDetails?: string;
}

interface Plan {
  variationId: string;
  label: string;
  title: string;
  copy: string;
  price: string;
  totalPrice: string;
  interval: string;
  details: any;
  perks: string[];
  billingDetails?: string;
}
