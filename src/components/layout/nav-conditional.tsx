"use client";

import { usePathname } from "next/navigation";

export function NavConditional({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/status")) {
    return null;
  }
  
  return <>{children}</>;
}