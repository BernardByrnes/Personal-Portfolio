"use client";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithHints = Navigator & {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  deviceMemory?: number;
};

export function shouldUseLightEffects() {
  if (typeof window === "undefined") return true;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as NavigatorWithHints;
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
  const slowConnection =
    connection?.saveData === true ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";
  const limitedCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const limitedMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;

  return reducedMotion || slowConnection || limitedCpu || limitedMemory;
}

export function hasFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}
