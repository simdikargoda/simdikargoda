import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, Phone, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema/customer";
import { eq } from "drizzle-orm";
import { requireStaff } from "@/lib/guard";
import { EditCustomerForm } from "./edit-customer-form";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  
  const { id } = await params;
  const db = getDb();
  
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Müşteri Detayı" 
          description={`${customer.name} profili ve ayarları`}
        />
        <Link
          href="/yonetim/musteriler"
          className="inline-flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Müşterilere Dön
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_2fr]">
        {/* Sol Kolon: Profil Özeti */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-soft">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-4 ring-primary/5">
                <Building2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
              {customer.authorizedPerson ? (
                <p className="text-sm font-medium text-muted mt-1">{customer.authorizedPerson}</p>
              ) : null}
              <div className="mt-4 flex gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${customer.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                  {customer.status === "active" ? "Aktif" : "Pasif"}
                </span>
                <span className="inline-flex rounded-full bg-info/10 text-info px-2.5 py-0.5 text-xs font-bold uppercase">
                  {customer.type === "current_account" ? "Cari" : "Ön Ödemeli"}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">Telefon</p>
                  <p className="text-sm font-medium text-foreground">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">E-posta</p>
                  <p className="text-sm font-medium text-foreground">{customer.email}</p>
                </div>
              </div>
              {customer.taxNumber && (
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-muted" />
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">Vergi Bilgileri</p>
                    <p className="text-sm font-medium text-foreground">{customer.taxOffice} / {customer.taxNumber}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">Adres</p>
                  <p className="text-sm font-medium text-foreground">
                    {customer.address || "Adres girilmemiş."}
                    {(customer.district || customer.city) && <br />}
                    {[customer.district, customer.city].filter(Boolean).join(" / ")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">Kayıt Tarihi</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(customer.createdAt, "dd MMMM yyyy", { locale: tr })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Düzenleme ve İşlemler */}
        <div className="space-y-6">
          <EditCustomerForm customer={customer} />
          
          <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-soft flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Kargo İşlemleri</h3>
              <p className="text-sm text-muted mt-1">Bu müşteriye ait tüm gönderileri listeleyin.</p>
            </div>
            <Link 
              href={`/yonetim/kargo?q=${encodeURIComponent(customer.name)}`}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-strong"
            >
              Gönderileri Gör
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
