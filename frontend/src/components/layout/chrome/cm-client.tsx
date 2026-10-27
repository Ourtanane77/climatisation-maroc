"use client";

import dynamic from "next/dynamic";

/**
 * Climatisation Maroc's header through next/dynamic (server-rendered, no Suspense fallback): its
 * code is a separate chunk, so arfro.com, which shares the layout route, does not download it
 * (Turbopack bundles every client component a route segment imports, rendered or not).
 */
export const SiteHeader = dynamic(() => import("../SiteHeader").then((m) => m.SiteHeader));
