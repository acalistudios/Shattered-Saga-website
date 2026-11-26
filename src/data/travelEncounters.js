import { peopleEncounterAvailable } from './peoples';

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
  },

  // --- ROAD THREATS (Hans 2026-11-18) ---
  // Several accurate, modest blows: dodging gets worse with every extra defence
  // in a round while armour soaks every hit, so heavier armour is favoured.
  // They scale with the character's level (utils/patrolEngine.js
  // scaleRoadThreat): one weak foe at level 1, more and better ones later,
  // never too hard, just wearing. Each still has non-combat ways out.
  {
    id: 'flagellant_zealots',
    scalesWithLevel: true,
    title: 'The Scourge Procession',
    region: 'region1',
    regionName: 'Region 1: Aethelgard & Heartland',
    intro: 'A procession of hooded flagellants blocks the crossroads, chanting and bleeding. Their prior points a scourge at you and names you a carrier of the Shattering. A dozen zealots close in with whips, cudgels and burning eyes.',
    approaches: [
      { id: 'zealot_sermon', name: 'Out-Preach the Prior', skill: 'divine_communion', fallbackSkill: 'performance', difficulty: 'professional', actionDesc: 'Answer scripture with scripture and turn the procession against its prior', winTitle: 'The Procession Kneels', winDesc: 'Your words cut deeper than any scourge. The zealots lower their whips and the shamed prior leads them on.', rewards: { gold: 0, reputation: 12, morality: 2, items: ['Holy Water'] }, failDesc: 'The prior shouts you down. Scourges fall on you for 4 HP damage before you break away.' },
      { id: 'zealot_read', name: 'Read the Mob', skill: 'insight', fallbackSkill: 'perception', difficulty: 'professional', actionDesc: 'Find the frightened ones at the edge of the crowd and peel them away', winTitle: 'The Crowd Thins', winDesc: 'You speak to the doubters, not the faithful. Half the procession drifts off; the rest lose heart.', rewards: { gold: 5, reputation: 8, morality: 1, items: ['Rations (2)'] }, failDesc: 'You misjudge them. The crowd surges and you take 3 HP of blows getting clear.' },
      { id: 'zealot_shieldwall', name: 'Hold the Bridge', skill: 'blocking', fallbackSkill: 'athletics', difficulty: 'professional', actionDesc: 'Plant yourself in the narrow bridge so only a few can reach you at once', winTitle: 'Unbroken', winDesc: 'Blow after blow rings off your guard until the zealots tire and the procession breaks.', rewards: { gold: 15, reputation: 10, morality: 1, items: ['Rations (2)'] }, failDesc: 'They swarm the bridge. You take 5 HP damage before forcing your way through.' },
      { id: 'zealot_fight', name: 'Break the Procession', skill: 'heavy_weapons', fallbackSkill: 'light_weapons', difficulty: 'professional', actionDesc: 'Wade into the procession and drive them off by force', winTitle: 'Scattered', winDesc: 'The zealots scatter into the fields, leaving their offerings in the road.', rewards: { gold: 20, reputation: 6, morality: 0, items: ['Rations (3)'] }, failDesc: 'There are too many. You stagger free with 6 HP damage.' },
      { id: 'zealot_slip', name: 'Slip Away in the Smoke', skill: 'stealth', fallbackSkill: 'survival', difficulty: 'novice', actionDesc: 'Use the censer smoke and the hedgerows to slip around the procession', winTitle: 'Unseen', winDesc: 'You are past the procession before the chant even falters.', rewards: { gold: 0, reputation: 2, morality: 0, items: [] }, failDesc: 'A zealot spots you in the hedge. You take 3 HP damage escaping.' },
    ],
  },
  {
    id: 'tollroad_crossbowmen',
    scalesWithLevel: true,
    title: 'The Unlawful Toll at Millers Ford',
    region: 'region1',
    regionName: 'Region 1: Aethelgard & Heartland',
    intro: 'A chain hangs across the ford. Behind a timber barricade, crossbowmen in a lord\'s faded livery level their bolts at you and name a toll no honest traveller could pay.',
    approaches: [
      { id: 'toll_pay', name: 'Pay or Haggle the Toll', skill: 'negotiation', fallbackSkill: 'deception', difficulty: 'novice', actionDesc: 'Haggle the toll down, or bluff that you ride under a lord\'s warrant', winTitle: 'Waved Through', winDesc: 'The sergeant pockets a fair coin and lowers the chain.', narrowWinDesc: 'They take their toll, but you cross unharmed.', rewards: { gold: 0, reputation: 6, morality: 0, items: [] }, tollCost: 10, failDesc: 'They take your coin and loose a bolt anyway: 4 HP damage.' },
      { id: 'toll_rush', name: 'Rush the Barricade', skill: 'athletics', fallbackSkill: 'heavy_weapons', difficulty: 'professional', actionDesc: 'Charge the barricade before they can reload', winTitle: 'Over the Wall', winDesc: 'You are over the timbers before the second volley. The crossbowmen throw down their weapons.', rewards: { gold: 20, reputation: 8, morality: 1, items: ['Crossbow Bolts (20)'] }, failDesc: 'A volley meets you halfway: 6 HP damage.' },
      { id: 'toll_shoot', name: 'Duel the Sergeant at Range', skill: 'marksmanship', fallbackSkill: 'perception', difficulty: 'professional', actionDesc: 'Find cover and pick off the sergeant across the ford', winTitle: 'Sergeant Down', winDesc: 'Your shot drops the sergeant and the rest lose their nerve.', rewards: { gold: 15, reputation: 8, morality: 1, items: ['Crossbow'] }, failDesc: 'You lose the exchange of shots: 5 HP damage.' },
      { id: 'toll_expose', name: 'Expose the False Livery', skill: 'lore', fallbackSkill: 'intimidation', difficulty: 'professional', actionDesc: 'Name the lord whose colours they wear, and the gallows that wait for toll thieves', winTitle: 'The Chain Falls', winDesc: 'The livery is stolen and they know you know it. They melt into the reeds.', rewards: { gold: 10, reputation: 12, morality: 1, items: [] }, failDesc: 'They laugh, and a bolt grazes you for 3 HP damage.' },
      { id: 'toll_ford', name: 'Find Another Crossing', skill: 'survival', fallbackSkill: 'tracking', difficulty: 'novice', actionDesc: 'Follow the river to a shallow crossing out of bowshot', winTitle: 'Around the Ford', winDesc: 'You cross a mile downstream with dry boots and a full purse.', rewards: { gold: 0, reputation: 2, morality: 0, items: [] }, failDesc: 'The current takes your footing; you lose an hour and 2 HP.' },
    ],
  },
  {
    id: 'anarchist_street_gang',
    scalesWithLevel: true,
    title: 'The Ashen Banner Riot',
    region: 'region2',
    regionName: 'Region 2: Ignis Ridge',
    intro: 'Smoke over the ridge road: an Ashen Banner gang of anarchists has torched a tax wagon. Seeing your gear, they decide you are the next symbol of tyranny and come at you with knives, clubs and slings.',
    approaches: [
      { id: 'anarchist_cause', name: 'Talk Their Language', skill: 'deception', fallbackSkill: 'negotiation', difficulty: 'professional', actionDesc: 'Convince them you hate the tax-lords as much as they do', winTitle: 'Comrade', winDesc: 'They share their wine and point you down a safe road.', rewards: { gold: 5, reputation: 6, morality: 0, items: ['Rations (2)'] }, failDesc: 'They see through you. Clubs land for 4 HP damage.' },
      { id: 'anarchist_cow', name: 'Break Their Nerve', skill: 'intimidation', fallbackSkill: 'leadership', difficulty: 'professional', actionDesc: 'Stand tall and make the ringleader back down in front of the gang', winTitle: 'Scattered', winDesc: 'The ringleader blinks first, and the gang scatters into the smoke.', rewards: { gold: 10, reputation: 8, morality: 1, items: [] }, failDesc: 'They rush you together: 5 HP damage.' },
      { id: 'anarchist_brawl', name: 'Brawl Through', skill: 'brawling', fallbackSkill: 'light_weapons', difficulty: 'professional', actionDesc: 'Meet them hand to hand and knock the fight out of them', winTitle: 'Last One Standing', winDesc: 'The last of them limps away; the stolen tax purse is yours to return or keep.', rewards: { gold: 25, reputation: 4, morality: 0, items: [] }, failDesc: 'Too many hands and knives: 6 HP damage.' },
      { id: 'anarchist_fire', name: 'Use the Fire', skill: 'survival', fallbackSkill: 'perception', difficulty: 'novice', actionDesc: 'Put the burning wagon between you and them and slip away downwind', winTitle: 'Lost in Smoke', winDesc: 'You vanish into the smoke and are miles away by dusk.', rewards: { gold: 0, reputation: 2, morality: 0, items: [] }, failDesc: 'The smoke chokes you and they catch you: 3 HP damage.' },
    ],
  },
  {
    id: 'inquisition_enforcers',
    scalesWithLevel: true,
    title: 'The Inquisition Checkpoint',
    region: 'region3',
    regionName: 'Region 3: Frostfire Glacier',
    intro: 'At a frozen pass, black-mantled Inquisition enforcers in chain and iron demand your papers and your soul. Their captain decides your elemental affinity is heresy and orders you taken alive.',
    approaches: [
      { id: 'inquisition_papers', name: 'Present Your Credentials', skill: 'deception', fallbackSkill: 'lore', difficulty: 'professional', actionDesc: 'Produce papers, seals and the right names to pass inspection', winTitle: 'Stamped and Passed', winDesc: 'The captain grudgingly stamps your papers and lets you through.', rewards: { gold: 0, reputation: 8, morality: 0, items: [] }, failDesc: 'Your papers do not satisfy. A mace strikes you for 4 HP before you flee.' },
      { id: 'inquisition_faith', name: 'Out-Argue the Captain', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'veteran', actionDesc: 'Meet the charge of heresy with true doctrine', winTitle: 'Absolved', winDesc: 'The captain cannot answer you. He blesses you, sourly, and steps aside.', rewards: { gold: 0, reputation: 14, morality: 2, items: ['Holy Water'] }, failDesc: 'Your words are named blasphemy: 5 HP damage escaping the pass.' },
      { id: 'inquisition_fight', name: 'Fight Through the Pass', skill: 'blocking', fallbackSkill: 'heavy_weapons', difficulty: 'veteran', actionDesc: 'Hold your guard against trained enforcers and force the pass', winTitle: 'The Pass Is Yours', winDesc: 'Drilled as they are, they cannot break your guard. They fall back up the mountain.', rewards: { gold: 25, reputation: 8, morality: 1, items: ['Iron Shield'] }, failDesc: 'Their drill beats your guard: 6 HP damage before you break free.' },
      { id: 'inquisition_climb', name: 'Climb Around', skill: 'athletics', fallbackSkill: 'survival', difficulty: 'professional', actionDesc: 'Leave the road and climb the ice above the checkpoint', winTitle: 'Over the Ice', winDesc: 'You come down past the checkpoint while they are still watching the road.', rewards: { gold: 0, reputation: 2, morality: 0, items: [] }, failDesc: 'You slip on the ice: 4 HP damage.' },
    ],
  },

  // --- PEOPLES: GOBLINS (data/peoples.js) ---
  // Only one of these three is ever on the road, chosen by how the goblin
  // clans see the player (goblinStance: Skritt and goblin standing).
  {
    id: 'goblin_traders',
    people: 'goblins',
    peaceful: true,
    title: 'Goblin Traders on the Hill Road',
    region: 'region1',
    regionName: 'Region 1: Aethelgard & Heartland',
    setting: 'The Goblin Wagon Camp',
    intro: 'A rattling cart of patched hides and bright scrap pulls off the hill road ahead. Three goblins lift a strip of red cloth on a stick: Skritt\'s sign. Their leader, Nettle Snagtooth, grins with every crooked tooth. "Skritt says you are a friend. Friends trade. Friends hear things."',
    gmNote: 'These goblins are friendly traders, not an ambush. They trust the player because of Skritt or past kindness. The player can trade with Nettle Snagtooth through the Trade button (the engine sets every price), swap news, or move on. If the player is kind and honest, Nettle tells them the way to Gutterstone Warren, the goblin village. End with [patrol_end: parley] when the player moves on peacefully. Attacking them is a betrayal: they flee or fight, and the clans will hear of it.',
    approaches: [
      { id: 'goblin_trade_haggle', name: 'Haggle Over Scrap', skill: 'negotiation', fallbackSkill: 'appraise', difficulty: 'novice', actionDesc: 'Trade stories and coin for the goblins\' oddest finds, haggling with good humour', winTitle: 'A Fair Bargain', winDesc: 'Nettle cackles, spits on her palm and shakes your hand. You part with a bundle of useful oddments and the feeling you were only slightly cheated.', rewards: { gold: 0, reputation: 5, morality: 1, items: ['Rations (2)', 'Torch'] }, failDesc: 'You haggle too hard. Nettle sniffs, packs up the good stuff, and sells you a single stale ration at twice its worth.' },
      { id: 'goblin_trade_news', name: 'Ask for Road News', skill: 'insight', fallbackSkill: 'languages', difficulty: 'novice', actionDesc: 'Listen to the goblins\' gossip about the roads and who is hunting whom', winTitle: 'Goblin Gossip', winDesc: 'The goblins talk over each other: which bridges are watched, which farms set dogs loose, and the hidden path to Gutterstone Warren, their village. They mark it on your map with a sticky thumb.', rewards: { gold: 0, reputation: 6, morality: 1, items: ['Healing Herbs'] }, failDesc: 'You miss the meaning under their jokes. They shrug and talk about the weather.' },
      { id: 'goblin_trade_heal', name: 'Tend the Lame Pony', skill: 'divine_manifestation', fallbackSkill: 'healing', difficulty: 'novice', actionDesc: 'Lay hands on the cart pony\'s swollen leg so the traders can travel on', winTitle: 'The Pony Walks', winDesc: 'Warm light runs down the pony\'s leg and the swelling eases. The goblins stare, then bow very low, and press a gift into your hands.', rewards: { gold: 0, reputation: 8, morality: 2, items: ['Rations (2)'] }, failDesc: 'The leg stays swollen. The goblins thank you anyway, a little sadly.' },
      { id: 'goblin_trade_ward', name: 'Ward Their Cart', skill: 'arcane_drawing', fallbackSkill: 'lore', difficulty: 'professional', actionDesc: 'Draw a small warding rune on the cart against the bandits who rob goblin traders', winTitle: 'Rune of Safe Roads', winDesc: 'The rune settles into the wood with a faint glow. Nettle traces it with a claw and promises your name will be spoken kindly in the Warren.', rewards: { gold: 0, reputation: 6, morality: 1, items: ['Torch'] }, failDesc: 'The rune smudges and fizzles. The goblins politely pretend it worked.' },
      { id: 'goblin_trade_betray', name: 'Rob the Traders', skill: 'heavy_weapons', fallbackSkill: 'intimidation', difficulty: 'novice', actionDesc: 'Turn on the goblins and take their cart by force', winTitle: 'Betrayal', winDesc: 'The goblins scatter into the gorse, leaving the cart. You have their scrap, and every clan in Aethelgard will soon know what you did.', rewards: { gold: 3, reputation: -10, morality: -3, items: ['Rusty Goblin Knife'] }, failDesc: 'Nettle is quicker than she looks. A knife nicks you for 3 HP as the cart bolts away.' },
    ],
  },
  {
    id: 'goblin_toll',
    people: 'goblins',
    title: 'The Goblin Toll at Crooked Bridge',
    region: 'region1',
    regionName: 'Region 1: Aethelgard & Heartland',
    intro: 'Half a dozen thin goblins crowd a broken footbridge, slings loaded and short spears levelled. Their chief, Rattle, holds out a bowl. "Toll! Food for the warren. Pay, and walk. No pay, no walk." They are hungry, wary and badly armed.',
    gmNote: 'These goblins do not know the player. They are hungry and nervous, not cruel: sharing food, respect or a show of strength gets the player past. Their slingers stay back; the spearmen and Rattle hold the bridge.',
    approaches: [
      { id: 'goblin_toll_rations', name: 'Share Your Food', skill: 'negotiation', fallbackSkill: 'insight', difficulty: 'novice', actionDesc: 'Offer rations from your pack as the toll and talk with the chief', winTitle: 'Fed and Friendly', winDesc: 'Rattle sniffs the rations, then grins. The goblins wave you across and one of them gives you a lucky pebble for the road.', rewards: { gold: 0, reputation: 5, morality: 1, items: ['Lucky Pebble'] }, failDesc: 'Rattle wants more than you offer. The slings start to swing and you have to pay double to cross.' },
      { id: 'goblin_toll_cow', name: 'Stare Them Down', skill: 'intimidation', fallbackSkill: 'leadership', difficulty: 'novice', actionDesc: 'Make it plain that crossing you would be a very bad idea', winTitle: 'Bridge Cleared', winDesc: 'The goblins look at each other, then at you, and melt back into the reeds. Rattle mutters something rude in goblin.', rewards: { gold: 0, reputation: 3, morality: 0, items: ['Rations (1)'] }, failDesc: 'They are too hungry to be scared. A sling stone cracks off your shoulder for 2 HP before they back down.' },
      { id: 'goblin_toll_bless', name: 'Bless the Bowl', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'professional', actionDesc: 'Pray over their empty bowl and speak of the Creator\'s care for the hungry', winTitle: 'An Unexpected Blessing', winDesc: 'The goblins go quiet as you pray. Rattle bows his head and lets you pass with no toll at all.', rewards: { gold: 0, reputation: 6, morality: 2, items: ['Rations (1)'] }, failDesc: 'They do not understand, and the bowl stays empty. You pay the toll anyway.' },
      { id: 'goblin_toll_spark', name: 'Scatter Them with Sparks', skill: 'arcane_shaping', fallbackSkill: 'arcane_drawing', difficulty: 'novice', actionDesc: 'Throw a harmless shower of loud sparks across the bridge', winTitle: 'Goblins Everywhere', winDesc: 'The sparks bang and crackle and the goblins flee squealing. You cross an empty bridge.', rewards: { gold: 0, reputation: 4, morality: 0, items: ['Rations (1)'] }, failDesc: 'The sparks fizzle and the goblins laugh. A spear jab catches you for 3 HP.' },
      { id: 'goblin_toll_fight', name: 'Force the Bridge', skill: 'light_weapons', fallbackSkill: 'brawling', difficulty: 'novice', actionDesc: 'Push across the bridge through the spearmen', winTitle: 'Bridge Taken', winDesc: 'You drive them off the bridge and into the stream. They will not forget it.', rewards: { gold: 2, reputation: 2, morality: -1, items: ['Goblin Sling'] }, failDesc: 'The spears are short but many. You take 4 HP before you break through.' },
    ],
  },
  {
    id: 'goblin_raiders',
    people: 'goblins',
    title: 'Goblin War Band in the Gorse',
    region: 'region1',
    regionName: 'Region 1: Aethelgard & Heartland',
    intro: 'A war drum thuds in the gorse. Goblins in mismatched armour rise from the bushes, shortbows drawn, while their war-boss Gash Ironear stalks forward with a jagged blade. "Ashveil killer! The clans remember. No Skritt here to save you."',
    gmNote: 'These goblins are hostile because the player finished Ashveil Keep without Skritt, or has harmed goblins before. Two archers shoot from the gorse while Gash fights in front. They can still be talked down by someone who makes real amends.',
    approaches: [
      { id: 'goblin_raid_fight', name: 'Cut Down the War-Boss', skill: 'light_weapons', fallbackSkill: 'heavy_weapons', difficulty: 'professional', actionDesc: 'Close with Gash Ironear before the archers find their range', winTitle: 'The War-Boss Falls', winDesc: 'Gash goes down and the drum stops. The rest vanish into the gorse.', rewards: { gold: 4, reputation: 5, morality: 0, items: ['Rusty Goblin Knife', 'Rations (1)'] }, failDesc: 'Arrows hiss in from the gorse while Gash slashes. You take 5 HP before you break their line.' },
      { id: 'goblin_raid_archers', name: 'Shoot the Archers', skill: 'marksmanship', fallbackSkill: 'thrown_weapons', difficulty: 'professional', actionDesc: 'Pick off the goblin archers in the gorse first', winTitle: 'Silence in the Gorse', winDesc: 'Without their archers the war band loses heart and flees.', rewards: { gold: 3, reputation: 5, morality: 0, items: ['Goblin Shortbow'] }, failDesc: 'They are better hidden than you thought. Two arrows find you for 4 HP.' },
      { id: 'goblin_raid_amends', name: 'Make Amends', skill: 'negotiation', fallbackSkill: 'insight', difficulty: 'veteran', actionDesc: 'Lower your guard, speak Skritt\'s name with respect, and offer something real to the clans', winTitle: 'A Grudging Truce', winDesc: 'Gash listens, spits, and finally lowers the blade. "Words are cheap. Remember them." The war band melts away.', rewards: { gold: 0, reputation: 8, morality: 2, items: [] }, failDesc: 'Gash does not believe you. The drum starts again and an arrow grazes you for 3 HP.' },
      { id: 'goblin_raid_ward', name: 'Ward Against Arrows', skill: 'arcane_drawing', fallbackSkill: 'arcane_shaping', difficulty: 'professional', actionDesc: 'Raise a shimmering ward and walk through the arrows', winTitle: 'Arrows Turned Aside', winDesc: 'Arrows bounce off your ward. Unnerved, the goblins break and run.', rewards: { gold: 2, reputation: 5, morality: 0, items: ['Rations (1)'] }, failDesc: 'The ward flickers. An arrow slips through for 4 HP.' },
      { id: 'goblin_raid_smite', name: 'Holy Light', skill: 'divine_manifestation', fallbackSkill: 'divine_communion', difficulty: 'professional', actionDesc: 'Blaze with holy light to blind the archers and stun the war-boss', winTitle: 'Blinded and Broken', winDesc: 'The light flares, the goblins shriek and scatter, and Gash flees with them.', rewards: { gold: 2, reputation: 5, morality: 0, items: ['Rations (1)'] }, failDesc: 'The light comes too slowly. Gash\'s blade cuts you for 4 HP.' },
    ],
  },
  // --- PEOPLES: DWARVES (data/peoples.js) ---
  // One of these three is on Ignis Ridge's roads at a time, by how the clans
  // see the player (the Obsidian Vault ending, then dwarf standing).
  {
    id: 'dwarf_caravan',
    people: 'dwarves',
    peaceful: true,
    title: 'A Dwarf Forge Caravan on the Ash Road',
    region: 'region2',
    regionName: 'Region 2: Ignis Ridge',
    setting: 'The Caravan Halt',
    intro: 'Iron-wheeled wagons grind to a halt on the ash road, pulled by shaggy mountain oxen and stacked with crates of ingots and wrapped blades. A broad dwarf woman in copper-banded braids climbs down from the lead wagon and looks you over. "Hulda Ashbraid, of Emberdeep. Word travels along the ridge about what you did at the Vault. Trade, if you like. We do not haggle with fools, so do not be one."',
    gmNote: 'These dwarves are friendly traders, not an ambush. They respect the player for saving Ignis Ridge, or for past good dealings with the clans. The player can trade with Hulda Ashbraid through the Trade button (the engine sets every price), talk, or move on. If the player is honest and respectful, Hulda tells them the way to Emberdeep Hold, the forge hold. End with [patrol_end: parley] when the player moves on peacefully. Attacking them is a betrayal: the caravan guards fight back hard, and the clans will hear of it.',
    approaches: [
      { id: 'dwarf_trade_haggle', name: 'Trade Fairly', skill: 'appraise', fallbackSkill: 'negotiation', difficulty: 'professional', actionDesc: 'Judge the quality of their wares honestly and offer a fair price', winTitle: 'A Dwarf\'s Respect', winDesc: 'Hulda grunts approval at your eye for good steel. The deal is struck with a handshake that nearly crushes your fingers.', rewards: { gold: 0, reputation: 5, morality: 1, items: ['Rations (2)', 'Torch'] }, failDesc: 'You praise a flawed blade. Hulda snorts and charges you full price for a whetstone.' },
      { id: 'dwarf_trade_smith', name: 'Talk Shop', skill: 'smithing', fallbackSkill: 'crafting', difficulty: 'professional', actionDesc: 'Talk forge-work with the caravan smiths: quench, temper and the heat of the ridge', winTitle: 'Forge-Kin', winDesc: 'The smiths warm to you at once and argue happily about tempering for an hour. Hulda marks the way to Emberdeep Hold on your map.', rewards: { gold: 0, reputation: 6, morality: 1, items: ['Iron Ingot'] }, failDesc: 'You mix up quench and temper. The smiths exchange a look and politely change the subject.' },
      { id: 'dwarf_trade_bless', name: 'Bless the Ox Team', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'novice', actionDesc: 'Pray for safe roads over the caravan and its weary oxen', winTitle: 'Safe Roads', winDesc: 'The dwarves bow their heads with you. Old ways, they say, but good ones. They send you off with bread from the ovens of the Hold.', rewards: { gold: 0, reputation: 5, morality: 2, items: ['Rations (2)'] }, failDesc: 'The words do not come. The dwarves wait, then nod kindly and roll on.' },
      { id: 'dwarf_trade_rune', name: 'Read Their Runes', skill: 'languages', fallbackSkill: 'lore', difficulty: 'professional', actionDesc: 'Read the clan runes cut into the lead wagon and greet them in their own words', winTitle: 'Clan Greeting', winDesc: 'Hulda\'s eyebrows climb. Few outsiders know the clan-cut. She tells you the road to Emberdeep and the word to give at its gate.', rewards: { gold: 0, reputation: 7, morality: 1, items: ['Torch'] }, failDesc: 'You read the runes wrongly and greet the oxen. The dwarves laugh, not unkindly.' },
      { id: 'dwarf_trade_betray', name: 'Rob the Caravan', skill: 'heavy_weapons', fallbackSkill: 'intimidation', difficulty: 'veteran', actionDesc: 'Turn on the caravan and seize a wagon by force', winTitle: 'Betrayal', winDesc: 'You drive the guards off a single wagon and take what you can carry. Every hold on the ridge will hear your name now, and not kindly.', rewards: { gold: 5, reputation: -10, morality: -3, items: ['Iron Ingot'] }, failDesc: 'Dwarf caravan guards do not run. A hammer catches your ribs for 5 HP before you break away.' },
    ],
  },
  {
    id: 'dwarf_hold_patrol',
    people: 'dwarves',
    title: 'Hold Wardens at the Ash Road Gate',
    region: 'region2',
    regionName: 'Region 2: Ignis Ridge',
    intro: 'A stone gate spans the ash road, and four dwarf hold wardens in heavy mail bar it with axes and round shields while a fifth watches from the wall with a loaded crossbow. Their captain, Warden Torvald Blackgrit, raises a gauntleted hand. "Clan road. Outsiders pay the road-tithe or state their business. Lie to me and you walk back the way you came."',
    gmNote: 'These dwarves do not know the player. They are stern but lawful: honesty, the road-tithe, or a show of skill gets the player through. They only fight if the player forces the gate. One crossbowman on the wall; the rest are axe-and-shield wardens.',
    approaches: [
      { id: 'dwarf_patrol_tithe', name: 'Pay the Road-Tithe', skill: 'negotiation', fallbackSkill: 'appraise', difficulty: 'novice', actionDesc: 'Pay the tithe and ask fair questions about the road ahead', winTitle: 'Tithe Paid', winDesc: 'Torvald counts the coin exactly, then tells you which bridges are sound. The gate swings open.', rewards: { gold: 0, reputation: 5, morality: 1, items: ['Rations (1)'] }, failDesc: 'Your coin is short. You pay in rations instead and the wardens let you through grudgingly.' },
      { id: 'dwarf_patrol_honest', name: 'State Your Business', skill: 'insight', fallbackSkill: 'leadership', difficulty: 'professional', actionDesc: 'Tell the captain plainly who you are and why you travel the ridge', winTitle: 'Plain Dealing', winDesc: 'Torvald studies your face a long moment, then nods. "Plain words. Good. Pass." No tithe asked.', rewards: { gold: 0, reputation: 6, morality: 1, items: [] }, failDesc: 'Something in your story does not sit right with him. You pay double and are watched all the way through.' },
      { id: 'dwarf_patrol_strength', name: 'Prove Your Strength', skill: 'athletics', fallbackSkill: 'brawling', difficulty: 'professional', actionDesc: 'Accept the wardens\' old challenge: lift the gate-stone that outsiders boast about', winTitle: 'The Gate-Stone Lifted', winDesc: 'The stone comes up and the wardens roar with laughter and approval. You pass free, with a slap on the back that nearly floors you.', rewards: { gold: 0, reputation: 6, morality: 0, items: ['Rations (1)'] }, failDesc: 'The stone does not move. You strain something (2 HP) and pay the tithe like everyone else.' },
      { id: 'dwarf_patrol_ward', name: 'Show Them Rune-Craft', skill: 'arcane_drawing', fallbackSkill: 'smithing', difficulty: 'professional', actionDesc: 'Draw a clean ward-rune on a warden\'s shield as proof of skill', winTitle: 'Rune-Worthy', winDesc: 'The rune burns clean and true. The wardens murmur and wave you through as a fellow craftsman.', rewards: { gold: 0, reputation: 6, morality: 0, items: [] }, failDesc: 'The rune cracks. Torvald frowns at his ruined shield paint and doubles the tithe.' },
      { id: 'dwarf_patrol_force', name: 'Force the Gate', skill: 'heavy_weapons', fallbackSkill: 'blocking', difficulty: 'veteran', actionDesc: 'Break through the shield line and past the gate', winTitle: 'Through the Gate', winDesc: 'You smash a gap in the shield wall and run the gate. The clans will remember this.', rewards: { gold: 3, reputation: 2, morality: -1, items: ['Dwarf Hand Axe'] }, failDesc: 'The shield wall holds and a crossbow bolt grazes you for 4 HP before you get through.' },
    ],
  },
  {
    id: 'dwarf_war_party',
    people: 'dwarves',
    title: 'A Dwarf War Party on the Basalt Stair',
    region: 'region2',
    regionName: 'Region 2: Ignis Ridge',
    intro: 'Boots ring on the basalt stair. A dwarf war party in blackened plate locks shields across the road, axes and hammers raised, and their thane, Ragna Coalfist, levels a great hammer at you. "Thief of the Fire Core. The clans have long memories and short patience."',
    gmNote: 'These dwarves are hostile because the player stole the Fire Core from the Obsidian Vault, or has harmed the clans before. A disciplined shield wall of axes and hammers; no archers. Ragna Coalfist is a woman (she/her). They can still be talked down by someone who offers real restitution.',
    approaches: [
      { id: 'dwarf_war_break', name: 'Break the Shield Wall', skill: 'heavy_weapons', fallbackSkill: 'brawling', difficulty: 'veteran', actionDesc: 'Drive into the shield wall and topple the thane', winTitle: 'The Thane Falls', winDesc: 'Ragna goes down hard and the war party draws back to carry her off the stair.', rewards: { gold: 4, reputation: 4, morality: 0, items: ['Dwarf Hand Axe', 'Rations (1)'] }, failDesc: 'The shield wall pushes back like a mountain. You take 6 HP before you break through.' },
      { id: 'dwarf_war_guard', name: 'Hold Your Guard', skill: 'blocking', fallbackSkill: 'light_weapons', difficulty: 'professional', actionDesc: 'Weather their hammer blows and wait for the line to open', winTitle: 'The Line Breaks', winDesc: 'Their blows break against your guard until their line falters, and you strike through the gap.', rewards: { gold: 3, reputation: 4, morality: 0, items: ['Rations (1)'] }, failDesc: 'A hammer gets past your guard for 5 HP.' },
      { id: 'dwarf_war_restitution', name: 'Offer Restitution', skill: 'negotiation', fallbackSkill: 'divine_communion', difficulty: 'veteran', actionDesc: 'Lower your weapons, admit the wrong, and offer to make it right', winTitle: 'A Debt Acknowledged', winDesc: 'Ragna lowers the hammer slowly. "A debt spoken is half paid. Pay the rest." The war party lets you pass.', rewards: { gold: 0, reputation: 8, morality: 2, items: [] }, failDesc: 'Ragna does not believe you. A hammer swing clips you for 4 HP.' },
      { id: 'dwarf_war_shape', name: 'Crack the Stair', skill: 'arcane_shaping', fallbackSkill: 'arcane_drawing', difficulty: 'veteran', actionDesc: 'Shatter the basalt under their shield wall', winTitle: 'Stone Gives Way', winDesc: 'The stair cracks and the shield wall stumbles apart. You are past before they reform.', rewards: { gold: 2, reputation: 4, morality: 0, items: ['Rations (1)'] }, failDesc: 'The basalt holds. An axe catches you for 5 HP.' },
      { id: 'dwarf_war_smite', name: 'Holy Fire', skill: 'divine_manifestation', fallbackSkill: 'divine_communion', difficulty: 'veteran', actionDesc: 'Call down blinding holy light upon the war party', winTitle: 'Blinded', winDesc: 'The light blinds the front rank and the war party falls back in disorder.', rewards: { gold: 2, reputation: 4, morality: 0, items: ['Rations (1)'] }, failDesc: 'The light comes too slowly. A hammer bruises you for 5 HP.' },
    ],
  },
  // --- PEOPLES: ELVES (data/peoples.js) ---
  // Few elves still live; their dead haunt the drowned roads of the Sapphire
  // Deep. One of these three at a time, by the Sunken Spire ending.
  {
    id: 'elf_wayfarers',
    people: 'elves',
    peaceful: true,
    title: 'Elven Wayfarers on the Lantern Causeway',
    region: 'region4',
    regionName: 'Region 4: The Sapphire Deep',
    setting: 'The Lantern Causeway',
    intro: 'Blue lanterns bob along a half-drowned causeway at dusk. A living elf woman walks among them, a satchel of sealed scrolls on her hip, and around her drift the pale shapes of elven ghosts, carrying nothing at all. She lifts a hand in greeting. "Ithiel Moonwake. The archivists say you saved what could be saved at the Spire. The dead remember that. So do I."',
    gmNote: 'These elves are friendly: a living elf scholar, Ithiel Moonwake (she/her), escorted by peaceful elven ghosts. They respect the player for preserving the Sunken Spire archive, or for past kindness to elves. The player can trade with Ithiel through the Trade button (the engine sets every price), talk, or move on. If the player is respectful, Ithiel tells them the way to the Silverlight Refuge, the last home of the living elves. End with [patrol_end: parley] when the player moves on peacefully. Attacking them is a betrayal: the ghosts rise in anger, and every elf, living or dead, will hear of it.',
    approaches: [
      { id: 'elf_wayfarer_lore', name: 'Share What You Learned', skill: 'lore', fallbackSkill: 'languages', difficulty: 'professional', actionDesc: 'Tell Ithiel what you learned in the Sunken Spire and ask about the elves before the Shattering', winTitle: 'Old Knowledge', winDesc: 'Ithiel listens closely, then answers your questions with stories no human library holds. Before you part she marks the way to the Silverlight Refuge on your map.', rewards: { gold: 0, reputation: 6, morality: 1, items: ['Common Scroll'] }, failDesc: 'You muddle the history. Ithiel corrects you gently and the conversation stays polite and short.' },
      { id: 'elf_wayfarer_trade', name: 'Trade for Scrolls', skill: 'negotiation', fallbackSkill: 'appraise', difficulty: 'novice', actionDesc: 'Trade coin and news for the scrolls in Ithiel\'s satchel', winTitle: 'A Fair Exchange', winDesc: 'Ithiel parts with a scroll and a little elven waybread, and thanks you for the news from the inland roads.', rewards: { gold: 0, reputation: 5, morality: 1, items: ['Rations (2)'] }, failDesc: 'You haggle like a fishwife. Ithiel smiles thinly and sells you only waybread.' },
      { id: 'elf_wayfarer_bless', name: 'Pray for the Dead', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'professional', actionDesc: 'Offer a prayer to the Creator for the elven dead who walk with her', winTitle: 'The Ghosts Bow', winDesc: 'The ghosts go still, then bow to you one by one. Ithiel\'s eyes shine. "They have not been prayed for in a very long time."', rewards: { gold: 0, reputation: 8, morality: 2, items: ['Healing Herbs'] }, failDesc: 'The words feel hollow and the ghosts drift on, unmoved.' },
      { id: 'elf_wayfarer_light', name: 'Mend a Lantern', skill: 'arcane_drawing', fallbackSkill: 'crafting', difficulty: 'professional', actionDesc: 'Redraw the faded rune on a guttering ghost-lantern', winTitle: 'The Lantern Burns Again', winDesc: 'The rune flares blue and the lantern steadies. The ghost who carries it touches your shoulder, cold and grateful.', rewards: { gold: 0, reputation: 6, morality: 1, items: ['Torch'] }, failDesc: 'The rune smudges and the lantern gutters. Ithiel thanks you for trying.' },
      { id: 'elf_wayfarer_betray', name: 'Rob the Scholar', skill: 'light_weapons', fallbackSkill: 'intimidation', difficulty: 'professional', actionDesc: 'Seize Ithiel\'s satchel of scrolls by force', winTitle: 'Betrayal', winDesc: 'You tear the satchel away and run as the ghosts wail behind you. No elf, living or dead, will forget this.', rewards: { gold: 4, reputation: -10, morality: -3, items: ['Common Scroll'] }, failDesc: 'The ghosts close around you, freezing cold, and drain 4 HP before you break free.' },
    ],
  },
  {
    id: 'elf_ghost_procession',
    people: 'elves',
    title: 'The Drowned Procession',
    region: 'region4',
    regionName: 'Region 4: The Sapphire Deep',
    intro: 'Fog rolls over the tide-road and a procession of elven ghosts walks out of it, robed for a funeral that ended centuries ago. They carry an empty bier. At their head the Mourning Herald, a tall ghost in a silver veil, stops before you. "You stand in the road of the dead, living one. Kneel, or turn back, or give us a reason to let you pass."',
    gmNote: 'These elven ghosts do not know the player. They are solemn, not cruel: respect, silence, prayer or the right words in old Elvish let the player pass. They only become dangerous if the player mocks or attacks the procession. Ghosts: cold touch and wailing, no bows.',
    approaches: [
      { id: 'elf_procession_kneel', name: 'Kneel in Silence', skill: 'insight', fallbackSkill: 'divine_communion', difficulty: 'novice', actionDesc: 'Step aside, kneel and keep silence while the procession passes', winTitle: 'The Dead Pass By', winDesc: 'The procession flows past you like mist. The Herald pauses, inclines its veiled head, and is gone.', rewards: { gold: 0, reputation: 5, morality: 1, items: [] }, failDesc: 'You fidget and a ghost brushes past you. The cold drains 2 HP.' },
      { id: 'elf_procession_elvish', name: 'Speak in Old Elvish', skill: 'languages', fallbackSkill: 'lore', difficulty: 'veteran', actionDesc: 'Greet the Herald in the old tongue and ask whose funeral this was', winTitle: 'A Name Remembered', winDesc: 'The Herald answers in the old tongue and tells you the name of the dead queen they mourn. The procession parts for you.', rewards: { gold: 0, reputation: 7, morality: 1, items: ['Common Scroll'] }, failDesc: 'Your Elvish is wrong. The ghosts hiss and you back away, chilled for 2 HP.' },
      { id: 'elf_procession_pray', name: 'Pray Over the Bier', skill: 'divine_communion', fallbackSkill: 'divine_manifestation', difficulty: 'professional', actionDesc: 'Lay a blessing on the empty bier for the one who was never buried', winTitle: 'Rest Offered', winDesc: 'A soft light settles on the bier. For a moment the ghosts look less lost, and they let you through.', rewards: { gold: 0, reputation: 6, morality: 2, items: [] }, failDesc: 'The blessing does not take. The Herald turns its veiled face away and you must go around.' },
      { id: 'elf_procession_ward', name: 'Ward Against Cold', skill: 'arcane_shaping', fallbackSkill: 'arcane_drawing', difficulty: 'professional', actionDesc: 'Raise a warm ward and walk calmly through the procession', winTitle: 'Through the Mist', winDesc: 'Your ward holds the cold at bay and you pass through the ghosts without harm.', rewards: { gold: 0, reputation: 3, morality: 0, items: [] }, failDesc: 'The ward fails halfway and the cold bites for 3 HP.' },
      { id: 'elf_procession_disperse', name: 'Scatter the Ghosts', skill: 'divine_manifestation', fallbackSkill: 'heavy_weapons', difficulty: 'professional', actionDesc: 'Blaze with holy light and force the dead from the road', winTitle: 'Scattered', winDesc: 'The ghosts break apart like mist in sunlight. The road is clear, and somewhere the elven dead will remember the insult.', rewards: { gold: 2, reputation: 2, morality: -1, items: [] }, failDesc: 'The ghosts wail and swarm you; the cold drains 4 HP before you break through.' },
    ],
  },
  {
    id: 'elf_ghost_wardens',
    people: 'elves',
    title: 'The Drowned Knights',
    region: 'region4',
    regionName: 'Region 4: The Sapphire Deep',
    intro: 'Water streams upward from the sea as armoured elven ghosts rise out of it, their silver plate green with weed, spectral blades drawn. Their captain, Ser Calathir the Drowned Knight, points his sword at you. "Archive-breaker. You sold our memory for coin, or let it drown. The dead have come to collect."',
    gmNote: 'These elven ghosts are hostile because the player sold or abandoned the Sunken Spire archive, or harmed elves before. Spectral knights with swords; no bows. Holy Water and blessed weapons strike them fully. They can still be calmed by someone who truly makes amends to the dead.',
    approaches: [
      { id: 'elf_wardens_fight', name: 'Cross Blades with the Captain', skill: 'light_weapons', fallbackSkill: 'heavy_weapons', difficulty: 'veteran', actionDesc: 'Fight Ser Calathir until his spectral form breaks', winTitle: 'The Knight Unmade', winDesc: 'Calathir\'s form breaks into sea-mist and the others sink back beneath the waves.', rewards: { gold: 3, reputation: 4, morality: 0, items: ['Rations (1)'] }, failDesc: 'A spectral blade passes through your guard like cold water: 5 HP.' },
      { id: 'elf_wardens_holy', name: 'Holy Light', skill: 'divine_manifestation', fallbackSkill: 'divine_communion', difficulty: 'professional', actionDesc: 'Burn the drowned knights with holy light', winTitle: 'Sent Back to the Deep', winDesc: 'The light scours the ghosts and they sink, wailing, into the sea.', rewards: { gold: 2, reputation: 4, morality: 0, items: [] }, failDesc: 'The light flickers. A ghost blade chills you for 4 HP.' },
      { id: 'elf_wardens_amends', name: 'Make Amends to the Dead', skill: 'divine_communion', fallbackSkill: 'negotiation', difficulty: 'veteran', actionDesc: 'Lay down your weapons, confess what you did to the archive, and swear to make it right', winTitle: 'The Dead Wait', winDesc: 'Calathir lowers his blade. "Swear it again where the archive drowned." The knights sink back into the sea and let you pass.', rewards: { gold: 0, reputation: 8, morality: 2, items: [] }, failDesc: 'Calathir does not believe you. His blade touches you, cold as the deep, for 4 HP.' },
      { id: 'elf_wardens_ward', name: 'Ward and Retreat', skill: 'arcane_drawing', fallbackSkill: 'athletics', difficulty: 'professional', actionDesc: 'Draw a ward across the causeway and fall back behind it', winTitle: 'Held at the Line', winDesc: 'The ghosts cannot cross your ward. They glare and sink back beneath the waves.', rewards: { gold: 0, reputation: 3, morality: 0, items: [] }, failDesc: 'The ward cracks and a ghost blade finds you for 4 HP.' },
      { id: 'elf_wardens_guard', name: 'Hold Your Ground', skill: 'blocking', fallbackSkill: 'survival', difficulty: 'veteran', actionDesc: 'Stand fast against the ghost knights until dawn weakens them', winTitle: 'Dawn Comes', winDesc: 'You hold until the sun rises and the drowned knights fade with the night.', rewards: { gold: 2, reputation: 4, morality: 0, items: ['Rations (1)'] }, failDesc: 'The night is long. You take 6 HP of cold wounds before dawn.' },
    ],
  },

  // --- PEOPLES: TIDE-FOLK (data/peoples.js) ---
  // Merfolk who walk on land. One of these three at a time, by the Drowned
  // Market ending.
  {
    id: 'tidefolk_traders',
    people: 'tidefolk',
    peaceful: true,
    title: 'Tide-Folk Salvagers at the Reef Landing',
    region: 'region4',
    regionName: 'Region 4: The Sapphire Deep',
    setting: 'The Reef Landing',
    intro: 'A long low boat noses onto a shingle beach, heaped with nets, salvage and baskets of shells. A young tide-folk man with sea-green scales on his cheeks and webbed hands vaults over the side and grins. "Coral Venn. The drowned market says you dealt fairly with the dead. Fair dealers are welcome on our tides. Want to see what the sea gave up this week?"',
    gmNote: 'These tide-folk are friendly salvage traders, not an ambush. They respect the player for dealing fairly with the Drowned Market, or for past kindness to tide-folk. The player can trade with Coral Venn through the Trade button (the engine sets every price), talk, or move on. If the player is honest, Coral tells them the way to Pearlgate Grotto, the tide-folk town. End with [patrol_end: parley] when the player moves on peacefully. Attacking them is a betrayal: they flee into the sea, and every reef will hear of it.',
    approaches: [
      { id: 'tide_trade_haggle', name: 'Haggle Over Salvage', skill: 'appraise', fallbackSkill: 'negotiation', difficulty: 'novice', actionDesc: 'Sort the good salvage from the junk and strike a fair price', winTitle: 'Good Salvage', winDesc: 'Coral laughs at how quickly you spot the real silver. You part with useful finds and a new friend.', rewards: { gold: 0, reputation: 5, morality: 1, items: ['Rope (50 ft)'] }, failDesc: 'You pay silver for a tarnished tin cup. Coral is too polite to say so.' },
      { id: 'tide_trade_sea', name: 'Swap Sea-Lore', skill: 'survival', fallbackSkill: 'lore', difficulty: 'professional', actionDesc: 'Trade knowledge of tides, storms and safe harbours', winTitle: 'Tide-Wise', winDesc: 'Coral is delighted to meet a landwalker who knows the tides. He tells you the hidden channel to Pearlgate Grotto.', rewards: { gold: 0, reputation: 6, morality: 1, items: ['Rations (2)'] }, failDesc: 'You mix up the spring and neap tides. Coral grins and explains them slowly.' },
      { id: 'tide_trade_heal', name: 'Tend a Net-Cut', skill: 'healing', fallbackSkill: 'herbalism', difficulty: 'novice', actionDesc: 'Bind the deep cut on a young salvager\'s webbed hand', winTitle: 'A Clean Bandage', winDesc: 'The cut is cleaned and bound. The tide-folk press a handful of pearls-in-the-rough into your hand.', rewards: { gold: 2, reputation: 6, morality: 2, items: [] }, failDesc: 'The bandage slips. They thank you anyway and bind it themselves.' },
      { id: 'tide_trade_bless', name: 'Bless the Boat', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'novice', actionDesc: 'Pray for the boat and its crew on their next voyage', winTitle: 'Safe Waters', winDesc: 'The tide-folk join the prayer in their own rippling tongue and give you dried fish for the road.', rewards: { gold: 0, reputation: 5, morality: 2, items: ['Rations (2)'] }, failDesc: 'The prayer is awkward. They nod politely and push off.' },
      { id: 'tide_trade_betray', name: 'Rob the Boat', skill: 'light_weapons', fallbackSkill: 'intimidation', difficulty: 'novice', actionDesc: 'Turn on the salvagers and take their haul', winTitle: 'Betrayal', winDesc: 'The tide-folk dive into the surf and leave the boat to you. Every reef will know your face now.', rewards: { gold: 4, reputation: -10, morality: -3, items: ['Rope (50 ft)'] }, failDesc: 'Coral\'s knife is quicker than you think. You take 3 HP as they push off.' },
    ],
  },
  {
    id: 'tidefolk_reef_toll',
    people: 'tidefolk',
    title: 'The Reef Wardens\' Passage',
    region: 'region4',
    regionName: 'Region 4: The Sapphire Deep',
    intro: 'Your path along the reef narrows to a single rock bridge over churning water. Four tide-folk reef wardens rise from the surf to bar it, coral-tipped tridents levelled, and their leader, Warden Kailo Deepcurrent, speaks in a voice like a breaking wave. "This is reef-road, landwalker. Land folk pay the tide-due, or swim."',
    gmNote: 'These tide-folk do not know the player. They are proud and territorial, not cruel: the tide-due, respect for the sea, or a show of skill gets the player across. They fight only if the player forces the bridge. Tridents and nets; no bows.',
    approaches: [
      { id: 'tide_toll_pay', name: 'Pay the Tide-Due', skill: 'negotiation', fallbackSkill: 'appraise', difficulty: 'novice', actionDesc: 'Pay the due and ask about the reef ahead', winTitle: 'Due Paid', winDesc: 'Kailo weighs the coin, nods, and warns you about the rip tide past the third rock.', rewards: { gold: 0, reputation: 5, morality: 1, items: [] }, failDesc: 'You are short. The wardens take rations instead and let you pass with a scowl.' },
      { id: 'tide_toll_swim', name: 'Take the Swimmer\'s Challenge', skill: 'athletics', fallbackSkill: 'survival', difficulty: 'professional', actionDesc: 'Swim the channel beside the bridge, as the wardens dare you to', winTitle: 'Strong Swimmer', winDesc: 'You haul yourself out on the far side to whistles of approval. No due is asked.', rewards: { gold: 0, reputation: 6, morality: 0, items: [] }, failDesc: 'The current drags you under for a moment. You come up coughing, 3 HP worse, and pay the due anyway.' },
      { id: 'tide_toll_respect', name: 'Honour the Sea', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'professional', actionDesc: 'Pour out fresh water to the sea and speak the Creator\'s blessing on the reef', winTitle: 'The Sea Honoured', winDesc: 'The wardens lower their tridents. Few landwalkers think to honour the sea. You pass freely.', rewards: { gold: 0, reputation: 6, morality: 1, items: [] }, failDesc: 'They see it as empty show. The due is doubled.' },
      { id: 'tide_toll_trick', name: 'Talk Your Way Past', skill: 'deception', fallbackSkill: 'performance', difficulty: 'professional', actionDesc: 'Claim to carry a message for the Pearlgate elders', winTitle: 'Urgent Message', winDesc: 'Kailo hesitates, then waves you through. Messages to the elders are not to be delayed.', rewards: { gold: 0, reputation: 2, morality: -1, items: [] }, failDesc: 'Kailo sees through it. A trident butt to the ribs costs you 2 HP, and you pay double.' },
      { id: 'tide_toll_force', name: 'Force the Bridge', skill: 'heavy_weapons', fallbackSkill: 'blocking', difficulty: 'professional', actionDesc: 'Push through the tridents and across the rock bridge', winTitle: 'Bridge Forced', winDesc: 'You break through and across. The wardens dive into the surf, and the reef will remember.', rewards: { gold: 2, reputation: 2, morality: -1, items: ['Coral Trident'] }, failDesc: 'A net tangles your legs and a trident jab costs you 4 HP before you get across.' },
    ],
  },
  {
    id: 'tidefolk_raiders',
    people: 'tidefolk',
    title: 'Tide-Folk Raiders in the Shallows',
    region: 'region4',
    regionName: 'Region 4: The Sapphire Deep',
    intro: 'The tide pulls back too fast, and tide-folk raiders surge out of the shallows with weighted nets and barbed tridents, while two more hurl harpoons from a rock behind them. Their leader, Skarra the Drowner, bares sharp teeth. "Grave-robber. You stole from the drowned market. The sea wants its due, and so do we."',
    gmNote: 'These tide-folk are hostile because the player robbed the Drowned Market dead, or has harmed tide-folk before. Net-throwers and tridents up close; two harpoon throwers on a rock. Skarra is a woman (she/her). They can still be calmed by someone who returns what was stolen or makes real amends.',
    approaches: [
      { id: 'tide_raid_fight', name: 'Fight Out of the Nets', skill: 'light_weapons', fallbackSkill: 'escapology', difficulty: 'professional', actionDesc: 'Cut free of the nets and drive at Skarra', winTitle: 'The Drowner Retreats', winDesc: 'Skarra takes a wound and dives into the surf; her raiders follow.', rewards: { gold: 3, reputation: 4, morality: 0, items: ['Coral Trident'] }, failDesc: 'A net drags you down in the surf and a trident finds you for 5 HP.' },
      { id: 'tide_raid_harpoons', name: 'Silence the Harpooners', skill: 'marksmanship', fallbackSkill: 'thrown_weapons', difficulty: 'professional', actionDesc: 'Pick off the harpoon throwers on the rock first', winTitle: 'Harpoons Silenced', winDesc: 'With the harpooners down, the raiders lose heart and slip back into the sea.', rewards: { gold: 2, reputation: 4, morality: 0, items: ['Rations (1)'] }, failDesc: 'A harpoon grazes your side for 4 HP.' },
      { id: 'tide_raid_amends', name: 'Return What Was Taken', skill: 'negotiation', fallbackSkill: 'divine_communion', difficulty: 'veteran', actionDesc: 'Lower your weapons and offer to return what was stolen from the drowned', winTitle: 'A Debt to the Sea', winDesc: 'Skarra studies you a long moment. "Bring it to the water at dawn." The raiders sink back into the surf.', rewards: { gold: 0, reputation: 8, morality: 2, items: [] }, failDesc: 'Skarra laughs. A net flies and you take 3 HP struggling free.' },
      { id: 'tide_raid_shape', name: 'Turn the Tide', skill: 'arcane_shaping', fallbackSkill: 'arcane_drawing', difficulty: 'veteran', actionDesc: 'Push the water back and leave the raiders stranded on the sand', winTitle: 'Stranded', winDesc: 'The sea draws back at your command and the raiders flounder on the sand, then flee into the deep.', rewards: { gold: 2, reputation: 4, morality: 0, items: [] }, failDesc: 'The water surges the wrong way and knocks you down for 4 HP.' },
      { id: 'tide_raid_smite', name: 'Holy Light', skill: 'divine_manifestation', fallbackSkill: 'divine_communion', difficulty: 'professional', actionDesc: 'Blind the raiders with holy light', winTitle: 'Blinded', winDesc: 'The light flares off the water and the raiders scatter into the waves.', rewards: { gold: 2, reputation: 4, morality: 0, items: [] }, failDesc: 'The light is too slow. A trident catches you for 4 HP.' },
    ],
  },
  // --- MAGIC BANDITS (Hans, 2026-11-25): any region, higher levels ---
  // Road threats with a spellcaster: the caster's spells go through armour
  // and are met with Resist (Willpower), so heavy armour alone is not enough.
  {
    id: 'hedge_mage_brigands',
    scalesWithLevel: true,
    minLevel: 5,
    title: 'Hedge-Mage Brigands',
    region: 'any',
    regionName: 'Any region (from level 5)',
    intro: 'The road ahead shimmers like heat haze, and the air smells of struck flint. A brigand in a patched coat steps out with a drawn blade, and behind him a hedge-mage in ragged robes traces burning sigils in the air, a bolt of crackling force already gathering in her palm. "Purse, pack and that fancy gear," the brigand says. "She does not miss."',
    gmNote: 'A brigand with a blade and a hedge-mage (she/her) who casts arcane bolts. The brigand\'s attacks are blade strikes; the hedge-mage\'s are spells. She casts only every other round: one round drawing the sigil (when a hit, a feint or a ward stops it), the next round casting. For every spell, emit the [enemy_attack] with "vs Ward" so the player resists with Willpower (armour does not stop magic). Breaking her concentration (a hit, a feint, a ward, silence) stops a spell. They are robbers, not fanatics: they flee if the mage is downed.',
    approaches: [
      { id: 'hedge_rush_mage', name: 'Rush the Mage', skill: 'athletics', fallbackSkill: 'light_weapons', difficulty: 'veteran', actionDesc: 'Charge past the brigand and break the hedge-mage\'s concentration before the bolt lands', winTitle: 'Spell Broken', winDesc: 'You reach the mage as the bolt fizzles in her hand. With their caster down, the brigands bolt for the trees.', rewards: { gold: 10, reputation: 6, morality: 1, items: ['Common Scroll', 'Rations (1)'] }, failDesc: 'The bolt hits you square in the chest, armour or no: 5 HP.' },
      { id: 'hedge_counterward', name: 'Counter-Ward', skill: 'arcane_drawing', fallbackSkill: 'arcane_shaping', difficulty: 'veteran', actionDesc: 'Draw a counter-ward that turns her bolts back on her', winTitle: 'Bolts Turned', winDesc: 'Her next bolt strikes your ward and rebounds. She shrieks and runs, and her partner follows.', rewards: { gold: 8, reputation: 6, morality: 0, items: ['Common Scroll'] }, failDesc: 'Your ward is a heartbeat slow. A bolt burns through it for 4 HP.' },
      { id: 'hedge_smite', name: 'Holy Light', skill: 'divine_manifestation', fallbackSkill: 'divine_communion', difficulty: 'professional', actionDesc: 'Blind both robbers with a flare of holy light before the spell is cast', winTitle: 'Blinded', winDesc: 'The light blinds them both and the half-cast spell collapses. They stumble away into the trees.', rewards: { gold: 6, reputation: 5, morality: 0, items: ['Rations (1)'] }, failDesc: 'The light comes too slowly. The bolt finds you for 4 HP.' },
      { id: 'hedge_shoot', name: 'Shoot the Caster', skill: 'marksmanship', fallbackSkill: 'thrown_weapons', difficulty: 'professional', actionDesc: 'Put an arrow or knife into the hedge-mage before she finishes the sigil', winTitle: 'Sigil Broken', winDesc: 'Your shot spoils her sigil and drops her to one knee. The brigand drags her away.', rewards: { gold: 8, reputation: 5, morality: 0, items: ['Common Scroll'] }, failDesc: 'You miss. The bolt does not: 4 HP.' },
      { id: 'hedge_bargain', name: 'Make Them a Better Offer', skill: 'negotiation', fallbackSkill: 'deception', difficulty: 'veteran', actionDesc: 'Point out that robbing you will cost them more than it pays, and offer a small toll instead', winTitle: 'A Reasonable Toll', winDesc: 'The two exchange a look. A little coin changes hands and they wave you on, the mage still watching.', rewards: { gold: 0, reputation: 3, morality: 0, items: [] }, failDesc: 'They are not interested in reason. The bolt is already flying: 3 HP.' },
    ],
  },
  {
    id: 'hooked_eye_cultists',
    scalesWithLevel: true,
    minLevel: 8,
    title: 'The Cult of the Hooked Eye',
    region: 'any',
    regionName: 'Any region (from level 8)',
    intro: 'Black candles burn at a crossroads where no one should have lit them. Cultists in red-lined black robes wait in a ring, each wearing a black iron amulet shaped like a hooked eye. A blade-adept with a curved knife steps forward, and behind him a cult priest raises a bowl of dark blood and begins to chant. Your blood answers with a sick, pulling ache.',
    gmNote: 'Demon-pact cultists of the Hooked Eye (the same hooked-eye amulet found in Ashveil Keep): a blade-adept with a curved knife and a cult priest who casts curses through a demonic pact. The adept\'s attacks are knife strikes; the priest\'s are curses. He curses only every other round: one round chanting (when a hit or Holy Water stops it), the next round cursing. For every curse, emit the [enemy_attack] with "vs Ward" so the player resists with Willpower (armour does not stop it). Holy Water splashed on the priest or on the blood bowl breaks the chant for two rounds; divine power hurts the priest normally. Their power comes from unnamed demons, never from any god. They fight to the death only if the priest stands; if the priest falls, the rest scatter.',
    approaches: [
      { id: 'cult_holy_water', name: 'Break the Chant', skill: 'divine_manifestation', fallbackSkill: 'divine_communion', difficulty: 'veteran', actionDesc: 'Hurl Holy Water or holy light into the blood bowl and break the demonic chant', winTitle: 'The Chant Breaks', winDesc: 'The blood bowl hisses and cracks. The priest staggers, cut off from whatever answered him, and the cult flees into the dark.', rewards: { gold: 10, reputation: 8, morality: 2, items: ['Holy Water'] }, failDesc: 'The chant rises. A curse knots through your blood for 5 HP.' },
      { id: 'cult_strike_priest', name: 'Cut Down the Priest', skill: 'light_weapons', fallbackSkill: 'heavy_weapons', difficulty: 'veteran', actionDesc: 'Get past the blade-adept and strike the priest before the curse is finished', winTitle: 'The Priest Falls', winDesc: 'The priest falls across his candles and the ring breaks. The adept runs.', rewards: { gold: 12, reputation: 7, morality: 1, items: ['Rations (1)'] }, failDesc: 'The adept\'s knife and the priest\'s curse both land: 6 HP.' },
      { id: 'cult_resist', name: 'Steel Your Will', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'veteran', actionDesc: 'Pray to the Creator and hold your mind and blood against the curse', winTitle: 'The Curse Fails', winDesc: 'The curse slides off a will braced by prayer. Shaken, the cultists lose their nerve and scatter.', rewards: { gold: 6, reputation: 6, morality: 2, items: [] }, failDesc: 'Your will bends. The curse takes 4 HP from you before it breaks.' },
      { id: 'cult_counterspell', name: 'Unweave the Curse', skill: 'arcane_drawing', fallbackSkill: 'lore', difficulty: 'legendary', actionDesc: 'Trace the shape of the demonic sigil and unweave it as it forms', winTitle: 'Unwoven', winDesc: 'The sigil unravels under your hand and the backlash throws the priest to the ground. The ring breaks and flees.', rewards: { gold: 10, reputation: 7, morality: 1, items: ['Common Scroll'] }, failDesc: 'The sigil is stranger than anything you have studied. It burns through your ward for 5 HP.' },
      { id: 'cult_flee', name: 'Break the Circle and Run', skill: 'athletics', fallbackSkill: 'acrobatics', difficulty: 'professional', actionDesc: 'Kick over the candles to break their circle and run before the curse is cast', winTitle: 'Out of the Ring', winDesc: 'The candles scatter, the circle breaks and you are away down the road before they can begin again.', rewards: { gold: 0, reputation: 3, morality: 0, items: [] }, failDesc: 'A curse catches you in the back as you run: 3 HP.' },
    ],
  },
  // --- PEOPLES: SKY-FOLK (data/peoples.js) ---
  // Light-boned, feather-crested people of the Astral Reach. One of these
  // three at a time, by the Threads of the Astral Sky ending.
  {
    id: 'skyfolk_skiff_traders',
    people: 'skyfolk',
    peaceful: true,
    title: 'A Sky-Folk Cloud-Skiff at the Mooring Post',
    region: 'region4',
    regionName: 'Region 4: The Astral Reach',
    setting: 'The Mooring Post',
    intro: 'A narrow cloud-skiff with patched sky-silk sails drifts down to a mooring post on the bridge ahead and ties off with a snap of rope. A lean sky-folk man with a crest of grey-barred feathers leans over the rail and grins. "Talon Ashwing. The winds say you kept the threads from tearing up there. Sky-folk do not forget a favour. Trade? I have wind-glass, arrows and news from three isles."',
    gmNote: 'These sky-folk are friendly traders, not an ambush. They respect the player for stabilizing or releasing the Focal Core, or for past kindness to sky-folk. The player can trade with Talon Ashwing (he/him) through the Trade button (the engine sets every price), talk, or move on. If the player is honest, Talon tells them how to reach Hightether Aerie, the sky-folk town. End with [patrol_end: parley] when the player moves on peacefully. Attacking them is a betrayal: the skiff casts off and every isle will hear of it.',
    approaches: [
      { id: 'sky_trade_haggle', name: 'Trade for Wind-Glass', skill: 'appraise', fallbackSkill: 'negotiation', difficulty: 'novice', actionDesc: 'Look over the wind-glass, arrows and sky-silk and strike a fair price', winTitle: 'Fair Winds', winDesc: 'Talon laughs and throws in a coil of sky-silk rope for luck. You part with good gear and a friend on the winds.', rewards: { gold: 0, reputation: 5, morality: 1, items: ['Arrows (20)'] }, failDesc: 'You overpay for a cracked wind-glass. Talon is too cheerful to notice.' },
      { id: 'sky_trade_winds', name: 'Read the Winds Together', skill: 'survival', fallbackSkill: 'perception', difficulty: 'professional', actionDesc: 'Talk winds, weather and safe crossings between the isles', winTitle: 'Wind-Wise', winDesc: 'Talon is delighted. He sketches the wind-road to Hightether Aerie on the back of your map.', rewards: { gold: 0, reputation: 6, morality: 1, items: ['Rations (2)'] }, failDesc: 'You read the clouds backwards. Talon explains them, patiently, twice.' },
      { id: 'sky_trade_mend', name: 'Mend a Torn Sail', skill: 'crafting', fallbackSkill: 'arcane_drawing', difficulty: 'professional', actionDesc: 'Help stitch a torn sky-silk sail before the next gust', winTitle: 'Sail Mended', winDesc: 'The sail fills cleanly. The crew whoop and press a small wind-glass charm into your hand.', rewards: { gold: 2, reputation: 6, morality: 1, items: [] }, failDesc: 'Your stitches pucker. The crew redo them quietly and thank you anyway.' },
      { id: 'sky_trade_bless', name: 'Bless the Skiff', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'novice', actionDesc: 'Pray for fair winds and safe moorings for the crew', winTitle: 'Fair Winds Blessed', winDesc: 'The sky-folk bow their crests with you, an old custom among them, and share dried skyfruit for the road.', rewards: { gold: 0, reputation: 5, morality: 2, items: ['Rations (2)'] }, failDesc: 'The words do not come. The crew nod kindly and cast off.' },
      { id: 'sky_trade_betray', name: 'Seize the Skiff', skill: 'light_weapons', fallbackSkill: 'intimidation', difficulty: 'professional', actionDesc: 'Turn on the traders and take their cargo', winTitle: 'Betrayal', winDesc: 'The crew leap from the rail and glide away on spread cloaks, leaving the cargo. Every isle will know your face now.', rewards: { gold: 4, reputation: -10, morality: -3, items: ['Arrows (20)'] }, failDesc: 'An arrow from the rigging grazes you for 3 HP as the skiff casts off.' },
    ],
  },
  {
    id: 'skyfolk_wind_wardens',
    people: 'skyfolk',
    title: 'The Wind Wardens of the High Bridge',
    region: 'region4',
    regionName: 'Region 4: The Astral Reach',
    intro: 'A suspension bridge sways above the clouds, and three sky-folk wardens glide down onto it on outspread wing-cloaks: two land on the ropes above you with bows drawn, and their leader, Warden Aeris Stormcrest, lands in front of you with a long spear. "Wind-road, groundling. Pay the wind-toll, or show us you can walk it without falling."',
    gmNote: 'These sky-folk do not know the player. They are proud and wary of groundlings, not cruel: the wind-toll, courage on the bridge, or respect for the winds gets the player across. Two archers on the bridge ropes, the warden with a spear in front. They fight only if the player forces the bridge.',
    approaches: [
      { id: 'sky_warden_toll', name: 'Pay the Wind-Toll', skill: 'negotiation', fallbackSkill: 'appraise', difficulty: 'novice', actionDesc: 'Pay the toll and ask about the crossing ahead', winTitle: 'Toll Paid', winDesc: 'Aeris counts the coin and warns you about the gust that comes every hundred heartbeats. The bridge is yours.', rewards: { gold: 0, reputation: 5, morality: 1, items: [] }, failDesc: 'You are short of coin. You pay in rations and are watched all the way across.' },
      { id: 'sky_warden_walk', name: 'Walk the Rope', skill: 'acrobatics', fallbackSkill: 'athletics', difficulty: 'professional', actionDesc: 'Accept the wardens\' dare: cross on the guide-rope instead of the planks', winTitle: 'Sure-Footed', winDesc: 'You cross on the rope without a wobble. The wardens whistle in approval and wave you through free.', rewards: { gold: 0, reputation: 6, morality: 0, items: [] }, failDesc: 'You slip and catch the rope with one hand, wrenching your shoulder for 3 HP, and pay the toll anyway.' },
      { id: 'sky_warden_respect', name: 'Honour the Winds', skill: 'divine_communion', fallbackSkill: 'insight', difficulty: 'professional', actionDesc: 'Bow to the winds as sky-folk do and speak a blessing on the bridge', winTitle: 'The Winds Honoured', winDesc: 'Aeris lowers her spear in surprise. Few groundlings know the custom. You pass freely.', rewards: { gold: 0, reputation: 6, morality: 1, items: [] }, failDesc: 'You get the bow wrong and the archers laugh. The toll is doubled.' },
      { id: 'sky_warden_ward', name: 'Calm the Gusts', skill: 'arcane_shaping', fallbackSkill: 'arcane_drawing', difficulty: 'professional', actionDesc: 'Still the gusts around the bridge so all of you can cross safely', winTitle: 'Still Air', winDesc: 'The wind drops to a whisper. Impressed, the wardens escort you across themselves.', rewards: { gold: 0, reputation: 6, morality: 0, items: [] }, failDesc: 'A gust slips your control and slams you into the ropes for 3 HP.' },
      { id: 'sky_warden_force', name: 'Force the Bridge', skill: 'blocking', fallbackSkill: 'light_weapons', difficulty: 'professional', actionDesc: 'Shield yourself against the archers and push past the warden', winTitle: 'Across', winDesc: 'You shoulder past Aeris and run the bridge under arrow fire. The isles will hear of it.', rewards: { gold: 2, reputation: 2, morality: -1, items: ['Arrows (20)'] }, failDesc: 'Two arrows find you before you reach the far side: 5 HP.' },
    ],
  },
  {
    id: 'skyfolk_storm_raiders',
    people: 'skyfolk',
    title: 'Storm Raiders Out of the Clouds',
    region: 'region4',
    regionName: 'Region 4: The Astral Reach',
    intro: 'The wind turns cold and wrong. Sky-folk raiders drop out of a storm cloud on wing-cloaks, three archers loosing as they glide, and their captain, Storm-Captain Harrow, lands on the bridge before you with a javelin in each hand. "Core-thief. You tore the sky\'s heart out for yourself. The winds want it back, and so do we."',
    gmNote: 'These sky-folk are hostile because the player claimed the Focal Core for themselves, or has harmed sky-folk before. Three archers gliding and shooting from above, and Storm-Captain Harrow (she/her) with javelins on the bridge. They can still be calmed by someone who truly makes amends to the sky.',
    approaches: [
      { id: 'sky_raid_cover', name: 'Take Cover and Fight', skill: 'blocking', fallbackSkill: 'light_weapons', difficulty: 'veteran', actionDesc: 'Shield yourself from the arrows and close with the captain', winTitle: 'The Captain Withdraws', winDesc: 'You drive Harrow back to the bridge rail; wounded, she leaps off on her wing-cloak and her raiders follow.', rewards: { gold: 3, reputation: 4, morality: 0, items: ['Arrows (20)'] }, failDesc: 'Arrows rain from above. You take 5 HP before you reach her.' },
      { id: 'sky_raid_shoot', name: 'Shoot Them Down', skill: 'marksmanship', fallbackSkill: 'thrown_weapons', difficulty: 'veteran', actionDesc: 'Pick the gliding archers out of the air', winTitle: 'Out of the Sky', winDesc: 'Two archers spiral away wounded. Harrow calls the retreat.', rewards: { gold: 3, reputation: 4, morality: 0, items: ['Arrows (20)'] }, failDesc: 'They are fast in the wind. A javelin catches you for 5 HP.' },
      { id: 'sky_raid_wind', name: 'Turn the Wind', skill: 'arcane_shaping', fallbackSkill: 'arcane_drawing', difficulty: 'veteran', actionDesc: 'Throw the gale back at the gliders and scatter them', winTitle: 'Blown Away', winDesc: 'Your gale flings the gliders across the sky. By the time they recover, you are gone.', rewards: { gold: 2, reputation: 4, morality: 0, items: [] }, failDesc: 'The storm fights you. A javelin finds you for 4 HP.' },
      { id: 'sky_raid_amends', name: 'Make Amends to the Sky', skill: 'negotiation', fallbackSkill: 'divine_communion', difficulty: 'veteran', actionDesc: 'Lower your weapons and swear to return what was taken from the sky', winTitle: 'Words on the Wind', winDesc: 'Harrow studies you a long moment. "Words blow away. Prove them." The raiders rise back into the cloud.', rewards: { gold: 0, reputation: 8, morality: 2, items: [] }, failDesc: 'Harrow does not believe you. A javelin grazes you for 4 HP.' },
      { id: 'sky_raid_light', name: 'Holy Light', skill: 'divine_manifestation', fallbackSkill: 'divine_communion', difficulty: 'professional', actionDesc: 'Blaze with holy light to blind the gliding archers', winTitle: 'Blinded', winDesc: 'The light dazzles the gliders and they veer away into the clouds.', rewards: { gold: 2, reputation: 4, morality: 0, items: [] }, failDesc: 'The light comes too slowly. An arrow finds you for 4 HP.' },
    ],
  },
];

/**
 * A random road encounter for a region (minLevel, if any, gates an encounter
 * by level; region 'any' walks every region's roads). A people's encounters only appear in the form that matches how
 * that people sees the character (data/peoples.js).
 */
export function getRandomTravelEncounter(regionId = 'region1', level = 1, character = null) {
  const matches = TRAVEL_ENCOUNTERS.filter(e => (e.region === regionId || e.region === 'any') && (e.minLevel || 1) <= level
    && peopleEncounterAvailable(e, character));
  if (matches.length > 0) {
    const idx = Math.floor(Math.random() * matches.length);
    return matches[idx];
  }
  return TRAVEL_ENCOUNTERS[0];
}
