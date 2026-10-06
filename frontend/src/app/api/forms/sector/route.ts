import { jsonFormHandler } from "@/lib/leads/server";

/** Sector page quote form; body includes sector_slug. Contract: lib/leads/server.ts. */
export const POST = jsonFormHandler("/leads/sector");
