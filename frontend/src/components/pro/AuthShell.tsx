import Link from "next/link";
import type { ReactNode } from "react";
import type { Phone } from "@/lib/types";

/** Centred 480px column of the Connexion page, with the sign-up prompt and the help line. */
export function AuthShell({ phone, children }: { phone: Phone; children: ReactNode }) {
  return (
    <div className="flex justify-center pt-8 pb-4 md:pt-[72px] md:pb-6">
      <div className="flex w-full max-w-[480px] flex-col gap-4">
        {children}
        <div className="rounded-20 flex flex-wrap justify-center gap-1.5 bg-white px-5 py-[18px] text-base">
          <span>Pas encore de compte ?</span>
          <Link href="/devenir-revendeur" className="font-bold underline">
            Devenir revendeur
          </Link>
        </div>
        <span className="text-muted text-center text-sm">
          Besoin d&apos;aide :{" "}
          <a href={phone.href} className="font-bold">
            {phone.display}
          </a>
        </span>
      </div>
    </div>
  );
}
