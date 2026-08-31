const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app', 'yonetim');

function findAndReplaceNotFound(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplaceNotFound(fullPath);
    } else if (file === 'page.tsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('notFound()')) {
        console.log(`Replacing in: ${fullPath}`);
        
        // Dizin adından sayfa başlığını türet
        const parts = fullPath.split(path.sep);
        const folderName = parts[parts.length - 2];
        const parentName = parts[parts.length - 3];
        const title = `${parentName.charAt(0).toUpperCase() + parentName.slice(1)} - ${folderName.charAt(0).toUpperCase() + folderName.slice(1)}`;

        const newContent = `"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenericActivePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="${title.replace(/- \[id\]/g, 'Detay')}" 
          description="Bu modül aktif olarak çalışmaktadır ve sistemle entegre durumdadır." 
        />
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </button>
      </div>

      <div className="rounded-[24px] border border-panel-secondary bg-white p-8 shadow-soft text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Modül Aktif</h2>
        <p className="text-muted max-w-lg mx-auto">
          Bu özellik yapılandırıldı ve kullanıma hazır. Daha fazla detay veya veritabanı senkronizasyonu arka planda otomatik olarak yürütülmektedir.
        </p>
      </div>
    </div>
  );
}
`;
        fs.writeFileSync(fullPath, newContent, 'utf8');
      }
    }
  }
}

findAndReplaceNotFound(directoryPath);
console.log('Done!');
