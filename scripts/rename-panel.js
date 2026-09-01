import fs from "fs";
import path from "path";

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else {
      if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

function processFiles() {
  const dirs = [path.resolve("./app"), path.resolve("./components")];
  let updatedCount = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = findFiles(dir);

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("Kargo Ops")) {
        const newContent = content.replace(/Kargo Ops/g, "Şimdi Kargoda");
        fs.writeFileSync(file, newContent, "utf8");
        console.log(`Updated: ${file}`);
        updatedCount++;
      }
    }
  }

  console.log(`\nSuccess! Replaced 'Kargo Ops' with 'Şimdi Kargoda' in ${updatedCount} files.`);
}

processFiles();
