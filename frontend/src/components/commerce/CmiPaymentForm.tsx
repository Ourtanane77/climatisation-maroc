"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { MAT, MatIcon } from "@/components/ui/icons";
import type { PaymentForm } from "@/lib/commerce/types";
import { dh } from "@/lib/format";

/**
 * Posts the signed form to CMI's payment page: submitted as soon as the page is first shown, the
 * button stays for browsers without JavaScript, a second visit, or a blocked automatic submit. The fields are
 * signed by the API: they are sent exactly as received.
 */
export function CmiPaymentForm({ form }: { form: PaymentForm }) {
  const ref = useRef<HTMLFormElement>(null);
  const oid = form.fields.oid ?? "";
  useEffect(() => {
    // Once per order and tab: coming back from CMI with "Back" shows the button instead of
    // bouncing to CMI again.
    const key = `cmi-auto-submit:${oid}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: submit anyway.
    }
    ref.current?.submit();
  }, [oid]);

  return (
    <form ref={ref} method="post" action={form.url} acceptCharset="UTF-8" className="flex flex-col gap-3">
      {Object.entries(form.fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button type="submit" variant="orange" full icon={<MatIcon d={MAT.lock} size={20} />}>
        Payer {dh(form.total)} par carte
      </Button>
    </form>
  );
}
