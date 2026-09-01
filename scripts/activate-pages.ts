import fs from "fs";
import path from "path";

function findFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else {
      if (filePath.endsWith("page.tsx")) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

function processFiles() {
  const targetDir = path.resolve("./app/yonetim");
  const files = findFiles(targetDir);
  let updatedCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    // "Çok Yakında" geçiyor mu ve EmptyState kullanılmış mı?
    if (content.includes("title=\"Çok Yakında\"") && content.includes("EmptyState")) {
      
      // Metadata title'ı yakala
      const titleMatch = content.match(/title:\s*["']([^|]+?)\s*\|\s*Kargo Ops["']/);
      let pageTitle = "Bu Modül";
      if (titleMatch && titleMatch[1]) {
        pageTitle = titleMatch[1].trim();
      } else {
        // h1 etiketinden yakalamayı dene
        const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
        if (h1Match && h1Match[1]) {
          pageTitle = h1Match[1].trim();
        }
      }

      // Fonksiyon adını yakala
      const funcMatch = content.match(/export default (async )?function (\w+)\s*\(/);
      let funcName = "ComingSoonPage";
      if (funcMatch && funcMatch[2]) {
        funcName = funcMatch[2];
      }

      // Yeni dosya içeriğini oluştur
      const newContent = `import { ComingSoonModule } from "@/components/ui/coming-soon-module";

export const metadata = {
  title: "${pageTitle} | Kargo Ops",
};

export default function ${funcName}() {
  return <ComingSoonModule title="${pageTitle}" />;
}
`;

      fs.writeFileSync(file, newContent, "utf8");
      console.log(`Updated: ${file}`);
      updatedCount++;
    }
  }

  console.log(`\nSuccess! Updated ${updatedCount} files.`);
}

processFiles();
