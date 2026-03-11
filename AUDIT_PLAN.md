# Draw Steel Creator — Full-Scale Audit Plan

> **This audit follows all laws from CLAUDE.md. Every verification uses the authority chain: PDFs → Markdown (data-md-main/) → App JSON → Engine → UI.**

---

## Critical Finding: Gap Summary

| System | App Has | Source Has | Gap | Severity |
|--------|---------|-----------|-----|----------|
| Class Features | 74 | 686 | **612 missing** | CRITICAL |
| Abilities | 420 | ~507 | **~87 to verify** | CRITICAL |
| Conditions (full rules) | Abbreviated | 10 full files | **Full text missing** | HIGH |
| Complications | 100 | 101 | **1 missing + text verify** | HIGH |
| Treasures | 0 | 99 | **Entire system missing** | HIGH |
| Titles | 0 | 60 | **Entire system missing** | MEDIUM |
| Movement Rules | Partial | 25 | **Mostly missing** | MEDIUM |
| Monsters | 0 | 415+ | **Entire system missing** | MEDIUM |
| No-Kit Classes | Placeholder | Full rules | **5 classes incomplete** | HIGH |
| Conduit Domains | 1 allowed | 2 required | **Rules violation** | MEDIUM |
| Summoner Minions | 0 | Full rules | **Core mechanic missing** | MEDIUM |

---

## Phase 1: Core Data Accuracy Audit (P0 — Do First)

**Goal**: Verify every JSON data file field-by-field against markdown source.
**Method**: Read markdown files, compare against JSON, flag discrepancies, fix immediately.

### 1A: Ancestries (12 files)
```
Source: data-md-main/Rules/Ancestries/{Name}.md
Target: src/data/ancestries.json
Verify: name, size, speed, stability, ancestryPoints, signatureTraits[], purchasedTraits[], measurements
Special: Revenant former life mechanics, trait sub-choices (damageTypeOptions, runeOptions, skillChoices)
```

### 1B: Careers (18 files)
```
Source: data-md-main/Rules/Careers/{Name}.md
Target: src/data/careers.json
Verify: name, description, skills.granted[], skills.grantedFrom{}, languages, renown, wealth, projectPoints, perk
```

### 1C: Kits (23 files)
```
Source: data-md-main/Rules/Kits/{Name}.md + Rules/Abilities/Kits/{Name}/
Target: src/data/kits.json
Verify: equipment (armor, weapons), ALL bonuses (stamina, speed, stability, meleeDamage[3], rangedDamage[3], distances, disengage), signatureAbility (full text)
Special: Stormwight kits (boren, corven, raden, vuken)
```

### 1D: Complications (101 files)
```
Source: data-md-main/Rules/Complications/{Name}.md
Target: src/data/complications.json + src/data/complication-choices.ts
Verify: name, benefit text, drawback text, fixedSkills, skillChoices, languageChoices, statBonuses (stamina, staminaScaling, recoveries, stability, renown, wealth), benefitChoice options
Special: Find the 1 missing complication
```

### 1E: Perks (48 files)
```
Source: data-md-main/Rules/Perks/{Category}/{Name}.md
Target: src/data/perks.json
Verify: name, type, description per perk across all 6 groups
```

### 1F: Cultures (14 files)
```
Source: data-md-main/Rules/Cultures/{Type}/{Name}.md
Target: src/data/cultures.json
Verify: environments (5), organizations (2), upbringings (6), skill grants, language options
```

### 1G: Skills (6 files)
```
Source: data-md-main/Rules/Skills/{Group}.md
Target: src/data/skill-groups.ts
Verify: Every skill in every group (crafting:4, exploration:10, interpersonal:10, intrigue:11, lore:10 = 45)
```

---

## Phase 2: Abilities & Features Audit (P0 — Critical)

### 2A: Ability Audit (per class, ~507 files)
```
For each class (Censor, Conduit, Elementalist, Fury, Null, Shadow, Tactician, Talent, Troubadour):
Source: data-md-main/Rules/Abilities/{Class}/{Level} Features/{Ability}.md
Target: src/data/abilities.json → classes.{classId}.signature_abilities[] + heroic_abilities[]

Per ability verify:
- name, cost, cost_amount, cost_resource
- keywords[] (exact match, order-independent)
- action_type / type
- distance, target
- power_roll characteristic
- tier1, tier2, tier3 (EXACT text)
- effect (EXACT text)
- flavor
- subclass filter
- level gating
```

