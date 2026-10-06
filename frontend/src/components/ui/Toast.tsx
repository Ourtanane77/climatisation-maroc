"use client";

import { useEffect, useState } from "react";

/** Black pill toast at the bottom ("… ajouté au panier"), 2.2 s, as in the design. */

type Listener = (message: string) => void;
const listeners = new Set<Listener>();

export function toast(message: string) {
  listeners.forEach((l) => l(message));
}

export function ToastHost() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const listener: Listener = (m) => {
      setMessage(m);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(""), 2200);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      {message && <div className="animate-rise bg-ink max-w-[90vw] rounded-full px-5 py-3 text-center text-[15px] text-white">{message}</div>}
    </div>
  );
}
