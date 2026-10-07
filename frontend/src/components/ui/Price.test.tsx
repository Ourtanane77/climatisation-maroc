import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { isOnRequest, priceRequestHref, priceText } from "@/lib/format";
import { PriceBlock } from "./Price";

describe("« Prix sur demande » (price 0)", () => {
  it("formats prices and on-request items", () => {
    expect(isOnRequest(0)).toBe(true);
    expect(isOnRequest(null)).toBe(true);
    expect(isOnRequest(570000)).toBe(false);
    expect(priceText(0)).toBe("Prix sur demande");
    expect(priceText(570000)).toBe("5 700 Dhs");
    // Temporary Excel references are never shown or prefilled; real references are.
    expect(priceRequestHref("XLS-GRILLESIMPLE6010")).toBe("/demander-un-devis");
    expect(priceRequestHref("CUIV0010")).toBe("/demander-un-devis?ref=CUIV0010");
    expect(priceRequestHref(null)).toBe("/demander-un-devis");
  });

  it("shows « Prix sur demande » without « À partir de », struck price or saving", () => {
    render(<PriceBlock price={0} regularPrice={100000} from />);
    expect(screen.getByText("Prix sur demande")).toBeInTheDocument();
    expect(screen.queryByText("À partir de")).toBeNull();
    expect(screen.queryByText(/Économisez/)).toBeNull();
    expect(screen.queryByText(/Dhs/)).toBeNull();
  });

  it("keeps the normal price block for priced items", () => {
    const { container } = render(<PriceBlock price={550000} regularPrice={670000} />);
    expect(container.textContent).toContain(priceText(550000));
    expect(container.textContent).toContain("Économisez");
    expect(container.textContent).not.toContain("Prix sur demande");
  });
});