### 2B: Class Features Audit (THE BIGGEST GAP — 686 files)
```
Source: data-md-main/Rules/Features/{Class}/{Level} Features/{Feature}.md
Target: src/data/class-features.json

Current state: 74 features in JSON vs 686 in markdown
Per class gap:
- Censor: 3 in JSON vs 95 in markdown
- Conduit: 6 vs 99
- Elementalist: 3 vs 78
- Fury: 3 vs 68
- Null: 3 vs 66
- Shadow: 3 vs 63
- Tactician: 3 vs 66
- Talent: 27 vs 80
- Troubadour: 3 vs 71

ACTION: Rebuild class-features.json with ALL features from markdown, organized by class + level
```

### 2C: Conditions Audit
```
Source: data-md-main/Rules/Conditions/{Name}.md
Target: src/types/character.ts CONDITION_DESCRIPTIONS

Verify full rule text for all 9 conditions:
bleeding, dazed, frightened, grabbed, prone, restrained, slowed, taunted, weakened
Replace abbreviated descriptions with full canonical text
```

---

## Phase 3: Character Creation Fixes (P1)

### 3A: No-Kit Classes
```
Classes needing kit alternatives: Conduit, Elementalist, Null, Talent, Summoner
Read: data-md-main/Rules/Classes/{Class}.md for replacement mechanic
Read: data-md-main/Rules/Features/{Class}/ for equipment-related features
Update: KitStep.tsx, ClassChoice type, stat-calculator.ts, pdf-exporter.ts
```

### 3B: Conduit Dual Domain
```
Read: data-md-main/Rules/Classes/Conduit.md
Update: SubclassStep.tsx (multi-select 2 domains)
Update: ClassChoice type (secondSubclassId or array)
Update: ability filtering for dual-domain
Update: PDF export for both domains
```

### 3C: Populate All Missing Class Features
```
Read: ALL 686 feature markdown files
Build: Complete class-features.json with every feature at every level
Update: PlayActions.tsx (display all features by level)
Update: PlaySheet.tsx (features list)
Update: pdf-exporter.ts (class features field)
Update: ReviewStep.tsx (features section)
Update: LevelUpModal.tsx (show new features at each level)
```

---

## Phase 4: Play Mode Enhancements (P1-P2)

### 4A: Full Condition System (P1)
```
Create: src/data/conditions.json (from 10 markdown files)
Update: PlayCombat.tsx — expandable condition cards with full rules
Update: types/character.ts — replace abbreviated descriptions
Consider: Visual stat indicators when conditions affect speed/damage
```

### 4B: Treasure & Inventory System (P1)
```
Create: src/data/treasures.json (from 99 markdown files in 4 categories)
  Categories: Artifacts, Consumables (by echelon), Leveled Treasures (armor/implement/weapon/other), Trinkets (by echelon)
Create: TreasureItem type in character.ts
Create: PlayInventory.tsx component (new tab or section in PlaySheet)
Update: play-store.ts — inventory[] per character
Update: data-export.ts — include inventory in backup
Update: character-store.ts — migration for inventory field
Consider: Treasure stat effects on computed stats
Consider: Consumable usage tracking (charges, single-use)
Consider: Awarded treasures from Director (add item flow)
```

### 4C: Dice Roller / Power Roll (P2)
```
Create: src/engine/dice-roller.ts
  - roll2d10() → number
  - powerRoll(characteristic: number, edges: number, banes: number) → { total, tier, isCrit }
  - resolveTier(roll: number) → 1 | 2 | 3
Update: PlayAbilities.tsx — "Roll" button on each ability card
Update: PlayCombat.tsx — Quick roll section
Consider: Roll history display
Consider: Edge/bane modifier inputs
```

