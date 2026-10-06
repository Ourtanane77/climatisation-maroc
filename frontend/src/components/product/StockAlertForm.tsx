"use client";

import { useState } from "react";
import { ErrorIcon } from "@/components/ui/icons";
import { PHONE_ERROR_SHORT, isValidMoroccanPhone, normalizePhone } from "@/lib/phone";

/**
 * Out-of-stock box (design: "Rupture de stock pour cette puissance" + "Me prévenir").
 * Posts {sku, phone} to the Next form handler /api/forms/stock-alert (lead type alerte_stock).
 */
export function StockAlertForm({ sku, unit = "puissance" }: { sku: string; unit?: string }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidMoroccanPhone(phone)) {
      setError(PHONE_ERROR_SHORT);
      return;
    }
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/forms/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ sku, phone: normalizePhone(phone) }),
      });
      if (res.ok) {
        setState("sent");
        return;
      }
      const body = (await res.json().catch(() => null)) as { errors?: Record<string, string[]>; message?: string } | null;
      setError(body?.errors?.phone?.[0] ?? body?.errors?.sku?.[0] ?? body?.message ?? "L’envoi a échoué. Réessayez dans un instant.");
    } catch {
      setError("L’envoi a échoué. Réessayez dans un instant.");
    }
    setState("idle");
  }

  return (
    <div className="rounded-16 bg-tint-orange flex flex-col gap-3 px-[18px] py-4">
      <span className="text-promo text-[15px] font-bold">Rupture de stock pour cette {unit}</span>
      {state === "sent" ? (
        <p role="status" className="text-ink m-0 text-[15px] font-semibold">
          C’est noté : nous vous appelons dès le retour en stock.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-wrap gap-2">
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Votre téléphone"
            aria-label="Téléphone"
            aria-invalid={!!error}
            aria-describedby={error ? `stock-alert-error-${sku}` : undefined}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 min-w-40 flex-1 rounded-full border-[1.5px] border-[#E3C7B3] bg-white px-[18px] text-base"
          />
          <button type="submit" disabled={state === "sending"} className="bg-ink h-12 rounded-full px-5 text-[15px] font-bold text-white disabled:opacity-60">
            Me prévenir
          </button>
          {error && (
            <p id={`stock-alert-error-${sku}`} role="alert" className="text-promo m-0 flex w-full items-center gap-1.5 text-sm font-semibold">
              <ErrorIcon size={16} />
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
