import Link from "next/link";

/** Home page placeholder: the full design (hero, power finder, bento, rails) is built in phase 7. */
export default function HomePage() {
  return (
    <section className="flex flex-col gap-6 py-16">
      <h1 className="m-0 max-w-[900px] text-[38px] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance md:text-[52px] xl:text-[62px]">
        Jusqu&apos;à -30 % sur toute la gamme de climatiseurs
      </h1>
      <p className="m-0 text-xl font-semibold">Le confort au cœur de votre quotidien</p>
      {process.env.NODE_ENV !== "production" && (
        <p className="text-muted m-0">
          Site en construction. Composants : <Link href="/styleguide">/styleguide</Link>
        </p>
      )}
    </section>
  );
}
