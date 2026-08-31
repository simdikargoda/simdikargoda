"use client";

import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Kargo oluşturma sayfasına yönlendiren ana CTA. */
export function NewShipmentButton() {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/yonetim/kargo/yeni")}>
      <PackagePlus className="h-4 w-4" />
      Yeni Kargo
    </Button>
  );
}
