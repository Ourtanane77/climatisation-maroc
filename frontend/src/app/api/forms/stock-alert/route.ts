import { jsonFormHandler } from "@/lib/leads/server";

/** "Me prévenir" on an out-of-stock product: {sku, phone}. Contract: lib/leads/server.ts. */
export const POST = jsonFormHandler("/leads/stock-alert");
