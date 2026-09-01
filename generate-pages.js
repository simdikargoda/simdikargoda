const fs = require('fs');
const path = require('path');

const sidebarContent = fs.readFileSync('components/layout/sidebar.tsx', 'utf8');

const regex = /\{\s*href:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*icon:\s*([a-zA-Z]+)/g;
let match;
const routes = [];

while ((match = regex.exec(sidebarContent)) !== null) {
  routes.push({
    href: match[1],
    label: match[2],
    icon: match[3]
  });
}

const baseDir = path.join(process.cwd(), 'app');

routes.forEach(route => {
  if (route.href === '/yonetim') return; 
  if (route.href === '/yonetim/kargo/yeni') return; // this one is real
  if (route.href === '/yonetim/kargo/excel') return; // real
  
  const routePath = route.href.replace(/^\//, '');
  const dirPath = path.join(baseDir, routePath);
  const filePath = path.join(dirPath, 'page.tsx');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    const componentName = route.label.replace(/[^a-zA-Z0-9]/g, '') + 'Page';
    const content = `import { EmptyState } from "@/components/ui/empty-state";
import { ${route.icon} } from "lucide-react";

export const metadata = {
  title: "${route.label} | Kargo Ops",
};

export default function ${componentName}() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">${route.label}</h1>
        <p className="text-sm font-medium text-muted mt-1">Bu modül yapım aşamasındadır.</p>
      </div>
      <EmptyState
        title="Çok Yakında"
        description="${route.label} sayfası için geliştirme çalışmaları devam etmektedir."
        icon={${route.icon}}
      />
    </div>
  );
}
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Created: ' + filePath);
  }
});

console.log('All missing pages generated successfully!');