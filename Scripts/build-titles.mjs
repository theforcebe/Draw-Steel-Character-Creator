/**
 * Extract all titles from data-md-main/Rules/Titles/ into src/data/titles.json
 *
 * Walks the 4 echelon subdirectories, parses YAML frontmatter + markdown body,
 * and outputs a sorted JSON array of title objects.
 */

import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, basename } from 'path';

const TITLES_ROOT = join(process.cwd(), '..', 'data-md-main', 'Rules', 'Titles');
const OUTPUT = join(process.cwd(), 'src', 'data', 'titles.json');

// ---------------------------------------------------------------------------
// Simple YAML frontmatter parser (matches build-treasures.mjs pattern)
// ---------------------------------------------------------------------------
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
    if (listMatch) {
      currentKey = listMatch[1];
      currentList = [];
      fm[currentKey] = currentList;
    } else if (listItemMatch && currentList) {
      currentList.push(listItemMatch[1].replace(/^'|'$/g, ''));
    } else if (kvMatch) {
      currentKey = null;
      currentList = null;
      fm[kvMatch[1]] = kvMatch[2].replace(/^'|'$/g, '').replace(/^"|"$/g, '');
    }
  }
  return { fm, body: match[2].trim() };
}

// ---------------------------------------------------------------------------
// Recursive directory walker (matches build-treasures.mjs pattern)
// ---------------------------------------------------------------------------
function walkDir(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    try {
      if (statSync(full).isDirectory()) {
        walkDir(full, results);
      } else if (entry.endsWith('.md') && !entry.startsWith('_') && !entry.startsWith('Index')) {
        results.push(full);
      }
    } catch { /* skip inaccessible entries */ }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Strip markdown formatting (bold, italic, links, HTML comments)
// ---------------------------------------------------------------------------
function stripMarkdown(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // bold
    .replace(/\*([^*]+)\*/g, '$1')         // italic
    .replace(/`([^`]+)`/g, '$1')           // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/<!-- -->/g, '')              // HTML comments
    .replace(/> /g, '')                    // blockquote markers
    .trim();
}

// ---------------------------------------------------------------------------
// Parse echelon string ("1st", "2nd", etc.) to integer
// ---------------------------------------------------------------------------
function parseEchelon(str) {
  const map = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4 };
  return map[str] || parseInt(str, 10) || 1;
}

// ---------------------------------------------------------------------------
// Extract flavor, prerequisite, effect, and special from body markdown
// ---------------------------------------------------------------------------
function extractTitleFields(body) {
  let flavor = '';
  let prerequisite = '';
  let effect = '';
  let special = '';

  // Remove the heading line (#### Title Name)
  const withoutHeading = body.replace(/^#{1,6}\s+.*\n*/m, '').trim();

  // Extract flavor text: a single italic line at the start, e.g. *Some flavor text.*
  // The line starts and ends with * and sits before **Prerequisite:**
  const flavorMatch = withoutHeading.match(/^\*(.+)\*\s*\n/);
  if (flavorMatch) {
    flavor = flavorMatch[1].trim();
  }

  // Extract prerequisite: everything after **Prerequisite:** until **Effect:** or end
  const prereqMatch = withoutHeading.match(/\*\*Prerequisite:\*\*\s*([\s\S]*?)(?=\n\n\*\*Effect:\*\*|\n\*\*Effect:\*\*|$)/);
  if (prereqMatch) {
    prerequisite = stripMarkdown(prereqMatch[1].trim());
  }

  // Extract effect: everything after **Effect:** until a non-blockquoted **Special:** or end
  // Only match **Special:** at column 0 (not inside > blockquotes, which are ability specials)
  const effectMatch = withoutHeading.match(/\*\*Effect:\*\*\s*([\s\S]*?)(?=\n\*\*Special:\*\*|$)/);
  if (effectMatch) {
    effect = stripMarkdown(effectMatch[1].trim());
  }

  // Extract special: only match **Special:** at the start of a line (not inside blockquotes)
  const specialMatch = withoutHeading.match(/^\*\*Special:\*\*\s*([\s\S]*?)$/m);
  if (specialMatch) {
    special = stripMarkdown(specialMatch[1].trim());
  }

  return { flavor, prerequisite, effect, special };
}

// ---------------------------------------------------------------------------
// Main extraction
// ---------------------------------------------------------------------------
const files = walkDir(TITLES_ROOT);
const titles = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const { fm, body } = parseYaml(content);
  const { flavor, prerequisite, effect, special } = extractTitleFields(body);

  if (!effect && !prerequisite) continue; // skip files with no meaningful content

  const echelon = parseEchelon(fm.echelon);

  const title = {
    id: fm.item_id || basename(file, '.md').toLowerCase().replace(/\s+/g, '-'),
    name: fm.item_name || basename(file, '.md'),
    echelon,
    prerequisite,
    effect,
    flavor: flavor || undefined,
    special: special || undefined,
  };

  titles.push(title);
}

// Sort by echelon ascending, then name alphabetically
titles.sort((a, b) => {
  if (a.echelon !== b.echelon) return a.echelon - b.echelon;
  return a.name.localeCompare(b.name);
});

const result = {
  version: 1,
  source: 'Draw Steel Heroes v1.01',
  titles,
};

writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
console.log(`Extracted ${titles.length} titles`);
console.log(`  1st Echelon: ${titles.filter(t => t.echelon === 1).length}`);
console.log(`  2nd Echelon: ${titles.filter(t => t.echelon === 2).length}`);
console.log(`  3rd Echelon: ${titles.filter(t => t.echelon === 3).length}`);
console.log(`  4th Echelon: ${titles.filter(t => t.echelon === 4).length}`);
