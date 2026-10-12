/** JSON-LD script tag. Kept apart from ./jsonld (server-only site config) so client components can use it. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // "<" is escaped so a value can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
