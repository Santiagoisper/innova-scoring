export type VisitDiscountTier = {
  min: number;
  max: number | null;
  discount: number;
};

export const protocolPricingTiers = [
  { min: 0, max: 5, price: 150 },
  { min: 6, max: 10, price: 200 },
  { min: 11, max: 20, price: 250 },
  { min: 21, max: 30, price: 300 },
  { min: 31, max: 40, price: 350 },
  { min: 41, max: 50, price: 400 },
] as const;

export const inPersonVisitDiscountTiers: VisitDiscountTier[] = [
  { min: 0, max: 50, discount: 0 },
  { min: 51, max: 100, discount: 0.1 },
  { min: 101, max: 150, discount: 0.2 },
  { min: 151, max: 200, discount: 0.3 },
  { min: 201, max: 250, discount: 0.4 },
  { min: 251, max: 400, discount: 0.45 },
  { min: 401, max: null, discount: 0.5 },
];

export const IN_PERSON_VISIT_UNIT_PRICE = 10;
export const PHONE_VISIT_UNIT_PRICE = 2.5;
export const IMPLEMENTATION_FEE = 1000;

export type InvoiceInput = {
  protocolCount: number;
  inPersonVisits: number;
  phoneVisits: number;
  includeImplementation: boolean;
};

export type InvoiceBreakdown = {
  protocolFee: number;
  inPersonSubtotal: number;
  inPersonDiscountRate: number;
  inPersonDiscountAmount: number;
  inPersonTotal: number;
  phoneTotal: number;
  implementationFee: number;
  grandTotal: number;
};

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function getProtocolFee(protocolCount: number): number {
  const qty = clampNonNegative(protocolCount);
  const tier = protocolPricingTiers.find((item) => qty >= item.min && qty <= item.max);
  if (tier) {
    return tier.price;
  }

  const extraProtocols = Math.max(0, qty - 50);
  return 400 + extraProtocols * 8;
}

export function getInPersonDiscountRate(visitCount: number): number {
  const qty = clampNonNegative(visitCount);
  const tier = inPersonVisitDiscountTiers.find(
    (item) => qty >= item.min && (item.max === null || qty <= item.max),
  );

  return tier?.discount ?? 0;
}

export function buildInvoiceBreakdown(input: InvoiceInput): InvoiceBreakdown {
  const protocolCount = clampNonNegative(input.protocolCount);
  const inPersonVisits = clampNonNegative(input.inPersonVisits);
  const phoneVisits = clampNonNegative(input.phoneVisits);

  const protocolFee = getProtocolFee(protocolCount);
  const inPersonSubtotal = inPersonVisits * IN_PERSON_VISIT_UNIT_PRICE;
  const inPersonDiscountRate = getInPersonDiscountRate(inPersonVisits);
  const inPersonDiscountAmount = inPersonSubtotal * inPersonDiscountRate;
  const inPersonTotal = inPersonSubtotal - inPersonDiscountAmount;
  const phoneTotal = phoneVisits * PHONE_VISIT_UNIT_PRICE;
  const implementationFee = input.includeImplementation ? IMPLEMENTATION_FEE : 0;

  const grandTotal = protocolFee + inPersonTotal + phoneTotal + implementationFee;

  return {
    protocolFee,
    inPersonSubtotal,
    inPersonDiscountRate,
    inPersonDiscountAmount,
    inPersonTotal,
    phoneTotal,
    implementationFee,
    grandTotal,
  };
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
