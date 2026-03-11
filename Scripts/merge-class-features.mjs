/**
 * Merges extracted features with existing class-features.json.
 * Existing features with rich metadata (keywords, subclass_effects, etc.) are preserved.
 * New features from extraction are added.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const existing = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'class-features.json'), 'utf8'));
const extracted = JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'class-features-full.json'), 'utf8'));

const result = {
  version: 3,
  source: 'Draw Steel Heroes v1.01',
  generated: new Date().toISOString(),
  classes: {}
};

for (const [classId, classData] of Object.entries(extracted.classes)) {
  const existingClass = existing.classes[classId] || {};
  const existingFeatures = existingClass.features || [];

  // Build a map of existing features by name for quick lookup
  const existingByName = new Map();
  for (const f of existingFeatures) {
    existingByName.set(f.name, f);
  }

  // Start with the extracted features
  const mergedFeatures = [];
  const addedNames = new Set();

  for (const extracted_f of classData.features) {
    const existingMatch = existingByName.get(extracted_f.name);

    if (existingMatch) {
      // Existing feature has richer data — use it but ensure level is set
      const merged = { ...existingMatch };
      if (!merged.level) merged.level = extracted_f.level;
      // Add subclass from extraction if existing doesn't have it
      if (extracted_f.subclass && !merged.subclass && !merged.subclass_effects) {
        merged.subclass = extracted_f.subclass;
      }
      // If existing description is shorter, use extracted (more complete)
      if (extracted_f.description && existingMatch.description &&
          extracted_f.description.length > existingMatch.description.length * 1.5) {
        // The extracted is significantly more complete — keep both
        merged.full_description = extracted_f.description;
      }
      mergedFeatures.push(merged);
      addedNames.add(extracted_f.name);
    } else {
      // New feature — add from extraction
      mergedFeatures.push(extracted_f);
      addedNames.add(extracted_f.name);
    }
  }

  // Add any existing features that weren't in the extraction (edge case)
  for (const f of existingFeatures) {
    if (!addedNames.has(f.name)) {
      mergedFeatures.push(f);
    }
  }

  // Sort by level then name
  mergedFeatures.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  result.classes[classId] = {
    resource_name: existingClass.resource_name || classData.resource_name || '',
    resource_generation: existingClass.resource_generation || classData.resource_generation || [],
    features: mergedFeatures
  };

  const existCount = existingFeatures.length;
  const newCount = mergedFeatures.length - existCount;
  console.log(`${classId}: ${existCount} existing + ${newCount} new = ${mergedFeatures.length} total`);
}

// Handle summoner (only in existing, not in features markdown)
if (existing.classes.summoner && !result.classes.summoner) {
  result.classes.summoner = existing.classes.summoner;
  console.log(`summoner: ${existing.classes.summoner.features.length} existing (preserved, not in markdown features)`);
}

writeFileSync(join(process.cwd(), 'src', 'data', 'class-features.json'), JSON.stringify(result, null, 2));
const total = Object.values(result.classes).reduce((s, c) => s + c.features.length, 0);
console.log(`\nTotal features: ${total}`);
console.log('Written to: src/data/class-features.json');
