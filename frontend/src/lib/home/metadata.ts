import "server-only";
import type { Metadata } from "next";
import { designImage } from "@/lib/design-assets";
import { seoMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";

/** Home page metadata (both storefronts; canonical « / »). */
export function homeMetadata(): Metadata {
  return seoMetadata({ title: SITE.defaultTitle, absolute: true, description: SITE.description, path: "/", image: designImage("cover-ariha.png") });
}
