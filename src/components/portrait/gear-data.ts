// ============================================================
// GEAR NAMES & DESCRIPTIONS — per ancestry, 10 levels each
// [0] = armor names/descs, [1] = weapon names/descs
// ============================================================

export const GEAR_NAMES: Record<string, [string[], string[]]> = {
  devil: [
    ['Tattered Hellweave','Iron Hellguard','Ashforged Plate','Ember Crown','Infernal Vanguard','Desolation Mail','Hellfire Sovereign','Throne of Ash Armor','The Undying Pyre','Seal of the Dark Compact'],
    ['Rusted Warden Blade','Forge-Blessed Sword','Hellfire Glaive','Ashbringer','Infernal Sunder','Soul-Scour Blade','The Torment Edge','Oblivion\'s Fang','Desolation\'s Will','The Last Confession'],
  ],
  dragonknight: [
    ['Scale-Touched Hauberk','Drakeforged Plate','Wyrmscale Mail','Dragon Sentinel Armor','Wyrm Lord\'s Guard','Scion of the Elder Scale','Aspect of the Drake','Draconite Sovereign','The Dragon Eternal','Heavenscale Godplate'],
    ['Drake Talon','Dragonfire Lance','Scion\'s Glaive','Wyrmbane Spear','Scale-Blessed Halberd','Dragon Herald\'s Lance','Sovereign Lance','The Elder\'s Fang','Skybreaker','The Worldcleave'],
  ],
  dwarf: [
    ['Stonehewn Tunic','Mountain Forged Mail','Deepstone Plate','Runewarden Armor','Grimnir\'s Guard','Stone King\'s Might','Eternal Forge Plate','The Unbreaking','Ancestor\'s Mantle','The Living Mountain'],
    ['Prospector\'s Pick','Deepstone Axe','Runewarden Axe','Grimnir\'s Cleave','The Earthsplitter','Anvilborn Maul','Forge-King Warhammer','The Grudgebringer','Ancestor\'s Verdict','World-Ender\'s Axe'],
  ],
  hakaan: [
    ['Giant-Cloth Wraps','Doomseeker\'s Mantle','Prophet\'s Guard','Fatewarden Plate','The Third Eye\'s Chosen','Visionwarden Armor','Giant-King\'s Aegis','Oracle\'s Sovereign','The Last Vision','Fate\'s Terminus'],
    ['Seer\'s Walking Staff','Doom Oracle Staff','Fate\'s Reach','Third Eye Stave','Vision-Ender','The Foretelling','Prophecy\'s End','The Inevitable','Doom-Seer\'s Will','The Final Omen'],
  ],
  highelf: [
    ['Silkwoven Robes','Starthread Vestments','Moonshard Mail','Elven Sentinel Plate','Radiance Guard','First Light Vestments','The Elven Eternal','Heaven\'s Grace Armor','Starborn Mantle','The Celestial Accord'],
    ['Moonbeam Staff','Starthread Rod','Elven Starwand','Dawnfire Staff','Heaven\'s Whisper','The Celestial Will','Starborn Sceptre','Light\'s Covenant','The Eternal Dawn','Heaven\'s End'],
  ],
  human: [
    ['Common Guard Tunic','Iron Order Mail','Champion\'s Plate','Knight\'s Aegis','Order of the Sun Armor','Heroic Vanguard','The Undaunted Plate','Last Stand Armor','Legionnaire Eternal','The Champion\'s Oath'],
    ['Militia Sword','Knightly Blade','Champion\'s Sword','Order Sword','The Unwavering Blade','Hero\'s Covenant','The Last Stand Sword','Legionnaire\'s Will','Oath of the Eternal','The Champion\'s End'],
  ],
  memonek: [
    ['Crystal Shards','Lattice Weave','Geometric Hauberk','Law-Forged Plate','Order Crystal Mail','The Harmonic Form','Law Sovereign Armor','Crystalline Eternal','The Perfect Law','Absolute Order'],
    ['Law Fragment','Crystal Shard Blade','Geometric Glaive','Order Lattice Blade','Harmonic Blade','Law Sovereign Blade','The Perfect Shard','Absolute Cut','Law\'s End','The Final Theorem'],
  ],
  orc: [
    ['War-Bones','Bloodforged Mail','Iron Warchief Plate','Warpriest Armor','Blood Covenant Plate','The Unbroken','Warchief Eternal','Ancestor\'s Fury','The Bloodpact Eternal','World\'s Fury'],
    ['Crude Waraxe','Bloodforged Axe','Warchief\'s Cleave','The Bloodpact','Fury Unchained','Ancestor\'s Rage','The Warlord\'s Verdict','Bloodtide Maul','Fury Eternal','World-Ender'],
  ],
  polder: [
    ['Patchwork Vest','Shadow-Stitched Coat','Shroud of Dusk','Umbral Warden Vest','Shadow Sovereign Coat','The Night\'s Chosen','Umbral Eternal Coat','Shadow God\'s Shroud','The Last Darkness','The Living Shadow'],
    ['Tinker\'s Dagger','Shadow Blade','Umbral Edge','Dusk Dagger','Night\'s Fang','The Unseen Blade','Shadowgod\'s Fang','The Darkness','The Final Veil','The Last Silence'],
  ],
  revenant: [
    ['Bone-Fragment Mail','Soul-Bound Husk','Grave Iron Armor','Undying Plate','Soul Sovereign Mail','The Undead Eternal','Grave-King\'s Armor','The Soul Immortal','Undying\'s Covenant','The Living Death'],
    ['Grave Scythe','Soul Reaper','Undying Edge','Void Scythe','The Eternal Harvest','Soul Sovereign\'s Blade','Grave-King\'s Reaper','The Last Cut','Death\'s Covenant','The End of All Things'],
  ],
  timeraider: [
    ['Astral Wrappings','Timerunner\'s Mail','Void-Forged Plate','Epoch Guard Armor','Temporal Sovereign','The Time-Locked','Astral Eternal Plate','Time-Warden\'s Mantle','The Epoch Eternal','The Last Moment'],
    ['Phase Knife','Time Blade','Epoch Saber','Void Sabre','Temporal Cleave','The Moment\'s Edge','Epoch Eternal Blade','The Last Second','Time\'s Covenant','The Final Epoch'],
  ],
  wodeelf: [
    ['Leaf-Woven Cloak','Forest Shadow Mantle','Wode Warden Armor','Ancient Grove Mail','The Forest Eternal','Wode Sovereign\'s Cloak','Nature\'s Eternal Mail','The Ancient Grove\'s Chosen','Forest God\'s Cloak','The Living Forest'],
    ['Carved Shortbow','Wode Ranger\'s Bow','Ancient Grove Bow','The Hunter\'s Arc','Forest Eternal Bow','Wode Sovereign\'s Bow','Nature\'s Eternal Arc','The Ancient Hunter','Forest God\'s Bow','The Final Arrow'],
  ],
};

