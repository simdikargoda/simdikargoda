import UsersListPage from "@/components/users/users-list-page";

export const dynamic = "force-dynamic";

export default async function PasifKullanicilarPage() {
  return (
    <UsersListPage
      title="Pasif Kullanıcılar"
      description="Pasif duruma alınmış sistem kullanıcıları"
      status="passive"
    />
  );
}
