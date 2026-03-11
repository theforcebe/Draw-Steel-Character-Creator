# Draw Steel Character Creator — Development Bible

> **PRIME DIRECTIVE: Every piece of work MUST be 10/10 quality. Grade yourself out of 10 after every task. If it's not a 10, you're not done. Fix it until it is.**

> **ZERO TOLERANCE RULE: No change ships unless EVERY connected system has been updated, verified, and proven functional. A feature that works in isolation but breaks save, export, play mode, or any downstream system is a 0/10 — not a 1, a ZERO.**

> **SOURCE OF TRUTH: The official Draw Steel PDFs are the ONLY authority on game rules, stats, abilities, and mechanics. When in doubt, READ THE PDF. Never guess. Never assume. Never rely on memory alone.**

---

## 0. LAWS OF DEVELOPMENT (NON-NEGOTIABLE)

These laws override everything. Follow them on every task, no exceptions.

### Law 0: The Source of Truth Rule
**Three canonical sources define ALL game data, rules, mechanics, stats, abilities, and text in this application. Use them for EVERY task.**

#### The Three Sources (in priority order):

**1. Official PDFs (HIGHEST AUTHORITY — final arbiter of any dispute):**
- **`C:\Users\keane\Draw Steel Project\Draw Steel\Draw Steel Heroes v1.01.pdf`** — The complete character creation reference. Contains ALL class abilities (signature + heroic), ancestry traits, career details, kit stats, complication text, subclass descriptions, characteristic arrays, and everything needed to build a character. THIS IS THE PRIMARY REFERENCE.
- **`C:\Users\keane\Draw Steel Project\Draw Steel\Draw Steel Rules Reference v1.01.pdf`** — The complete rules reference. Contains combat rules, conditions, action economy, power roll mechanics, distance/area definitions, stamina/dying rules, recovery rules, and all gameplay mechanics. THIS IS THE RULES AUTHORITY.