### 4D: Ability Usage & Resource Tracking (P2)
```
Update: PlayAbilities.tsx — "Use" button that auto-deducts heroic resource
Update: play-store.ts — link ability cost to resource counter
Update: PlayAbilities.tsx — gray out unaffordable abilities
Consider: Per-encounter ability tracking
Consider: Triggered action marking
```

### 4E: Title System (P2)
```
Create: src/data/titles.json (from 60 markdown files across 4 echelons)
Update: PlayProgression.tsx — title selection at echelon milestones
Update: character.ts — title field in CharacterData
Update: Full ripple (store, migration, PDF, review, play sheet, save/load)
```

### 4F: Initiative Tracker (P3)
```
Update: play-store.ts — initiative order, current turn, round counter
Update: PlayCombat.tsx — initiative UI
Consider: "Your turn" resource generation reminder
Consider: Per-round condition expiry
```

---

## Phase 5: Stat & Formula Verification (P0 — Continuous)

### 5A: Manual Stat Cross-Check
```
For each class at levels 1, 4, 7, 10:
1. Compute manually using CLAUDE.md formulas
2. Compare against stat-calculator.ts output
3. Compare against PDF export values
4. Compare against PlayCombat max values
5. Compare against PlaySheet displayed values
All 5 must agree.
```

### 5B: Pregen Verification
```
Use Draw Steel/Pregens/ folder
For each pregen:
1. Input choices into wizard
2. Compare all computed stats against pregen PDF
3. Flag any discrepancies
```

---

## Phase 6: Integration Smoke Tests (P0 — After Each Phase)

### After EVERY phase completion, run:
```
□ npm run build (must pass)
□ Full wizard flow (14 steps, no errors)
□ Save character → reload → load character (all fields present)
□ Export backup → import backup (no data loss)
□ PDF export (all 567 fields correct)
□ Save & Play (stats compute correctly)
□ All 5 play tabs render without errors
□ Level up (stat deltas correct, ability selection works)
□ Mode switch (create→play→create preserves state)
□ Portrait renders (all ancestries, all levels)
□ Old saved characters load (migration handles new fields)
```

---

## Execution Order

```
WEEK 1:  Phase 1A-1G (core data accuracy)
         Phase 2C (conditions — small, high impact)
         Phase 6 smoke tests

WEEK 2:  Phase 2A (abilities audit — class by class)
         Phase 6 smoke tests

WEEK 3:  Phase 2B (class features gap analysis)
         Phase 3C (begin building missing features)
         Phase 6 smoke tests

WEEK 4:  Phase 3C (continue features)
         Phase 4A (full condition system)
         Phase 4B (treasure/inventory — begin)
         Phase 6 smoke tests

WEEK 5:  Phase 3A (no-kit classes)
         Phase 4B (treasure/inventory — complete)
         Phase 5A (stat cross-check)
         Phase 6 smoke tests

WEEK 6:  Phase 3B (conduit dual domain)
         Phase 4C (dice roller)
         Phase 4D (ability usage tracking)
         Phase 6 smoke tests

WEEK 7:  Phase 4E (titles)
         Phase 5B (pregen verification)
         Phase 6 full integration suite

WEEK 8+: Phase 4F (initiative tracker)
         Polish, edge cases, performance
         Final integration audit
```

---

## How to Execute Each Audit Step

### For data accuracy (Phases 1-2):
1. Read the markdown file(s) for the entity
2. Read the corresponding JSON in the app
3. Compare field-by-field
4. If discrepancy found: markdown wins → fix the JSON
5. If markdown seems wrong: verify against PDF → PDF wins
6. Document every fix with source reference

### For new features (Phases 3-4):
1. Read ALL relevant markdown files first
2. Design the data model (types)
3. Build the JSON data file
4. Add store fields + migration
5. Build UI component
6. Update PDF exporter
7. Update play mode displays
8. Update review step
9. Run Phase 6 smoke tests
10. Grade yourself (must be 10/10)

### For integration tests (Phase 6):
1. Test the happy path first
2. Test edge cases (Revenant, Tactician dual-kit, Stormwight, no-kit classes)
3. Test migration (old data → new schema)
4. Test cross-mode (create → play → edit → play)
5. Test at multiple levels (1, 5, 10)
