import { act, fireEvent, render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AirflowLines } from "@/components/arfro/AirflowLines";
import { ClipReveal, CountUp, HorizontalScroller, Marquee, Parallax, Reveal, ScrollIndicator, SplitHeadline } from "@/components/arfro/motion";
import { loadGsap, resetGsapForTests } from "@/components/arfro/motion/gsap";

// gsap is mocked: the factories count how often the modules are actually imported.
// `tweens` counts gsap.fromTo calls (reset per test; the module itself is cached once imported).
const imports = vi.hoisted(() => ({ gsap: 0, scrollTrigger: 0, tweens: 0 }));
vi.mock("gsap", () => {
  imports.gsap++;
  const ctx = { revert: vi.fn() };
  const gsap = {
    registerPlugin: vi.fn(),
    context: (fn: () => void) => {
      fn();
      return ctx;
    },
    fromTo: vi.fn(() => {
      imports.tweens++;
    }),
    to: vi.fn(() => ({ scrollTrigger: null })),
    matchMedia: () => ({ add: vi.fn(), revert: vi.fn() }),
  };
  return { gsap, default: gsap };
});
vi.mock("gsap/ScrollTrigger", () => {
  imports.scrollTrigger++;
  const ScrollTrigger = { config: vi.fn(), refresh: vi.fn() };
  return { ScrollTrigger, default: ScrollTrigger };
});

/** Captured IntersectionObserver callbacks, to simulate scrolling into view. */
let observers: Array<{ cb: IntersectionObserverCallback; el?: Element }> = [];

