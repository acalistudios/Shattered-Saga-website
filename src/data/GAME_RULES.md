# Shattered Saga — Official Game Rules & Mechanics Reference

> **Document Version:** 6.1 (Comprehensive Systems & Mechanics Edition)  
> **Status:** Living Master Document  
> **Primary File Locations:**
> - Master Repository Document: [`website/src/data/GAME_RULES.md`](file:///C:/Users/hansi/Dropbox/MSI%20folders/Documents/_ACALI%20Studios/Shattered%20Saga/website/src/data/GAME_RULES.md)
> - Workspace Reference: [`Shattered Saga - Rules Reference.md`](file:///C:/Users/hansi/Dropbox/MSI%20folders/Documents/_ACALI%20Studios/Shattered%20Saga/Shattered%20Saga%20-%20Rules%20Reference.md)
> - In-Game Help Data Module: [`website/src/data/rulesHelp.js`](file:///C:/Users/hansi/Dropbox/MSI%20folders/Documents/_ACALI%20Studios/Shattered%20Saga/website/src/data/rulesHelp.js)
> - Chat UI Artifact: [`running_game_rules.md`](file:///C:/Users/hansi/.gemini/antigravity/brain/d917b103-4655-435d-9a0d-cf433fb73ff2/running_game_rules.md)

---

## Table of Contents
1. [Core Resolution: The Opposed Roll System](#1-core-resolution-the-opposed-roll-system)
2. [Step-Die Formulas & Die Scaling](#2-step-die-formulas--die-scaling)
3. [The 8 Core Attributes](#3-the-8-core-attributes)
4. [The 36 Canonical Skills & Attribute Pairings](#4-the-36-canonical-skills--attribute-pairings)
5. [Difficulty & Resistance Mechanics (Static vs Living Foes)](#5-difficulty--resistance-mechanics-static-vs-living-foes)
6. [Character Creation, Moral Anchors & Roleplay Modifiers](#6-character-creation-moral-anchors--roleplay-modifiers)
7. [Progression, Leveling & Engine-Authoritative Rewards](#7-progression-leveling--engine-authoritative-rewards)
8. [Combat Mechanics: Initiative, Actions & Defenses](#8-combat-mechanics-initiative-actions--defenses)
9. [Weapons, Armor Soak & The Tactical Damage Matrix](#9-weapons-armor-soak--the-tactical-damage-matrix)
10. [Health, Healing, Bleeding & Dying](#10-health-healing-bleeding--dying)
11. [Death, The Resurrection Rite & The Undead State](#11-death-the-resurrection-rite--the-undead-state)
12. [Gear Recovery System & Trail Mechanics](#12-gear-recovery-system--trail-mechanics)
13. [Time Flow, Fatigue, Rations & Starvation](#13-time-flow-fatigue-rations--starvation)
14. [Magic Disciplines, Spell Points (SP) & Channeling](#14-magic-disciplines-spell-points-sp--channeling)
15. [Economy, Currency & Trading Rules](#15-economy-currency--trading-rules)
16. [Encumbrance, Volume & Weight Constraints](#16-encumbrance-volume--weight-constraints)
17. [Repeatable Training: Patrols & The Arena](#17-repeatable-training-patrols--the-arena)
18. [Engine Authority vs AI Narration Protocol](#18-engine-authority-vs-ai-narration-protocol)

---

## 1. Core Resolution: The Opposed Roll System

Shattered Saga replaces static Target Numbers (AC or fixed DC) with an active, dynamic **Opposed Roll Resolution Engine**. Every meaningful action is a contest between the player's active agency and the opposing friction of the world.

### Why Opposed Rolls?
1. **Dynamic Tension:** Static target numbers make challenges predictable. Opposed rolls ensure that even experienced adventurers face unpredictable environmental twists, while desperate novices always have a fighting chance.
2. **Two-Attribute Synergy:** Instead of tethering a skill to a single stat, every skill blends two attributes (a Primary anchor representing core aptitude, and a Secondary anchor representing finesse or complementary strength).
3. **Consistent Training via Skill d2s:** Skills do not roll swingy polyhedral dice. Instead, each skill rank rolls a `1d2` (coin flip: 1 or 2). This ensures that training provides a stable, reliable floor of competence while attributes provide raw potential.
4. **Granular Margins:** The difference between the rolls ($\text{Margin} = \text{Player} - \text{Resistance}$) directly shapes the story and mechanics: it drives bonus weapon damage, bleeding severity, spell effectiveness, and degrees of narrative triumph or consequence.

---

## 2. Step-Die Formulas & Die Scaling

### The Master Roll Formula
$$\text{Player Total} = \text{Primary Attribute Die} + \text{Secondary Attribute Die} + \sum_{i=1}^{\text{Ranks}} 1\text{d}2_i + \text{Net Modifiers}$$

```
   [ Primary Attribute Die ]       -->  Determined by Primary Attribute score (1d4 to 1d12, 1d20)
+  [ Secondary Attribute Die ]     -->  Determined by Secondary Attribute score (1d2 to 1d6, 1d10)
+  [ Skill Ranks (0 to 5) ]        -->  Each rank rolls 1d2 (1 or 2)
+  [ Active Modifiers ]            -->  Gear bonuses, Roleplay modifiers, Morality bonuses, Penalties
-------------------------------------------------------------------------------------------------
=  Total Player Check Result
```

### A. Primary Attribute Step-Die Progression
The primary attribute score sets the die type:
* **Score 1:** `1d4` (Range: 1–4, Average: 2.5)
* **Score 2:** `1d6` (Range: 1–6, Average: 3.5)
* **Score 3:** `1d8` (Range: 1–8, Average: 4.5)
* **Score 4:** `1d10` (Range: 1–10, Average: 5.5)
* **Score 5:** `1d12` (Range: 1–12, Average: 6.5)
* **Score 6 (Monstrous / Mythic Boon):** `1d20` (Range: 1–20, Average: 10.5)
* **Score 7 (Dragon / Demi-God):** `1d20 + 1d4` (Range: 2–24, Average: 13.0)
* **Score 8 (Ascendant):** `1d20 + 1d6` (Range: 2–26, Average: 14.0)

### B. Secondary Attribute Step-Die Progression
The secondary attribute provides auxiliary support:
* **Score 1:** `1d2` (Range: 1–2, Average: 1.5)
* **Score 2:** `1d2 + 1` (Range: 2–3, Average: 2.5)
* **Score 3:** `1d4` (Range: 1–4, Average: 2.5)
* **Score 4:** `1d4 + 1` (Range: 2–5, Average: 3.5)
* **Score 5:** `1d6` (Range: 1–6, Average: 3.5)
* **Score 6 (Monstrous):** `1d10` (Range: 1–10, Average: 5.5)
* **Score 7 (Dragon):** `1d10 + 1d2` (Range: 2–12, Average: 7.0)

### C. Skill Ranks (0 to 5)
Each rank in the tested skill rolls **1d2** (1 or 2):
* **Untrained (Rank 0):** `+0` (Raw attribute instinct only)
* **Novice (Rank 1):** `+1d2` (Range: 1–2, Average: 1.5)
* **Apprentice (Rank 2):** `+2d2` (Range: 2–4, Average: 3.0)
* **Journeyman (Rank 3):** `+3d2` (Range: 3–6, Average: 4.5)
* **Expert (Rank 4):** `+4d2` (Range: 4–8, Average: 6.0)
* **Master (Rank 5):** `+5d2` (Range: 5–10, Average: 7.5)

### D. Interpreting the Margin of Success / Failure
$$\text{Margin} = \text{Player Roll} - \text{Resistance Roll}$$

| Margin Range | Outcome Tier | Mechanical & Narrative Resolution |
| :---: | :---: | :--- |
| **$+8$ or higher** | **Critical Triumph** | Effortless perfection. Bypasses complications, adds $+2$ bonus raw damage in combat, triggers bleeding on edged attacks, inspires onlookers. |
| **$+4$ to $+7$** | **Decisive Success** | Clean victory. Objectives achieved swiftly; adds $+1$ bonus raw damage in combat per 3 full margin points. |
| **$+1$ to $+3$** | **Narrow Success** | Objective achieved with minor friction, noise, or spent momentum. |
| **$0$** | **Standoff / Stalemate** | Equal forces collide. Narrow compromise, partial progress with a complication, or weapon lock in melee. |
| **$-1$ to $-3$** | **Minor Failure** | Missed mark, wasted time, minor noise made, or small tactical setback. |
| **$-4$ to $-7$** | **Clear Failure** | Objective failed. Triggers environmental hazards, alerts guards, consumes consumables, or invites counter-attacks. |
| **$-8$ or worse** | **Critical Disaster** | Catastrophic blunder. Weapon dropped or damaged, major fatigue drain, immediate incoming damage, or severe tactical compromise. |

---

## 3. The 8 Core Attributes

Attributes represent raw biological, mental, and planar capability. Normal characters range from **1 to 5**:

| Attribute | Primary Gameplay Role | Secondary Gameplay Role | Health & Resource Impact |
| :--- | :--- | :--- | :--- |
| **Power** | Heavy melee weapon attacks, athletics, raw physical feats. | Melee hit precision, shield blocking defense. | Increases Max Carrying Weight ($30 + \text{Power} \times 15\text{ lbs}$). |
| **Coordination** | Light/ranged weapon accuracy, acrobatics, stealth, lockpicking. | Melee finesse, shield parry reflexes. | Key stat for Initiative in combat. |
| **Vigor** | Physical endurance, resisting poisons, survival fortitude. | Armor resilience, heavy weapon defense. | Determines Max HP ($10 + \text{Vigor} \times 2$) & Max Fatigue. |
| **Willpower** | Mental discipline, spell resistance, resisting terror. | Arcane channeling concentration. | Key stat for Arcane Drawing & magic defense. |
| **Intellect** | Logical analysis, tactical knowledge, appraising, lore. | Manual precision for traps, lockpicking, herbalism. | Determines Language fluency & Lore depth. |
| **Charisma** | Social projection, command, deception, negotiation. | Intimidation menace, performance. | Dictates merchant relationship ceilings. |
| **Attunement** | Planar sensitivity, sensing magical currents. | Luck, magical dodging. | Powers raw Arcane Shaping magnitude. |
| **Empathy** | Spiritual receptivity, intuition, reading motives. | Healing medicine, animal rapport. | Powers Divine Communion & Divine Manifestation. |

* **Starting Distribution:** All attributes begin at base **1**. Players distribute **16 free attribute points** (total pool of 24 points).
* **Attribute Lock:** Attributes remain locked during normal play. They do **not** increase on standard level-ups. Permanent attribute gains occur only through rare, named story milestones.

---

## 4. The 36 Canonical Skills & Attribute Pairings

Every skill is linked to one Primary Attribute (1.0 die) and one Secondary Attribute (0.5 die):

| # | Skill Name | Primary (1.0) | Secondary (0.5) | Core Gameplay Function |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Acrobatics** | Coordination | Vigor | Dodging attacks, tumbling, balancing on ledges. |
| 2 | **Alchemy** | Intellect | Attunement | Identifying potions, brewing reagents, neutralizing poisons. |
| 3 | **Animal Rapport** | Empathy | Willpower | Pacifying predators, directing mounts, reading animal moods. |
| 4 | **Appraise** | Intellect | Attunement | Estimating item worth, spotting counterfeits and gems. |
| 5 | **Arcane Drawing** | Willpower | Attunement | Channeling raw mana. Determines **Max Arcane SP** ($\text{Rank} \times 3$). |
| 6 | **Arcane Shaping** | Attunement | Intellect | Casting arcane spells: Attacks and Defensive Wards. |
| 7 | **Athletics** | Power | Vigor | Climbing, sprinting, swimming through rapids, vaulting. |
| 8 | **Blocking** | Power | Coordination | Shield defense and weapon parries to soak incoming hits. |
| 9 | **Brawling** | Power | Vigor | Unarmed strikes, grappling, headbutts, tavern fighting. |
| 10 | **Crafting** | Coordination | Intellect | Creating mundane gear, leatherwork, field repairs. |
| 11 | **Deception** | Charisma | Intellect | Bluffs, false identities, disguising true motives. |
| 12 | **Divine Communion** | Empathy | Willpower | Prayer and holy connection. Determines **Max Divine SP** ($\text{Rank} \times 3$). |
| 13 | **Divine Manifestation** | Empathy | Willpower | Channeling divine miracles: Healing, Control, and Smite. |
| 14 | **Escapology** | Coordination | Willpower | Slipping manacles, wriggling free of webs and ropes. |
| 15 | **Healing** | Intellect | Empathy | Treating wounds, diagnosis, long-term medical care during rest. |
| 16 | **Heavy Weapons** | Power | Vigor | Greatswords, mauls, warhammers, battleaxes, polearms. |
| 17 | **Herbalism** | Intellect | Empathy | Foraging medicinal roots, preparing poultices and salves. |
| 18 | **Insight** | Empathy | Intellect | Reading intent, detecting lies, discerning hidden motives. |
| 19 | **Intimidation** | Power | Charisma | Coercing through menace, roar, or overwhelming presence. |
| 20 | **Languages** | Intellect | Empathy | Reading ancient dead tongues, translating planar ciphers. |
| 21 | **Leadership** | Charisma | Willpower | Commanding squads, maintaining troop morale under fire. |
| 22 | **Light Weapons** | Coordination | Power | Daggers, shortswords, rapiers, scythes, sickles. |
| 23 | **Lockpicking** | Coordination | Intellect | Bypassing mechanical locks, padlocks, and vault latches. |
| 24 | **Lore** | Intellect | Empathy | History, planar cosmology, myths, religions, ancient architecture. |
| 25 | **Luck** | Attunement | Willpower | Risky gambits, finding unlooked-for exits, games of chance. |
| 26 | **Marksmanship** | Coordination | Intellect | Bows, crossbows, precision shooting (consumes arrows). |
| 27 | **Negotiation** | Charisma | Empathy | Diplomacy, striking bargains, bartering merchant prices. |
| 28 | **Perception** | Intellect | Empathy | Spotting ambushes, finding secret doors, hearing footsteps. |
| 29 | **Performance** | Charisma | Coordination | Music, theatrical distraction, rousing oratory. |
| 30 | **Smithing** | Power | Intellect | Forging weapons, armor tempering, metal repairs. |
| 31 | **Stealth** | Coordination | Willpower | Moving silently, sticking to shadows, evading patrol routes. |
| 32 | **Survival** | Vigor | Empathy | Enduring wild weather, navigating forests, finding water. |
| 33 | **Thievery** | Coordination | Charisma | Pickpocketing, sleight of hand, palming small relics. |
| 34 | **Thrown Weapons** | Coordination | Power | Throwing knives, javelins, axes, alchemical flasks. |
| 35 | **Tracking** | Empathy | Intellect | Reading footprints, blood trails, hunting beasts across wilderness. |
| 36 | **Trapping** | Coordination | Intellect | Setting hunting snares, disarming dungeon pressure plates. |

---

## 5. Difficulty & Resistance Mechanics (Static vs Living Foes)

When a skill check occurs, the engine rolls an opposing resistance:

### A. Static & Environmental Resistance Tiers
For stationary obstacles (locks, sheer cliffs, traps, ciphers), the engine rolls against authored difficulty tiers:

| Tier | Formula | Minimum | Average | Maximum | Narrative Description |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Easy / Novice** | `1d6 + 1d2 + 1` | 3 | **6.0** | 9 | Simple wooden latch, calm social exchange, vaulting a hedge. |
| **Moderate / Professional** | `1d10 + 1d4` | 2 | **8.0** | 14 | Sturdy iron lock, scaling a castle wall in rain, haggling a guard. |
| **Hard / Veteran** | `1d12 + 1d6` | 2 | **10.0** | 18 | Ancient dwarven cipher, navigating a burning hall, resisting fear. |
| **Extreme / Legendary** | `1d12 + 1d6 + 3d2` | 5 | **14.5** | 24 | Vault of the ancients, binding an unleashed demon, mythic deed. |

### B. Living Foes (Dynamic Opposed Resistance)
When dealing with an active NPC or creature:
* The opposing creature rolls its **own attribute and skill dice** (e.g. an attacking bandit rolls their Light Weapons skill against the player's Dodge or Block).
* Incorporeal entities, wraiths, and demons use their monstrous stat blocks (Scores 6–10), rolling `1d20` primaries.

---

## 6. Character Creation, Moral Anchors & Roleplay Modifiers

### A. Moral Anchors
Characters define an ethical and behavioral profile:
* **Virtues:** *Justice, Mercy, Courage, Integrity, Humility, Wisdom*.
* **Vices:** *Wrath, Greed, Pride, Deceit, Stubbornness, Cruelty*.
* **Philosophical Allegiances:** *Preservation, Entropist, Skeptic, Egoist, Traditionalist*.

### B. The Roleplay Roll Modifier (`+1` / `-1`)
* When a player describes an action that demonstrates great loyalty to their **Virtue**, **Vice**, or **Philosophy**, the GM emits `[roleplay_modifier: +1]`. The engine adds a **flat +1 modifier to their next skill roll**.
* If a player acts completely out of character (e.g. a pacifist healer brutally executing a surrendered captive), the GM emits `[roleplay_modifier: -1]`, applying a **-1 penalty to the next roll**.

### C. Morality Scale (-100 to +100) & Combat Scaling
* **Heroic Alignment ($\ge +15, \ge +30, \ge +45$):**
  * Holy priests and villagers offer warmth, secret lore, and lower prices.
  * In combat, heroics gain **+1, +2, or +3 Hit Bonus** and **+1, +2, or +3 Damage Bonus** against evil, demonic, undead, and monstrous foes.
* **Villainous Alignment ($\le -15, \le -30, \le -45$):**
  * Smugglers and bandits open black-market access and outlaw shortcuts.
  * In combat, villains gain **+1, +2, or +3 Hit Bonus** and **+1, +2, or +3 Damage Bonus** against innocent, holy, and noble defenders.

---

## 7. Progression, Leveling & Engine-Authoritative Rewards

The game engine authoritatively owns all character progression. The AI Game Master narrates outcomes and emits milestone tags, but cannot arbitrarily invent permanent power.

### A. Level Up & Health Gains
Completing an adventure grants a level-up:
* Base health increases by **+1 Max HP**.
* On **even levels (Level 2, 4, 6...)**, characters gain bonus Max HP based on their Vigor score:
  * $\text{Vigor} \ge 6$: **+3 bonus HP** (Total +4 HP)
  * $\text{Vigor } 4–5$: **+2 bonus HP** (Total +3 HP)
  * $\text{Vigor } 3$: **+1 bonus HP** (Total +2 HP)
  * $\text{Vigor } 1–2$: **+0 bonus HP** (Total +1 HP)

### B. Spendable Skill Points
Each completed adventure awards guaranteed spendable skill points based on content wave:
* **Wave 1–2 (Starter / Tier 1):** **2 Skill Points**
* **Wave 3–4 (Mid-tier / Tier 2):** **3 Skill Points**
* **Wave 5–6 (Late-game / Tier 3):** **4 Skill Points**

### C. Skill Rank Upgrade Cost Formula
Upgrading a skill from its current rank costs points equal to:
$$\text{Skill Upgrade Cost} = \text{Current Rank} + 1$$
* Rank 0 $\rightarrow$ Rank 1: **1 Point**
* Rank 1 $\rightarrow$ Rank 2: **2 Points**
* Rank 2 $\rightarrow$ Rank 3: **3 Points**
* Rank 3 $\rightarrow$ Rank 4: **4 Points**
* Rank 4 $\rightarrow$ Rank 5: **5 Points**
* Skill rank hard cap is **5**.

---

## 8. Combat Mechanics: Initiative, Actions & Defenses

Combat runs in structured 10-second tactical rounds:

```
[ Combat Round (10s) ]
  ├── 1. Initiative: Opposed Coordination Check
  ├── 2. Active Turn: 1 Primary Action (Attack, Spell, Item, Tactical Maneuver)
  └── 3. Defense Queue: React to Incoming Attacks (Dodge or Block)
```

### A. Defensive Reactions
When enemies strike, their attacks enter the player's Defense Queue. The player must choose:
1. **Acrobatics (Dodge):** Completely avoids all damage on success. Heavy armor penalizes dodge checks (Medium: -1, Heavy: -2).
2. **Blocking (Block / Parry):** Requires an equipped weapon or shield. On success, absorbs damage through shield soak.

### B. Swarm & Multi-Defense Penalty
* The **first defense roll in a round is made at full strength**.
* **Each subsequent defense roll in the same round suffers a cumulative -2 penalty** (2nd defense: -2, 3rd defense: -4, 4th defense: -6). Facing multiple opponents simultaneously is lethal; chokepoints are vital.

---

## 9. Weapons, Armor Soak & The Tactical Damage Matrix

### A. Raw Damage Calculation
$$\text{Raw Damage} = \text{Weapon Die} + \lfloor \text{Margin} / 3 \rfloor + \text{Morality Bonus} + \text{Item Magic Bonus}$$
* **Margin Damage:** Every full **3 points** of success margin adds **+1 Raw Damage**.

### B. Armor Soak Dice
When a hit penetrates defense, equipped armor rolls to absorb physical damage:
* **Light Armor (Leather):** Soaks `1d3` + magic bonus. Check penalty: None.
* **Medium Armor (Chainmail):** Soaks `1d4` + magic bonus. Check penalty: **-1** to Acrobatics and Athletics.
* **Heavy Armor (Plate):** Soaks `1d6` + magic bonus. Check penalty: **-2** to Acrobatics and Athletics.

### C. Shield Soak Dice
* **Small Shield (Buckler):** Soaks `1d4` + magic bonus.
* **Medium Shield (Heater / Steel):** Soaks `1d6` + magic bonus.
* **Large Shield (Tower / Heavy):** Soaks `1d8` + magic bonus.
* *Note:* Magic shields (+X) add their bonus to both the **Block check** and the **Soak roll**.

### D. Tactical Damage-Type Matrix
The attack's physical type (Blunt, Edged, Piercing) modifies the rolled armor soak by **$\pm 2$**:

| Armor Type \ Damage Type | Blunt | Edged | Piercing | Tactical Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Light (Leather)** | $+0$ | $+0$ | **$-2$** (Weak) | Thrusts and arrows pierce leather cleanly. |
| **Medium (Chainmail)** | **$-2$** (Weak) | $+0$ | **$+2$** (Strong) | Maces crush links; arrows glance off rings. |
| **Heavy (Plate)** | **$-2$** (Weak) | **$+2$** (Strong) | $+0$ | Swords glance off curved steel; warhammers crush plate. |

$$\text{Net Damage Taken} = \max(0, \text{Raw Damage} - \text{Adjusted Armor Soak} - \text{Shield Soak})$$

---

## 10. Health, Healing, Bleeding & Dying

### A. Bleeding Tiers (0 to 4)
* Caused primarily by high-margin Edged attacks (Margin $\ge 5 \rightarrow$ Tier 1; Margin $\ge 8 \rightarrow$ Tier 2).
* **Tier 1:** $-1 \text{ HP per action}$
* **Tier 2:** $-2 \text{ HP per action}$
* **Tier 3:** $-3 \text{ HP per action}$
* **Tier 4:** $-4 \text{ HP per action}$
* Bleeding ticks every discrete action taken.
* Each action, there is a **10% chance** the tier drops by 1 naturally.
* Bandages, Healer's Kits, or Divine Heal of magnitude $S \ge 2$ halt all bleeding immediately.

### B. Bandages
* Applying a Bandage costs **1 action**.
* Instantly restores **+1 HP** and **halts all bleeding**.

### C. Unconscious & Dying Countdown
* At **0 to -4 HP**, the character collapses unconscious.
* A **5-round death countdown** begins. Active bleeding continues to tick toward $-5 \text{ HP}$.
* Halting bleeding or healing the character to $1+ \text{ HP}$ revives them (groggy status: $-2$ on all checks for 1 hour).
* Reaching **-5 HP** or allowing the countdown to expire results in **True Death**.

---

## 11. Death, The Resurrection Rite & The Undead State

Permadeath is replaced by the **Resurrection & Consequence Engine**:

### A. The Resurrection Rite
Upon death, the character is taken to the **Resurrection Modal**:
1. **Sacrifice of Power:** The engine randomly selects **2 attributes** currently above the floor of 1. The player must choose **1 attribute to permanently lose**.
2. **Sanctuary Return:** The character revives at an unlocked sanctuary (**Ashveil Chapel** or **Merrin Abbey**).
3. **Loss of Gear:** All carried equipment and inventory are stripped and transferred to a **Gear Recovery Trail**.

### B. The Undead State (Permanent Curse)
A resurrected character is mechanically and narratively **Undead**:
* Cold, visibly unsettling, rejected by natural life.
* **Social Skill Penalty:** Automatic **-1 penalty to all social checks** (*Deception, Intimidation, Leadership, Negotiation, Performance*).
* **Repeat Deaths:** A second death increases the penalty to **-2** (never decreases).
* **The Cure:** Undeath cannot be cured through rest, medicine, or normal magic. It can only be cleansed by consuming the rare item: `Rite of Quiet Return`. Curing removes the undead status and social penalty, but **does NOT refund the lost attribute point**.

### C. Divine Intervention Items
* **Breath of the Creator:** Consumed at death. Revives the character in place with $1 \text{ HP}$, keeps all gear, and bypasses attribute loss and undeath.
* **Thread of Returning:** Consumed at death. Restarts the adventure from the beginning, keeps all gear, and bypasses attribute loss and undeath.

---

## 12. Gear Recovery System & Trail Mechanics

Stripped belongings are not deleted—they enter a dynamic recovery trail:
* **Carrier Trails:** If killed by an intelligent foe (human, merchant, construct), the killer carries the gear. The killer relocates every **12 hours**. Defeating them recovers the gear.
* **Cache Trails:** If killed by beasts, undead, spirits, or elementals, the gear is stored in a marked cache. The cache relocates every **24 hours**.
* **Trail Expiration:** All trails go cold after **72 game hours**. Once cold, gear is permanently lost.
* Reaching the recovery site restores all stripped equipment to inventory and clears the trail.

---

## 13. Time Flow, Fatigue, Rations & Starvation

### A. Dynamic Time Passage
* Dialogue / Standard Look: **1 minute** ($0.017 \text{ hrs}$)
* Quick checks (Lockpicking, Trapping): **5 minutes** ($0.083 \text{ hrs}$)
* Deep searching / Perception: **10 minutes** ($0.166 \text{ hrs}$)
* Combat rounds: **10 seconds** ($0.0028 \text{ hrs}$)
* Crafting: **30 minutes** ($0.5 \text{ hrs}$)
* Smithing: **1 hour** ($1.0 \text{ hr}$)

### B. Midnight & Starvation
* Reaching 24:00 (midnight) increments the Day and automatically consumes **1 Ration**.
* If inventory has no rations, **Starvation Level increases by 1**.
* Each starvation level applies a cumulative **-1 penalty to ALL check rolls**.
* Consuming a ration clears starvation immediately.

### C. Fatigue & Exhaustion
$$\text{Max Fatigue} = 12.5 + (2.5 \times \text{Vigor}) \quad (\text{range } 15.0 \text{ to } 25.0)$$
* Actions drain fatigue (Smithing: $-1.0$, Athletics: $-0.5$, Combat: $-0.1$, Dialogue: $-0.01$).
* **Passive Recovery:** Below $50\%$ fatigue, standard dialogue turns recover $+0.5 \text{ fatigue}$ up to the half mark.
* **Exhaustion Penalty:** If fatigue drops below 0, all rolls suffer **-1 penalty per 0.5 points below 0**.
* **Collapse:** Dropping to $-10.0$ fatigue triggers collapse for 8 hours (resets fatigue to $-5.0$).

### D. 8-Hour Rest Recovery
* Consumes 1 Ration and advances time by 8 hours.
* Fully restores **Fatigue**, **Arcane SP**, and **Divine SP**.
* Restores HP based on: $\text{Vigor Die} + (\text{Healing Rank} \times 1\text{d}2) + \text{Medicine Dice}$ (Poultice $+1\text{d}6$; Healer's Kit $+2\text{d}6$ and cures conditions).

---

## 14. Magic Disciplines, Spell Points (SP) & Channeling

Magic uses freeform player description governed by structured mechanical shapes:

### A. The Two Disciplines
* **Arcane Magic (Arcane Shaping):** Powered by Arcane SP ($\text{Max} = \text{Arcane Drawing Rank} \times 3$).
  * **Attack:** Deals $S \text{d}6$ raw damage.
  * **Ward / Barrier:** Grants $+1\text{d}4$ armor soak per $S$ for $S$ rounds.
* **Divine Magic (Divine Manifestation):** Powered by Divine SP ($\text{Max} = \text{Divine Communion Rank} \times 3$).
  * **Heal:** Restores $S \text{d}6 \text{ HP}$ (at $S \ge 2$, halts bleeding).
  * **Control:** Binds or charms target for $S$ rounds.
  * **Smite:** Deals $S \text{d}8$ radiant damage; bypasses incorporeal immunity; affects evil/undead/demons only.

### B. Channeling Magnitude ($S$) & Burnout
* The caster chooses how many SP to invest ($S$), up to their skill rank in Arcane Shaping or Divine Manifestation.
* Channeling adds **$+4 \times S$ complexity** to the resistance roll.
* **Burnout:** Overspending SP triggers burnout:
  * Arcane deficit is deducted directly from **HP**.
  * Divine deficit is deducted directly from **Fatigue**.
* **SP Conversion:** Arcane and Divine SP convert at a **3:1 ratio**.

---

## 15. Economy, Currency & Trading Rules

* **Currency Exchange:** $10\text{ cp} = 1\text{ sp}$; $10\text{ sp} = 1\text{ gp}$ ($1\text{ gp} = 100\text{ cp}$).
* **Merchant Rates:** Merchants buy relevant goods at **50% of base value**.
* **Negotiation:** Successful Negotiation checks improve buy/sell rates up to **75% of base value**.
* **Quality Multipliers:** Broken ($\times 0.1$), Worn ($\times 0.75$), Common ($\times 1.0$), Masterwork ($\times 2.5$), Magical ($\times 10$), Relic ($\times 20$).

---

## 16. Encumbrance, Volume & Weight Constraints

* $\text{Max Carrying Weight} = 30 + (\text{Power} \times 15) \text{ lbs}$.
* **Encumbered ($> 100\%$ capacity):** $-2$ penalty to physical checks, $+50\%$ fatigue drain.
* **Overloaded ($> 150\%$ capacity):** $-4$ penalty to physical checks, $+100\%$ fatigue drain, risk of collapse.

---

## 17. Repeatable Training: Patrols & The Arena

* **Patrols (Available from Adventure 1):** Low-lethality regional expeditions to unstick struggling characters. Awards modest copper, rations, and chances for minor gear ($\sim +1$). Rate-limited by fatigue and rations.
* **The Arena (Unlocked after Adventure 13):** Tiered combat brackets with entry fees and escalating prize purses.

---

## 18. Engine Authority vs AI Narration Protocol

1. **The Game Engine Controls:** Dice rolls, margin calculations, HP, SP, fatigue, status effects, inventory additions, currency budgets, leveling, skill rank increases, and death outcomes.
2. **The AI Game Master Controls:** Scene descriptions, sensory details, NPC dialogue, tactical descriptions, and emitting structured action tags (`[objective_complete: id]`, `[ending_selected: id]`, `[combat_start]`, `[scene_end]`).
3. **No Discretionary AI Power:** The AI GM cannot invent unauthored magic items, award arbitrary permanent attributes, grant extra skill points, or manipulate server-authoritative gems.
