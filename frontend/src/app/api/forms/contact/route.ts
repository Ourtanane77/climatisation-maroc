import { jsonFormHandler } from "@/lib/leads/server";

/** Contact page message (Écrivez-nous). Contract: lib/leads/server.ts. */
export const POST = jsonFormHandler("/leads/contact");
