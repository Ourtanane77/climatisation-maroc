import { ButtonLink } from "@/components/ui/Button";
import { waLink } from "@/lib/whatsapp";

/**
 * Light-blue contact band closing the blog, article and calculator pages (design ContactCtaBand):
 * the advice line, "Nous écrire sur WhatsApp" with a prefilled message, "Demander un devis".
 */
export function ContactCtaBand({ title, whatsappText }: { title: string; whatsappText: string }) {
  return (
    <section className="pt-10 md:pt-14">
      <div className="bg-tint-blue flex flex-wrap items-center justify-between gap-6 rounded-[28px] p-6 md:p-12">
        <div className="flex max-w-[620px] flex-col gap-2">
          <h2 className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">{title}</h2>
          <p className="text-ink-2 m-0 text-[17px] leading-[1.55]">Conseil : 0666-088348, du lundi au samedi de 9h à 19h.</p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <ButtonLink href={waLink(whatsappText)} variant="whatsapp">
            Nous écrire sur WhatsApp
          </ButtonLink>
          <ButtonLink href="/demander-un-devis" variant="orange">
            Demander un devis
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
