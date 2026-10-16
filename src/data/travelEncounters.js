// Travel & Roadside Combat Encounters between adventures.
// Features tactical physical combat (archery, stealth, heavy melee, blocking, brawling),
// arcane spell strikes, divine smiting, and diplomatic outcomes with bribes/tolls.
// All 4 world regions are supported with thematic regional hazards.

export const TRAVEL_ENCOUNTERS = [
  // --- REGION 1: AETHELGARD & HEARTLAND ---
  {
    id: 'highway_bandit_ambush',
    title: "Highwayman Ambush on the King's Road",
    region: 'region1',
    regionName: 'Region 1: Aethelgard & Heartland',
    intro: "While journeying along the King's Highway between adventures, warning whistle signals echo from the pine forest. A felled tree blocks the road! A band of ragged highwaymen and deserters emerge with notched blades and hunting bows, demanding your purse or your life.",
    approaches: [
      {
        id: 'archery_stealth',
        name: 'Snipe Leader from Stealth',
        skill: 'marksmanship',
        fallbackSkill: 'stealth',
        difficulty: 'novice',
        actionDesc: 'Loose a bodkin arrow from concealment into the bandit captain (+extra surprise damage)',
        winTitle: 'Sharpshooter Ambush!',
        winDesc: 'Your arrow streaks from the shadows, piercing the chieftain\'s shoulder and pinning him to the cart. Terrified of a concealed sniper, the bandit gang breaks and flees into the woods!',
        rewards: {
          gold: 20,
          reputation: 10,
          morality: 1,
          items: ['Bandit Shortbow', 'Rations (2)']
        },
        failDesc: 'Your arrow glances off a wooden buckler, giving away your position. The bandits swarm before you can reload! You suffer 4 HP damage before breaking free.'
      },
      {
        id: 'heavy_melee',
        name: 'Heavy Melee Charge',
        skill: 'heavy_weapons',
        fallbackSkill: 'brawling',
        difficulty: 'novice',
        actionDesc: 'Draw cold steel and charge headlong into their frontline with overwhelming force',
        winTitle: 'Martial Dominance!',
        winDesc: 'With a thunderous war cry, you shatter their barricade and cleave through the frontline. The surviving outlaws throw down their weapons and scatter in panic!',
        rewards: {
          gold: 15,
          reputation: 10,
          morality: 1,
          items: ['Bandit Iron Cleaver', 'Rations (1)']
        },
        failDesc: 'You are outflanked in the muddy ditch. Slashing blades score painful blows, inflicting 5 HP damage before you fight your way clear.'
      },
      {
        id: 'arcane_strike',
        name: 'Arcane Spell Blast',
        skill: 'arcane_shaping',
        fallbackSkill: 'arcane_drawing',
        difficulty: 'novice',
        actionDesc: 'Weave raw ambient mana into an explosive shockwave to blast through their ranks',
        winTitle: 'Arcane Conflagration!',
        winDesc: 'A dazzling sphere of shaped kinetic fire erupts across their barricade. Singed and terrified of wizardry, the outlaws run for their lives, dropping their stolen loot!',
        rewards: {
          gold: 25,
          reputation: 12,
          morality: 1,
          items: ['Aether Shard', 'Rations (1)']
        },
        failDesc: 'The spell fizzles in the damp autumn air, triggering an electrostatic backlash that burns your hands for 4 HP damage as you fall back.'
      },
      {
        id: 'divine_smite',
        name: 'Divine Holy Smite',
        skill: 'divine_manifestation',
        fallbackSkill: 'divine_communion',
        difficulty: 'novice',
        actionDesc: 'Channel righteous holy brilliance to strike divine terror into the bandits',
        winTitle: 'Holy Retribution!',
        winDesc: 'Blinding celestial radiance blazes from your symbol. The outlaws fall to their knees in terror, begging for forgiveness and dropping their ill-gotten coin!',
        rewards: {
          gold: 20,
          reputation: 15,
          morality: 2,
          items: ['Holy Water', 'Rations (2)']
        },
        failDesc: 'Your holy prayer is interrupted by a flying stone. You suffer 3 HP damage and spiritual strain (-1 Fatigue) before escaping the ambush.'
      },
      {
        id: 'diplomatic_parley',
        name: 'Diplomatic Parley & Toll',
        skill: 'negotiation',
        fallbackSkill: 'intimidation',
        difficulty: 'novice',
        actionDesc: 'Parley with the bandit lieutenant to negotiate passage without bloodshed',
        winTitle: 'Silver-Tongued Accord',
        winDesc: 'With commanding composure and persuasive eloquence, you convince the outlaws that robbing you will bring royal retribution. They apologize and grant you safe escort past the road block!',
        highMarginWinDesc: 'With commanding composure and persuasive eloquence, you convince the outlaws that robbing you will bring royal retribution. They apologize and grant you safe escort past the road block!',
        narrowWinDesc: 'You talk the highwaymen down from violence, but their leader insists on a toll. You hand over 10 Gold (or 1 ration) to pass peacefully with honor intact.',
        rewards: {
          gold: 0,
          reputation: 10,
          morality: 1,
          items: []
        },
        tollCost: 10,
        failDesc: 'They jeer at your polite words, snatch 15 Gold from your coin purse, and strike you with a club for 3 HP damage before letting you run!'
      }
    ]
  },
  {
    id: 'harvest_vale_scavengers',
    title: 'Blighted Scavengers on the Lowland Byway',
    region: 'region1',
    regionName: 'Region 1: Aethelgard & Heartland',
    intro: 'Along the damp cart-tracks bordering the Harvest Vale wheatfields, desperate deserters and blighted scavengers leap from drainage ditches with scythes and crude crossbows, determined to steal your grain and provisions.',
    approaches: [
      {
        id: 'archery_snipe',
        name: 'Snipe Crossbow Ambushers',
        skill: 'marksmanship',
        fallbackSkill: 'stealth',
        difficulty: 'novice',
        actionDesc: 'Drop into the tall rye and shoot the scavenger crossbowmen before they can reload',
        winTitle: 'Deadeye Counter-Ambush!',
        winDesc: 'Two whistling bodkin arrows silence the scavenger crossbows. Seeing their fire superiority broken, the survivors throw down their scythes and scatter into the marshes!',
        rewards: {
          gold: 15,
          reputation: 10,
          morality: 1,
          items: ['Hunter Crossbow', 'Rations (2)']
        },
        failDesc: 'A jagged bolt grazes your forearm, dealing 4 HP damage as you roll for cover behind a milestone.'
      },
      {
        id: 'shield_bash',
        name: 'Shield Wall & Heavy Cleave',
        skill: 'blocking',
        fallbackSkill: 'heavy_weapons',
        difficulty: 'novice',
        actionDesc: 'Brace your shield against their scythe charge and hammer their battle line back',
        winTitle: 'Shattered Scythes!',
        winDesc: 'Your shield meets their charge like an iron wall. You counter with a sweeping strike that snaps their polearms in half and sends them fleeing in disarray!',
        rewards: {
          gold: 18,
          reputation: 10,
          morality: 1,
          items: ['Iron War Scythe', 'Rations (1)']
        },
        failDesc: 'A curved scythe hooks your shield rim, pulling your shoulder and inflicting 4 HP damage before you break the grapple.'
      },
      {
        id: 'kinetic_burst',
        name: 'Kinetic Shockwave Blast',
        skill: 'arcane_shaping',
        fallbackSkill: 'arcane_drawing',
        difficulty: 'novice',
        actionDesc: 'Blast the water-filled ditch with a kinetic aether pulse to overturn their position',
        winTitle: 'Mud and Static Burst!',
        winDesc: 'The ditch erupts in a deafening torrent of pressurized spray and blue sparks. The dazed scavengers scramble backward in sheer terror of hedge-wizardry!',
        rewards: {
          gold: 20,
          reputation: 12,
          morality: 1,
          items: ['Aether Shard', 'Rations (2)']
        },
        failDesc: 'The wet mud grounds your magical channel; the static feedback stings for 3 HP damage.'
      },
      {
        id: 'sacred_benediction',
        name: 'Sacred Judgment Litany',
        skill: 'divine_manifestation',
        fallbackSkill: 'divine_communion',
        difficulty: 'novice',
        actionDesc: 'Invoke the righteous gods of the harvest to demand their immediate submission',
        winTitle: 'Righteous Repentance!',
        winDesc: 'A brilliant halo of harvest gold light ignites your weapons. Stricken with guilt and dread, the scavengers fall to their knees, begging for mercy and leaving their stolen provisions!',
        rewards: {
          gold: 15,
          reputation: 15,
          morality: 2,
          items: ['Holy Water', 'Blight Ward Charm']
        },
        failDesc: 'Your prayer is drowned out by their shrieks; an iron cleaver gashes your cloak for 3 HP damage.'
      },
      {
        id: 'ration_bargain',
        name: 'Appeal to Reason & Bribe Rations',
        skill: 'negotiation',
        fallbackSkill: 'insight',
        difficulty: 'novice',
        actionDesc: 'Offer them honest rations and work rather than risking their lives in highway robbery',
        winTitle: 'Merciful Accord',
        winDesc: 'You address their desperation with dignity and strength. Convinced of your goodwill and fearful of your steel, they thank you, pledge to abandon banditry, and escort you to the crossroads!',
        highMarginWinDesc: 'You address their desperation with dignity and strength. Convinced of your goodwill and fearful of your steel, they thank you, pledge to abandon banditry, and escort you to the crossroads!',
        narrowWinDesc: 'They agree to lay down their weapons if you grant them 10 Gold (or travel rations). You pay the meager fee and depart without blood on your hands.',
        rewards: {
          gold: 0,
          reputation: 12,
          morality: 2,
          items: []
        },
        tollCost: 10,
        failDesc: 'They sneer at your offer, snatch 12 Gold from your belt, and strike you with a club for 3 HP damage before running into the brush!'
      }
    ]
  },

  // --- REGION 2: IGNIS RIDGE & VOLCANIC FORGES ---
  {
    id: 'ashveil_ridge_raiders',
    title: 'Mountain Brigands at the Mist Pass',
    region: 'region2',
    regionName: 'Region 2: Ignis Ridge & Mountain Passes',
    intro: 'High in the jagged sulfurous crags of the Mist Pass, mountain brigands drop a stone avalanche across your trail. Horns sound from the cliffs as cloaked raiders brandishing spears and slings close in.',
    approaches: [
      {
        id: 'archery_counter',
        name: 'Counter-Snipe Cliff Archers',
        skill: 'marksmanship',
        fallbackSkill: 'perception',
        difficulty: 'professional',
        actionDesc: 'Pinpoint the raider slingers along the high cliff ledge and pick them off with precision shots',
        winTitle: 'Deadeye Counter-Fire!',
        winDesc: 'Two whistling arrows strike the cliff slingers through their leather cloaks. Deprived of high ground, the remaining brigands flee across the scree!',
        rewards: {
          gold: 25,
          reputation: 12,
          morality: 1,
          items: ['Brigand Hunting Sling', 'Rations (2)']
        },
        failDesc: 'Falling rocks and lead bullets rain down, inflicting 4 HP damage before you scramble into an overhanging cave.'
      },
      {
        id: 'shield_wall',
        name: 'Shield Wall & Counter-Attack',
        skill: 'blocking',
        fallbackSkill: 'heavy_weapons',
        difficulty: 'professional',
        actionDesc: 'Brace your shield to deflect tumbling boulders, then counter-attack with heavy strikes',
        winTitle: 'Unbroken Defense!',
        winDesc: 'Your shield turns aside rocks and spears without budging. You counter with a sweeping strike that breaks their spearheads and shatters their resolve!',
        rewards: {
          gold: 20,
          reputation: 12,
          morality: 1,
          items: ['Iron Shield Boss', 'Rations (1)']
        },
        failDesc: 'A heavy boulder knocks your guard aside, bruising your shoulder for 4 HP damage as you tumble down the scree.'
      },
      {
        id: 'arcane_gust',
        name: 'Arcane Gale Shockwave',
        skill: 'arcane_shaping',
        fallbackSkill: 'athletics',
        difficulty: 'professional',
        actionDesc: 'Unleash a howling windstorm that blows rocks and raiders backward off the ledges',
        winTitle: 'Tempest Wrath!',
        winDesc: 'A shrieking vortex of gale-force mana sweeps the cliff face, hurling the brigands tumbling into snowdrifts. The path is cleared!',
        rewards: {
          gold: 30,
          reputation: 15,
          morality: 1,
          items: ['Aether Shard', 'Rations (1)']
        },
        failDesc: 'The gale whips back into your face, throwing you onto sharp slate for 4 HP damage.'
      },
      {
        id: 'divine_presence',
        name: 'Sanctified Command',
        skill: 'divine_communion',
        fallbackSkill: 'leadership',
        difficulty: 'professional',
        actionDesc: 'Chant an ancient warding litany that echoes against the mountain peaks like thunder',
        winTitle: 'Divine Awe!',
        winDesc: 'Your voice rings with supernatural power. Terrified that they have angered the mountain spirits, the raiders prostrate themselves and abandon the pass!',
        rewards: {
          gold: 25,
          reputation: 18,
          morality: 2,
          items: ['Holy Water', 'Rations (2)']
        },
        failDesc: 'The echo dies in the howling wind; a thrown javelin grazes your side for 3 HP damage.'
      },
      {
        id: 'mountain_intimidation',
        name: 'Roar an Ultimatum',
        skill: 'intimidation',
        fallbackSkill: 'negotiation',
        difficulty: 'professional',
        actionDesc: 'Brandish your battle gear and challenge their chieftain to single combat or scatter',
        winTitle: 'Iron Will Prevails',
        winDesc: 'Your terrifying fury and icy gaze shatter the chieftain\'s nerve. He bows respectfully and orders his men to clear the boulders from your path!',
        highMarginWinDesc: 'Your terrifying fury and icy gaze shatter the chieftain\'s nerve. He bows respectfully and orders his men to clear the boulders from your path!',
        narrowWinDesc: 'The chieftain hesitates and demands a 12 Gold mountain tribute to let you pass. You pay the token fee to avoid a bloody melee.',
        rewards: {
          gold: 0,
          reputation: 12,
          morality: 1,
          items: []
        },
        tollCost: 12,
        failDesc: 'They mock your threats, hurling stones that deal 4 HP damage and forcing you to surrender 15 Gold before you escape!'
      }
    ]
  },
  {
    id: 'redvein_gladiator_runaways',
    title: 'Renegade Pit Gladiators at the Cinder Gorge',
    region: 'region2',
    regionName: 'Region 2: Ignis Ridge & Volcanic Forges',
    intro: 'Through the choking smoke of the Cinder Gorge, heavily scarred runaway pit fighters from the Colosseum bar your way with notched greatswords and spiked chains, demanding ransom or blood.',
    approaches: [
      {
        id: 'pinpoint_shot',
        name: 'Pinpoint Bodkin Shot',
        skill: 'marksmanship',
        fallbackSkill: 'stealth',
        difficulty: 'professional',
        actionDesc: 'Aim a heavy armor-piercing bodkin arrow through the gaps in their gladiator harness',
        winTitle: 'Iron Pierced!',
        winDesc: 'Your bodkin strikes the lead gladiator squarely through his shoulder armor, spinning him into the ash. Outmatched at range, the pit fighters retreat behind volcanic boulders!',
        rewards: {
          gold: 30,
          reputation: 15,
          morality: 1,
          items: ['Gladiator Spiked Pauldron', 'Rations (2)']
        },
        failDesc: 'A whirring spiked chain snags your bowstring, ripping it free and dealing 4 HP damage.'
      },
      {
        id: 'colosseum_clash',
        name: 'Clash in Close Quarters',
        skill: 'heavy_weapons',
        fallbackSkill: 'brawling',
        difficulty: 'professional',
        actionDesc: 'Meet their brute maul charge head-on and demonstrate unmatched arena martial prowess',
        winTitle: 'Gladiator Champion!',
        winDesc: 'You parry their two-handed maul, hook their lead fighter with a savage riposte, and disarm their weapons in three brutal strokes. The gladiators salute your superiority and yield their purse!',
        rewards: {
          gold: 25,
          reputation: 18,
          morality: 1,
          items: ['Heavy Arena Spatha', 'Rations (2)']
        },
        failDesc: 'Their spiked buckler smashes into your ribs, dealing 5 HP damage before you roll clear.'
      },
      {
        id: 'magma_burst',
        name: 'Arcane Flame Eruption',
        skill: 'arcane_shaping',
        fallbackSkill: 'arcane_drawing',
        difficulty: 'professional',
        actionDesc: 'Tap the subterranean magma vein beneath their boots to trigger a blinding cinder burst',
        winTitle: 'Volcanic Wrath!',
        winDesc: 'A geyser of sulfur flame and red sparks bursts from the rock fissure. Scorched and terrified of volcanic sorcery, the gladiators abandon their gear and scatter!',
        rewards: {
          gold: 35,
          reputation: 15,
          morality: 1,
          items: ['Aether Shard', 'Volatile Brimstone']
        },
        failDesc: 'The sulfur fumes backdraft into your face, burning your lungs for 4 HP damage.'
      },
      {
        id: 'divine_smite_cinder',
        name: 'Radiant Smite of Retribution',
        skill: 'divine_manifestation',
        fallbackSkill: 'divine_communion',
        difficulty: 'professional',
        actionDesc: 'Channel blazing radiant light to purify the blood-debt of the pit arena',
        winTitle: 'Righteous Radiance!',
        winDesc: 'A column of divine gold radiance sears through the ash clouds. Shaken to their souls, the gladiators drop their weapons, begging for atonement from their bloody sins!',
        rewards: {
          gold: 25,
          reputation: 20,
          morality: 2,
          items: ['Holy Water', 'Gladiator Vow Token']
        },
        failDesc: 'A thrown throwing axe deflects your holy symbol, striking for 4 HP damage.'
      },
      {
        id: 'gladiator_code',
        name: 'Invoke the Gladiator Oath',
        skill: 'negotiation',
        fallbackSkill: 'leadership',
        difficulty: 'professional',
        actionDesc: 'Speak the sacred arena oath of freed warriors to convince them you are brothers-in-arms',
        winTitle: 'Bond of the Arena',
        winDesc: 'You speak their dialect and honor their struggle against slavery. Touched by your words, their champion lowers his blade, shares a flask of wine, and guides you past the dangerous magma fissures!',
        highMarginWinDesc: 'You speak their dialect and honor their struggle against slavery. Touched by your words, their champion lowers his blade, shares a flask of wine, and guides you past the dangerous magma fissures!',
        narrowWinDesc: 'The gladiators agree to let you pass unharmed in exchange for a 15 Gold tribute for food and medical salves. You pay the fee and part in peace.',
        rewards: {
          gold: 0,
          reputation: 15,
          morality: 1,
          items: []
        },
        tollCost: 15,
        failDesc: 'They laugh bitterly at your words, snatch 20 Gold from your pack, and strike your chest for 4 HP damage before letting you run!'
      }
    ]
  },

  // --- REGION 3: FROSTFIRE GLACIER & CRYPTS ---
  {
    id: 'frostfire_glacier_ambush',
    title: 'Frost-Reavers & White-Fur Pack on the Glacier',
    region: 'region3',
    regionName: 'Region 3: Frostfire Glacier',
    intro: 'Crossing the treacherous blue-ice crevasses of the Frostfire Glacier, howling frost-wolves and cloaked tribal reavers emerge from the blizzard with bone spears and barbed harpoons, blocking your route to the crypts.',
    approaches: [
      {
        id: 'frost_sniper',
        name: 'Snipe Pack Alpha in Blizzard',
        skill: 'marksmanship',
        fallbackSkill: 'survival',
        difficulty: 'professional',
        actionDesc: 'Calculate the howling crosswind and put a bodkin arrow through the alpha frost-wolf',
        winTitle: 'Alpha Slain!',
        winDesc: 'Your arrow flies true through the driving snow, taking down the massive alpha wolf. Robbed of their pack leader, the reavers break formation and retreat across the ice fields!',
        rewards: {
          gold: 30,
          reputation: 15,
          morality: 1,
          items: ['Frost-Wolf Pelt', 'Rations (3)']
        },
        failDesc: 'The gale deflects your arrow; a snarling wolf lunges from the fog, biting your thigh for 4 HP damage.'
      },
      {
        id: 'ice_cleave',
        name: 'Brace Shield & Cleave the Ice',
        skill: 'heavy_weapons',
        fallbackSkill: 'blocking',
        difficulty: 'professional',
        actionDesc: 'Slam your warhammer into the ice sheet to fracture the ground beneath their charging vanguard',
        winTitle: 'Chasm Shattered!',
        winDesc: 'Your mighty blow splinters the glacier floor! A jagged crevasse splits open between you, isolating their warriors and sending the terrified wolves fleeing into the snow!',
        rewards: {
          gold: 25,
          reputation: 15,
          morality: 1,
          items: ['Reaver Bone Spear', 'Rations (2)']
        },
        failDesc: 'The ice gives way beneath your own stance; you wrench your knee and take 4 HP damage.'
      },
      {
        id: 'thermal_blast',
        name: 'Arcane Flame Conflagration',
        skill: 'arcane_shaping',
        fallbackSkill: 'arcane_drawing',
        difficulty: 'professional',
        actionDesc: 'Ignite a blazing thermal firestorm that flash-melts the glacial frost around them',
        winTitle: 'Flash-Thaw Inferno!',
        winDesc: 'A searing wave of elemental fire evaporates the blizzard into a cloud of scalding steam. Paralyzed by the heat, the frost-reavers flee for the shelter of the mountain caves!',
        rewards: {
          gold: 35,
          reputation: 18,
          morality: 1,
          items: ['Aether Shard', 'Glacial Ice Crystal']
        },
        failDesc: 'Sudden steam blasts scald your eyes and hands, dealing 4 HP damage as your fire spell sputters.'
      },
      {
        id: 'sacred_pyre',
        name: 'Radiant Dawn Smite',
        skill: 'divine_manifestation',
        fallbackSkill: 'divine_communion',
        difficulty: 'professional',
        actionDesc: 'Channel blazing solar radiance to banish the unnatural supernatural chill',
        winTitle: 'Sunlight Across the Ice!',
        winDesc: 'A sphere of blinding sunlight dispels the frost-gloom. The wolves whimper and cower in fear of the sacred fire, while the reavers prostrate themselves before your divine aura!',
        rewards: {
          gold: 30,
          reputation: 20,
          morality: 2,
          items: ['Holy Water', 'Frost Ward Talisman']
        },
        failDesc: 'The unnatural chill snuffs your blessing; frostbite bites your fingers for 3 HP damage.'
      },
      {
        id: 'pack_negotiate',
        name: 'Parley with Reaver Chieftain',
        skill: 'negotiation',
        fallbackSkill: 'animal_rapport',
        difficulty: 'professional',
        actionDesc: 'Toss a cured dried ration to the wolves and parley with the reaver shaman in ancient frost-speech',
        winTitle: 'Truce of the Blizzard',
        winDesc: 'You show no fear and treat the beasts with reverence. The reaver chieftain nods in solemn respect, shares his hearth-salt, and grants you safe transit through the glacial pass!',
        highMarginWinDesc: 'You show no fear and treat the beasts with reverence. The reaver chieftain nods in solemn respect, shares his hearth-salt, and grants you safe transit through the glacial pass!',
        narrowWinDesc: 'The shaman agrees not to loose the pack if you offer a 15 Gold travel token (or silver rations). You pay the fee and cross the glacier unharmed.',
        rewards: {
          gold: 0,
          reputation: 15,
          morality: 1,
          items: []
        },
        tollCost: 15,
        failDesc: 'The wolves growl fiercely, taking your rations and 15 Gold while snapping at your boots for 4 HP damage!'
      }
    ]
  },
  {
    id: 'merrin_plague_carrion',
    title: 'Plague Marauders on the Abbey Trail',
    region: 'region3',
    regionName: 'Region 3: Frostfire Glacier & Abbey Roads',
    intro: 'Along the fog-bound pilgrim road winding toward Merrin Abbey, diseased marauders in shroud-cloth and plague masks step from the graves with rusted sickles, desperate for medicine, clean water, and coins.',
    approaches: [
      {
        id: 'cauterize_archery',
        name: 'Fire-Tipped Ranged Shots',
        skill: 'marksmanship',
        fallbackSkill: 'alchemy',
        difficulty: 'professional',
        actionDesc: 'Light your bodkin arrowheads with alchemical sulfur to keep the infectious carrion at bay',
        winTitle: 'Sulfur Fire Defense!',
        winDesc: 'Your sulfur arrows ignite their damp rags, filling the air with acrid smoke. Terrified of fire and cleansing steel, the infected marauders break off their assault and limp into the fens!',
        rewards: {
          gold: 25,
          reputation: 15,
          morality: 1,
          items: ['Plague Doctor Mask', 'Rations (2)']
        },
        failDesc: 'A rusted sickle grazes your collarbone, inflicting 4 HP damage and risking infection before you break free.'
      },
      {
        id: 'sweeping_defense',
        name: 'Sweeping Halberd / Melee Arc',
        skill: 'heavy_weapons',
        fallbackSkill: 'brawling',
        difficulty: 'professional',
        actionDesc: 'Sweep your heavy blade in wide, disciplined arcs to keep infected claws out of reach',
        winTitle: 'Iron Perimeter Held!',
        winDesc: 'Your disciplined martial sweeps cleave their wooden pikes and force their line backward into the ditch. Unwilling to press against cold steel, they abandon the road!',
        rewards: {
          gold: 20,
          reputation: 15,
          morality: 1,
          items: ['Marauder Rusted Sickle', 'Rations (2)']
        },
        failDesc: 'You are dragged into the contaminated mud, taking 4 HP damage before fighting your way back to your feet.'
      },
      {
        id: 'cleansing_fire',
        name: 'Arcane Cleansing Pyre',
        skill: 'arcane_shaping',
        fallbackSkill: 'alchemy',
        difficulty: 'professional',
        actionDesc: 'Weave a sterile white-hot ring of flame that scorches the ground and consumes miasma',
        winTitle: 'Purifying Barrier!',
        winDesc: 'White fire sears a twenty-foot circle around your boots, incinerating the foul spores and burning their weapon shafts. The marauders shriek in awe and retreat into the mist!',
        rewards: {
          gold: 30,
          reputation: 18,
          morality: 1,
          items: ['Aether Shard', 'Medicinal Herb Bundle']
        },
        failDesc: 'Miasma chokes your spellcast; you cough violently and suffer 3 HP damage.'
      },
      {
        id: 'sanctified_cure',
        name: 'Divine Light of Healing & Banishment',
        skill: 'divine_manifestation',
        fallbackSkill: 'healing',
        difficulty: 'professional',
        actionDesc: 'Channel the pure holy radiance of Saint Orra to soothe their fever and command them to yield',
        winTitle: 'Miraculous Grace!',
        winDesc: 'A soothing celestial glow washes over the road, cooling their fevered pustules and dispelling their bloodlust. Weeping in gratitude and awe, the marauders fall to their knees in prayer!',
        rewards: {
          gold: 25,
          reputation: 25,
          morality: 3,
          items: ['Holy Water', 'Consecrated Linen Wrap']
        },
        failDesc: 'Their diseased madness resists the prayer; an iron cleaver slashes your forearm for 3 HP damage.'
      },
      {
        id: 'medical_triage_parley',
        name: 'Offer Medicinal Herbs for Safe Passage',
        skill: 'negotiation',
        fallbackSkill: 'herbalism',
        difficulty: 'professional',
        actionDesc: 'Offer clean herbal poultices and medical advice in exchange for safe passage to the abbey',
        winTitle: 'Healer\'s Compassion',
        winDesc: 'Recognizing your genuine medical expertise, their leader breaks down in tears. In exchange for clean water and herbal poultices, they bless your journey and reveal a secret safe trail past the plague pits!',
        highMarginWinDesc: 'Recognizing your genuine medical expertise, their leader breaks down in tears. In exchange for clean water and herbal poultices, they bless your journey and reveal a secret safe trail past the plague pits!',
        narrowWinDesc: 'They accept your medical herbs, but demand a 12 Gold donation for their sick camp. You pay the charity and proceed without bloodshed.',
        rewards: {
          gold: 0,
          reputation: 18,
          morality: 2,
          items: []
        },
        tollCost: 12,
        failDesc: 'In their delirium, they rob you of 15 Gold and clean rations, dealing 4 HP damage before staggering away!'
      }
    ]
  },

  // --- REGION 4: THE SAPPHIRE DEEP & ASTRAL REACH ---
  {
    id: 'cinder_coast_corsairs',
    title: 'Boiling Sea Corsair Skiff',
    region: 'region4',
    regionName: 'Region 4: The Sapphire Deep & Sunken Ruins',
    intro: 'While sailing between island outposts in the steaming waters of the Boiling Sea, a blackened corsair catamaran with red canvas sails cuts through the steam, grappling onto your gunwales!',
    approaches: [
      {
        id: 'corsair_archery',
        name: 'Shoot Helmsman & Rigging',
        skill: 'marksmanship',
        fallbackSkill: 'acrobatics',
        difficulty: 'professional',
        actionDesc: 'Shoot flaming arrows into the corsair mainsail and pick off their helmsman',
        winTitle: 'Catamaran Ablaze!',
        winDesc: 'Your flaming bodkin sets their canvas ablaze! Out of control, their catamaran drifts into a scalding steam vent, leaving their floating cargo chests behind!',
        rewards: {
          gold: 35,
          reputation: 15,
          morality: 1,
          items: ['Corsair Cutlass', 'Rations (3)']
        },
        failDesc: 'Crossbow bolts riddle your bulwark, inflicting 5 HP damage before you cut their grappling hooks.'
      },
      {
        id: 'deck_melee',
        name: 'Boarding Deck Melee',
        skill: 'light_weapons',
        fallbackSkill: 'heavy_weapons',
        difficulty: 'professional',
        actionDesc: 'Leap onto the corsair prow with flashing blades to cut down the boarding party',
        winTitle: 'Pirate Deck Cleared!',
        winDesc: 'In a whirlwind of blade-work, you parry their cutlasses and send three pirates splashing into the warm surf. The remainder surrender their plunder!',
        rewards: {
          gold: 30,
          reputation: 15,
          morality: 1,
          items: ['Corsair Dagger', 'Rations (2)']
        },
        failDesc: 'You take a barbed harpoon blow for 5 HP damage before tumbling back onto your deck.'
      },
      {
        id: 'steam_shaping',
        name: 'Arcane Steam Inversion',
        skill: 'arcane_shaping',
        fallbackSkill: 'arcane_drawing',
        difficulty: 'professional',
        actionDesc: 'Channel the boiling sea steam into a scalding cone that blinds and cooks their deck',
        winTitle: 'Boiling Maelstrom!',
        winDesc: 'You seize the boiling sea spray, turning it into a scalding thermal wall that blinds the pirates. Screaming in agony, they cast off their lines and drift away!',
        rewards: {
          gold: 40,
          reputation: 18,
          morality: 1,
          items: ['Aether Shard', 'Volatile Brimstone']
        },
        failDesc: 'Steam scalds your own forearms, dealing 4 HP damage as you struggle to vent the heat.'
      },
      {
        id: 'sea_consecration',
        name: 'Divine Water Consecration',
        skill: 'divine_manifestation',
        fallbackSkill: 'divine_communion',
        difficulty: 'professional',
        actionDesc: 'Consecrate the churning waters to summon calming holy tides that push the corsairs away',
        winTitle: 'Calm Across the Boiling Deep!',
        winDesc: 'A circle of pristine blue water expands from your vessel, extinguishing sulfur fumes and lifting your ship safely away from the pirate skiff!',
        rewards: {
          gold: 25,
          reputation: 20,
          morality: 2,
          items: ['Holy Water', 'Rations (2)']
        },
        failDesc: 'The sulfurous heat resists your blessing; you take 4 burns damage as embers spray the deck.'
      },
      {
        id: 'corsair_bribe',
        name: 'Bargain with Pirate Captain',
        skill: 'negotiation',
        fallbackSkill: 'deception',
        difficulty: 'professional',
        actionDesc: 'Bargain using maritime law and maritime charter knowledge to negotiate safe passage',
        winTitle: 'Pirate Accord Sealed',
        winDesc: 'You convincingly bluff that your vessel is escorted by the Ignis Navy. The corsair captain dips his blade in salute and sails away without asking for a copper!',
        highMarginWinDesc: 'You convincingly bluff that your vessel is escorted by the Ignis Navy. The corsair captain dips his blade in salute and sails away without asking for a copper!',
        narrowWinDesc: 'The corsair captain agrees to leave you in one piece in exchange for a 15 Gold water-toll. You pay the toll and sail away unharmed.',
        rewards: {
          gold: 0,
          reputation: 12,
          morality: 1,
          items: []
        },
        tollCost: 15,
        failDesc: 'The captain robs you of 25 Gold and a crew member slashes your arm for 4 HP damage before letting you drift off.'
      }
    ]
  },
  {
    id: 'astral_rift_void_stalkers',
    title: 'Phase-Raiders at the Sky-Rift Ridge',
    region: 'region4',
    regionName: 'Region 4: The Astral Reach & Sky Islands',
    intro: 'While traversing the floating azure islands and suspended bridges of the Astral Reach, shimmering violet tears open in the void air. Masked phase-raiders wielding flickering aether blades step out of the static, demanding your soul shards.',
    approaches: [
      {
        id: 'phase_archery',
        name: 'Intercept Phase Step with Ranged Bodkin',
        skill: 'marksmanship',
        fallbackSkill: 'perception',
        difficulty: 'veteran',
        actionDesc: 'Anticipate their teleportation shimmer and loose an arrow where their heart will rematerialize',
        winTitle: 'Phase Spliced!',
        winDesc: 'Your arrow pierces the phase-stalker the instant he solidifies in reality! Disrupting their spatial tether, the remaining raiders collapse back into the astral rift in disarray!',
        rewards: {
          gold: 40,
          reputation: 20,
          morality: 1,
          items: ['Phase-Tether Bow', 'Astral Shard (2)']
        },
        failDesc: 'The raider flickers behind you; a violet blade slash deals 5 HP damage before you leap to safety.'
      },
      {
        id: 'void_cleave',
        name: 'Shatter Phase Blades with Cold Iron',
        skill: 'heavy_weapons',
        fallbackSkill: 'blocking',
        difficulty: 'veteran',
        actionDesc: 'Ground their unstable energy blades with a devastating cold iron cleave',
        winTitle: 'Void Severed!',
        winDesc: 'Your dense steel cleaver shatters their crystalline aether daggers with an explosive ring! The feedback knocks the phase-raiders off the gravity bridge, leaving their chests behind!',
        rewards: {
          gold: 35,
          reputation: 20,
          morality: 1,
          items: ['Phase-Forged Dagger', 'Rations (2)']
        },
        failDesc: 'Static electricity arcs into your wrists, shocking you for 5 HP damage.'
      },
      {
        id: 'astral_resonance',
        name: 'Arcane Gravity Reversal',
        skill: 'arcane_shaping',
        fallbackSkill: 'arcane_drawing',
        difficulty: 'veteran',
        actionDesc: 'Overload their localized rift anchor to reverse the gravitational pull of the sky-ledge',
        winTitle: 'Gravitational Collapse!',
        winDesc: 'You twist the regional aether currents, reversing gravity beneath their boots! The raiders are flung upward into an astral vacuum, dropping their spatial caches onto the bridge!',
        rewards: {
          gold: 45,
          reputation: 22,
          morality: 1,
          items: ['Aether Shard', 'Astral Focusing Prism']
        },
        failDesc: 'The gravitational snap tosses you against a floating monolith for 5 HP damage.'
      },
      {
        id: 'astral_consecration',
        name: 'Divine Anchor of Unyielding Reality',
        skill: 'divine_manifestation',
        fallbackSkill: 'divine_communion',
        difficulty: 'veteran',
        actionDesc: 'Slam your holy focus into the stone to anchor physical reality and seal their void rift',
        winTitle: 'Sanctified Reality Restored!',
        winDesc: 'A blinding pillar of white celestial reality slams down, closing their shimmering void rifts like iron doors. Trapped in physical form, the raiders panic and surrender their plunder!',
        rewards: {
          gold: 35,
          reputation: 25,
          morality: 2,
          items: ['Holy Water', 'Astral Ward Relic']
        },
        failDesc: 'Planar static fractures your prayer circle, shocking you for 4 HP damage.'
      },
      {
        id: 'planar_bargain',
        name: 'Bargain in Ancient Astral Cant',
        skill: 'negotiation',
        fallbackSkill: 'languages',
        difficulty: 'veteran',
        actionDesc: 'Speak the pre-cataclysm planar language to negotiate toll terms based on planar cartography',
        winTitle: 'Accord of the Void',
        winDesc: 'You recite the ancient celestial covenants that govern astral transit. Awed that a mortal knows the High Cant, the void raiders bow, grant you free passage, and mark your trail safe!',
        highMarginWinDesc: 'You recite the ancient celestial covenants that govern astral transit. Awed that a mortal knows the High Cant, the void raiders bow, grant you free passage, and mark your trail safe!',
        narrowWinDesc: 'The phase-raiders accept your words, but demand an astral transit toll of 20 Gold. You pay the crossing fee and cross the bridge unharmed.',
        rewards: {
          gold: 0,
          reputation: 20,
          morality: 1,
          items: []
        },
        tollCost: 20,
        failDesc: 'They misinterpret your dead tongue, siphon 25 Gold from your pouch, and strike you with static for 5 HP damage!'
      }
    ]
  }
];

export function getRandomTravelEncounter(regionId = 'region1') {
  const matches = TRAVEL_ENCOUNTERS.filter(e => e.region === regionId);
  if (matches.length > 0) {
    const idx = Math.floor(Math.random() * matches.length);
    return matches[idx];
  }
  return TRAVEL_ENCOUNTERS[0];
}
