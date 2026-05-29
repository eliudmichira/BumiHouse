import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all JS/JSX files
function findFiles(dir, extensions = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to clean console.log statements
function cleanConsoleLogs(content) {
  // Remove console.log statements
  content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
  
  // Remove console.error statements (keep for production debugging)
  // content = content.replace(/console\.error\([^)]*\);?\s*/g, '');
  
  // Remove console.warn statements
  content = content.replace(/console\.warn\([^)]*\);?\s*/g, '');
  
  // Remove console.info statements
  content = content.replace(/console\.info\([^)]*\);?\s*/g, '');
  
  // Remove console.debug statements
  content = content.replace(/console\.debug\([^)]*\);?\s*/g, '');
  
  return content;
}

// Function to clean development comments
function cleanDevComments(content) {
  // Remove TODO comments
  content = content.replace(/\/\/\s*TODO:.*$/gm, '');
  
  // Remove FIXME comments
  content = content.replace(/\/\/\s*FIXME:.*$/gm, '');
  
  // Remove development comments
  content = content.replace(/\/\/\s*DEV:.*$/gm, '');
  
  return content;
}

// Main function
function cleanForProduction() {
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findFiles(srcDir);
  
  console.log(`🔍 Found ${files.length} files to clean...`);
  
  let cleanedFiles = 0;
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Clean console.log statements
      content = cleanConsoleLogs(content);
      
      // Clean development comments
      content = cleanDevComments(content);
      
      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        cleanedFiles++;
        console.log(`✅ Cleaned: ${path.relative(process.cwd(), file)}`);
      }
    } catch (error) {
      console.error(`❌ Error cleaning ${file}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Production cleanup complete!`);
  console.log(`📊 Files cleaned: ${cleanedFiles}/${files.length}`);
}

// Run the cleanup
cleanForProduction(); 