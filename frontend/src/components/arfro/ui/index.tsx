/**
 * Arfro ui entry point (docs/arfro-design-system.md), for SERVER components: re-exports the
 * client-safe primitives (./base) and the server-only photo helpers (./image). Client components
 * ("use client") import from "@/components/arfro/ui/base" instead.
 */
export * from "./base";
export * from "./image";
