import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-panel p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-6">
        <PackageX className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        404 - Sayfa Bulunamadı
      </h1>
      <p className="mt-4 text-base text-muted max-w-md mx-auto">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. URL'yi kontrol edin veya anasayfaya dönün.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary/90"
        >
          Anasayfaya Dön
        </Link>
      </div>
    </div>
  );
}
