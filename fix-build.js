import fs from 'fs';
import path from 'path';

function fixFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixFiles(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.json')) {
      let content = fs.readFileSync(filePath, 'utf8');
      // 移除末尾的%或其他控制字符
      content = content.replace(/[%\x00-\x1f]*$/, '');
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed: ${filePath}`);
    }
  });
}

fixFiles('./dist');
console.log('Build fix completed!');
