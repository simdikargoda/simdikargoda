import UsersListPage from "@/components/users/users-list-page";

export const dynamic = "force-dynamic";

export default async function AktifKullanicilarPage() {
  return (
    <UsersListPage
      title="Aktif Kullanıcılar"
      description="Aktif durumdaki sistem kullanıcıları"
      status="active"
    />
  );
}
