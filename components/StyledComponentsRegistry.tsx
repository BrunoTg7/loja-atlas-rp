"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createGlobalStyle, ServerStyleSheet } from "styled-components";

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return styledComponentsStyleSheet.collect(<>{children}</>);
}
