# Decision Cascade Map - Every Choice and Its Effects

## STEP: ANCESTRY

### Decision: Choose Ancestry
- Sets: size, speed, stability, ancestry points budget
- Cascades:
  - Revenant -> must choose Former Life ancestry -> size/speed from that ancestry
  - Revenant + size 1S -> gets 3 ancestry points instead of 2
  - Revenant -> "Previous Life" traits show traits FROM the former ancestry
  - Determines which purchased traits are available

### Decision: Select Purchased Traits (within ancestry points budget)
Each trait may cascade:

| Ancestry | Trait | Sub-choice Required | Affects |
|----------|-------|---------------------|---------|
| Devil | Silver Tongue (signature) | Choose 1 interpersonal skill | Skills |
| Dragon Knight | Wyrmplate (signature) | Choose damage type | Character sheet |
| Dragon Knight | Dragon Breath | Choose damage type | Ability damage type |
| Dragon Knight | Prismatic Scales | Choose damage type (from Wyrmplate list) | Immunity |
| Dwarf | Runic Carving (signature) | Choose rune (Detection/Light/Voice) | Character sheet |
| Dwarf | Grounded | None | +1 stability |
| Dwarf | Spark Off Your Skin | None | +6/12/18/24 stamina by level |
| Human | Staying Power | None | +2 recoveries |
| Orc | Passionate Artisan | Choose 2 crafting skills | Skills |
| Orc | Grounded | None | +1 stability |
| Time Raider | Psionic Gift | Choose 1 of 3 abilities | Abilities |
| Devil | Beast Legs | None | Speed -> 6 |
| Wode Elf | Swift | None | Speed -> 6 |
| Memonek | Lightning Nimbleness | None | Speed -> 7 |
| Revenant | Previous Life: 1 Pt | Choose 1-pt trait from former ancestry | Cascades to that trait's effects |
| Revenant | Previous Life: 2 Pts | Choose 2-pt trait from former ancestry | Cascades to that trait's effects |

---

## STEP: CULTURE

### Decision: Choose Environment
- Cascades: Must choose 1 skill from the environment's skill groups
  - Nomadic: exploration or interpersonal
  - Rural: crafting or lore
  - Secluded: interpersonal or lore
  - Urban: interpersonal or intrigue
  - Wilderness: crafting or exploration

### Decision: Choose Organization
- Cascades: Must choose 1 skill from organization's skill groups
  - Bureaucratic: interpersonal or intrigue
  - Communal: crafting or exploration

### Decision: Choose Upbringing
- Cascades: Must choose 1 skill from upbringing's options
  - Academic: lore group
  - Creative: Music or Perform (interpersonal), or crafting group
  - Labor: Blacksmithing (crafting), Handle Animals (interpersonal), or exploration group
  - Lawless: intrigue group
  - Martial: specific list (Blacksmithing, Fletching, Climb, Endurance, Ride, Intimidate, Alertness, Track, Monsters, Strategy)
  - Noble: interpersonal group

### Decision: Choose Language
- Adds 1 language (in addition to Caelian)

---

## STEP: CAREER

### Decision: Choose Career
- Cascades:
  - Granted skills (fixed, automatic)
  - grantedFrom skills (CHOICE from skill groups) - currently quickBuild only
  - Language slots (CHOICE of extant languages) - recently fixed
  - Perk (CHOICE from perk group) - currently quickBuild only
  - Fixed: renown, wealth, project points

### Decision: Choose Skills from grantedFrom groups
- Each career specifies skill groups and count
- Some careers have special notes (Laborer: crafting OR exploration, not mixed)

### Decision: Choose Perk from career's perk group
- 6 perk groups with 6-10 options each
- crafting, exploration, interpersonal, intrigue, lore, supernatural

---

## STEP: CLASS

### Decision: Choose Class
- Sets: base stamina, stamina/level, recoveries, speed bonus, heroic resource
- Determines available subclasses

### Decision: Choose Subclass
- Some subclasses grant a skill (must be stored):
  - Censor Exorcist: Read Person
  - Censor Oracle: Magic
  - Censor Paragon: Lead
  - Fury Berserker: Lift
  - Fury Reaver: Hide
  - Fury Stormwight: Track
  - Shadow Black Ash: Magic
  - Shadow Caustic Alchemy: Alchemy
  - Shadow Harlequin Mask: Lie
  - Troubadour Auteur: Brag
  - Troubadour Duelist: Gymnastics
  - Troubadour Virtuoso: Music

