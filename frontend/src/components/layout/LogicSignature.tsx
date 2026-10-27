import { SITE_URL } from "@/lib/site";

/** utm_source: the storefront's host (climatisationmaroc.com, arfro.com…). */
function siteHost(): string {
  try {
    return new URL(SITE_URL).hostname || "client";
  } catch {
    return "client";
  }
}

/**
 * Signature of the agency that built the two storefronts (Logic Technologies), from its no-JS
 * snippet: rendered on the server, styled by `.lt-sig` in globals.css. `dark` sits on the blue
 * footers and takes the colour of the text around it; `light` (default, owner's choice) is black on
 * a white pill, readable on both blue footers. The link is named by its own text (« Conçu avec
 * amour par Logic Technologies », the heart being labelled « amour »), so the name matches what is
 * on screen (WCAG 2.5.3).
 */
export function LogicSignature({ theme = "light", className }: { theme?: "light" | "dark"; className?: string }) {
  const href = `https://logictechnologies.ma?utm_source=${encodeURIComponent(siteHost())}&utm_medium=signature&utm_campaign=signe-logic`;
  return (
    <a className={className ? `lt-sig ${className}` : "lt-sig"} data-theme={theme} href={href} target="_blank" rel="noopener">
      <svg className="lt-sig__mark" viewBox="112 132 744 632" aria-hidden="true" focusable="false">
        <path className="c" d="M117,137H225V397A250,250 0 0 0 475,645H531V754H475A358,358 0 0 1 117,397Z" />
        <path className="c" d="M318,137H375A358,358 0 0 1 733,495V754H624V494A249,249 0 0 0 375,245H318Z" />
        <path className="i" d="M621,137H851V245H730Q690,183 621,137Z" />
        <circle className="i" cx="424" cy="445" r="75" />
      </svg>
      <span className="lt-sig__t">
        Conçu avec
        <svg className="lt-sig__h" viewBox="0 0 24 24" role="img" aria-label="amour" focusable="false">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
        </svg>
        par
      </span>
      <b>Logic Technologies</b>
    </a>
  );
}
