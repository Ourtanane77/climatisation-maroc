import Script from "next/script";

/** Clarity project IDs are short alphanumeric strings; anything else is ignored (written into a script). */
const CLARITY_ID_PATTERN = /^[a-z0-9]+$/i;

/**
 * Microsoft Clarity loader (Microsoft's snippet), loaded after hydration. The element id must not be
 * « clarity »: browsers expose element ids as window properties, so window.clarity would be the
 * <script> element, the snippet would keep it instead of its queue function, and the tag would fail
 * (« a[c] is not a function »).
 */
export const CLARITY_SCRIPT_ID = "ms-clarity-init";

export function Clarity({ id }: { id: string | null }) {
  if (!id || !CLARITY_ID_PATTERN.test(id)) return null;
  return (
    <Script id={CLARITY_SCRIPT_ID} strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`}
    </Script>
  );
}
