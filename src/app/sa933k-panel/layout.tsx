import type { ReactNode } from "react";
import { getPrivateMetadata } from "@/lib/seo";

export const metadata = getPrivateMetadata("Panel Pengelola");

export default function PanelLayout({ children }: { children: ReactNode }) {
  return children;
}
