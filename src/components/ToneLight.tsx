"use client";

import { useEffect } from "react";

/** Passe le header en ton clair le temps de la page (fond clair), même si le Footer tente de le changer. */
export default function ToneLight() {
  useEffect(() => {
    const body = document.body;
    const force = () => {
      if (body.dataset.tone !== "light") body.dataset.tone = "light";
    };
    force();
    const mo = new MutationObserver(force);
    mo.observe(body, { attributes: true, attributeFilter: ["data-tone"] });
    return () => {
      mo.disconnect();
      delete body.dataset.tone;
    };
  }, []);
  return null;
}
