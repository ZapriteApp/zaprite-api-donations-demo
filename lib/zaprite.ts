const ZAPRITE_API_BASE = "https://api.zaprite.com/v1";

function getAuthHeaders(): HeadersInit {
  const key = process.env.ZAPRITE_API_KEY;
  if (!key) throw new Error("ZAPRITE_API_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export type CreateOrderBody = {
  customCheckoutId: string;
  /** Amount in smallest unit (cents for USD). */
  amount: number;
  currency: string;
  redirectUrl: string;
  externalUniqId: string;
  tags: string[];
  disablePaymentNotifs: boolean;
};

export type ZapriteTransaction = {
  /** Amount in smallest unit (cents for USD). */
  amount: number;
  currency?: string;
  method?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type ZapriteOrder = {
  id: string;
  checkoutUrl?: string;
  transactions?: ZapriteTransaction[];
  createdAt?: string;
  [key: string]: unknown;
};

export async function createOrder(
  amountUsd: number,
  redirectUrl: string
): Promise<{ checkoutUrl: string; orderId: string }> {
  const checkoutId = process.env.ZAPRITE_CHECKOUT_ID;
  if (!checkoutId) throw new Error("ZAPRITE_CHECKOUT_ID is not set");

  const amountCents = Math.round(amountUsd * 100);

  const res = await fetch(`${ZAPRITE_API_BASE}/orders`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      customCheckoutId: checkoutId,
      amount: amountCents,
      currency: "USD",
      redirectUrl,
      externalUniqId: `zadd_${Date.now()}`,
      tags: ["Zaprite API Donations Demo"],
      disablePaymentNotifs: true,
    } satisfies CreateOrderBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zaprite create order failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { checkoutUrl?: string; id?: string };
  const checkoutUrl = data.checkoutUrl ?? (data as { checkout_url?: string }).checkout_url;
  const orderId =
    data.id ?? (data as { orderId?: string }).orderId ?? (data as { order_id?: string }).order_id;

  if (!checkoutUrl || !orderId) {
    throw new Error("Zaprite response missing checkoutUrl or order id");
  }
  return { checkoutUrl, orderId: String(orderId) };
}

export async function getOrder(orderId: string): Promise<ZapriteOrder | null> {
  const res = await fetch(`${ZAPRITE_API_BASE}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zaprite get order failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<ZapriteOrder>;
}

export async function listOrders(): Promise<ZapriteOrder[]> {
  const res = await fetch(`${ZAPRITE_API_BASE}/orders`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zaprite list orders failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { data?: ZapriteOrder[]; orders?: ZapriteOrder[] };
  const list = data.data ?? data.orders ?? (Array.isArray(data) ? data : []);
  return Array.isArray(list) ? list : [];
}
