import Script from "next/script";
import { Suspense } from "react";
import { MetaPixelPageViews } from "./MetaPixelPageViews";

/** Pixel IDs are numeric; anything else is ignored (the ID is written into a script). */
const META_PIXEL_ID_PATTERN = /^\d{6,20}$/;

/** The id avoids names scripts read from window (element ids become window properties: not « fbq »). */
export const META_PIXEL_SCRIPT_ID = "meta-pixel-init";

/**
 * Meta (Facebook) Pixel loader (Meta's snippet), loaded after hydration: init + the first PageView.
 * Client-side navigations send their own PageView (MetaPixelPageViews), since the App Router does
 * not reload the page.
 */
export function MetaPixel({ id }: { id: string | null }) {
  if (!id || !META_PIXEL_ID_PATTERN.test(id)) return null;
  return (
    <>
      <Script id={META_PIXEL_SCRIPT_ID} strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`}
      </Script>
      {/* useSearchParams needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <MetaPixelPageViews />
      </Suspense>
    </>
  );
}

/** Meta's fallback for visitors without JavaScript. */
export function MetaPixelNoScript({ id }: { id: string | null }) {
  if (!id || !META_PIXEL_ID_PATTERN.test(id)) return null;
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element -- tracking pixel, not content */}
      <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`} />
    </noscript>
  );
}
