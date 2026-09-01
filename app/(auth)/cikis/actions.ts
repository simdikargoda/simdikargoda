"use server";

import { redirect } from "next/navigation";

import { clearSessionCookie, getCurrentSession } from "@/lib/auth";

export async function logoutAction(): Promise<void> {
  await getCurrentSession();
  await clearSessionCookie();
  redirect("/giris");
}
