// Travel & Roadside Combat Encounters between adventures.
// Features tactical physical combat (archery, stealth, heavy melee),
// arcane spell strikes, divine smiting, and diplomatic outcomes with bribes/tolls.

export const TRAVEL_ENCOUNTERS = [
  {
    id: 'highway_bandit_ambush',
    title: "Highwayman Ambush on the King's Road",
    region: 'region1',
    regionName: 'The Heartland & Ashveil',
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
    id: 'ashveil_ridge_raiders',
    title: 'Mountain Brigands at the Mist Pass',
    region: 'region1',
    regionName: 'The Heartland & Ashveil',
    intro: 'High in the jagged crags of the Mist Pass, mountain brigands drop a stone avalanche across your trail. Horns sound from the cliffs as cloaked raiders brandishing spears and slings close in.',
    approaches: [
      {
        id: 'archery_counter',
        name: 'Counter-Snipe Cliff Archers',
        skill: 'marksmanship',
        fallbackSkill: 'perception',
        difficulty: 'novice',
        actionDesc: 'Pinpoint the raider slingers along the high cliff ledge and pick them off with precision shots',
        winTitle: 'Deadeye Counter-Fire!',
        winDesc: 'Two whistling arrows strike the cliff slingers through their leather cloaks. Deprived of high ground, the remaining brigands flee across the scree!',
        rewards: {
          gold: 20,
          reputation: 10,
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
        difficulty: 'novice',
        actionDesc: 'Brace your shield to deflect tumbling boulders, then counter-attack with heavy strikes',
        winTitle: 'Unbroken Defense!',
        winDesc: 'Your shield turns aside rocks and spears without budging. You counter with a sweeping strike that breaks their spearheads and shatters their resolve!',
        rewards: {
          gold: 15,
          reputation: 10,
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
        difficulty: 'novice',
        actionDesc: 'Unleash a howling windstorm that blows rocks and raiders backward off the ledges',
        winTitle: 'Tempest Wrath!',
        winDesc: 'A shrieking vortex of gale-force mana sweeps the cliff face, hurling the brigands tumbling into snowdrifts. The path is cleared!',
        rewards: {
          gold: 25,
          reputation: 12,
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
        difficulty: 'novice',
        actionDesc: 'Chant an ancient warding litany that echoes against the mountain peaks like thunder',
        winTitle: 'Divine Awe!',
        winDesc: 'Your voice rings with supernatural power. Terrified that they have angered the mountain spirits, the raiders prostrate themselves and abandon the pass!',
        rewards: {
          gold: 20,
          reputation: 15,
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
        difficulty: 'novice',
        actionDesc: 'Brandish your battle gear and challenge their chieftain to single combat or scatter',
        winTitle: 'Iron Will Prevails',
        winDesc: 'Your terrifying fury and icy gaze shatter the chieftain\'s nerve. He bows respectfully and orders his men to clear the boulders from your path!',
        highMarginWinDesc: 'Your terrifying fury and icy gaze shatter the chieftain\'s nerve. He bows respectfully and orders his men to clear the boulders from your path!',
        narrowWinDesc: 'The chieftain hesitates and demands a 10 Gold mountain tribute to let you pass. You pay the token fee to avoid a bloody melee.',
        rewards: {
          gold: 0,
          reputation: 10,
          morality: 1,
          items: []
        },
        tollCost: 10,
        failDesc: 'They mock your threats, hurling stones that deal 3 HP damage and forcing you to surrender 15 Gold before you escape!'
      }
    ]
  },
  {
    id: 'boiling_sea_corsairs',
    title: 'Boiling Sea Corsair Skiff',
    region: 'region2',
    regionName: 'Ignis Ridge & Boiling Sea',
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
          reputation: 15,
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
          reputation: 10,
          morality: 1,
          items: []
        },
        tollCost: 15,
        failDesc: 'The captain robs you of 25 Gold and a crew member slashes your arm for 4 HP damage before letting you drift off.'
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
