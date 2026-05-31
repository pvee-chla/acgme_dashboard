import { readFileSync } from 'node:fs';

function parseTSV(filepath) {
  const buffer = readFileSync(filepath);
  const decoder = new TextDecoder('utf-16');
  const content = decoder.decode(buffer);
  console.log('First 500 chars:', content.slice(0, 500));
  const lines = content.split('\n').filter(l => l.trim());
  console.log('Lines:', lines.length);
  const headers = lines[0].split('\t').map(h => h.trim());
  console.log('Headers:', headers);
  return { headers, lines: lines.slice(0, 5) };
}

const result = parseTSV('/home/yollama/Documents/acgme_test/data/Total_Number_of_Patients.csv');
console.log(JSON.stringify(result, null, 2));