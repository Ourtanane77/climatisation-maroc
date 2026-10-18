import "server-only";
import { cookies, headers } from "next/headers";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { clientIpFrom } from "@/lib/client-ip";
import { siteHeaders, SITE } from "@/lib/site";
import { CART_COOKIE, VISIT_COOKIE, parseCart, type CartLine } from "@/lib/cart/cookie";
import type { City, OrderView, PaymentForm, Quote } from "./types";

/**
 * Server-side calls to the commerce API (backend-for-frontend): they forward the reseller token
 * (pro prices), the storefront (X-Site) and the visitor's IP (rate limits). Never cached: prices depend on the visitor.
 */

const API_BASE = `${(process.env.API_INTERNAL_URL ?? "http://localhost:8080").replace(/\/$/, "")}/api/v1`;

export interface ApiResult<T> {
  status: number;
  body: T;
}

/** Forwards a request body to the API and returns its status and JSON, errors included. */
export async function apiForward<T>(method: "GET" | "POST", path: string, body?: unknown, clientIp?: string | null): Promise<ApiResult<T>> {
  const token = await getToken();
  const ip = clientIp ?? (await visitorIp());
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...siteHeaders(),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(ip ? { "X-Forwarded-For": ip } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, body: json };
}

/** The visitor's IP as seen by nginx (never the client-supplied first X-Forwarded-For entry). */
export async function visitorIp(): Promise<string | null> {
  return clientIpFrom(await headers());
}

export async function cartFromCookie(): Promise<CartLine[]> {
  const jar = await cookies();
  return parseCart(jar.get(CART_COOKIE)?.value);
}

/** Technical visit ticked on a product page (`cm_visit=1`). */
export async function visitFromCookie(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(VISIT_COOKIE)?.value === "1";
}

export async function quoteCart(lines: CartLine[], technicalVisit = false): Promise<Quote> {
  const { status, body } = await apiForward<Quote>("POST", "/cart/quote", { lines, options: { technical_visit: technicalVisit } });
  if (status !== 200) throw new Error(`POST /cart/quote → ${status}`);
  return body;
}

export async function getOrder(reference: string, token: string): Promise<OrderView | null> {
  if (!new RegExp(`^${SITE.orderPrefix}-\\d{4}-\\d{5}$`, "i").test(reference) || !token) return null;
  const { status, body } = await apiForward<OrderView>("GET", `/orders/${encodeURIComponent(reference.toUpperCase())}?t=${encodeURIComponent(token)}`);
  return status === 200 ? body : null;
}

/** Payment methods offered at checkout: card payment only when the back office turned it on. */
export async function getCheckoutOptions(): Promise<{ onlinePayment: boolean }> {
  const { status, body } = await apiForward<{ onlinePayment?: boolean }>("GET", "/checkout/options");
  return { onlinePayment: status === 200 && body.onlinePayment === true };
}

/** The signed CMI form of a card order, or null when it cannot be paid now (paid, cancelled, card off). */
export async function getPaymentForm(reference: string, token: string): Promise<PaymentForm | null> {
  if (!new RegExp(`^${SITE.orderPrefix}-\\d{4}-\\d{5}$`, "i").test(reference) || !token) return null;
  const { status, body } = await apiForward<PaymentForm>("POST", `/orders/${encodeURIComponent(reference.toUpperCase())}/payment`, { t: token });
  return status === 200 && body.url && body.fields ? body : null;
}

export async function getCities(): Promise<City[]> {
  const { data } = await apiGet<{ data: City[] }>("/cities", { tags: ["cities"], revalidate: 3600 });
  return data;
}