function stubMotionEnv({ reduced = false, offscreen = true }: { reduced?: boolean; offscreen?: boolean } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((q: string) => ({ matches: reduced && q.includes("reduce"), media: q, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  class IO {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(el: Element) {
      observers.push({ cb: this.cb, el });
    }
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", IO);
  const top = offscreen ? 5000 : 10;
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);
}

function enterAll() {
  act(() => {
    for (const o of observers) o.cb([{ isIntersecting: true, target: o.el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
  });
}

beforeEach(() => {
  observers = [];
  imports.tweens = 0;
  resetGsapForTests();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const everything = (
  <div>
    <Reveal stagger>
      <p>Un</p>
      <p>Deux</p>
    </Reveal>
    <ClipReveal from="left">
      <span>Image</span>
    </ClipReveal>
    <SplitHeadline text="Le confort qui change tout." />
    <Parallax>
      <span>Drift</span>
    </Parallax>
    <AirflowLines variant="hero" />
    <ScrollIndicator href="#suite" />
    <CountUp value={2008} grouping={false} />
  </div>
);

describe("server render", () => {
  it("is the final, visible state: no element is hidden and gsap is never imported", () => {
    const html = renderToString(everything);
    expect(html).not.toContain("data-reveal");
    expect(html).toContain("Un");
    expect(html).toContain('aria-label="Le confort qui change tout."');
    expect(html).toContain("2008");
    expect(imports.gsap).toBe(0);
    expect(imports.scrollTrigger).toBe(0);
  });

  it("loadGsap resolves to null without importing gsap when there is no window", async () => {
    vi.stubGlobal("window", undefined);
    await expect(loadGsap()).resolves.toBeNull();
    vi.unstubAllGlobals();
    expect(imports.gsap).toBe(0);
  });
});

describe("reduced motion", () => {
  it("hides and animates nothing, and never loads gsap", async () => {
    stubMotionEnv({ reduced: true, offscreen: true });
    const { container } = render(everything);
    expect(container.querySelector("[data-reveal]")).toBeNull();
    await expect(loadGsap()).resolves.toBeNull();
    await act(async () => {});
    expect(imports.gsap).toBe(0);
    expect(observers).toHaveLength(0);
  });
});

describe("scroll entrances", () => {
  it("leaves blocks already on screen untouched", () => {
    stubMotionEnv({ offscreen: false });
    const { container } = render(everything);
    expect(container.querySelector("[data-reveal]")).toBeNull();
  });

  it("hides off-screen blocks after hydration, then reveals them on entry", () => {
    stubMotionEnv({ offscreen: true });
    const { container } = render(everything);
    const reveal = container.querySelector(".arfro-reveal") as HTMLElement;
    const clip = container.querySelector(".arfro-clip-reveal") as HTMLElement;
    const split = container.querySelector(".arfro-split") as HTMLElement;
    expect(reveal.dataset.reveal).toBe("out");
    expect(clip.dataset.reveal).toBe("out");
    expect(split.dataset.reveal).toBe("out");
    enterAll();
    expect(reveal.dataset.reveal).toBe("in");
    expect(clip.dataset.reveal).toBe("in");
    expect(split.dataset.reveal).toBe("in");
  });

  it("drops the attribute on unmount so nothing stays hidden", () => {
    stubMotionEnv({ offscreen: true });
    const { container, unmount } = render(
      <Reveal>
        <p>x</p>
      </Reveal>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.dataset.reveal).toBe("out");
    unmount();
    expect(el.dataset.reveal).toBeUndefined();
  });

  it("SplitHeadline intro never waits for scroll (CSS plays it from the server HTML)", () => {
    stubMotionEnv({ offscreen: true });
    const { container } = render(<SplitHeadline as="h1" intro text="Le confort qui change tout." />);
    const h1 = container.querySelector("h1")!;
    expect(h1.dataset.reveal).toBeUndefined();
    expect(h1).toHaveClass("arfro-split-intro");
    expect(h1.querySelectorAll(".arfro-split-word .arfro-split-inner")).toHaveLength(5);
    expect(screen.getByRole("heading", { name: "Le confort qui change tout." })).toBe(h1);
  });
});

/** Lets the dynamic imports and promise chains settle. */
async function flush() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
  });
}

function scroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("lazy gsap", () => {
  it("never loads gsap for divider, connector and footer lines (CSS drawing only)", async () => {
    stubMotionEnv({ offscreen: true });
    const { container } = render(
      <>
        <AirflowLines variant="divider" />
        <AirflowLines variant="connector" />
        <AirflowLines variant="dark" scrub={false} />
      </>,
    );
    scroll();
    await flush();
    enterAll();
    await flush();
    expect(imports.gsap).toBe(0);
    expect(imports.scrollTrigger).toBe(0);
    container.querySelectorAll("svg").forEach((svg) => expect(svg.dataset.reveal).toBe("in"));
  });

  it("loads gsap for a scrubbed block only after the visitor scrolls near it, never on load", async () => {
    stubMotionEnv({ offscreen: true });
    const { container } = render(<AirflowLines variant="hero" />);
    await flush();
    expect(imports.gsap).toBe(0); // initial load: nothing
    const svg = container.querySelector("svg")!;
    expect(svg.dataset.reveal).toBe("out");
    const drawObservers = observers.length;
    scroll();
    await flush();
    expect(imports.gsap).toBe(0); // scrolled, but the block is not near yet
    // Only the gsap gate fires (its rootMargin is a screen wide): the block is not on screen yet.
    act(() => {
      for (const o of observers.slice(drawObservers))
        o.cb([{ isIntersecting: true, target: o.el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    await flush();
    expect(imports.gsap).toBe(1);
    expect(imports.scrollTrigger).toBe(1);
    expect(imports.tweens).toBe(1);
    expect(svg.dataset.reveal).toBe("scrub");
  });

  it("does not start the Parallax tween before the first scroll", async () => {
    stubMotionEnv({ offscreen: false });
    render(
      <Parallax>
        <span>Drift</span>
      </Parallax>,
    );
    enterAll();
    await flush();
    expect(imports.tweens).toBe(0);
    scroll();
    await flush();
    enterAll();
    await flush();
    expect(imports.tweens).toBe(1);
  });
});

describe("airflow pulse", () => {
  it("runs only while the block is on screen (data-inview toggled by the observer)", () => {
    stubMotionEnv({ offscreen: false });
    const { container } = render(<AirflowLines variant="hero" />);
    const svg = container.querySelector("svg")!;
    expect(svg.dataset.inview).toBeUndefined();
    const fire = (isIntersecting: boolean) =>
      act(() => {
        for (const o of observers)
          if (o.el === svg) o.cb([{ isIntersecting, target: svg } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
      });
    fire(true);
    expect(svg.dataset.inview).toBe("true");
    fire(false);
    expect(svg.dataset.inview).toBeUndefined();
  });

  it("is not observed with animate={false} or reduced motion", () => {
    stubMotionEnv({ offscreen: false });
    render(<AirflowLines variant="dark" animate={false} />);
    expect(observers).toHaveLength(0);
  });
});

describe("AirflowLines", () => {
  it("renders decorative paths drawn with pathLength=1", () => {
    const { container } = render(<AirflowLines variant="hero" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg).toHaveClass("arfro-airflow");
    const lines = svg.querySelectorAll(".arfro-airflow-line");
    expect(lines).toHaveLength(3);
    lines.forEach((p) => expect(p).toHaveAttribute("pathLength", "1"));
    expect(svg.querySelectorAll(".arfro-airflow-pulse")).toHaveLength(3);
  });

  it("has no pulse and no data-animate when static", () => {
    const { container } = render(<AirflowLines variant="connector" animate={false} />);
    const svg = container.querySelector("svg")!;
    expect(svg).not.toHaveAttribute("data-animate");
    expect(svg.querySelectorAll(".arfro-airflow-line")).toHaveLength(1);
    expect(svg.querySelectorAll(".arfro-airflow-pulse")).toHaveLength(0);
  });
});

describe("Marquee", () => {
  it("duplicates the items, the copy aria-hidden and inert", () => {
    const { container } = render(
      <Marquee as="ul" label="Marques partenaires" duration={30}>
        <li>LG</li>
        <li>Carrier</li>
      </Marquee>,
    );
    const groups = container.querySelectorAll(".arfro-marquee-group");
    expect(groups).toHaveLength(2);
    expect(groups[0]).not.toHaveAttribute("aria-hidden");
    expect(groups[0]).toHaveAttribute("aria-label", "Marques partenaires");
    expect(groups[1]).toHaveAttribute("aria-hidden", "true");
    expect(groups[1]).toHaveAttribute("inert");
    expect(screen.getAllByRole("listitem")).toHaveLength(2); // the copy is not exposed
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--arfro-marquee-duration")).toBe("30s");
  });
});

describe("CountUp", () => {
  it("renders the final value for the server and screen readers", () => {
    const html = renderToString(<CountUp value={5700} suffix=" Dhs" />);
    expect(html).toContain("5 700 Dhs");
    expect(html).toContain("sr-only");
  });
});

describe("HorizontalScroller", () => {
  it("wraps each child in a panel inside a labelled, focusable region", () => {
    render(
      <HorizontalScroller label="Nos environnements">
        <article>Maison</article>
        <article>Bureaux</article>
        {null}
      </HorizontalScroller>,
    );
    const region = screen.getByRole("region", { name: "Nos environnements" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region.querySelectorAll(".arfro-hscroll-item")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Panneau précédent" })).toBeDisabled();
  });

  it("moves one panel with the arrow keys", () => {
    const scrollTo = vi.fn();
    render(
      <HorizontalScroller label="Panneaux" controls={false}>
        <div>A</div>
        <div>B</div>
      </HorizontalScroller>,
    );
    const region = screen.getByRole("region", { name: "Panneaux" });
    region.scrollTo = scrollTo as unknown as typeof region.scrollTo;
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("split module (production entry ./index.tsx)", () => {
  it("exports the primitives through next/dynamic: they render once their chunk has loaded", async () => {
    const lazy = await import("./index");
    render(
      <Suspense fallback={null}>
        <lazy.Reveal>
          <p>Chargé</p>
        </lazy.Reveal>
        <lazy.SplitHeadline text="Le confort" />
      </Suspense>,
    );
    expect(await screen.findByText("Chargé")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Le confort" })).toBeInTheDocument();
    expect(typeof lazy.useInView).toBe("function");
    expect(typeof lazy.loadGsap).toBe("function");
  });
});
