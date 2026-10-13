import Script from "next/script";

/** Container IDs look like GTM-XXXXXXX; anything else is ignored (the ID is written into a script). */
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

/** Google Tag Manager loader (Google's snippet), loaded after hydration. Rendered in <body>. */
export function GoogleTagManager({ id }: { id: string | null }) {
  if (!id || !GTM_ID_PATTERN.test(id)) return null;
  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`}
    </Script>
  );
}

/** Google's fallback for visitors without JavaScript, first thing in <body>. */
export function GoogleTagManagerNoScript({ id }: { id: string | null }) {
  if (!id || !GTM_ID_PATTERN.test(id)) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
