// Journal notes for adventure items (Hans, 2026-11-12): once the player
// obtains one of an adventure's authored items, the journal's Discoveries
// list says plainly what it is for. Keyed by exact item name.

export const ITEM_NOTES = {
  // Ashveil Keep
  "Creator's Binding Seal Tile": 'A piece of the original prison seal. Bring it to the Malachar ritual: it helps re-bind the demon.',
  'Demon-Cult Amulet': "Malachar's cult token. It reveals his secrets, but keeping or bargaining with it corrupts you.",
  "Aldric's Signet Ring": "Opens Voss-crest mechanisms in the keep and helps you appeal to Aldric's spirit.",
  '+1 Dagger (Voss Crest)': "Aldric's family dagger. It can strike keep-bound spirits.",
  '+1 Shield (Voss Crest)': 'The Voss family shield. Its falcon eye can reveal curses, possession and lies.',
  'Holy Water': 'Harms demons, undead and possessed foes. On Aldric, it only calms him.',
  'Silver Mirror': "Reveals invisible shadows, possession marks and Malachar's hidden writing.",
  'Binding Prayer Scroll': 'One use: makes the final re-binding of Malachar easier.',
  "Vance's Blessed Iron Keystone": "Lent by Vance the blacksmith. Set it into the cracked prison seal to bind Malachar and save the children, or return it to Vance in the village square.",
  // The Saltblood Mines
  "Threx's Ledger": "Proof of Threx's trafficking, bribes and buyers. Decode it and bring it to the authorities.",
  "Threx's Sealed Letter": 'Proof of the possession conspiracy. Opening it early may warn Threx.',
  'Flare Pouch': 'A dangerous stimulant: a quick boost, then a crash and possible craving.',
  'Raw Redvein Ore': 'Can drive out possessing spirits during a ritual, but carrying it brings nightmares.',
  "Bram's Notebook": "Lent by Old Bram. Explains Redvein and Flare, and how to destroy the Processing Hall without killing the prisoners. Give it back to Bram when you're done.",
  // Blackroot Hollow
  'Spider-Silk Bundle': 'Fine crafting silk: sell it or use it for rope, nets or armour lining.',
  'Queen Venom Vial': "One dose of Mother Silken's venom for a blade.",
  'Blackroot Egg Sac': 'Living spider young: evidence, a bargaining chip, or a dangerous ingredient. Profiting from it is wrong.',
  "Mara's Smoke Bombs": 'Three uses: keep spiders and swarms at bay.',
  // The Thorn Treaty
  'Original Thorn Treaty': 'The real border treaty. Use it to settle the dispute lawfully.',
  'Living Thorn Charm': 'Once per adventure, helps with forest survival and tracking.',
  'False Boundary Map': "A forged survey map. Expose it, or misuse it at your conscience's cost.",
  "Warden's Grave Deed": 'Proves ancestral burial rights near the trees. Supports a compromise or exposes false claims.',
  // The Glass Orchard Masquerade
  'Cracked Masquerade Mask': 'Helps you keep up a false identity at the party.',
  'Glass Secret Fruit': 'Break it to learn one guest secret, and use it against them.',
  'Glass Thorn Dagger': 'A poisoned glass blade.',
  'Master Mask List': "Pell's list of who wears which mask. Use it to identify guests.",
  // The Elemental Crucible
  'Fivefold Keystone': 'Opens the central font once the three shrine trials are complete.',
  'Cinder Antler Shard': 'One use: fire on a strike, or rest by a flame to recover.',
  'Granite Heart Pebble': 'Grows heavy near danger. Helps you protect others once per adventure.',
  'Aether Thread Spindle': 'Once per adventure, helps you find hidden paths and perfect timing.',
  'Elemental Awakening Mark': 'Your elemental ability is awakened.',
  // The Bandit Crown of Greywash Road
  'Crown Map': 'Shows the bandit camps, supply drops and Crown Hollow.',
  'Sealed Funding Letters': "Proof that Elsbet funded the raids: the key to a lawful ending.",
  'Black-Crown Longbow': "The bandit captain's fire-aspected bow.",
  'Bandit Cache Key': 'Opens the Crown Hollow cache of coin, weapons and stolen farm deeds.',
  // Whispers of the Sunken Spire
  'Lost Archive Scroll': 'Elven records of planar static cycles. A major lore find.',
  'Amulet of Tide-Taming': 'Breathe underwater for a scene once per rest.',
  'Water-Breathing Elixir': "One hour of water breathing. If Naelia lent it, drink it for the dive or hand it back to her unused; don't walk off with it.",
  // The Plague Bells of Merrin Abbey
  'Blessed Bell Clapper': 'A holy relic: restores divine power or stabilises the dying.',
  "Healer's Abbey Satchel": "A healer's kit with five uses.",
  'Names of the Dead Ledger': 'The names bound by grief. Bring it to the release rite.',
  'Blue Fever Poultices': 'Three uses: better recovery or calmer fever.',
  // The Drowned Market of Bellweather Quay
  'Pearl Memory Scale': 'Once per rest, retry a failed check of the mind, at a cost.',
  'Drowned Coin': 'Pays one ghost toll, or honours the dead.',
  'Evacuation Bell Contract': 'Proof the council sold the warning bells: the key to breaking the curse and public justice.',
  'Blue-Lantern Charm': 'Once per adventure, helps with ghosts, tides and drowned places.',
  // The Clockwork Conservatory
  'Sun Gear Key': 'One of three gear keys for the alignment lock (Sun 45).',
  'Moon Gear Key': "Unit-7's keepsake brooch, and one of three gear keys for the alignment lock (Moon 90). Set it in the lock, or pin it back on Unit-7.",
  'Star Gear Key': 'One of three gear keys for the alignment lock (Star 180).',
  'Aether-Wrench': 'A clocksmith tool and weapon. Helps with clockwork and steam valves.',
  'Stabilized Chrono-Core': 'Install it in the central engine to stabilise the conservatory, or use it once to heal.',
  "Von Rictor's Ledger": "Translate it to learn Unit-7's shut-down phrase and the alignment code.",
  'Tiny Copper Leg': 'Fit it on Pip with Crafting to recruit him.',
  'Alchemical Acid Flask': "One throw: eats through locks, mechanisms and Unit-7's plating.",
  // The Obsidian Vault
  'Fire Core': 'Power for crafting or magic. Mishandle it and Ember Maw wakes.',
  'Flame-ward Shield +2': 'A shield built against fire.',
  'Basalt Warhammer +2': 'A heavy hammer with a fire strike.',
  // Chains of the Iron Colosseum
  'Arena Champion Laurel': 'Proof of a legal arena victory: social standing in the city.',
  'Gladiator Net': 'Entangles a foe for a round.',
  'Ledger of Illegal Sales': "Varro's crimes in writing. Turn the magistrates, the watch or the crowd against him.",
  'Underworks Key': 'Opens the drain tunnels, beast pens and an armoury door: your way out.',
  'Champion Maul +2': "Durn Ashjaw's maul.",
  // The Brass Plague of Tinkertown
  'Logic Core Diagram': 'A map of the central clockwork mind. Helps you shut down the conversion network.',
  'Masterwork Tool Kit +1': 'Better crafting.',
  'Governor Gear': 'Disables a clockwork servant, or helps repair Matron 12.',
  'Brass Plague Sample': 'Research material. Selling it risks a new outbreak.',
  // The Mirror War of Saint Orra
  "Saint Orra's Veil +3": 'Sees through doubles, illusions and possession.',
  'Mirror Shard Charm': 'Once per adventure, a flicker of a possible self.',
  'Silvered Rapier +1': 'A blade from the reflection realm.',
  'Reflection Testimony': 'Statements from originals and doubles. Use them to decide who remains.',
  // Threads of the Astral Sky
  'Focal Static Core': 'Arcane power or a ward, but overuse twists gravity.',
  'Sky-Stalker Composite Bow +2': 'A wind bow for heights and unstable footing.',
  'Starfall Bowstring +3': 'Install it on a bow (Inventory > Install) for a permanent upgrade.',
  'Astral Gravity Compass': 'Points to the safest "down" on floating routes.',
  // The Frostfire Crypt
  'Twin Embers Pouch': 'Two uses: light a brazier, warm Theron, or hold off the cold.',
  'Frostfire Heart': "Kaelen-Ghar's heart: flame or frost stance once per rest.",
  'Frostfire Glaive +3': "Kaelen-Ghar's glaive.",
  'Runic Ice-Chisel': 'Shatters ice walls, frost locks and runic mechanisms.',
  "Theron's Map": "The hidden path to Kaelen-Ghar's sarcophagus and the trap switches.",
  'Freezing Venom Vial': 'One dose of freezing venom for a blade.',
  'Runic Tablet Translation': 'Reads the crypt runes and can bypass one glyph trap.',
  // The Hunger Under Harvest Hill
  'Sacrifice Ledger': 'Proof of the village sacrifices. Confront the leaders with it.',
  'Dawnbound Sickle +3': 'A blessed blade against roots, vines and famine spirits.',
  'Root-Heart Seed': 'Restores strength or grows impossible crops, but corrupts unless the pact is resolved.',
  'Shrine Pact Stone': 'The first famine contract. Use it to break, redirect or renegotiate the pact.',
};