export const GEAR_DESCS: Record<string, [string[], string[]]> = {
  devil: [
    ['Scorched rags sewn from infernal hides, still warm to the touch.','Mail hammered from iron smelted in the deep pits; wards against fear.','Plate born in ashfire, each piece a contract of pain written in metal.','A crown of smoldering metal. Those who wear it dream of ruin.','Armor forged from the screams of the fallen, living with fell intent.','Ancient desolation given shape \u2014 each plate a sorrow made solid.','The sovereign armor of a hellfire court. It burns those unworthy.','Crafted from the spent rage of a dead god. Nothing beneath Orden rivals it.','A covenant of destruction, sealed into steel that will never cool.','The final pact. It does not guard its wearer \u2014 it judges all others.'],
    ['A blade still dripping with first blood, crude but committed.','Blessed in a forge-pit. Each swing feels like a punishment.','A glaive that drinks fire from the air around it when drawn.','A sword forged by will alone; the ash in its metal thirsts.','A weapon that cuts the very concept of mercy from the battlefield.','Reaps not just flesh but the memory of what it touches.','A blade born with a name \u2014 and a grudge older than Orden.','A fang broken from a god of oblivion; the edge is absolute.','This weapon has ended things that thought themselves eternal.','The final argument. It has never needed making twice.'],
  ],
  dragonknight: [
    ['Dragon-scale scraps riveted over toughened leather.','Plate hammered to dragon-tooth standards; fire never reaches within.','Authentic wyrmscale, layered so thick that blades merely slide off.','The armor of a knight sworn to an elder \u2014 fear precedes them.','The sentinel guard of the Dragon Court. Unshaken by god or fire.','Forged in the crucible where the world was young. Elder-touched.','The aspect of the living dragon, shaped to one worthy warrior.','Dragon-shard and Draconite alloy. Older than any human kingdom.','Armor the elder dragons themselves would recognize as kin.','Heaven-forged scales from the first dragon\'s final shedding.'],
    ['A talon torn from a young drake, cleaned and hilted.','A lance that channels draconic fire through its shaft on each thrust.','Forged from the tooth of a fallen scion \u2014 it remembers its origin.','The sacred spear of dragonknight heritage; it burns what it touches.','A halberd that leaves fire in the wake of every swing.','A herald\'s lance that announces the knight\'s coming in flame.','A sovereign weapon \u2014 no shield has halted it in recorded history.','A blade that holds the memory of an elder dragon\'s last roar.','The sky has never been the same since this was raised against it.','The world trembled when this weapon was named. It still does.'],
  ],
  dwarf: [
    ['Rough-hewn links of iron, fit for a miner turned fighter.','Deepstone rings hammered tight; absorbs shock better than it should.','Plate carved with ancestor-runes, older than the mountain it came from.','Warden-forged, each piece carrying seven generations of prayers.','Armor the enemy learns to dread before they ever see it twice.','Shaped by the fires beneath the oldest peak in Vasloria.','Plate the forge-king wore when he held the pass for three days alone.','Nothing has broken it. Nothing will.','Every dent is a battle won. Every mark an ancestor honored.','The mountain given form \u2014 enduring, absolute, immovable.'],
    ['A prospector\'s pick, unexpectedly lethal in practiced hands.','A deepstone axe ground to an edge that cleaves granite.','A runed axe whose every inscription is a story of victory.','The weapon of the Grimnir tradition \u2014 the grudge made physical.','An axe that has split things that were not meant to be split.','A maul that resonates when it finds something worthy of destroying.','The forge-king\'s hammer. Every blow is a verdict.','This weapon carries the weight of all that must be answered.','The deepest grudge. It will be paid.','No reckoning has been deferred by this axe. None ever will be.'],
  ],
  hakaan: [
    ['Cloth wrappings ritually wound under the guidance of the dying.','A seer\'s mantle; the third eye woven into every stitch.','Armor stitched with the names of every end the wearer has foreseen.','Plate worn by fatewarden giants \u2014 the doom they carry is not theirs alone.','Chosen by the third eye itself. It shows the wearer when to move.','Armor that resonates with prophetic grief. It has known every foe before.','The giant-king\'s aegis, forged from visions of his final stand.','The oracle\'s sovereign armor. It has already won every fight it\'s entered.','The last vision: armor that has already seen its wearer\'s death \u2014 and decided against it.','Fate\'s end, given shape. The timeline bends around its wearer.'],
    ['A walking staff repurposed with grim determination.','A doom oracle\'s stave \u2014 it rings when destiny approaches.','A staff whose tip has touched every battlefield in Vasloria.','The third eye\'s reach; this stave can touch what the eye sees.','A staff that ends the fate of what it strikes.','The foretelling made physical. A swing is always inevitable.','A weapon whose next strike has already been written.','The inevitable stave. Resistance is not merely futile \u2014 it is already past.','The doom-seer\'s will. It has never needed a second swing.','The final omen. After this strikes, there are no more futures.'],
  ],
  highelf: [
    ['Silkwoven threads said to be spun from condensed moonlight.','Star-thread vestments that shift like a night sky in motion.','Moonshard mail \u2014 each ring a sliver of shattered first-star.','The sentinel plate of the Elven Courts, elegant as a decree.','Radiant vestments worn by the first-light order of Orden.','Vestments worn only when the elves permit the world to see them at full power.','The armor of the elven eternal \u2014 it has not aged since the first age.','Heaven\'s grace spun into metal; faith and finery entwined.','The starborn mantle, worn by those who remember the world\'s birth.','The celestial accord \u2014 agreement between the elf and the sky itself.'],
    ['A moonbeam staff that illuminates truth in the darkest corners.','A starthread rod that hums with the resonance of the oldest songs.','An elven starwand carved from the branch of the first tree.','A dawnfire staff \u2014 each strike leaves a trail of sealed light.','A weapon that whispers prophecy to its holder in combat.','The celestial will given rod-form. Stars orbit its tip uninvited.','A sceptre carved from a fallen constellation.','Light\'s covenant with this elf, sealed in a weapon that refuses darkness.','The eternal dawn, wieldable, unwilling to set.','The staff that ended the first darkness. It remembers.'],
  ],
  human: [
    ['A guard\'s hand-me-down \u2014 still saves lives.','Iron links carefully maintained; older than its wearer by far.','A champion\'s plate, dented from victories it was present for.','Knight\'s aegis \u2014 polished daily, reflecting the oath sworn within.','Armor of the Order of the Sun; faith hammered into every link.','Worn by a hero the songs haven\'t caught up to yet.','The undaunted plate \u2014 it has never been surrendered. It never will be.','Worn during the last stand of a siege that should have ended differently.','Legionnaire armor that has stood in every major battle of the age.','The champion\'s oath, forged into metal. It does not break promises.'],
    ['A militia sword used by someone who decided to be more.','A knightly blade passed down through a family of impossible people.','The champion\'s sword \u2014 ordinary steel made extraordinary by its bearer.','An order sword that carries the blessing of the Sun Temple.','A blade whose edge has never faltered, even when its holder was afraid.','The hero\'s covenant with victory \u2014 it has never been sheathed in defeat.','The last stand sword. It has always been enough.','A blade that will be remembered in songs not yet written.','The oath of the eternal \u2014 sworn into steel and kept.','The champion\'s end \u2014 the weapon that made the world safer, finally at peace.'],
  ],
  memonek: [
    ['Raw law-crystal fragments shaped into crude but effective protection.','Lattice-woven panels that distribute force across geometric planes.','Crystalline hauberk forged under the authority of pure reason.','Plate of absolute Law \u2014 it cannot be argued with.','Harmonic crystal mail \u2014 it resonates in defence of order.','The perfect form of armor: each piece an axiom made solid.','The sovereign form of Law, worn by one who enforces it.','Crystalline armor that has never been touched by chaos.','The absolute order personified \u2014 it predicts and counters every attack.','The perfect law. It was always going to be this.'],
    ['A crystal fragment repurposed into the first weapon that made sense.','A shard-blade that cuts with mathematical precision.','A geometric glaive \u2014 every angle optimized for maximum result.','An order-lattice blade: aligned with the laws of physics at their strictest.','A harmonic blade that resonates through armor and shield alike.','The law sovereign blade \u2014 it has proven every argument by edge.','The perfect shard: a weapon without flaw, unnecessary complexity, or mercy.','The absolute cut. It doesn\'t slash \u2014 it corrects.','The law\'s end: what is struck by this is no longer subject to debate.','The final theorem. QED.'],
  ],
  orc: [
    ['Bones lashed to hide \u2014 the first armor, and still sufficient.','Bloodforged links hammered under the tradition of the warchief.','Iron warchief plate that has never been removed in defeat.','Warpriest armor bearing the bloodpact marks of the full warband.','The blood covenant plate \u2014 it remembers every life it has protected.','The unbroken armor. Not a single clasp has ever given way.','Warchief eternal \u2014 worn only by one who has led and never fled.','The armor of the ancestors\' fury. The ancestors approve.','The bloodpact eternal. It does not acknowledge surrender.','The world\'s fury, shaped and strapped on.'],
    ['A crude waraxe \u2014 the first tool of the warchief lineage.','A bloodforged axe; the metal remembers every swing it has completed.','The warchief\'s cleave \u2014 heavy enough to teach respect to stone.','The bloodpact axe, bound in the rites of the warband council.','Fury unchained \u2014 a weapon that fights back when blocked.','The ancestor\'s rage. It has been angry since it was forged.','The warlord\'s verdict. It has never required appeal.','A maul that carries the bloodtide. The tide never goes out.','Fury eternal \u2014 it does not tire. Its holder might.','The world-ender. It has come close. It is patient.'],
  ],
  polder: [
    ['Patchwork cloth sewn from stolen shadows and market scraps.','Shadow-stitched coat: the seams dissolve when the wearer goes still.','A shroud woven from dusk itself \u2014 blurs the boundary of sight.','The umbral warden vest. It is never where blows expect it.','The shadow sovereign coat. The shadows recognize their master.','Night\'s chosen vestment \u2014 the darkness cooperates with its wearer.','The umbral eternal coat. It has been invisible since it was made.','The shadow god\'s shroud. The dark owes this wearer a debt.','The last darkness that anything struck its wearer ever saw.','The living shadow. It is no longer worn \u2014 it merges.'],
    ['A tinker\'s dagger repurposed with surprising lethality.','A shadow blade that always appears from the unexpected direction.','The umbral edge \u2014 it finds the gap between safety and certainty.','A dusk dagger that strikes from whatever shadow is nearest.','The night\'s fang. It has never announced itself.','The unseen blade. This is the first you\'ve heard of it.','The shadowgod\'s fang. The shadows keep its secrets.','The darkness: not a blade, but an absence that happens to cut.','The final veil \u2014 drawn across every light that saw it coming.','The last silence. It is already done.'],
  ],
  revenant: [
    ['Bone fragments from past lives wired together with grim purpose.','The soul-bound husk \u2014 armor that continues despite its own death.','Grave iron: metal pulled from a burial site, still cold.','The undying plate. It does not protect life \u2014 it refuses death.','Soul sovereign mail: each ring is a vow to continue anyway.','The undead eternal \u2014 not alive, and yet not finished.','The grave-king\'s armor. The grave-king left it behind for a reason.','The soul immortal: armor that burns with the memory of a purpose.','The undying\'s covenant with every enemy still owed a reckoning.','The living death. It wears its wearer as much as the reverse.'],
    ['A grave scythe hauled from an old battlefield. Still sharp enough.','The soul reaper \u2014 it collects something beyond flesh.','The undying edge: it has killed things that had already died.','A void scythe that cuts through the distinction between life and death.','The eternal harvest \u2014 it has never stopped swinging since first use.','The soul sovereign\'s blade: it governs what it ends.','The grave-king\'s reaper. The grave-king prepared it for this exact foe.','The last cut. After this, the reckoning is complete.','Death\'s covenant. It was signed. It is being upheld.','The end of all things. It has been working toward this for a long time.'],
  ],
  timeraider: [
    ['Astral cloth wrappings that blur at high velocity.','Timerunner\'s mail, each link quantum-locked against decisive harm.','Void-forged plate from a forge that exists in several moments at once.','Epoch guard armor \u2014 it has already survived attacks yet to come.','The temporal sovereign: it exists fully in exactly one timeline.','The time-locked armor \u2014 it does not update. It does not need to.','Astral eternal plate: worn by those who walk the Timescape freely.','The time-warden\'s mantle \u2014 it carries the weight of causal authority.','The epoch eternal. It was always going to survive this.','The last moment. This armor ensures there will be one more.'],
    ['A phase knife that steps briefly out of reality to bypass defenses.','A time blade that consistently arrives slightly ahead of the parry.','The epoch saber: each swing edits a brief moment of combat history.','A void sabre that severs cause from effect.','The temporal cleave \u2014 it cuts across time as much as space.','The moment\'s edge: finds the exact instant between guard and guard.','The epoch eternal blade. It has ended things before they knew the fight started.','The last second \u2014 it buys one, consistently.','Time\'s covenant with this raider, sealed in a weapon.','The final epoch. Time ends here.'],
  ],
  wodeelf: [
    ['Leaves bound with forest cord; indistinguishable from the undergrowth.','Forest shadow mantle; moves like wind through the canopy.','Wode warden armor, each piece cut from a tree that gave it willingly.','Ancient grove mail \u2014 it smells of rain and centuries.','The forest eternal\'s armor: the forest watches through every panel.','The wode sovereign\'s cloak \u2014 even other forests show it deference.','Nature\'s eternal mail. The forest will not let it fail.','The ancient grove\'s chosen: the armor of the oldest story in the wood.','The forest god\'s cloak. The god is not entirely absent from it.','The living forest. It is not entirely armor anymore.'],
    ['A carved shortbow used for hunting before it was used for war.','The wode ranger\'s bow \u2014 strings itself from nearby vines when dropped.','The ancient grove bow: its wood remembers every tree that fell.','The hunter\'s arc. It has never missed something it was aimed at with intention.','The forest eternal bow \u2014 it draws on something more than the archer\'s strength.','The wode sovereign\'s bow. The forest aims through it.','Nature\'s eternal arc \u2014 every arrow is the last thing a threat expects.','The ancient hunter\'s bow. It is older than the forest around it.','The forest god\'s bow. The arrows find their own way.','The final arrow. The forest has been saving it.'],
  ],
};

/** Get gear names for a given ancestry and level */
export function getGearNames(ancestryId: string, level: number): { armor: string; weapon: string } {
  const idx = Math.max(0, Math.min(9, level - 1));
  const names = GEAR_NAMES[ancestryId];
  if (!names) return { armor: 'Unknown Armor', weapon: 'Unknown Weapon' };
  return { armor: names[0][idx], weapon: names[1][idx] };
}

/** Get gear descriptions for a given ancestry and level */
export function getGearDescs(ancestryId: string, level: number): { armor: string; weapon: string } {
  const idx = Math.max(0, Math.min(9, level - 1));
  const descs = GEAR_DESCS[ancestryId];
  if (!descs) return { armor: '', weapon: '' };
  return { armor: descs[0][idx], weapon: descs[1][idx] };
}
