"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Edit2, X, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateCustomerAction, deleteCustomerAction, type UpdateCustomerState, type DeleteCustomerState } from "../actions";

export function EditCustomerForm({
  customer,
}: {
  customer: {
    id: string;
    name: string;
    authorizedPerson: string | null;
    phone: string;
    email: string;
    taxOffice: string | null;
    taxNumber: string | null;
    address: string | null;
    city: string | null;
    district: string | null;
    status: "active" | "passive";
  };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, pending] = useActionState<UpdateCustomerState, FormData>(
    updateCustomerAction,
    {}
  );
  
  const [deleteState, deleteAction, isDeleting] = useActionState<DeleteCustomerState, FormData>(
    deleteCustomerAction,
    {}
  );

  async function onFormAction(formData: FormData) {
    formAction(formData);
  }

  useEffect(() => {
    if (state.success) {
      toast.success("Müşteri bilgileri güncellendi.");
      setIsEditing(false);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  useEffect(() => {
    if (deleteState.error) {
      toast.error(deleteState.error);
    }
  }, [deleteState]);

  if (!isEditing) {
    return (
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
          <Edit2 className="h-3.5 w-3.5" />
          Müşteriyi Düzenle
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Müşteri Bilgilerini Düzenle</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 px-2 text-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form action={onFormAction} className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="customerId" value={customer.id} />

          <Input label="Ad / Firma *" name="name" defaultValue={customer.name} required />
          <Input label="Yetkili Kişi" name="authorizedPerson" defaultValue={customer.authorizedPerson ?? ""} />
          
          <Input label="Telefon *" name="phone" defaultValue={customer.phone} required />
          <Input label="E-posta *" name="email" type="email" defaultValue={customer.email} required />

          <Input label="Vergi Dairesi" name="taxOffice" defaultValue={customer.taxOffice ?? ""} />
          <Input label="Vergi No" name="taxNumber" defaultValue={customer.taxNumber ?? ""} />

          <div className="sm:col-span-2">
            <Input label="Açık Adres" name="address" defaultValue={customer.address ?? ""} />
          </div>

          <Input label="İl" name="city" defaultValue={customer.city ?? ""} />
          <Input label="İlçe" name="district" defaultValue={customer.district ?? ""} />

          <Select label="Durum *" name="status" defaultValue={customer.status} required>
            <option value="active">Aktif</option>
            <option value="passive">Pasif</option>
          </Select>

          <div className="col-span-full mt-4 flex items-center justify-between border-t border-panel-secondary pt-4">
            {/* Silme formu kendi form tag'ine sahip olamaz (form içinde form olmaz). Bu yüzden dış grid içine koydum ve düzenleme formunu ayrı sardım. */}
            <div className="flex justify-end gap-2 ml-auto">
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={pending || isDeleting}>
                Vazgeç
              </Button>
              <Button type="submit" loading={pending} disabled={isDeleting} className="gap-2">
                <Check className="h-4 w-4" />
                Kaydet
              </Button>
            </div>
          </div>
        </form>

        <form action={deleteAction} className="col-span-full -mt-[3.75rem]">
           <input type="hidden" name="customerId" value={customer.id} />
           <Button 
            type="submit" 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
            loading={isDeleting}
            disabled={pending}
            onClick={(e) => {
              if(!confirm("Müşteriyi silmek istediğinize emin misiniz? (Bağlı kargosu varsa silinmez)")) {
                e.preventDefault();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Müşteriyi Sil
           </Button>
        </form>
      </div>
    </div>
  );
}
