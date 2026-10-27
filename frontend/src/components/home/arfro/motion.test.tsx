import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrandTiles } from "./BrandTiles";
import { CountUp, REVEAL_MS, Reveal, groupDigits, onFirstEntry } from "./motion";

/** IntersectionObserver stub: `enter()` reports every observed element as intersecting. */
class FakeObserver {
  static instances: FakeObserver[] = [];
  targets: Element[] = [];
  disconnected = false;
  constructor(private cb: IntersectionObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
  enter() {
    this.cb(
      this.targets.map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver,
    );
  }
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

/** Puts every element below the fold (jsdom lays nothing out), or on screen. */
function placeElements(onScreen: boolean) {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top: onScreen ? 10 : 2000,
    bottom: onScreen ? 200 : 2200,
    left: 0,
    right: 100,
    width: 100,
    height: 190,
    x: 0,
    y: onScreen ? 10 : 2000,
    toJSON: () => ({}),
  });
}

beforeEach(() => {
  FakeObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  setReducedMotion(false);
  placeElements(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("onFirstEntry", () => {
  it("does nothing for an element already on screen", () => {
    placeElements(true);
    const cb = vi.fn();
    expect(onFirstEntry(document.body, cb)).toBeNull();
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("does nothing with reduced motion", () => {
    setReducedMotion(true);
    expect(onFirstEntry(document.body, vi.fn())).toBeNull();
  });

  it("does nothing without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    expect(onFirstEntry(document.body, vi.fn())).toBeNull();
  });

  it("calls back once when the element scrolls in", () => {
    const cb = vi.fn();
    const stop = onFirstEntry(document.body, cb);
    expect(stop).toBeTypeOf("function");
    FakeObserver.instances[0].enter();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(FakeObserver.instances[0].disconnected).toBe(true);
  });
});

describe("Reveal", () => {
  it("hides an off-screen block after hydration, shows it on entry, then drops the transition state", () => {
    vi.useFakeTimers();
    render(
      <Reveal group>
        <p>Contenu</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("Contenu").parentElement!;
    expect(wrapper).toHaveClass("am-group");
    expect(wrapper.dataset.reveal).toBe("hidden");
    act(() => FakeObserver.instances[0].enter());
    expect(wrapper.dataset.reveal).toBe("shown");
    act(() => vi.advanceTimersByTime(REVEAL_MS));
    expect(wrapper.dataset.reveal).toBe("done");
  });

  it("leaves a block on screen (the hero, the LCP element) untouched", () => {
    placeElements(true);
    render(
      <Reveal>
        <p>Visible</p>
      </Reveal>,
    );
    expect(screen.getByText("Visible").parentElement!.dataset.reveal).toBeUndefined();
  });

  it("never hides anything with reduced motion", () => {
    setReducedMotion(true);
    render(
      <Reveal>
        <p>Calme</p>
      </Reveal>,
    );
    expect(screen.getByText("Calme").parentElement!.dataset.reveal).toBeUndefined();
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("is visible in the server HTML (no hidden state before hydration)", async () => {
    const { renderToString } = await import("react-dom/server");
    const html = renderToString(
      <Reveal>
        <p>SSR</p>
      </Reveal>,
    );
    expect(html).not.toContain("data-reveal");
  });
});

describe("CountUp", () => {
  it("groups digits with the figure's own separator", () => {
    expect(groupDigits(12000, "9 000")).toBe("12 000");
    expect(groupDigits(950, "9 000")).toBe("950");
    expect(groupDigits(24000, "24000")).toBe("24 000");
  });

  it("starts from 0 off screen and counts up to the real figure on entry", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    render(<CountUp text={"9 000"} duration={100} />);
    // Screen readers always get the real figure.
    expect(document.querySelector(".sr-only")!.textContent).toBe("9 000");
    const shown = document.querySelector("[aria-hidden]")!;
    expect(shown.textContent).toBe("0");
    act(() => FakeObserver.instances[0].enter());
    act(() => frames.shift()!(performance.now() + 1000));
    expect(shown.textContent).toBe("9 000");
  });

  it("stays static with reduced motion", () => {
    setReducedMotion(true);
    render(<CountUp text="18 000" />);
    expect(document.querySelector("[aria-hidden]")!.textContent).toBe("18 000");
  });
});

describe("BrandTiles marquee", () => {
  const brands = [
    { name: "LG", href: "/marques/lg", logo: "/lg.webp", aspect: 2 },
    { name: "Carrier", href: "/marques/carrier", logo: null, aspect: null },
  ];

  it("renders the list twice, the copy hidden from assistive tech and the tab order", () => {
    const { container } = render(<BrandTiles brands={brands} official={new Set(["/marques/lg"])} />);
    const lists = container.querySelectorAll("ul.am-marquee__list");
    expect(lists).toHaveLength(2);
    const [main, copy] = lists;
    expect(main).not.toHaveAttribute("aria-hidden");
    expect(copy).toHaveAttribute("aria-hidden", "true");
    expect(copy).toHaveClass("am-marquee__copy");
    copy.querySelectorAll("a").forEach((a) => expect(a).toHaveAttribute("tabindex", "-1"));
    main.querySelectorAll("a").forEach((a) => expect(a).not.toHaveAttribute("tabindex"));
    // One accessible link per brand, every brand shown (not only the first eight).
    expect(screen.getAllByRole("link", { name: /LG|Carrier/ })).toHaveLength(2);
    expect(screen.getAllByText("Distributeur officiel")).toHaveLength(2);
    expect(copy.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("sets the loop duration from the number of brands", () => {
    const { container } = render(<BrandTiles brands={brands} official={new Set()} />);
    expect((container.querySelector(".am-marquee__track") as HTMLElement).style.getPropertyValue("--am-duration")).toBe("8s");
  });

  it("renders nothing without brands", () => {
    const { container } = render(<BrandTiles brands={[]} official={new Set()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