/**
 * Items an NPC lends rather than gives. The engine tracks what the player does
 * with them and adjusts the owner's standing (localEconomy.relationships).
 */
export const LOANED_ITEMS = {
  "Vance's Blessed Iron Keystone": {
    adventureId: 'ashveil_keep',
    owner: 'Vance Coalhand',
    ownerShort: 'Vance',
    ownerLocations: ['Ashveil Village Square'],
    // used: set into the seal; returned: brought back unused; kept: left the
    // adventure still holding it; lateReturn: brought back after keeping it.
    reputation: { used: 15, returned: 5, kept: -20, lateReturn: 10 },
    outcomes: {
      used: 'You set Vance\'s keystone into the seal. Vance is proud his work saved the children.',
      returned: 'You returned Vance\'s keystone unused. He thanks you for your honesty.',
      kept: 'You left Ashveil still carrying Vance\'s keystone. Vance considers it stolen.',
      lateReturn: 'You finally brought Vance\'s keystone back. He forgives you, mostly.',
    },
  },
  "Bram's Notebook": {
    adventureId: 'saltblood_mines',
    owner: 'Old Bram',
    ownerShort: 'Bram',
    // Bram is a prisoner: he is found in the cages or the barracks.
    ownerLocations: ['Prisoner Barracks', 'Intake Cage'],
    reputation: { used: 5, returned: 10, kept: -15, lateReturn: 5 },
    outcomes: {
      used: "Bram's notebook was spent bringing down the Flare operation. He says it was worth it.",
      returned: "You gave Bram his notebook back. His life's work is safe, and he won't forget it.",
      kept: "You left the mines with Bram's notebook. He has lost his life's work.",
      lateReturn: "You finally returned Bram's notebook. He is relieved, if wary.",
    },
  },
  'Water-Breathing Elixir': {
    adventureId: 'sunken_spire',
    owner: 'Naelia the Diver',
    ownerShort: 'Naelia',
    ownerLocations: ['Flooded Library Entrance', 'Planar Archives Sanctuary'],
    // Only a lent elixir is a loan: copies bought from a merchant are not
    // (see startLoans in utils/discoveries.js).
    reputation: { used: 5, returned: 5, kept: -15, lateReturn: 5 },
    outcomes: {
      used: "You drank Naelia's elixir for the dive. She counts it as money well lent.",
      returned: "You handed Naelia's elixir back unused. She is surprised, and pleased.",
      kept: "You left the Spire with Naelia's elixir. She marks you down as a thief.",
      lateReturn: "You finally brought Naelia's elixir back. She takes it without a word.",
    },
  },
  'Moon Gear Key': {
    adventureId: 'clockwork_conservatory',
    owner: 'Unit-7 (Nanny)',
    ownerShort: 'Unit-7',
    ownerLocations: ['The Alchemical Lab'],
    reputation: { used: 10, returned: 5, kept: -10, lateReturn: 5 },
    outcomes: {
      used: "You set Unit-7's moon brooch into the alignment lock. The conservatory hums back to life.",
      returned: "You pinned the moon brooch back on Unit-7. Its whirring softens.",
      kept: "You left the conservatory with Unit-7's moon brooch. The lock stays dark.",
      lateReturn: "You brought Unit-7's moon brooch back at last.",
    },
  },
};