### Decision: Choose Characteristics Array
- Sets the 5 characteristic scores

### Decision: Choose Kit
- Affects: stamina, speed, stability, melee/ranged damage, equipment

### Decision: Choose Signature + Heroic Abilities
- Filtered by class and level

---

## STEP: COMPLICATION

### Decision: Choose Complication
- Many complications cascade into further choices:

### Fixed Skills (auto-granted, store on sheet):
| Complication | Skills |
|---|---|
| Crash Landed | Timescape |
| Fallen Immortal | Religion |
| Master Chef | Cooking |
| Raised by Beasts | Handle Animals |
| Silent Sentinel | Eavesdrop, Sneak |

### Chooseable Skills:
| Complication | Count | From |
|---|---|---|
| Consuming Interest | 1 | lore group |
| Disgraced | 1 | interpersonal or intrigue |
| Grifter | 1 | intrigue group |
| Hunted | 1 | intrigue group |
| Hunter | 1 | Specific list: Interrogate, Alertness, Eavesdrop, Search, Track, Criminal Underworld, Rumors, Society |
| Ivory Tower | 3 | any group |
| Promising Apprentice | 1 | crafting group |
| Runaway | 1 | crafting group |
| Secret Identity | 1 | intrigue group |
| Shipwrecked | 2 | exploration group |
| Silent Sentinel | 1 | lore group (in addition to fixed Eavesdrop, Sneak) |
| Wrongly Imprisoned | 2 | any group EXCEPT interpersonal |

### Languages:
| Complication | Count | Type |
|---|---|---|
| Exile | 1 | extant |
| Ivory Tower | 1 | dead |
| Shattered Legacy | 1 | any (extant or dead) |

### Language Loss:
| Complication | Effect |
|---|---|
| Shipwrecked | Forget 1 known language |

### Stat Bonuses:
| Complication | Bonus |
|---|---|
| Curse of Punishment | +1 recovery |
| Curse of Stone | +1 stability |
| Disgraced | +1 renown |
| Elemental Inside | +3 stamina (at levels 1, 4, 7, 10) |
| Indebted | Starting wealth -5 |
| Outlaw | +1 renown |
| Primordial Sickness | -1 recovery |
| Vow of Duty | +1 stability |
| Wodewalker | Recovery value + highest characteristic |

### Choice Between Benefits:
| Complication | Options |
|---|---|
| Infernal Contract...Bad | Choose ONE: +2 Renown, +2 Wealth, or +3 Stamina |

---

## EXPORT: What Goes On The Character Sheet

### Skills (aggregated from ALL sources):
1. Culture: environment + organization + upbringing skill choices
2. Career: granted + chosen from grantedFrom groups
3. Complication: fixed + chosen skills
4. Ancestry: Silver Tongue skill, Passionate Artisan skills
5. Subclass: granted skill (if any)

### Languages (aggregated):
1. Caelian (always)
2. Culture language choice
3. Career language choices (0-2)
4. Complication language choices (0-3)
5. Minus: Shipwrecked forgotten language

### Wealth:
- Base: 1
- + Career wealth bonus
- + Complication wealth bonus (Infernal Contract choice)
- - Complication penalty (Indebted: -5)

### Renown:
- Career renown
- + Complication renown (Disgraced +1, Outlaw +1, Infernal Contract choice +2)

### Stamina:
- Class base + per level
- + Kit bonus * echelon
- + Ancestry trait bonuses (Spark Off Your Skin)
- + Complication bonuses (Elemental Inside +3, Infernal Contract choice +3)

### Recoveries:
- Class base
- + Ancestry bonus (Staying Power +2)
- + Complication bonus (Curse of Punishment +1, Primordial Sickness -1)

### Stability:
- Kit bonus
- + Ancestry bonus (Grounded +1)
- + Complication bonus (Curse of Stone +1, Vow of Duty +1)

### Speed:
- Ancestry base (or trait override)
- + Kit bonus
- + Class bonus

---

## CHARACTER STORAGE

### Save:
- Complete CharacterData snapshot -> localStorage array
- Timestamp, name, ancestry, class for gallery display

### Load:
- Restore CharacterData from gallery into builder
- Navigate to review step

### New:
- Reset builder to defaults
- Navigate to welcome step
