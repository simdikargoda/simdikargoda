import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/giris");
  }

  if (session.role === "admin") {
    redirect("/yonetim");
  }

  redirect("/panel");
}
