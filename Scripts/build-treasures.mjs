/**
 * Extract all treasures from data-md-main/Rules/Treasures/ into src/data/treasures.json
 */

import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, basename } from 'path';

const TREASURES_ROOT = join(process.cwd(), '..', 'data-md-main', 'Rules', 'Treasures');
const OUTPUT = join(process.cwd(), 'src', 'data', 'treasures.json');

function parseYaml(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { fm: {}, body: content };
  const fm = {};
  let currentKey = null;
  let currentList = null;
  for (const line of match[1].split('\n')) {
    const listMatch = line.match(/^(\w[\w_]*):\s*$/);
    const listItemMatch = line.match(/^\s+-\s+(.*)$/);
    const kvMatch = line.match(/^(\w[\w_]*):\s+(.+)$/);
    if (listMatch) { currentKey = listMatch[1]; currentList = []; fm[currentKey] = currentList; }
    else if (listItemMatch && currentList) { currentList.push(listItemMatch[1].replace(/^'|'$/g, '')); }
    else if (kvMatch) { currentKey = null; currentList = null; fm[kvMatch[1]] = kvMatch[2].replace(/^'|'$/g, '').replace(/^"|"$/g, ''); }
  }
  return { fm, body: match[2].trim() };
}

function extractDescription(body) {
  let desc = body
    .replace(/^#{1,6}\s+.*\n*/m, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<!-- -->/g, '')
    .replace(/> /g, '')
    .trim();
  // Limit to first 800 chars for JSON size
  if (desc.length > 800) desc = desc.substring(0, 800) + '...';
  return desc;
}

function walkDir(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    try {
      if (statSync(full).isDirectory()) {
        walkDir(full, results);
      } else if (entry.endsWith('.md') && !entry.startsWith('_') && !entry.startsWith('Index')) {
        results.push(full);
      }
    } catch { /* skip */ }
  }
  return results;
}

const files = walkDir(TREASURES_ROOT);
const treasures = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const { fm, body } = parseYaml(content);
  const description = extractDescription(body);
  if (!description || description.length < 10) continue;

  const relPath = file.replace(TREASURES_ROOT, '').replace(/\\/g, '/');

  let category = 'other';
  if (relPath.includes('Artifact')) category = 'artifact';
  else if (relPath.includes('Consumable')) category = 'consumable';
  else if (relPath.includes('Leveled')) category = 'leveled';
  else if (relPath.includes('Trinket')) category = 'trinket';

  let subcategory = '';
  if (relPath.includes('Armor')) subcategory = 'armor';
  else if (relPath.includes('Weapon')) subcategory = 'weapon';
  else if (relPath.includes('Implement')) subcategory = 'implement';
  else if (relPath.includes('Other Leveled')) subcategory = 'other';

  treasures.push({
    id: fm.item_id || basename(file, '.md').toLowerCase().replace(/\s+/g, '-'),
    name: fm.item_name || basename(file, '.md'),
    category,
    subcategory: subcategory || undefined,
    echelon: fm.echelon || undefined,
    description,
    keywords: body.match(/\*\*Keywords:\*\*\s*(.+)/)?.[1]?.replace(/\*/g, '').trim() || undefined,
  });
}

// Sort by category, then echelon, then name
treasures.sort((a, b) => {
  const catOrder = { artifact: 0, leveled: 1, trinket: 2, consumable: 3, other: 4 };
  const ca = catOrder[a.category] ?? 99;
  const cb = catOrder[b.category] ?? 99;
  if (ca !== cb) return ca - cb;
  const ea = String(a.echelon || '');
  const eb = String(b.echelon || '');
  if (ea !== eb) return ea.localeCompare(eb);
  return a.name.localeCompare(b.name);
});

const result = {
  version: 1,
  source: 'Draw Steel Heroes v1.01',
  treasures
};

writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
console.log(`Extracted ${treasures.length} treasures`);
console.log(`  Artifacts: ${treasures.filter(t => t.category === 'artifact').length}`);
console.log(`  Leveled: ${treasures.filter(t => t.category === 'leveled').length}`);
console.log(`  Trinkets: ${treasures.filter(t => t.category === 'trinket').length}`);
console.log(`  Consumables: ${treasures.filter(t => t.category === 'consumable').length}`);
