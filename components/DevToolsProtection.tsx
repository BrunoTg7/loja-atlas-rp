"use client";

import { useEffect } from "react";

export default function DevToolsProtection() {
  useEffect(() => {
    console.log(
      "%c🛑 ATLAS RP — Área Protegida",
      "background: #1e1b4b; color: #818cf8; font-size: 20px; padding: 10px 20px; border-radius: 8px; font-weight: bold;"
    );
    console.log(
      "%cTentativas de acesso não autorizado serão registradas.",
      "color: #a5b4fc; font-size: 12px;"
    );
  }, []);

  return null;
}
