"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox, ChipGroup, Field, FileDrop, PasswordInput, SegmentedToggle, Select, TextInput, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { PHONE_ERROR_CHECKOUT, isValidMoroccanPhone } from "@/lib/phone";

const VILLES = [
  "Agadir",
  "Béni Mellal",
  "Casablanca",
  "El Jadida",
  "Essaouira",
  "Fès",
  "Kénitra",
  "Marrakech",
  "Meknès",
  "Mohammedia",
  "Ouarzazate",
  "Oujda",
  "Rabat",
  "Safi",
  "Salé",
  "Tanger",
  "Tétouan",
  "Autre ville",
];
const PROJETS = ["Nouvelle installation", "Remplacement", "Entretien", "Fourniture seule"] as const;

export function StyleguideForms() {
  const [who, setWho] = useState<"particulier" | "professionnel">("particulier");
  const [tel, setTel] = useState("06 12 34");
  const [projet, setProjet] = useState<(typeof PROJETS)[number] | null>("Nouvelle installation");
  const [cgv, setCgv] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const telInvalid = !isValidMoroccanPhone(tel);

  return (
    <div className="rounded-24 flex flex-col gap-6 bg-white p-5 md:p-8">
      <SegmentedToggle
        label="Vous êtes"
        value={who}
        onChange={setWho}
        options={[
          { value: "particulier", label: "Particulier" },
          { value: "professionnel", label: "Professionnel" },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nom complet" htmlFor="sg-nom">
          <TextInput id="sg-nom" autoComplete="name" defaultValue="Yassine El Amrani" />
        </Field>
        <Field label="Téléphone" htmlFor="sg-tel" error={telInvalid ? PHONE_ERROR_CHECKOUT : null}>
          <TextInput id="sg-tel" type="tel" inputMode="tel" value={tel} onChange={(e) => setTel(e.target.value)} invalid={telInvalid} />
        </Field>
        <Field label="E-mail" optional htmlFor="sg-mail">
          <TextInput id="sg-mail" type="email" placeholder="Pour recevoir le récapitulatif" />
        </Field>
        <Field label="Ville" htmlFor="sg-ville">
          <Select id="sg-ville" defaultValue="Marrakech">
            {VILLES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mot de passe souhaité" htmlFor="sg-pw" hint="8 caractères minimum.">
          <PasswordInput id="sg-pw" autoComplete="new-password" />
        </Field>
        <FileDrop label="Joindre un plan ou une photo" accept="image/*,.pdf" fileName={file} onFile={(f) => setFile(f?.name ?? null)} />
        <Field label="Note pour le livreur" optional htmlFor="sg-note" className="md:col-span-2">
          <Textarea id="sg-note" rows={3} placeholder="Étage, point de repère, horaires" />
        </Field>
      </div>
      <ChipGroup label="Type de projet" options={PROJETS} value={projet} onChange={setProjet} />
      <Checkbox checked={cgv} onChange={setCgv}>
        J&apos;accepte les{" "}
        <Link href="/cgv" className="underline">
          conditions générales de vente
        </Link>
      </Checkbox>
      <Button variant="orange" className="self-start">
        Envoyer ma demande
      </Button>
    </div>
  );
}
