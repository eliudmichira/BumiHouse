import fs from 'fs';

const content = fs.readFileSync('c:/Users/User/Documents/GitHub/BumihouseUpdate/client/src/routes/listPage/listPage_fixed_useLocation.jsx', 'utf8');
const lines = content.split('\n');

console.log("\n=== Lines 30 to 45 ===");
for (let i = 29; i < 45; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
