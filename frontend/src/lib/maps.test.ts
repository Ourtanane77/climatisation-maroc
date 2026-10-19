import { describe, expect, it } from "vitest";
import { googleMapsEmbedSrc } from "./maps";

const ARFRO =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3396.4047309297084!2d-7.990787888134776!3d31.65014507404711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafefea414aac07%3A0xc50205eec02ae1c!2sARFRO!5e0!3m2!1sfr!2sma!4v1792428423780!5m2!1sfr!2sma";

describe("googleMapsEmbedSrc", () => {
  it("keeps a Google Maps embed address", () => {
    expect(googleMapsEmbedSrc(ARFRO)).toBe(ARFRO);
    expect(googleMapsEmbedSrc(`  ${ARFRO}  `)).toBe(ARFRO);
  });

  it("refuses anything else", () => {
    for (const url of [
      null,
      undefined,
      "",
      "http://www.google.com/maps/embed?pb=x",
      "https://google.com/maps/embed?pb=x",
      "https://www.google.com.evil.ma/maps/embed?pb=x",
      "https://www.google.com/maps/place/ARFRO",
      "https://www.google.com/maps/embed",
      "https://user@www.google.com/maps/embed?pb=x",
      "https://www.google.com:8443/maps/embed?pb=x",
      "https://www.google.com/maps/embed?pb=x#y",
      '<iframe src="https://www.google.com/maps/embed?pb=x"></iframe>',
      'https://www.google.com/maps/embed?pb=x" onload="alert(1)',
      "javascript:alert(1)",
    ]) {
      expect(googleMapsEmbedSrc(url)).toBeNull();
    }
  });
});