**2. Structured Markdown Data Repository (WORKING REFERENCE — fastest to search and parse):**
- **`C:\Users\keane\Draw Steel Project\data-md-main\`** — 2,433 structured markdown files with YAML frontmatter extracted from the official books. This is the **primary working reference** for day-to-day development because it is searchable, structured, and machine-parseable. Use this FIRST when looking up data, then cross-reference the PDF if the markdown seems incomplete or ambiguous.

**3. App JSON Data Files (IMPLEMENTATION — what the app actually uses):**
- `src/data/*.json` and `src/data/*.ts` — The processed data the app consumes. These MUST match Sources 1 and 2. If they don't, the JSON is wrong.

#### The Authority Chain:
```
Official PDFs (v1.01) ← ultimate truth, final arbiter
       ↓ extracted into
Markdown Repository (data-md-main) ← working reference, searchable, structured
       ↓ processed into
App JSON/TS Data Files (src/data/) ← what the app consumes
       ↓ consumed by
Engine + UI + PDF Export ← what the user sees
```
**If any layer disagrees with the one above it, the UPSTREAM source wins.**

---

#### The Markdown Data Repository — Complete Reference

**Location**: `C:\Users\keane\Draw Steel Project\data-md-main\`

**Structure** (2,433 files total):
```
data-md-main/
├── Rules/ (1,791 files) ← CHARACTER CREATION + GAMEPLAY RULES
│   ├── Abilities/ (545 files)
│   │   ├── Censor/ (73 files — all signature + heroic abilities)
│   │   ├── Conduit/ (73 files)
│   │   ├── Elementalist/ (67 files)
│   │   ├── Fury/ (57 files)
│   │   ├── Null/ (57 files)
│   │   ├── Shadow/ (65 files)
│   │   ├── Tactician/ (57 files)
│   │   ├── Talent/ (57 files)
│   │   ├── Troubadour/ (57 files)
│   │   ├── Common/ (17 files — Free Strike, Charge, Defend, Heal, maneuvers, moves)
│   │   └── Kits/ (21 subcategories — kit-specific signature abilities)
│   ├── Ancestries/ (13 files — all 12 ancestries + index)
│   ├── Careers/ (19 files — all 18 careers + index)
│   ├── Classes/ (10 files — class overviews)
│   ├── Classes By Level/ (9 directories — per-class level progression tables)
│   ├── Features/ (686 files — class features organized by class + level)
│   ├── Kits/ (23 files — all kit definitions)
│   ├── Complications/ (105 files — all complications with mechanics)
│   ├── Conditions/ (10 files — all 9 conditions + index)
│   ├── Cultures/ (14 files — environments, organizations, upbringings)
│   ├── Perks/ (48 files — all perks by category)
│   ├── Skills/ (6 files — skill group definitions)
│   ├── Titles/ (60 files — echelon-based titles/prestige, 4 tiers)
│   ├── Treasures/ (99 files — artifacts, consumables, leveled treasures, trinkets)
│   ├── Movement/ (25 files — walk, climb, fly, burrow, teleport, forced movement, fall damage)
│   └── Negotiation/ (12 files — NPC motivations and pitfalls)
│
├── Bestiary/ (640 files) ← MONSTERS + ENCOUNTERS
│   └── Monsters/
│       ├── Monsters/ (415+ statblocks across 52 creature types)
│       │   ├── War Dogs/ (45 statblocks)
│       │   ├── Demons/ (33 statblocks)
│       │   ├── Undead/ (34 statblocks)
│       │   ├── Humans/ (15), Dwarves/ (13), Orcs/ (15), Elves/ (42)...
│       │   ├── Dragons/ (5), Giants/ (13), Devils/ (8)...
│       │   ├── Named: Ajax the Invincible, Lich, Count Rhodar Von Glauer...
│       │   └── Rivals/ (28 statblocks — 7 per echelon, player-like enemies)
│       ├── Dynamic Terrain/ (35 files — hazards, fieldworks, mechanisms, siege engines)
│       └── Retainers/ (47 files — companion creatures + role advancement abilities)
│
└── Adventures/ (2 files) ← PLACEHOLDER (not yet converted)
```

#### Markdown File Format (YAML Frontmatter + Markdown Body):
Every file is machine-parseable with consistent YAML frontmatter:
```yaml
---
item_id: arrest-5-wrath          # Machine ID (kebab-case, unique)
item_name: "Arrest (5 Wrath)"    # Display name
item_index: '06'                 # Sort order
type: feature/ability/censor/1st-level-feature  # Classification hierarchy
source: mcdm.heroes.v1           # Source book version
file_dpath: Abilities/Censor/1st-Level Features  # Directory path

# Ability-specific fields:
class: censor
level: 1
action_type: Main action
cost: "5 Wrath"
cost_amount: 5
cost_resource: Wrath
keywords: [Magic, Melee, Strike, Weapon]
distance: Melee 1
target: One creature
flavor: '"I got you, you son of a bitch."'
feature_type: ability

# Monster-specific fields:
might: 3
agility: 1
stamina: 80
speed: 5
stability: 3
size: 1M
roles: [Elite Brute]
ev: 40

# Versioning:
scc: [mcdm.heroes.v1:feature.ability.censor.1st-level-feature:arrest-5-wrath]
scdc: [1.1.1:11.2.7.1:06]
---
[Markdown body with full text, tables, power rolls, tier results]
```

#### How to Use the Markdown Repository:

**For looking up ability data:**
```
Read: data-md-main/Rules/Abilities/{ClassName}/{Level} Features/{AbilityName}.md
Example: data-md-main/Rules/Abilities/Censor/1st-Level Features/Arrest.md
```

**For looking up class features:**
```
Read: data-md-main/Rules/Features/{ClassName}/{Level} Features/{FeatureName}.md
OR: data-md-main/Rules/Classes By Level/{ClassName}/{Level}.md
```

**For looking up ancestry data:**
```
Read: data-md-main/Rules/Ancestries/{AncestryName}.md
```

**For looking up monster statblocks:**
```
Read: data-md-main/Bestiary/Monsters/Monsters/{CreatureType}/Statblocks/{MonsterName}.md
```

**For looking up conditions, movement, combat rules:**
```
Read: data-md-main/Rules/Conditions/{ConditionName}.md
Read: data-md-main/Rules/Movement/{RuleName}.md
```

**For looking up treasures, titles, perks:**
```
Read: data-md-main/Rules/Treasures/{Category}/{ItemName}.md
Read: data-md-main/Rules/Titles/{Echelon}/{TitleName}.md
Read: data-md-main/Rules/Perks/{Category}/{PerkName}.md
```

**For searching across all data** (use Grep with the path):
```
Grep for keyword in data-md-main/Rules/ to find all references
Grep for item_id in YAML frontmatter for precise lookups
```

---

#### Data Available in Markdown That Is NOT Yet in App JSON:

| Data | Markdown Location | Files | Priority | Use Case |
|------|------------------|-------|----------|----------|
| **Conditions (full rules)** | Rules/Conditions/ | 10 | CRITICAL | Play mode combat — condition descriptions and mechanics |
| **Titles** | Rules/Titles/ | 60 | HIGH | Character progression at echelon milestones |
| **Treasures** | Rules/Treasures/ | 99 | HIGH | Loot, equipment rewards, magic items |
| **Movement rules** | Rules/Movement/ | 25 | MEDIUM | Play mode — climb, fly, burrow, teleport, forced movement |
| **Monster statblocks** | Bestiary/Monsters/ | 415+ | MEDIUM | Encounter building, enemy tracking in play mode |
| **Dynamic terrain** | Bestiary/Dynamic Terrain/ | 35 | MEDIUM | Encounter environment hazards |
| **Retainers** | Bestiary/Retainers/ | 47 | LOW | Companion creatures for players |
| **Negotiation** | Rules/Negotiation/ | 12 | LOW | Social encounter mechanics |
| **Level progression tables** | Rules/Classes By Level/ | 100 | LOW | Already implied in abilities, but explicit tables available |

---

#### The 10 Commandments of Source Truth:

1. **Before implementing ANY game mechanic**: Read the relevant markdown file FIRST (fastest), then verify against the PDF if needed.
2. **Before adding or modifying ANY ability data**: Read the exact ability markdown file from `data-md-main/Rules/Abilities/`. Copy the EXACT wording — do not paraphrase, summarize, or infer. Cross-reference the Heroes PDF for final verification.
3. **Before adding or modifying ANY stat formula**: Verify against the markdown class/ancestry data AND cross-reference with pregen character sheets in the PDF.
4. **Before adding or modifying ANY class feature**: Read the full feature markdown from `data-md-main/Rules/Features/`, including subclass-specific variations.
5. **Before adding or modifying ANY ancestry trait**: Read the exact trait description from `data-md-main/Rules/Ancestries/`, including all sub-choice options.
6. **Before adding or modifying ANY career, kit, perk, or complication**: Read the full entry from the corresponding markdown directory.
7. **Before implementing ANY combat rule**: Read the exact rule from `data-md-main/Rules/Conditions/`, `Rules/Movement/`, or the Rules Reference PDF.
8. **When resolving a discrepancy**: Markdown vs JSON → Markdown wins. Markdown vs PDF → **PDF wins. Always.** Update downstream to match upstream.
9. **When a user reports incorrect data**: Search the markdown repo first (fastest), verify against PDF, then correct the JSON.
10. **When implementing a new feature** that touches game mechanics: Search the markdown repo for ALL related files, read them, then implement. For monsters/encounters, search the Bestiary. For character data, search Rules.

**How to reference sources:**
- **Markdown**: Use Grep to search `data-md-main/` by keyword, or Read specific files by path
- **PDFs**: Use the Read tool with PDF file path and specific page ranges
- **Always note which source you referenced** when making data changes (markdown path or PDF page)

**If you cannot verify something against the sources, STOP and ask.** Do not guess. Wrong game data is worse than no game data — players will notice and lose trust in the tool.

### Law 1: The Ripple Rule
Every change ripples. Before you write a single line of code, trace the FULL impact chain using the System Dependency Map (Section 2). If a change touches CharacterData, you MUST update: the type definition, the store default, the store migration, the PDF exporter, the play mode initialization, the review step display, the play sheet display, the character save/load, and the data export/import. No partial updates. Ever.

### Law 2: The Integration Guarantee
When you finish a feature, every one of these must still work perfectly:
- **Character Creation**: All 14 wizard steps complete without errors
- **Character Save**: `saveCharacter()` persists the new data to localStorage gallery
- **Character Load**: Loading a saved character restores ALL fields including your new ones
- **Character Export/Import**: JSON backup includes and restores the new data with deduplication
- **PDF Character Sheet**: All 567 fields render correctly, new data appears in the right fields
- **PDF Ability Cards**: Battle cards render with resolved ability text
- **PDF Combat Reference**: Static reference still generates
- **Play Mode Init**: `handleSaveAndPlay()` computes correct stats including your changes
- **Play Mode Combat**: Stamina, recoveries, resource, conditions all work
- **Play Mode Actions**: Class features, abilities, kit abilities, trait actions display correctly
- **Play Mode Abilities**: Resolved ability cards show correct values
- **Play Mode Sheet**: Full character data displays including your additions
- **Play Mode Progression**: Level-up recalculates stats, grants abilities, syncs play state
- **Play Mode Save**: `updateSavedCharacter()` persists mid-session state
- **Mode Switching**: Create→Play→Create→Play preserves all state correctly
- **Portrait System**: SVG renders for all 12 ancestries at all 10 levels
- **Existing Saved Characters**: Old characters in localStorage still load (migration handles new fields)

### Law 3: The Completeness Standard
Half-done features don't exist. If you add a data field, it appears everywhere it should — in the wizard step, in the review summary, in the PDF export, in the play sheet, in the save/load cycle, in the export/import backup. If you can't complete ALL integration points in one session, explicitly document what remains and mark the feature as incomplete.

### Law 4: The Quality Bar
```
10/10 = Feature works perfectly across all systems. No regressions. Clean TypeScript.
        UX is polished. Animations are smooth. Data persists correctly. PDF renders right.
        Build passes. Old saved characters still load. Code is readable.

9/10  = Everything works but minor polish missing. ACCEPTABLE TO SHIP but note what's missing.

8/10  = Works but has a known edge case or minor visual issue. DOCUMENT IT but can ship.

7/10 or below = DO NOT SHIP. Fix it. Find what's broken. Trace the ripple chain again.
```

**After every task, output your grade with reasoning:**
```
GRADE: X/10
- What works: [list]
- What was verified: [list]
- What could be better: [list, or "nothing — this is complete"]
```

### Law 5: The Build Gate
`npm run build` MUST pass before any task is considered complete. TypeScript errors = automatic 0/10. No `@ts-ignore`, no `any` types as escape hatches, no unused imports left behind. The CI pipeline will reject failures and block deployment.

### Law 6: The Persistence Guarantee
This app stores data in 3 localStorage keys. Any change that could affect stored data MUST be verified:
- `draw-steel-character` (Zustand v1): Active character + wizard state + mode
- `draw-steel-play-states` (Zustand v0): Per-character combat/session state
- `draw-steel-saved-characters` (raw JSON): Character gallery array

**Test scenarios after ANY state-related change:**
1. Create new character → save → reload browser → load character → verify ALL fields present
2. Old character in storage (pre-change) → reload → verify migration fills new fields with defaults
3. Export backup → clear storage → import backup → verify ALL data restored
4. Enter play mode → track combat → reload browser → verify play state preserved
5. Level up in play mode → save → exit to create mode → re-enter play → verify level persists

### Law 7: The Cross-System Sync Rule
These systems MUST always agree with each other. If they show different values, something is broken:
- **Source PDFs** (Heroes v1.01 + Rules Reference v1.01) === **Markdown repo** (data-md-main/) === **App JSON** data files === computed values === displayed values
- `stat-calculator.ts` computed values === PDF exported values === PlaySheet displayed values === PlayCombat max values === CharacterPreview sidebar values
- `skill-mapper.ts` aggregated skills === PDF skill checkboxes === PlaySheet skills list === ReviewStep skills display
- `ability-resolver.ts` resolved text === PlayAbilities card text === BattleCard text === PDF ability grid text
- `complication-stats.ts` bonuses === stat-calculator inputs === PDF complication benefit text

The chain of truth flows: **Official PDFs → Markdown repo (data-md-main/) → App JSON data files → Engine calculations → UI display → PDF export**. If any link disagrees with the one before it, the upstream source wins.

### Law 8: The UX Excellence Standard
This is a premium fantasy experience, not a form with fields. Every interaction must feel intentional:
- **Animations**: Use Motion (Framer Motion) for step transitions, card selections, mode switches. No jarring cuts.
- **Feedback**: Every user action must have visible feedback — selection highlights, save confirmations, validation messages.
- **Consistency**: All cards use ParchmentCard. All buttons use GoldButton or the established button patterns. All stats use StatBlock.
- **Typography**: Cinzel for headings, Cinzel Decorative for display, Crimson Text for body. Never system fonts.
- **Color**: Fantasy glassmorphism palette. Dark backgrounds, warm accents, golden highlights. Reference `index.css` custom properties.
- **Responsiveness**: Every component must work on desktop AND mobile (game table use).
- **Loading States**: Never show empty screens. Skeleton states, spinners, or meaningful placeholders.
- **Error States**: Never crash silently. Show user-friendly error messages in ParchmentCard style.

### Law 9: The "Would I Use This?" Test
Before marking any feature complete, honestly answer: "If I were a Draw Steel player sitting at a table with my phone, would this feature feel premium, fast, and reliable?" If the answer is anything but an enthusiastic yes, iterate.

### Law 10: The Documentation Rule
If a change affects how systems interact, update this CLAUDE.md. This file is the source of truth. If the code and this file disagree, the file needs updating. Keep it current.

---

## 1. ARCHITECTURE OVERVIEW

**Stack**: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + Zustand 5 + pdf-lib + Motion (Framer Motion)
**Deployment**: GitHub Pages via GitHub Actions (push to `main` → auto-deploy)
**Repo**: `https://github.com/theforcebe/Draw-Steel-Character-Creator.git`
**Base URL**: `/Draw-Steel-Character-Creator/`
**State persistence**: Zustand with localStorage (`draw-steel-character`, `draw-steel-play-states`, `draw-steel-saved-characters`)

### Dual-Mode Application
The app has two modes controlled by `character-store.mode`:
- **Create Mode** (`mode: 'create'`): 14-step wizard for character building
- **Play Mode** (`mode: 'play'`): 6-tab interface for live gameplay tracking

Mode switch happens in `App.tsx` — binary render gate. No shared layout between modes.

---

## 2. SYSTEM DEPENDENCY MAP

```
┌─────────────────────────────────────────────────────────────────┐
│               CANONICAL SOURCE PDFs (final arbiter)             │
│  Draw Steel Heroes v1.01.pdf   (character data authority)       │
│  Draw Steel Rules Reference v1.01.pdf  (rules authority)        │
└──────────────┬──────────────────────────────────────────────────┘
               │ extracted into
┌──────────────▼──────────────────────────────────────────────────┐
│          MARKDOWN DATA REPOSITORY (working reference)           │
│  data-md-main/Rules/ (1,791 files)                              │
│    Abilities(545) │ Features(686) │ Ancestries(13) │ Classes(10)│
│    Careers(19) │ Kits(23) │ Complications(105) │ Conditions(10) │
│    Cultures(14) │ Perks(48) │ Skills(6) │ Titles(60)           │
│    Treasures(99) │ Movement(25) │ Negotiation(12)              │
│  data-md-main/Bestiary/ (640 files)                             │
│    Monsters(415+) │ Dynamic Terrain(35) │ Retainers(47)        │
└──────────────┬──────────────────────────────────────────────────┘
               │ processed into
┌──────────────▼──────────────────────────────────────────────────┐
│                   APP JSON DATA LAYER                            │
│  abilities.json │ ancestries.json │ careers.json │ kits.json    │
│  perks.json │ complications.json │ cultures.json                │
│  class-features.json │ ability-mechanics.json                   │
│  skill-groups.ts │ complication-choices.ts                      │
└──────────────┬──────────────────────────────────────────────────┘
               │ feeds
┌──────────────▼──────────────────────────────────────────────────┐
│                     14 WIZARD STEPS                             │
│  Welcome → Ancestry → Traits → Culture → Career → Class →      │
│  Subclass → Characteristics → Kit → Abilities → Complication → │
│  Details → Model → Review                                       │
└──────────────┬──────────────────────────────────────────────────┘
               │ writes to
┌──────────────▼──────────────────────────────────────────────────┐
│                   CHARACTER STORE (Zustand)                     │
│  CharacterData: name, level, ancestryId, formerLifeAncestryId, │
│  selectedTraits[], culture, career, classChoice, complication,  │
│  appearance, backstory, portraitSettings, computedStats         │
│  + mode, currentStep, playingCharacterId, validationError       │
└───────┬───────────┬───────────┬─────────────┬───────────────────┘
        │           │           │             │
   ┌────▼────┐ ┌────▼────┐ ┌───▼──────┐ ┌───▼──────────┐
   │ Stat    │ │ Skill   │ │ PDF      │ │ Character    │
   │ Calc    │ │ Mapper  │ │ Exporter │ │ Storage      │
   │ Engine  │ │         │ │ (567     │ │ (localStorage│
   │         │ │         │ │  fields) │ │  gallery)    │
   └────┬────┘ └────┬────┘ └───┬──────┘ └───┬──────────┘
        │           │           │             │
        └─────┬─────┴───────────┘             │
              │                               │
   ┌──────────▼───────────────────────────────▼──┐
   │                  PLAY MODE                   │
   │  PlayStore (Zustand): stamina, recoveries,   │
   │  heroicResource, surges, victories,           │
   │  conditions, notes — per characterId          │
   │                                               │
   │  5 Tabs: Combat │ Actions │ Abilities │       │
   │          Sheet │ Progression                  │
   └───────────────────────────────────────────────┘
```

---

## 3. MANDATORY IMPACT ANALYSIS

### Before writing ANY code, complete this analysis:

**Step 0: Verify against canonical sources.**
If the change involves ANY game data (abilities, stats, traits, rules, conditions, mechanics), look it up in the sources:
- **FIRST** → Search `data-md-main/Rules/` or `data-md-main/Bestiary/` (fastest, structured, searchable)
- **THEN** → Cross-reference the official PDF if the markdown seems incomplete or ambiguous:
  - Character data → `Draw Steel Heroes v1.01.pdf`
  - Rules/mechanics → `Draw Steel Rules Reference v1.01.pdf`
Do NOT proceed until you have confirmed the correct values from at least one canonical source.

**Step 1: Identify the blast radius.**
Ask: "What am I changing?" Then trace EVERY downstream system using this matrix:

| If you're changing... | You MUST also update... |
|----------------------|------------------------|
| **Any field in CharacterData** | `types/character.ts` (interface) → `character-store.ts` (default + migration) → `pdf-exporter.ts` (field mapping) → `ReviewStep.tsx` (display) → `PlaySheet.tsx` (display) → `character-storage.ts` (save/load inherits) → `data-export.ts` (backup inherits) |
| **Stat calculations** | `stat-calculator.ts` → `pdf-exporter.ts` (stat fields) → `CharacterPreview.tsx` (sidebar) → `PlayCombat.tsx` (max values) → `PlaySheet.tsx` (stat grid) → `LevelUpModal.tsx` (stat deltas) → `handleSaveAndPlay()` in WizardLayout (init values) |
| **Skills or languages** | `skill-mapper.ts` → `pdf-exporter.ts` (checkboxes + language field) → `ReviewStep.tsx` (skill list) → `PlaySheet.tsx` (skills section) → Step UIs (cross-step dedup via `getExcludedSkills`) |
| **Abilities** | `abilities.json` → `ability-resolver.ts` (text resolution) → `AbilitiesStep.tsx` (selection UI) → `pdf-exporter.ts` (ability grid 6×3) → `PlayAbilities.tsx` (resolved cards) → `PlayActions.tsx` (action lists) → `BattleCard.tsx` + `BattleCardsView.tsx` (print cards) → `ReviewStep.tsx` (ability summary) |
| **Class features** | `class-features.json` → `PlayActions.tsx` (features display) → `PlaySheet.tsx` (features list) → `pdf-exporter.ts` (class features field + resource rules) → `ReviewStep.tsx` (features section) |
| **Kits** | `kits.json` → `KitStep.tsx` (selection UI) → `stat-calculator.ts` (bonuses) → `pdf-exporter.ts` (damage tiers + equipment) → `model-data.ts` (armor/weapon mapping) → `portrait system` (visual rendering) → `PlayActions.tsx` (kit signature ability) |
| **Complications** | `complications.json` + `complication-choices.ts` → `ComplicationStep.tsx` (UI) → `complication-stats.ts` (bonus calc) → `stat-calculator.ts` (stamina/stability/recovery bonuses) → `pdf-exporter.ts` (complication fields + stat effects) → `skill-mapper.ts` (complication skills) |
| **Ancestries or traits** | `ancestries.json` → `AncestryStep.tsx` + `AncestryTraitsStep.tsx` (UI) → `stat-calculator.ts` (speed/stamina/stability overrides) → `portrait system` (SVG model) → `skill-mapper.ts` (trait skill choices) → `pdf-exporter.ts` (traits field) |
| **Play mode combat** | `play-store.ts` (state + actions) → `PlayCombat.tsx` (UI) → `takeRespite()` (reset logic) → `initPlayState()` (initialization) → `updateMaxStats()` (level-up sync) |
| **Play mode progression** | `PlayProgression.tsx` + `LevelUpModal.tsx` → `character-store.ts` (setLevel + setClassChoice) → `stat-calculator.ts` (recompute) → `play-store.ts` (updateMaxStats + resetVictories) |
| **Wizard flow or steps** | `WIZARD_STEPS` in types → `step-validation.ts` → `category-completion.ts` → `WizardLayout.tsx` (navigation) → `character-store.ts` (nextStep/prevStep) |
| **Portrait/model** | `ancestry-renderers.ts` → `weapon-builders.ts` → `model-data.ts` → `gear-data.ts` → `model-css.ts` → `CharacterPortrait.tsx` → `ModelStep.tsx` → `ReviewStep.tsx` (portrait display) → `PlaySheet.tsx` (portrait display) |
| **UI components** | Check ALL consumers — use grep to find every import of the component before modifying its props or behavior |

**Step 2: Write the code.**

**Step 3: Run the Integration Verification Checklist (Section 4).**

**Step 4: Grade yourself (Law 4).**

---

## 4. INTEGRATION VERIFICATION CHECKLIST

Run this COMPLETE checklist after EVERY change. Not some of it. ALL of it.

### Source Truth Verification
```
□ If game data was added/modified: read the corresponding markdown file from data-md-main/ FIRST
□ If game data was added/modified: cross-verified against Draw Steel Heroes v1.01.pdf
□ If game rules were implemented/modified: read from data-md-main/Rules/ AND verified against Rules Reference v1.01.pdf
□ If stat formulas were changed: cross-referenced with worked examples in Heroes PDF pregen characters
□ If ability text was added/modified: copied EXACT wording from markdown source (no paraphrasing), verified against PDF
□ If conditions/combat rules were added/modified: read from data-md-main/Rules/Conditions/ AND verified against PDF
□ If monster/encounter data was used: read from data-md-main/Bestiary/ with exact statblock values
□ Authority chain verified: PDFs → Markdown → App JSON → Engine → UI (upstream always wins)
```

### Build Verification
```
□ npm run build passes with zero errors and zero warnings
□ No @ts-ignore, no untyped `any` escape hatches
□ No unused imports (CI will fail)
```

### Character Creation Flow
```
□ Welcome step: level selection works, new character resets all fields
□ Ancestry step: all 12 ancestries selectable, selection highlights correctly
□ Traits step: budget tracks correctly, sub-choices (damage types, runes, skills) work
□ Traits step: Revenant former life selection works, previous life traits cascade
□ Culture step: all 3 skill dropdowns filter correctly (cross-step + within-step dedup)
□ Career step: skill slots build correctly per career, perk selection works, languages work
□ Class step: all 10 classes selectable, class change resets downstream (subclass, chars, abilities, kit)
□ Subclass step: correct subclasses shown per class, subclass skill granted
□ Characteristics step: arrays load per class, assignment/swap works, no duplicate assignments
□ Kit step: correct kits per class/subclass (standard vs stormwight vs no-kit placeholder)
□ Kit step: Tactician dual-kit works, Stormwight special kits work
□ Abilities step: signature + heroic selection works, level-gated sections appear correctly
□ Abilities step: subclass-filtered abilities show only matching subclass
□ Complication step: optional toggle works, sub-choices (skills, languages, benefit) render
□ Details step: name, appearance, backstory save correctly
□ Model step: portrait renders for selected ancestry, weapon/color pickers work
□ Review step: ALL character data displays correctly in summary sections
```

### Save & Load
```
□ Save Character: persists to localStorage gallery with correct name, timestamp, full data
□ Load Character: restores ALL fields including traits, sub-choices, complication details
□ Load Character: wizard jumps to review step with all data intact
□ Delete Character: removes from gallery, play state cleaned up if applicable
□ Auto-save: Zustand persistence survives browser reload mid-wizard
□ Multiple Characters: gallery handles 2+ characters without data bleed between them
```

### Export & Import
```
□ Export Backup: JSON file downloads with all characters + play states
□ Export Backup: deduplication works (no duplicate characters in export)
□ Import Backup: restores characters to gallery with correct IDs
□ Import Backup: deduplicates against existing characters (no double-imports)
□ Import Backup: play states merge correctly
□ Import Backup: imported characters load and function identically to originals
```

### PDF Export
```
□ Character Sheet PDF: identity fields (name, level, ancestry, class, subclass, career) correct
□ Character Sheet PDF: all 5 characteristics render with correct values
□ Character Sheet PDF: computed stats (stamina, winded, recovery value, recoveries, speed, stability, size) correct
□ Character Sheet PDF: kit damage tiers (melee T1/T2/T3, ranged T1/T2/T3) correct
□ Character Sheet PDF: disengage, save value, echelon correct
□ Character Sheet PDF: all earned skills have checkboxes checked
□ Character Sheet PDF: languages list complete (Caelian + chosen - forgotten)
□ Character Sheet PDF: ability grid (6×3) populated with resolved ability text
□ Character Sheet PDF: class features and resource generation rules present
□ Character Sheet PDF: career benefits, culture details, complication text correct
□ Character Sheet PDF: trait descriptions with sub-choices (damage type, rune, etc.) correct
□ Ability Cards PDF: battle cards render with resolved power rolls and tier results
□ Combat Reference PDF: 3-page static reference generates correctly
```

### Play Mode
```
□ Save & Play: stats compute correctly and initialize play state
□ Save & Play: character saves to gallery before entering play mode
□ Combat tab: stamina bar reflects correct max, current adjusts with ± buttons
□ Combat tab: winded threshold line at correct position (floor(max/2))
□ Combat tab: temporary stamina adds/removes correctly
□ Combat tab: recoveries work (restore recoveryValue HP, decrement count)
□ Combat tab: heroic resource counter works with correct resource name per class
□ Combat tab: surges counter works
□ Combat tab: all 9 conditions toggle on/off, clear all works
□ Combat tab: catch breath = use 1 recovery
□ Combat tab: take respite resets stamina, recoveries, resource, surges, conditions
□ Combat tab: notes persist across tab switches and browser reload
□ Actions tab: standard actions (Free Strike, Charge, Defend, Heal) display correctly
□ Actions tab: maneuvers (8 standard) display correctly
□ Actions tab: class features filter by current level
□ Actions tab: kit signature ability displays if applicable
□ Actions tab: ancestry/trait actions display if applicable
□ Actions tab: filter buttons (All, Main, Maneuver, Move, Triggered) work
□ Abilities tab: signature + heroic ability cards render with resolved values
□ Abilities tab: power roll shows correct characteristic modifier
□ Abilities tab: tier results show resolved damage/effect values
□ Sheet tab: all identity, stats, characteristics, skills, languages display correctly
□ Sheet tab: class features list matches current level
□ Sheet tab: portrait renders correctly
□ Progression tab: victory counter increments/decrements
□ Progression tab: level-up triggers at correct threshold
□ Progression tab: LevelUpModal shows correct stat deltas (old → new)
□ Progression tab: ability selection at grant levels (2, 3, 5, 6, 8, 9) works
□ Progression tab: level-up updates both character store AND play store
□ Progression tab: revert level works with confirmation and correct rollback
□ Menu: Edit Character → switches to create mode at review step
□ Menu: Save & Exit → saves character, switches to create mode
□ Menu: Export Backup → downloads JSON with current state
```

### Mode Switching & State Integrity
```
□ Create → Play: all data transfers correctly
□ Play → Create (Edit): returns to review step with all data
□ Create → Play (same character): play state preserved (not re-initialized)
□ Create → Play (different character): new play state created
□ Browser reload in play mode: all play state preserved
□ Browser reload in create mode: wizard position and all data preserved
```

### Portrait System
```
□ All 12 ancestries render SVG without errors
□ Revenant uses former life ancestry for body model
□ Weapon appears at correct hand position per ancestry
□ Kit → armor class → armor coverage renders correctly
□ Level 1-2 (Tier I): basic appearance, gray tones
□ Level 3-4 (Tier II): green accents, small details
□ Level 5-6 (Tier III): gold, runes appear
□ Level 7-8 (Tier IV): orange, wings on applicable ancestries
□ Level 9-10 (Tier V): purple, particles, full animations
□ Color pickers (skin, armor, accent, gem) apply correctly
□ Revenant color pickers restricted (no skin/accent/gem)
□ Portrait displays in: ModelStep, ReviewStep, PlaySheet, CharacterPreview sidebar
```

---

## 5. THE FULL INTEGRATION MAP — What Updates What

Use this as your checklist when touching ANY system. The left column is what you changed. Every item in the right column MUST be checked.

### When CharacterData.classChoice changes:
```
→ stat-calculator.ts: classBase, perLevel, recoveries lookup
→ pdf-exporter.ts: Class, Subclass, characteristics, abilities grid, kit damage, class features
→ ability-resolver.ts: filters abilities by classId + subclassId
→ skill-mapper.ts: subclassSkill aggregation
→ PlayCombat.tsx: heroic resource name (CLASS_RESOURCES lookup)
→ PlayActions.tsx: class features, kit abilities, class abilities
→ PlayAbilities.tsx: ability cards for selected abilities
→ PlaySheet.tsx: class info, subclass, characteristics, features
→ PlayProgression/LevelUpModal: ability grant pool
→ portrait system: kit → armor/weapon visual
→ BattleCardsView.tsx: battle card generation
→ ReviewStep.tsx: class section, features section, abilities section
→ CharacterPreview.tsx: sidebar stats
→ character-storage.ts: saved data includes classChoice
→ data-export.ts: exported data includes classChoice
```

### When CharacterData.complication changes:
```
→ complication-stats.ts: recalculate bonuses (stamina, stability, recoveries, renown, wealth)
→ stat-calculator.ts: complication bonuses fed into stamina/stability/recovery formulas
→ skill-mapper.ts: complication skills added to aggregate
→ pdf-exporter.ts: complication name, benefit text, drawback text, stat effects, skill checkboxes, language list, wealth, renown
→ PlaySheet.tsx: complication display, skills list, languages list
→ ReviewStep.tsx: complication section, skills list, languages list, stats
→ CharacterPreview.tsx: sidebar stats (if stamina/speed/stability affected)
→ PlayCombat.tsx: max stamina (if stamina bonus changed)
→ initPlayState: stamina/recovery values
```

### When CharacterData.selectedTraits changes:
```
→ stat-calculator.ts: trait-based speed/stamina/stability/recovery overrides
→ skill-mapper.ts: trait skillChoices aggregation
→ pdf-exporter.ts: traits description field, skill checkboxes, stat fields
→ portrait system: some traits may affect visual (future)
→ PlaySheet.tsx: traits list, skills list, stats
→ PlayActions.tsx: ancestry/trait triggered actions
→ ReviewStep.tsx: ancestry section, skills list, stats
→ CharacterPreview.tsx: sidebar stats
→ complication step: excluded skills updated
→ career step: excluded skills updated
→ culture step: excluded skills updated
```

### When a new Play Mode field is added:
```
→ play-store.ts: PlayCharacterState interface + createDefaultPlayState() + initPlayState() + Zustand action
→ PlayCombat.tsx or appropriate tab: UI control
→ takeRespite(): add to reset if combat-scoped
→ updateMaxStats(): add if stat-derived
→ data-export.ts: included in playStates export (automatic via Zustand)
→ LevelUpModal: if affected by level change
```

---

## 6. STAT CALCULATION FORMULAS (GROUND TRUTH)

Any change to stats MUST match these. If reality differs from these formulas, the formula is wrong and this file needs updating.

```
echelon       = floor((level - 1) / 3) + 1
stamina       = classBase + (kitBonus × echelon) + ancestryTraitBonus + complicationBonus + ((level - 1) × classPerLevel)
winded        = floor(stamina / 2)
recoveryValue = floor(stamina / 3)
recoveries    = classBaseRecoveries + ancestryRecoveryBonus
speed         = ancestryBaseSpeed + kitSpeedBonus + classSpeedBonus + traitSpeedOverride
stability     = kitStabilityBonus + ancestryStabilityBonus + complicationStabilityBonus
size          = ancestry.size (1M, 1T, 1L, etc.)
saveValue     = floor(winded / 2)
disengage     = 1 + kitDisengageBonus
potency.strong  = max(might, agility, reason, intuition, presence)
potency.average = strong - 1
potency.weak    = strong - 2
```

### Class Base Stats
| Class | Base Stamina | Per Level | Recoveries |
|-------|-------------|-----------|------------|
| Censor | 21 | 9 | 12 |
| Conduit | 18 | 6 | 8 |
| Elementalist | 18 | 6 | 8 |
| Fury | 21 | 9 | 10 |
| Null | 21 | 9 | 8 |
| Shadow | 18 | 6 | 8 |
| Tactician | 21 | 9 | 10 |
| Talent | 18 | 6 | 8 |
| Troubadour | 18 | 6 | 8 |
| Summoner | 15 | 6 | 8 |

### Trait-Based Overrides
- Speed overrides: Beast Legs, Swift, Lightning Nimbleness
- Stability bonuses: Grounded trait
- Stamina scaling: Spark Off Your Skin (level1=6, level4=12, level7=18, level10=24)
- Recovery bonuses: Human Staying Power (+2)

---

## 7. CASCADING CHOICE RULES

When a choice changes, downstream choices MUST be handled:

### Ancestry Change (`setAncestry`)
- **Resets**: `selectedTraits[]`, `formerLifeAncestryId`, `computedStats`
- **Does NOT reset**: culture, career, class (user may keep those)
- **Downstream**: Trait budget changes, speed/size/stability may change, portrait model changes

### Class Change (`setClassChoice`)
- **Resets**: `subclassId`, `subclassSkill`, `characteristics` (all to 0), `signatureAbilityName`, `heroicAbilities[]`, `kitId`, `secondKitId`
- **Downstream**: Kit options change (stormwight vs standard vs none), ability pool changes, resource name changes, stat formulas change

### Subclass Change (within `setClassChoice`)
- **Resets**: `kitId` and `secondKitId` (if stormwight compatibility changes)
- **Downstream**: Ability filtering changes (subclass-locked abilities), subclass skill changes

### Complication Change (`setComplication`)
- **Resets**: All complication sub-choices (skills, languages, forgottenLanguage, benefitChoiceIndex)
- **Downstream**: Stat bonuses (stamina, stability, recoveries, renown, wealth), language list, skill list

### Level Change (`setLevel`)
- **Downstream**: Echelon changes, stamina scales, ability grant levels unlock, kit bonuses scale, trait stamina bonuses scale, visual tier changes on portrait

---

## 8. SKILL DEDUPLICATION PROTOCOL

Skills flow from 5 sources and MUST NOT duplicate:

```
Source 1: Culture    → environmentSkill + organizationSkill + upbringingSkill
Source 2: Career     → granted[] + chosen from grantedFrom groups
Source 3: Complication → fixedSkills + chosen skills
Source 4: Traits     → skillChoices from ancestry traits (Silver Tongue, Passionate Artisan)
Source 5: Subclass   → subclassSkill
```

**Cross-step dedup**: `getExcludedSkills(character, step)` returns skills from ALL OTHER steps
**Within-step dedup**: Each dropdown excludes picks from sibling dropdowns in same step
**Aggregation**: `getCharacterSkills()` returns flat deduplicated array for PDF/display

### When modifying any skill source:
1. Ensure `skill-mapper.ts` includes the new source
2. Ensure the step UI calls `getExcludedSkills()` for filtering
3. Ensure `pdf-exporter.ts` skill checkbox loop picks it up
4. Ensure `PlaySheet.tsx` displays it
5. Ensure `PlayActions.tsx` references it if it grants actions
6. Ensure `ReviewStep.tsx` lists it
7. Ensure cross-step dedup still excludes it in other steps' dropdowns

---

## 9. PDF EXPORT FIELD MAP

The PDF exporter maps to **567 form fields** in the official Draw Steel character sheet template.

### Critical Field Groups:
- **Identity**: Character Name, Level, Ancestry, Class, Subclass, Career
- **Characteristics**: Might, Agility, Reason, Intuition, Presence
- **Computed**: stamina max, winded count, recov stamina, recov max, Speed, Size, Stability, dying count, Save Value, Disengage
- **Kit**: Modifier Name, Weapon/Implement, Armor, all damage tiers (T1/T2/T3 melee + ranged), Modifier Benefits text
- **Skills**: 57 checkbox fields (one per skill)
- **Abilities**: 6×3 grid (18 ability slots) with: Name, Cost, Target, Distance, Keywords, Action, Power Roll, Tier 1/2/3
- **Actions**: Main Actions, Maneuvers, Triggered Actions (each has multiple text fields)
- **Career/Culture/Complication**: Detailed text fields for benefits, incidents, languages
- **Class Features**: Feature list + heroic resource rules

### When adding any new data to character:
1. Check `FIELD_COVERAGE_AUDIT.md` (in project root) for the target PDF field name
2. Add mapping in `pdf-exporter.ts` `exportCharacterPdf()`
3. If it's an ability, also update `exportAbilityCardsPdf()`
4. Verify font sizing works (auto-sizing logic handles field height)
5. Test PDF opens correctly in multiple viewers (Preview, Chrome, Adobe)

---

## 10. PLAY MODE INTEGRATION RULES

### Play State Lifecycle
```
1. INIT: WizardLayout.handleSaveAndPlay()
   → computeAllStats() with level, class, kit, traits, complication
   → saveCharacter() to gallery
   → playStore.initPlayState(id, maxStamina, maxRecoveries, recoveryValue)
   → characterStore.setMode('play')

2. ACTIVE: PlayMode renders 6 tabs reading from both stores
   → PlayCombat reads/writes PlayCharacterState (stamina, conditions, initiative)
   → PlaySheet reads CharacterData (read-only)
   → PlayAbilities reads abilities.json + resolves via ability-resolver + tracks usage
   → PlayActions reads class-features.json + abilities + kits + traits
   → PlayInventory reads/writes inventory items + treasure catalog
   → PlayProgression reads/writes victories, triggers level-up, manages titles

3. LEVEL UP: LevelUpModal
   → characterStore.setLevel(newLevel)
   → characterStore.setClassChoice() with new ability added
   → recompute stats
   → playStore.updateMaxStats() (resets stamina to new max)
   → playStore.resetVictories()

4. EXIT: Menu → Save & Exit
   → updateSavedCharacter() persists current state
   → characterStore.setMode('create')
```

### Play State Fields (per character)
```typescript
{
  currentStamina: number      // current HP, clamped [0, maxStamina]
  maxStamina: number          // from stat calculator
  temporaryStamina: number    // temp HP pool (min 0)
  usedRecoveries: number      // spent this encounter
  maxRecoveries: number       // from stat calculator
  recoveryValue: number       // floor(stamina / 3)
  heroicResource: number      // class resource counter (min 0)
  surges: number              // combat surges (min 0)
  victories: number           // session victories toward level-up
  activeConditions: Condition[] // 9 conditions
  notes: string               // freeform session notes
  inventory: InventoryItem[]  // treasures and items (persisted)
  initiative: InitiativeEntry[] // turn order tracker
  usedAbilities: string[]     // ability names used this encounter
  earnedTitles: string[]      // title IDs earned by character
}

// Inventory item structure
interface InventoryItem {
  id: string;               // unique id (treasure-id + timestamp)
  name: string;
  category: string;          // 'artifact' | 'consumable' | 'leveled' | 'trinket' | 'other'
  description: string;
  charges?: number;          // for consumables
  maxCharges?: number;
  isEquipped?: boolean;
  notes?: string;
}
```

### When modifying play mode:
1. Any new combat mechanic needs a field in `PlayCharacterState` interface (play-store.ts)
2. Add the Zustand action in play-store.ts
3. Add UI control in the appropriate tab component
4. If it affects stats → also update `updateMaxStats()` and `initPlayState()`
5. If it persists across sessions → it's auto-persisted via Zustand localStorage
6. If it resets on respite → add to `takeRespite()` action
7. If it resets on catch breath → verify `catchBreath()` behavior
8. Verify `data-export.ts` includes it in backup (automatic if in Zustand store)
9. Verify old play states (pre-change) don't crash when loaded (handle undefined gracefully)

---

## 11. PORTRAIT SYSTEM RULES

### Visual Tier Progression
| Tier | Levels | Armor Color | Effects |
|------|--------|-------------|---------|
| I Initiate | 1-2 | #909090 (gray) | Basic armor, simple colors |
| II Adept | 3-4 | #6aaa6a (green) | Small details, belt accents |
| III Champion | 5-6 | #c9a84c (gold) | Runes appear, signature marks |
| IV Legend | 7-8 | #ff6a00 (orange) | Wings, intense glow |
| V Mythic | 9-10 | #cc44ff (purple) | Particles, full animations |

### Revenant Special Case
- Uses `formerLifeAncestryId` for body silhouette
- Forced color palette: skin=#1e3030, armor=#0d1e18, accent=#7fffd4 (aquamarine)
- Ghost float animation instead of standard
- No skin/accent/gem color pickers in ModelStep

### When modifying portraits:
1. All 12 ancestries must render without errors at ALL 10 levels
2. Revenant must correctly use former life ancestry model
3. Weapon must appear at correct hand position (HAND_POS per ancestry)
4. Kit → armor class → armor coverage must map correctly
5. Level → tier → visual effects must scale correctly
6. SVG must not overflow container (check `.character-model` CSS)
7. Test in: ModelStep, ReviewStep, PlaySheet, CharacterPreview sidebar

---

## 12. ZUSTAND STORE MIGRATION PROTOCOL

### When adding fields to CharacterData:
1. **Add to interface** in `src/types/character.ts`
2. **Add default** in `DEFAULT_CHARACTER` in `character-store.ts`
3. **Add migration** in the `migrate` function of character-store.ts:
   ```typescript
   if (!state.newField) state.newField = defaultValue;
   ```
4. **Bump version** if the migration is breaking (currently version: 1)
5. **Test**: Clear localStorage → create character → verify field exists
6. **Test**: Keep old localStorage → reload → verify migration populates field
7. **Test**: Load old saved character from gallery → verify field present with default

### When adding fields to PlayCharacterState:
1. Add to interface in `play-store.ts`
2. Add to `createDefaultPlayState()` factory
3. Add to `initPlayState()` (preserve existing if updating)
4. Add Zustand action for the field
5. If it resets on respite → add to `takeRespite()`
6. **Test**: Old play states in localStorage don't crash (handle `undefined` with `?? defaultValue`)

---

## 13. FILE REFERENCE — WHAT LIVES WHERE

### Types & Interfaces
| File | Contains |
|------|----------|
| `src/types/character.ts` | CharacterData, ClassChoice, CultureChoice, CareerChoice, ComplicationChoice, SelectedTrait, ComputedStats, PortraitSettings, Condition, WizardStepId, CLASS_RESOURCES, WIZARD_STEPS, VICTORIES_TO_LEVEL_UP, ABILITY_GRANT_LEVELS |

### Stores
| File | localStorage Key | Contains |
|------|-----------------|----------|
| `src/stores/character-store.ts` | `draw-steel-character` | CharacterData + wizard nav + mode + setters + migration |
| `src/stores/play-store.ts` | `draw-steel-play-states` | Per-character play state map + combat actions |

### Engine
| File | Purpose | Consumers |
|------|---------|-----------|
| `stat-calculator.ts` | All stat formulas | PDF, play init, preview, review, level-up |
| `pdf-exporter.ts` | 567-field PDF mapping | Review export buttons |
| `combat-reference-pdf.ts` | 3-page static combat PDF | Review download |
| `ability-resolver.ts` | Resolve ability text templates | Play abilities, battle cards, PDF grid |
| `skill-mapper.ts` | Aggregate + dedup skills | PDF checkboxes, play sheet, review |
| `complication-stats.ts` | Complication bonus calc | Stat calculator inputs |
| `step-validation.ts` | Per-step validation gates | Store nextStep(), category completion |
| `category-completion.ts` | Wizard progress tracking | Sidebar progress |
| `character-storage.ts` | Gallery CRUD | Welcome step, save/load |
| `data-export.ts` | Backup export/import | Welcome step, play menu |

### Components
| Directory | Files | Purpose |
|-----------|-------|---------|
| `components/steps/` | 14 step components | Wizard flow |
| `components/play/` | PlayMode, PlayCombat, PlayActions, PlayAbilities, PlayInventory, PlaySheet, PlayProgression, LevelUpModal | Play mode (6 tabs) |
| `components/battle/` | BattleCard, BattleCardsView | Printable ability cards |
| `components/wizard/` | WizardLayout, CharacterPreview | Wizard frame + sidebar |
| `components/portrait/` | CharacterPortrait, ancestry-renderers, weapon-builders, gear-data, model-data, model-css | SVG character model |

### Data (ALL extracted from official sources — see Law 0)
| App JSON File | Content | Markdown Source (data-md-main/) | PDF Source |
|---------------|---------|-------------------------------|-----------|
| `src/data/abilities.json` | 9 classes × signature + heroic abilities | Rules/Abilities/ (545 files) | Heroes v1.01 |
| `src/data/ancestries.json` | 12 ancestries with traits | Rules/Ancestries/ (13 files) | Heroes v1.01 |
| `src/data/careers.json` | 18 careers with skills/perks | Rules/Careers/ (19 files) | Heroes v1.01 |
| `src/data/kits.json` | ~25 kits with bonuses | Rules/Kits/ (23 files) | Heroes v1.01 |
| `src/data/perks.json` | 6 perk groups | Rules/Perks/ (48 files) | Heroes v1.01 |
| `src/data/complications.json` | 50+ complications | Rules/Complications/ (105 files) | Heroes v1.01 |
| `src/data/cultures.json` | Environments, organizations, upbringings | Rules/Cultures/ (14 files) | Heroes v1.01 |
| `src/data/class-features.json` | 641 class features (9 classes + summoner) | Rules/Features/ (686 files) | Heroes v1.01 |
| `src/data/treasures.json` | 98 treasures (artifacts, leveled, trinkets, consumables) | Rules/Treasures/ (99 files) | Heroes v1.01 |
| `src/data/ability-mechanics.json` | Rules reference data | Rules/Conditions/ + Rules/Movement/ | Rules Ref v1.01 |
| `src/data/complication-choices.ts` | Complication sub-choice metadata | Rules/Complications/ (105 files) | Heroes v1.01 |
| `src/data/skill-groups.ts` | 5 skill groups, 57 skills | Rules/Skills/ (6 files) | Heroes v1.01 |
| `src/data/titles.json` | 59 titles (4 echelons) | Rules/Titles/ (60 files) | Heroes v1.01 |
| `src/data/class-kit-options.ts` | No-kit class options (prayers, enchantments, augmentations) | Rules/Features/ (per class) | Heroes v1.01 |

#### Data available in markdown NOT YET in app JSON:
| Markdown Source | Files | Status | Priority |
|----------------|-------|--------|----------|
| Rules/Conditions/ | 10 | IN APP (full canonical text in CONDITION_DESCRIPTIONS) | DONE |
| Rules/Titles/ | 60 | IN APP (titles.json + PlayProgression title browser) | DONE |
| Rules/Treasures/ | 99 | IN APP (treasures.json + PlayInventory) | DONE |
| Rules/Movement/ | 25 | NOT IN APP | MEDIUM — detailed movement mechanics |
| Rules/Classes By Level/ | 100 | NOT IN APP | MEDIUM — explicit progression tables |
| Bestiary/Monsters/ | 415+ | NOT IN APP | MEDIUM — encounter/enemy tracking |
| Bestiary/Dynamic Terrain/ | 35 | NOT IN APP | MEDIUM — encounter hazards |
| Bestiary/Retainers/ | 47 | NOT IN APP | LOW — companion creatures |
| Rules/Negotiation/ | 12 | NOT IN APP | LOW — social encounter mechanics |

**If ANY app JSON file contains a value that differs from the markdown OR the PDF, the JSON is WRONG. Fix it.**
**When implementing features from the "NOT IN APP" list above, read the markdown files first, then build the JSON from them.**

---

## 14. KNOWN LIMITATIONS & INCOMPLETE SYSTEMS

### Kit Step — No-Kit Classes
Conduit, Elementalist, Null, Talent now have full Prayer/Enchantment/Augmentation selection in KitStep.
Summoner still shows "Coming soon..." (rules not in source data).
- Data: `src/data/class-kit-options.ts` — ClassKitOption with stat bonuses
- Type: `ClassChoice.classKitOptionId` — selected option ID
- Stat calculator: handles classKitOptionId as alternative to kitId
- PDF/Review/PlaySheet: display the selected option name

### Conduit Dual Domains
Now supports 2 domains. SubclassStep shows First Domain + Second Domain selection.
- Type: `ClassChoice.secondDomainId` — second domain choice
- Validation: Conduit requires both domains
- PDF/Review/PlaySheet: display both domain names (e.g., "Life + War")

### Play Mode — Missing Mechanics
- No dice roller / power roll resolver
- No enemy/NPC tracking
- No condition auto-expiry
- No resource cost enforcement
- No multi-character party view
- No encounter builder
- No session/campaign history

### Summoner
- Minion tracking PDF template exists but no play mode minion management
- Summoned creature stat blocks not implemented

---

## 15. RULES REFERENCE — DRAW STEEL GAME SYSTEM

### Core Mechanic
- **Power Roll**: 2d10 + characteristic vs difficulty
  - Tier 1: 11 or lower | Tier 2: 12-16 | Tier 3: 17+
  - Natural 19-20: Critical hit

### Combat Structure
- **Your Turn**: 1 Move + 1 Main Action + 1 Maneuver + Free Actions
- **Main Actions**: Free Strike, Charge, Defend, Heal
- **Maneuvers**: Aid Attack, Catch Breath, Escape Grab, Grab, Knockback, Hide, Stand Up, Drink Potion
- **Triggered Actions**: Opportunity Attack

### Stamina & Dying
- **Winded**: At or below floor(stamina/2)
- **Dying**: At 0 stamina
- **Recoveries**: Spend to regain recoveryValue stamina
- **Respite**: Full rest — restore all

### Conditions (9)
bleeding, dazed, frightened, grabbed, prone, restrained, slowed, taunted, weakened

### Heroic Resources
| Class | Resource | Class | Resource |
|-------|----------|-------|----------|
| Censor | Wrath | Shadow | Insight |
| Conduit | Piety | Tactician | Focus |
| Elementalist | Essence | Talent | Clarity |
| Fury | Ferocity | Troubadour | Drama |
| Null | Discipline | Summoner | Essence |

### Ability Grants
Level 1: Signature + 3-cost + 5-cost heroic
Levels 2, 3, 5, 6, 8, 9: +1 heroic ability each

### Echelon
Echelon 1: Levels 1-3 | Echelon 2: 4-6 | Echelon 3: 7-9 | Echelon 4: 10

---

## 16. DEVELOPMENT WORKFLOW

### Git
- Single branch: `main`
- Push → GitHub Actions → auto-deploy to GitHub Pages
- CI: `tsc -b && vite build` — TypeScript errors block deploy
- Always `npm run build` locally before pushing

### Fonts
- **Cinzel** (400-700): Headings
- **Cinzel Decorative** (400, 700, 900): Display/titles
- **Crimson Text** (400, 600, 700): Body text
- Loaded via Google Fonts in `index.html`

### Styling
- Tailwind CSS 4 + custom theme in `src/index.css`
- Fantasy glassmorphism aesthetic
- Key classes: `.card`, `.btn-gold`, `.stat-block`, `.parchment`
- Portrait animations in `model-css.ts`

---

## 17. EMERGENCY RECOVERY

### localStorage corrupted:
1. DevTools → Application → Local Storage
2. Delete corrupted key (`draw-steel-character`, `draw-steel-play-states`, or `draw-steel-saved-characters`)
3. Reload — Zustand reinitializes with defaults
4. Import from backup JSON if available

### CI build fails:
1. Always TypeScript — run `npm run build` locally
2. Fix unused imports, type mismatches, null checks
3. Never `@ts-ignore` — fix the actual type

### PDF export breaks:
1. Verify template PDF exists in `public/templates/`
2. Verify field names match template
3. Check font embedding (pdf-lib standard fonts only)
4. Test minimal character first, then add complexity

---

## 18. SELF-ASSESSMENT TEMPLATE

Copy this after every completed task:

```
## TASK COMPLETION REPORT

### What was built/changed:
[Description]

### Source verification:
- [ ] Markdown data referenced from data-md-main/: [files read, or "N/A"]
- [ ] Game data verified against Draw Steel Heroes v1.01.pdf: [yes/no/N/A]
  - Pages referenced: [page numbers or "N/A"]
- [ ] Game rules verified against Draw Steel Rules Reference v1.01.pdf: [yes/no/N/A]
  - Pages referenced: [page numbers or "N/A"]
- [ ] All ability text is EXACT wording from source (not paraphrased): [yes/no/N/A]
- [ ] All stat values cross-referenced with pregen characters: [yes/no/N/A]
- [ ] Authority chain intact: PDFs → Markdown → JSON → Engine → UI: [yes/no]

### Systems touched:
[List every file modified]

### Integration verification:
- [ ] Build passes (npm run build)
- [ ] Character creation flow: [tested/not tested]
- [ ] Save/Load cycle: [tested/not tested]
- [ ] Export/Import backup: [tested/not tested]
- [ ] PDF export: [tested/not tested]
- [ ] Play mode init: [tested/not tested]
- [ ] Play mode combat: [tested/not tested]
- [ ] Play mode actions: [tested/not tested]
- [ ] Play mode abilities: [tested/not tested]
- [ ] Play mode sheet: [tested/not tested]
- [ ] Play mode progression: [tested/not tested]
- [ ] Mode switching: [tested/not tested]
- [ ] Portrait rendering: [tested/not tested]
- [ ] Old saved characters load: [tested/not tested]

### Cross-system sync verified:
- [ ] Source PDFs → JSON data files → Engine calculations → UI display → PDF export (full chain)
- [ ] Stat values match across: calculator, PDF, play sheet, combat, preview
- [ ] Skills match across: mapper, PDF, play sheet, review
- [ ] Abilities match across: resolver, PDF, play cards, battle cards

### GRADE: X/10
Reasoning: [Why this grade. What would make it higher if not 10.]
```
