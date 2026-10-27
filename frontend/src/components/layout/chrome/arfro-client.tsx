"use client";

import dynamic from "next/dynamic";

/**
 * arfro.com's client chrome through next/dynamic (server-rendered, no Suspense fallback): its code
 * is a separate chunk, so Climatisation Maroc, which shares the layout route, does not download it
 * (same pattern as cm-client.tsx).
 */
export const ArfroHeaderClient = dynamic(() => import("../arfro/ArfroHeaderClient").then((m) => m.ArfroHeaderClient));
export const ArfroFooterColumns = dynamic(() => import("../arfro/ArfroFooterColumns").then((m) => m.ArfroFooterColumns));
