/**
 * Script to extract ALL class features from data-md-main markdown files
 * and build a complete class-features.json.
 *
 * Reads: data-md-main/Rules/Features/{Class}/{Level} Features/{Feature}.md
 * Writes: src/data/class-features-full.json (review before replacing class-features.json)
 */

import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, basename } from 'path';

const DATA_MD_ROOT = join(process.cwd(), '..', 'data-md-main', 'Rules', 'Features');
const OUTPUT_FILE = join(process.cwd(), 'src', 'data', 'class-features-full.json');

// Read existing class-features.json to preserve resource_name and resource_generation
const existingData = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'class-features.json'), 'utf8'));

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const yamlStr = match[1];
  const body = match[2].trim();
  const frontmatter = {};

  // Simple YAML parser for our flat frontmatter
  let currentKey = null;
  let currentList = null;

  for (const line of yamlStr.split('\n')) {
    const listMatch = line.match(/^(\w[\w_]*):\s*$/);
    const listItemMatch = line.match(/^\s+-\s+(.*)$/);
    const kvMatch = line.match(/^(\w[\w_]*):\s+(.+)$/);

    if (listMatch) {
      currentKey = listMatch[1];
      currentList = [];
      frontmatter[currentKey] = currentList;
    } else if (listItemMatch && currentList) {
      currentList.push(listItemMatch[1].replace(/^'|'$/g, ''));
    } else if (kvMatch) {
      currentKey = null;
      currentList = null;
      let val = kvMatch[2].replace(/^'|'$/g, '').replace(/^"|"$/g, '');
      frontmatter[kvMatch[1]] = val;
    }
  }

  return { frontmatter, body };
}

function extractFeatureFromMarkdown(body, frontmatter) {
  // Clean up the body text
  let description = body;

  // Remove the heading (##### Feature Name)
  description = description.replace(/^#{1,6}\s+.*\n*/m, '').trim();

  // Convert markdown formatting to plain text for JSON
  // Keep bullet points but flatten for display
  description = description
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // bold
    .replace(/\*([^*]+)\*/g, '$1')       // italic
    .replace(/`([^`]+)`/g, '$1')         // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/<!-- -->/g, '')            // html comments
    .replace(/> /g, '')                  // blockquotes
    .trim();

  return description;
}

function parseLevelFromDir(dirName) {
  const match = dirName.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

// Build the complete features JSON
const result = {
  version: 3,
  source: 'Draw Steel Heroes v1.01',
  generated: new Date().toISOString(),
  classes: {}
};

const classNames = readdirSync(DATA_MD_ROOT).filter(name => {
  try {
    return statSync(join(DATA_MD_ROOT, name)).isDirectory();
  } catch { return false; }
});

for (const className of classNames) {
  const classId = className.toLowerCase();
  const classDir = join(DATA_MD_ROOT, className);

  // Preserve existing resource data
  const existing = existingData.classes[classId] || {};

  result.classes[classId] = {
    resource_name: existing.resource_name || '',
    resource_generation: existing.resource_generation || [],
    features: []
  };

  // Get all level directories
  const levelDirs = readdirSync(classDir).filter(name => {
    try {
      return statSync(join(classDir, name)).isDirectory();
    } catch { return false; }
  }).sort((a, b) => parseLevelFromDir(a) - parseLevelFromDir(b));

  for (const levelDir of levelDirs) {
    const level = parseLevelFromDir(levelDir);
    const featureDir = join(classDir, levelDir);

    const featureFiles = readdirSync(featureDir)
      .filter(f => f.endsWith('.md') && !f.startsWith('Index') && !f.startsWith('_'));

    for (const file of featureFiles) {
      const content = readFileSync(join(featureDir, file), 'utf8');
      const { frontmatter, body } = parseYamlFrontmatter(content);

      const description = extractFeatureFromMarkdown(body, frontmatter);

      // Skip if essentially empty
      if (!description || description.length < 10) continue;

      const feature = {
        name: frontmatter.item_name || basename(file, '.md'),
        level: level,
        description: description
      };

      // Add subclass if present
      if (frontmatter.subclass) {
        feature.subclass = frontmatter.subclass;
      }

      // Add feature_type if present
      if (frontmatter.feature_type) {
        feature.feature_type = frontmatter.feature_type;
      }

      // Add action_type if it's not just "feature"
      if (frontmatter.action_type && frontmatter.action_type !== 'feature') {
        feature.type = frontmatter.action_type;
      }

      // Add keywords if present
      if (frontmatter.keywords) {
        const kw = Array.isArray(frontmatter.keywords)
          ? frontmatter.keywords
          : frontmatter.keywords.split(',').map(k => k.trim().replace(/[\[\]]/g, ''));
        if (kw.length > 0 && kw[0]) {
          feature.keywords = kw;
        }
      }

      // Add distance if present
      if (frontmatter.distance) {
        feature.distance = frontmatter.distance;
      }

      // Add target if present
      if (frontmatter.target) {
        feature.target = frontmatter.target;
      }

      result.classes[classId].features.push(feature);
    }
  }

  // Sort features by level, then by name
  result.classes[classId].features.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  console.log(`${className}: ${result.classes[classId].features.length} features extracted`);
}

// Write output
writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
console.log(`\nTotal features: ${Object.values(result.classes).reduce((sum, c) => sum + c.features.length, 0)}`);
console.log(`Written to: ${OUTPUT_FILE}`);
