"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/page-header";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
import { createCustomerShipmentAction, type CreateShipmentState } from "../actions";

export default function NewCustomerShipmentForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CreateShipmentState, FormData>(
    createCustomerShipmentAction,
    {}
  );

  async function onFormAction(formData: FormData) {
    formAction(formData);
  }

  useEffect(() => {
    if (state.shipmentId) {
      toast.success("Kargo başarıyla oluşturuldu.");
      router.push(`/panel?created=${state.trackingNumber ?? state.shipmentId}`);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div>
      <PageHeader title="Yeni Kargo" description="Yeni bir gönderi oluşturun" />
      <form
        action={onFormAction}
        className="space-y-6 rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm"
      >
        <FormSection title="Kargo Firması Seçimi">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Kargo Firması *" name="provider" required defaultValue="aras">
              <option value="aras">Aras Kargo</option>
              <option value="dhl">DHL</option>
              <option value="hepsijet">HepsiJET</option>
              <option value="ptt">PTT Kargo</option>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Gönderici">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ad / Firma *" name="senderName" required />
            <Input label="Telefon *" name="senderPhone" required />
            <div className="sm:col-span-2">
              <Textarea label="Adres *" name="senderAddress" rows={2} required />
            </div>
            <Input label="İl" name="senderCity" />
            <Input label="İlçe" name="senderDistrict" />
          </div>
        </FormSection>

        <FormSection title="Alıcı">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ad / Firma *" name="receiverName" required />
            <Input label="Telefon *" name="receiverPhone" required />
            <div className="sm:col-span-2">
              <Textarea label="Adres *" name="receiverAddress" rows={2} required />
            </div>
            <Input label="İl" name="receiverCity" />
            <Input label="İlçe" name="receiverDistrict" />
          </div>
        </FormSection>

        <FormSection title="Paket">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Paket / Adet *" name="packageCount" type="number" min={1} defaultValue={1} required />
            <Input label="Desi *" name="desi" type="number" min={1} defaultValue={1} required />
            <Input label="Ağırlık *" name="weight" type="number" min={1} defaultValue={1} required />
            <div className="sm:col-span-3">
              <Textarea label="Açıklama" name="description" rows={2} />
            </div>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 border-t border-panel-secondary pt-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Vazgeç
          </Button>
          <Button type="submit" loading={pending}>
            Kargoyu Oluştur
          </Button>
        </div>
      </form>
    </div>
  );
}
