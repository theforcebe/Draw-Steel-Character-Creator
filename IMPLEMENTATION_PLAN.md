# Character Creator - Comprehensive Implementation Plan

## Phase 1: Data Foundation
**Goal**: Create the shared data structures everything else depends on.

### Files to create:
- `src/data/skill-groups.ts` - Master skill list per group (crafting, exploration, interpersonal, intrigue, lore)
- `src/data/complication-choices.ts` - Metadata for what each complication mechanically grants

### Files to modify:
- `src/types/character.ts`:
  - Extend `SelectedTrait` with optional sub-choices (damageType, skillChoices, abilityName)
  - Add `ComplicationChoices` interface (skills, languages, statBonuses)
  - Add `subclassSkill: string` to `ClassChoice`
  - Replace `complicationName: string | null` with richer complication data
- `src/stores/character-store.ts` - New setters for complication choices

### Dependencies: None (this is the foundation)

---

## Phase 2: Culture Skill Selection
**Goal**: Let users choose skills from each pillar instead of quickBuild defaults.

### Files to modify:
- `src/components/steps/CultureStep.tsx` - Add skill dropdowns per environment/organization/upbringing
- Uses: `skill-groups.ts` for skill lists

### Dependencies: Phase 1

---

## Phase 3: Career Skills + Perk Selection
**Goal**: Let users choose skills from grantedFrom groups and pick their perk.

### Files to modify:
- `src/components/steps/CareerStep.tsx` - Skill group selectors + perk picker
- Uses: `skill-groups.ts`, `perks.json`

### Dependencies: Phase 1

---

## Phase 4: Complication Choices
**Goal**: Add skill/language/stat selection for complications that grant them.

### Files to modify:
- `src/components/steps/ComplicationStep.tsx` - Conditional UI for skill/language/stat choices
- Uses: `complication-choices.ts`, `skill-groups.ts`, `cultures.json` (language lists)

### Dependencies: Phase 1

---

## Phase 5: Ancestry Trait Sub-Choices
**Goal**: Handle traits that require additional selections.

### Traits requiring sub-choices:
- Devil "Silver Tongue": 1 interpersonal skill
- Dragon Knight "Wyrmplate": damage type
- Dragon Knight "Dragon Breath": damage type
- Dragon Knight "Prismatic Scales": damage type (linked to Wyrmplate)
- Dwarf "Runic Carving": rune type
- Orc "Passionate Artisan": 2 crafting skills
- Time Raider "Psionic Gift": 1 of 3 abilities
- Revenant "Previous Life: 2 Pts": trait from former ancestry

### Files to modify:
- `src/components/steps/AncestryTraitsStep.tsx` - Conditional sub-choice UI per trait
- Uses: `skill-groups.ts`, `ancestries.json`

### Dependencies: Phase 1

---

## Phase 6: Subclass Granted Skills
**Goal**: Store and track skills granted by subclass selection.

### Files to modify:
- `src/components/steps/SubclassStep.tsx` - Store subclass skill in classChoice

### Dependencies: Phase 1

---

## Phase 7: Review + Export (The Big Integration)
**Goal**: Aggregate ALL data from ALL sources and display/export correctly.

### Skill aggregation (update `skill-mapper.ts`):
- Culture: environment + organization + upbringing skills
- Career: granted + chosen skills
- Complication: fixed + chosen skills
- Ancestry traits: Silver Tongue, Passionate Artisan skills
- Subclass: granted skill

### Language aggregation:
- Caelian (base)
- Culture language
- Career languages
- Complication languages (extant + dead)
- Minus: Shipwrecked "forget one language" drawback

### Stat computation (update `stat-calculator.ts`):
- Complication stamina bonuses (Elemental Inside +3)
- Complication recovery bonuses (Curse of Punishment +1, Primordial Sickness -1)
- Complication stability bonuses (Curse of Stone +1, Vow of Duty +1)

### Wealth/Renown computation:
- Base wealth: 1 + career wealth + complication wealth
- Base renown: career renown + complication renown

### PDF export updates (`pdf-exporter.ts`):
- All skills checked
- All languages listed
- Correct wealth/renown totals
- Complication details with chosen benefits
- Ancestry trait details with sub-choices
- Font sizing verified for all fields

### Review display updates (`ReviewStep.tsx`):
- Aggregated skills section
- Aggregated languages section
- Wealth + Renown display
- Full complication details (benefit/drawback + choices made)
- Ancestry trait details with sub-choices

### Dependencies: Phases 1-6

---

## Phase 8: Character Storage
**Goal**: Let users save completed characters locally and start new ones.

### Features:
- Save current character to localStorage gallery
- View list of saved characters
- Load a saved character back into the builder
- Delete saved characters
- Start new character (reset builder)

### Files to create:
- `src/stores/character-gallery.ts` - Zustand store for saved characters
- `src/components/CharacterGallery.tsx` - UI for browsing/loading/deleting saved characters

### Files to modify:
- `src/components/steps/ReviewStep.tsx` - "Save Character" button
- `src/components/steps/WelcomeStep.tsx` - Show saved characters, option to load or start new

### Dependencies: Phases 1-7 (characters must be complete to save meaningfully)
