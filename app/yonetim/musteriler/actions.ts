"use server";

import { z } from "zod";

import { requireStaff } from "@/lib/guard";
import { AppError } from "@/lib/errors";
import { tlToKurus } from "@/lib/money";
import { createCustomer } from "@/lib/services/customer.service";

const createCustomerSchema = z.object({
  name: z.string().min(2, "Müşteri adı en az 2 karakter olmalıdır."),
  authorizedPerson: z.string().optional(),
  phone: z.string().min(7, "Geçerli bir telefon girin."),
  email: z.string().email("Geçerli bir e-posta girin."),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  type: z.enum(["balance", "current_account"]).default("balance"),
  initialBalance: z.coerce.number().min(0).optional(),
  initialLimit: z.coerce.number().min(0).optional(),
});

export type CreateCustomerState = {
  error?: string;
  success?: boolean;
};

export async function createCustomerAction(
  _prev: CreateCustomerState,
  formData: FormData
): Promise<CreateCustomerState> {
  const session = await requireStaff();

  const parsed = createCustomerSchema.safeParse({
    name: formData.get("name"),
    authorizedPerson: formData.get("authorizedPerson") || undefined,
    phone: formData.get("phone"),
    email: formData.get("email"),
    taxOffice: formData.get("taxOffice") || undefined,
    taxNumber: formData.get("taxNumber") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    district: formData.get("district") || undefined,
    type: formData.get("type") ?? "balance",
    initialBalance: formData.get("initialBalance") || undefined,
    initialLimit: formData.get("initialLimit") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz müşteri bilgisi." };
  }

  void session; // yetki kontrolü yapıldı

  try {
    await createCustomer({
      name: parsed.data.name,
      authorizedPerson: parsed.data.authorizedPerson,
      phone: parsed.data.phone,
      email: parsed.data.email,
      taxOffice: parsed.data.taxOffice,
      taxNumber: parsed.data.taxNumber,
      address: parsed.data.address,
      city: parsed.data.city,
      district: parsed.data.district,
      type: parsed.data.type,
      initialBalanceKurus:
        parsed.data.initialBalance !== undefined
          ? tlToKurus(parsed.data.initialBalance)
          : undefined,
      initialLimitKurus:
        parsed.data.initialLimit !== undefined
          ? tlToKurus(parsed.data.initialLimit)
          : undefined,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "Müşteri oluşturulurken bir hata oluştu." };
  }
}

const updateCustomerSchema = z.object({
  customerId: z.string().uuid("Geçersiz müşteri ID'si."),
  name: z.string().min(2, "Müşteri adı en az 2 karakter olmalıdır."),
  authorizedPerson: z.string().optional(),
  phone: z.string().min(7, "Geçerli bir telefon girin."),
  email: z.string().email("Geçerli bir e-posta girin."),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  status: z.enum(["active", "passive"]),
});

export type UpdateCustomerState = {
  error?: string;
  success?: boolean;
};

export async function updateCustomerAction(
  _prev: UpdateCustomerState,
  formData: FormData
): Promise<UpdateCustomerState> {
  const session = await requireStaff();

  const parsed = updateCustomerSchema.safeParse({
    customerId: formData.get("customerId"),
    name: formData.get("name"),
    authorizedPerson: formData.get("authorizedPerson") || undefined,
    phone: formData.get("phone"),
    email: formData.get("email"),
    taxOffice: formData.get("taxOffice") || undefined,
    taxNumber: formData.get("taxNumber") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    district: formData.get("district") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz müşteri bilgisi." };
  }

  void session;

  try {
    const { updateCustomer } = await import("@/lib/services/customer.service");
    await updateCustomer({
      customerId: parsed.data.customerId,
      name: parsed.data.name,
      authorizedPerson: parsed.data.authorizedPerson,
      phone: parsed.data.phone,
      email: parsed.data.email,
      taxOffice: parsed.data.taxOffice,
      taxNumber: parsed.data.taxNumber,
      address: parsed.data.address,
      city: parsed.data.city,
      district: parsed.data.district,
      status: parsed.data.status,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "Müşteri güncellenirken bir hata oluştu." };
  }
}

const deleteCustomerSchema = z.object({
  customerId: z.string().uuid("Geçersiz müşteri ID'si."),
});

export type DeleteCustomerState = {
  error?: string;
  success?: boolean;
};

export async function deleteCustomerAction(
  _prev: DeleteCustomerState,
  formData: FormData
): Promise<DeleteCustomerState> {
  const session = await requireStaff();

  const parsed = deleteCustomerSchema.safeParse({
    customerId: formData.get("customerId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz müşteri ID." };
  }

  void session;

  try {
    const { deleteCustomer } = await import("@/lib/services/customer.service");
    await deleteCustomer(parsed.data.customerId);
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "Müşteri silinirken bir hata oluştu." };
  }
  
  // Başarılı olursa listeye yönlendir (catch dışında olmalı)
  const { redirect } = await import("next/navigation");
  redirect("/yonetim/musteriler");
  return { success: true };
}
