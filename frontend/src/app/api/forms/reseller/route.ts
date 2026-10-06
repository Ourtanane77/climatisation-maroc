import { jsonFormHandler } from "@/lib/leads/server";

/** Devenir revendeur application. Contract: lib/leads/server.ts. */
export const POST = jsonFormHandler("/resellers/apply");
