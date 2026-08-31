import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolvePrice } from "@/lib/services/pricing.service";

type PriceRow = {
  id: string;
  customerId: string;
  provider: string;
  type: "fixed" | "per_weight" | "per_desi";
  priceKurus: number;
  costKurus: number;
  breakpoint: number | null;
};

// state must be hoisted so it's available inside vi.mock factory.
const state = vi.hoisted(() => ({ row: null as PriceRow | null }));

vi.mock("@/db/client", () => {
  const getDb = () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (state.row ? [state.row] : []),
        }),
      }),
    }),
  });
  return { getDb };
});

function priceArgs(over?: Partial<PriceRow>): PriceRow {
  return {
    id: "price-1",
    customerId: "cust-1",
    provider: "aras",
    type: "fixed",
    priceKurus: 15000,
    costKurus: 9000,
    breakpoint: null,
    ...over,
  };
}

describe("Fiyatlandırma — resolvePrice (backend hesaplama)", () => {
  beforeEach(() => {
    state.row = priceArgs();
  });

  it("fixed fiyatı doğrudan döndürür", async () => {
    const result = await resolvePrice({ customerId: "cust-1", provider: "aras", weight: 1, desi: 1 });
    expect(result.salePriceKurus).toBe(15000);
    expect(result.costPriceKurus).toBe(9000);
  });

  it("per_weight fiyatı ağırlığa göre çarpar", async () => {
    state.row = priceArgs({ type: "per_weight", priceKurus: 10000, costKurus: 6000, breakpoint: 1 });
    const result = await resolvePrice({ customerId: "cust-1", provider: "aras", weight: 30, desi: 1 });
    expect(result.salePriceKurus).toBe(300000);
    expect(result.costPriceKurus).toBe(180000);
  });

  it("per_desi fiyatı desi'ye göre çarpar", async () => {
    state.row = priceArgs({ type: "per_desi", priceKurus: 5000, costKurus: 3000, breakpoint: 1 });
    const result = await resolvePrice({ customerId: "cust-1", provider: "aras", weight: 1, desi: 10 });
    expect(result.salePriceKurus).toBe(50000);
    expect(result.costPriceKurus).toBe(30000);
  });

  it("breakpoint altı minimum 1 birim ücretlendirir", async () => {
    state.row = priceArgs({ type: "per_weight", priceKurus: 10000, costKurus: 6000, breakpoint: 10 });
    const result = await resolvePrice({ customerId: "cust-1", provider: "aras", weight: 5, desi: 1 });
    expect(result.salePriceKurus).toBe(10000);
  });
});
