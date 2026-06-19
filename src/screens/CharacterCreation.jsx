import React, { useState, useEffect, useRef } from 'react';
import { SKILLS_LIST, PROFESSIONS_LIST, ELEMENTS_LIST, VIRTUES, VICES, ALLEGIANCES, ATTRIBUTE_LIST } from '../data/gms';
import { PRESET_METADATA } from '../data/portraits';

const HELP_TEXTS = {
  philosophy: {
    title: 'Philosophical Allegiances',
    content: (
      <div className="space-y-3">
        <p>Your philosophy dictates how you view planar forces and how the Game Masters shape your narrative path.</p>
        <p><strong>Preservation:</strong> Focuses on stability, defending civilization, protecting historical lore, and preventing catastrophic planar collapse.</p>
        <p><strong>Entropist:</strong> Believes that destruction, decay, and chaos are essential precursors to rebirth. You challenge stagnant institutions and embrace volatile changes.</p>
        <p><strong>Skeptic:</strong> Doubts grand cosmic dogmas, divine covenants, and magical fate. You rely on tangible proof, practicality, and personal survival.</p>
        <p><strong>Egoist:</strong> An individualist who prioritizes personal goals, self-preservation, and self-interest above collective duties.</p>
        <p><strong>Traditionalist:</strong> A guardian of ancient customs, ancestral honor, oaths, and historical legacies.</p>
      </div>
    )
  },
  virtue: {
    title: 'Moral Virtues',
    content: (
      <div className="space-y-2">
        <p>A positive alignment anchor defining your character's spiritual core. The GM will reward choices that demonstrate this virtue:</p>
        <p><strong>Justice:</strong> Standing up for fairness and protecting the weak.</p>
        <p><strong>Mercy:</strong> Offering restraint, compassion, and forgiveness.</p>
        <p><strong>Fortitude:</strong> Resilience and endurance in times of extreme physical or mental hardship.</p>
        <p><strong>Curiosity:</strong> Seeking knowledge, exploring ruins, and learning magical secrets.</p>
        <p><strong>Generosity:</strong> A willingness to share resources or aid without greed.</p>
        <p><strong>Humility:</strong> Valuing others, acting without vanity, and admitting errors.</p>
        <p><strong>Patience:</strong> Composure, avoiding rash actions, and timing your strikes.</p>
        <p><strong>Loyalty:</strong> Faithfulness to companion bonds and vows.</p>
      </div>
    )
  },
  vice: {
    title: 'Moral Vices',
    content: (
      <div className="space-y-2">
        <p>Your negative alignment anchor. Represents a character flaw or shadow side that GMs will use to create narrative conflicts or temptations:</p>
        <p><strong>Greed:</strong> Excessive craving for gold, artifacts, or magic.</p>
        <p><strong>Pride:</strong> Refusing help, refusing to back down, and hubris.</p>
        <p><strong>Wrath:</strong> Outbursts of temper, vengefulness, and violence.</p>
        <p><strong>Deception:</strong> A natural tendency to manipulate, lie, or cheat.</p>
        <p><strong>Impatience:</strong> Hating delay, rushing headfirst into danger.</p>
        <p><strong>Cowardice:</strong> Fleeing threats or placing self-preservation above duty.</p>
        <p><strong>Stubbornness:</strong> Refusing to adapt or listen to sound advice.</p>
        <p><strong>Cruelty:</strong> Harming others or enjoying their suffering.</p>
      </div>
    )
  },
  age: {
    title: 'Age & Experience',
    content: (
      <div className="space-y-3">
        <p>Your character's age tier scales your starting capabilities:</p>
        <p><strong>Youthful:</strong> +10 Attribute Points, 1 starting Profession, +3 free Hobby Skill Points. You have high potential but narrow professional experience.</p>
        <p><strong>Middle Age:</strong> +9 Attribute Points, 3 starting Professions (stacking allowed), +4 free Hobby Skill Points. A balance of natural talent and career experience.</p>
        <p><strong>Elder:</strong> +8 Attribute Points, 5 starting Professions (stacking allowed), +5 free Hobby Skill Points. Lower raw physical stats, but immense professional expertise.</p>
      </div>
    )
  },
  element: {
    title: 'Elemental Affinity',
    content: (
      <div className="space-y-3">
        <p>Replaces traditional race selections. Each character gravitated to a primal elemental energy, granting a permanent +1 bonus to a core attribute:</p>
        <p><strong>Air:</strong> grants <strong>+1 Coordination</strong> (agile, free-spirited, swift movement).</p>
        <p><strong>Earth:</strong> grants <strong>+1 Vigor</strong> (dense, sturdy, mountain-like endurance).</p>
        <p><strong>Fire:</strong> grants <strong>+1 Power</strong> (fierce, intense, burning strength).</p>
        <p><strong>Water:</strong> grants <strong>+1 Empathy</strong> (flowing, perceptive, tide-like emotional depth).</p>
        <p><strong>Aether:</strong> grants <strong>+1 Attunement</strong> (planar, cosmic, linked to magical ley lines).</p>
      </div>
    )
  },
  behavioral: {
    title: 'Behavioral Sliders',
    content: (
      <div className="space-y-3">
        <p>Interactive sliders that define your personality vectors, used by GMs to tailor dialogues and automatic action responses:</p>
        <p><strong>Practicality (Pragmatic vs. Idealistic):</strong> Pragmatic characters prioritize logic, efficiency, and cold realities. Idealistic characters prioritize heroism, moral duties, and hope.</p>
        <p><strong>Action (Cautious vs. Reckless):</strong> Cautious characters analyze risks, wait, and plan ahead. Reckless characters act impulsively, charge in, and trust their reflexes.</p>
      </div>
    )
  },
  attributes: {
    title: 'Core Attributes (Stats)',
    content: (
      <div className="space-y-2">
        <p>Attributes represent your raw talent and scale your opposed roll dice types (d4 to d12):</p>
        <p><strong>Power:</strong> Melee combat, damage, lifting, and blocking.</p>
        <p><strong>Coordination:</strong> Manual dexterity, reflexes, ranged combat, and stealth.</p>
        <p><strong>Vigor:</strong> Health pool size, stamina, and physical endurance.</p>
        <p><strong>Willpower:</strong> Mental shield, fear resistance, and magical focus.</p>
        <p><strong>Intellect:</strong> Lore, languages, logic, locks, and herbalism.</p>
        <p><strong>Charisma:</strong> Leadership, speechcraft, and social deception.</p>
        <p><strong>Attunement:</strong> Arcane drawing, magic weaving, and luck checks.</p>
        <p><strong>Empathy:</strong> Understanding others, divine magic, and animal connection.</p>
      </div>
    )
  }
};

export default function CharacterCreation({ onCreateCharacter, onBack, layoutMode = 'desktop' }) {
  const isDesktopLayout = layoutMode === 'desktop';
  // Identity states
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('middle'); // 'youth', 'middle', 'elder'
  const [element, setElement] = useState('air');
  const [portraitUrl, setPortraitUrl] = useState(null);
  const [portraitSeed, setPortraitSeed] = useState(null);
  
  const [activeInfo, setActiveInfo] = useState(null);
  
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const fileInputRef = useRef(null);
  const [galleryGenderFilter, setGalleryGenderFilter] = useState('All');
  const [galleryAgeFilter, setGalleryAgeFilter] = useState('All');

  // Automatically sync gallery filter with chosen character gender/age when opening modal
  useEffect(() => {
    if (isGalleryOpen) {
      setGalleryGenderFilter(gender);
      setGalleryAgeFilter(age);
    }
  }, [isGalleryOpen, gender, age]);

  const handleSelectPreset = (index) => {
    setPortraitUrl(`/portraits/portrait_${index}.jpg`);
    setPortraitSeed(index);
    setIsGalleryOpen(false);
  };

  const handleUploadPortrait = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPortraitUrl(event.target.result);
      setPortraitSeed(9999); // custom upload flag
    };
    reader.readAsDataURL(file);
  };

  // Allocation pools
  const [attributes, setAttributes] = useState({
    power: 0,
    coordination: 0,
    vigor: 0,
    willpower: 0,
    intellect: 0,
    charisma: 0,
    attunement: 0,
    empathy: 0
  });

  const [chosenProfessions, setChosenProfessions] = useState([]); // array of ids
  const [hobbySkills, setHobbySkills] = useState([]); // array of ids

  // Personality states
  const [philosophy, setPhilosophy] = useState(() => ALLEGIANCES[Math.floor(Math.random() * ALLEGIANCES.length)]);
  const [virtue, setVirtue] = useState(() => VIRTUES[Math.floor(Math.random() * VIRTUES.length)]);
  const [vice, setVice] = useState(() => VICES[Math.floor(Math.random() * VICES.length)]);
  const [practicality, setPracticality] = useState(0); // -5 to +5
  const [action, setAction] = useState(0); // -5 to +5

  // Calculations for remaining pools
  const maxAttributesLimit = 5;
  
  // Starting distributable points based on age (total sheet attributes is 24, so base is 8, meaning we distribute 16 plus age modifier)
  const getAttributePool = () => {
    if (age === 'youth') return 10;
    if (age === 'middle') return 9;
    return 8; // elder
  };

  const getProfessionSlots = () => {
    if (age === 'youth') return 1;
    if (age === 'middle') return 3;
    return 5; // elder
  };

  const getHobbyPoints = () => {
    if (age === 'youth') return 3;
    if (age === 'middle') return 4;
    return 5; // elder
  };

  // Reset allocations if Age changes
  useEffect(() => {
    setAttributes({
      power: 0,
      coordination: 0,
      vigor: 0,
      willpower: 0,
      intellect: 0,
      charisma: 0,
      attunement: 0,
      empathy: 0
    });
    setChosenProfessions([]);
    setHobbySkills([]);
  }, [age]);

  // Adjust spent points if Element changes to keep final scores capped at 5
  useEffect(() => {
    setAttributes((prev) => {
      const updated = { ...prev };
      const elementData = ELEMENTS_LIST.find((e) => e.id === element);
      Object.keys(updated).forEach((stat) => {
        let elementMod = 0;
        if (elementData && elementData.bonus && elementData.bonus[stat]) {
          elementMod = elementData.bonus[stat];
        }
        const finalScore = 1 + elementMod + updated[stat];
        if (finalScore > 5) {
          updated[stat] = Math.max(0, 5 - 1 - elementMod);
        }
      });
      return updated;
    });
  }, [element]);

  // Compute points spent
  const attributePointsSpent = Object.values(attributes).reduce((a, b) => a + b, 0);
  const attributePointsRemaining = getAttributePool() - attributePointsSpent;

  const professionSlotsRemaining = getProfessionSlots() - chosenProfessions.length;
  const hobbyPointsRemaining = getHobbyPoints() - hobbySkills.length;

  // Handles attribute changes
  const handleAttrChange = (stat, amount) => {
    const currentSpent = attributes[stat] || 0;
    const nextSpent = currentSpent + amount;
    
    // Check caps (stat score = base 1 + element mod + spent; we cap the final value at 5)
    const elementData = ELEMENTS_LIST.find((e) => e.id === element);
    let elementMod = 0;
    if (elementData && elementData.bonus && elementData.bonus[stat]) {
      elementMod = elementData.bonus[stat];
    }
    const finalScore = 1 + elementMod + nextSpent;

    if (nextSpent >= 0 && finalScore <= maxAttributesLimit && attributePointsRemaining - amount >= 0) {
      setAttributes((prev) => ({ ...prev, [stat]: nextSpent }));
    }
  };

  // Handles profession selection (stacking enabled!)
  const handleAddProfession = (profId) => {
    if (professionSlotsRemaining > 0) {
      setChosenProfessions((prev) => [...prev, profId]);
    }
  };

  const handleRemoveProfession = (idxToRemove) => {
    setChosenProfessions((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Handles hobby points
  const handleAddHobby = (skillId) => {
    // We check if skill rank + hobby ranks <= 5
    const existingRanks = getSkillRanks(skillId);
    if (hobbyPointsRemaining > 0 && existingRanks < 5) {
      setHobbySkills((prev) => [...prev, skillId]);
    }
  };

  const handleRemoveHobby = (idxToRemove) => {
    setHobbySkills((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Calculate live ranks in a skill for display
  const getSkillRanks = (skillId) => {
    let ranks = 0;
    
    // Ranks from professions
    chosenProfessions.forEach((profId) => {
      const prof = PROFESSIONS_LIST.find((p) => p.id === profId);
      if (prof && prof.skills.includes(skillId)) {
        ranks += 1;
      }
    });

    // Ranks from hobbies
    hobbySkills.forEach((skId) => {
      if (skId === skillId) {
        ranks += 1;
      }
    });

    return Math.min(5, ranks);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (attributePointsRemaining !== 0) return;
    if (professionSlotsRemaining !== 0) return;
    if (hobbyPointsRemaining !== 0) return;

    onCreateCharacter({
      name: name.trim(),
      gender,
      age,
      element,
      attributes,
      professions: chosenProfessions,
      hobbySkills,
      virtue,
      vice,
      philosophy,
      personality: { practicality, action },
      portraitUrl,
      portraitSeed
    });
  };

  const handleRandomName = () => {
    const maleFirsts = [
      'Alden', 'Bram', 'Caelen', 'Drystan', 'Eldrin', 'Faelan', 'Garrick', 'Harek', 'Ignis', 'Jarek',
      'Kaelen', 'Leif', 'Marek', 'Orion', 'Phelan', 'Roran', 'Soren', 'Torin', 'Valen', 'Zephyr',
      'Alistair', 'Benedict', 'Cedric', 'Darius', 'Eamon', 'Finnian', 'Gideon', 'Hadrian', 'Idris', 'Julian',
      'Kian', 'Lysander', 'Magnus', 'Nolan', 'Osric', 'Percival', 'Quentin', 'Rowan', 'Silas', 'Tristan',
      'Uric', 'Vance', 'Wulfric', 'Xander', 'Yvain', 'Zane', 'Thaddeus', 'Cassian', 'Lucius', 'Roderick'
    ];
    const femaleFirsts = [
      'Althea', 'Brina', 'Carys', 'Dahlia', 'Eira', 'Fiona', 'Gwen', 'Halia', 'Isolde', 'Juno',
      'Kira', 'Lyra', 'Morrigan', 'Nesta', 'Oona', 'Phara', 'Rowena', 'Sylvia', 'Talia', 'Vesper',
      'Aurelia', 'Beatrix', 'Celeste', 'Diana', 'Evangeline', 'Freya', 'Genevieve', 'Helena', 'Iris', 'Juliet',
      'Katrina', 'Lorelei', 'Maeve', 'Niamh', 'Ophelia', 'Penelope', 'Quinn', 'Rosalind', 'Seraphina', 'Theresa',
      'Una', 'Valerie', 'Wynn', 'Xenia', 'Yvaine', 'Zelda', 'Lyanna', 'Briar', 'Elara', 'Giselle', 'Fay'
    ];
    const surnames = [
      'Stoneborn', 'Windrunner', 'Forgehand', 'Everflow', 'Starward', 'Ironclad', 'Stormweaver', 'Sunshield',
      'Shadowvale', 'Moonbrook', 'Grimward', 'Ashwood', 'Deeprock', 'Skyline', 'Frostfire', 'Goldvein',
      'Spellbound', 'Oakheart', 'Silverwood', 'Brighton', 'Duskwalker', 'Dawnstrider', 'Tidecaller', 'Earthshaper',
      'Blightbane', 'Blackwood', 'Stormborn', 'Ironwood', 'Valerius', 'Hawkseye', 'Ravenscar', 'Spellweaver',
      'Drakeshield', 'Silverflame', 'Oakenshield', 'Swiftwind', 'Frostgiant', 'Shadowcast', 'Nightshade', 'Sunfire',
      'Wyvernbane', 'Runekeeper', 'Gloomwalker', 'Goldfinder', 'Deepwell', 'Highcliff', 'Redthorne', 'Wildheart',
      'Brightwood', 'Starfall', 'Dreadwood'
    ];

    let firstNames = maleFirsts.concat(femaleFirsts);
    if (gender === 'Male') firstNames = maleFirsts;
    else if (gender === 'Female') firstNames = femaleFirsts;

    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = surnames[Math.floor(Math.random() * surnames.length)];
    setName(`${first} ${last}`);

    // Randomize Moral Alignment on character random generation
    setPhilosophy(ALLEGIANCES[Math.floor(Math.random() * ALLEGIANCES.length)]);
    setVirtue(VIRTUES[Math.floor(Math.random() * VIRTUES.length)]);
    setVice(VICES[Math.floor(Math.random() * VICES.length)]);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 max-w-5xl mx-auto w-full overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-amber-500/20 pb-4 mb-6">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-350 hover:text-amber-400 cursor-pointer transition-colors"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-amber-400 font-serif">Chronicle Initiation</h2>
          <p className="text-3xs text-slate-450 uppercase tracking-widest font-semibold">
            Sculpt your character stats, skills, and alignments
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-8 py-2">
        
        {/* Stage 1: Identity & Age & Element */}
        <div className={`grid gap-6 ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
          
          {/* Identity Box (includes Age Selection) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-2 font-serif">Identity</h3>
              <div className="space-y-2">
                <label className="block text-2xs text-slate-400 font-semibold mb-1">Character Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-amber-500 text-slate-200 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={handleRandomName}
                  className="w-full py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/35 text-3xs font-bold text-amber-455 hover:text-amber-400 cursor-pointer transition-colors"
                >
                  🎲 Random Name
                </button>
              </div>
              <div>
                <label className="block text-2xs text-slate-400 font-semibold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-medium focus:outline-none"
                >
                  <option value="Male" className="bg-slate-900 text-slate-200">Male</option>
                  <option value="Female" className="bg-slate-900 text-slate-200">Female</option>
                  <option value="Other" className="bg-slate-900 text-slate-200">Other / Non-binary</option>
                </select>
              </div>
            </div>

            {/* Age Selection */}
            <div className="border-t border-slate-800/60 pt-4 mt-2">
              <div className="flex items-center gap-1.5 mb-3">
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-serif">Age & Experience</h3>
                <button
                  type="button"
                  onClick={() => setActiveInfo(HELP_TEXTS.age)}
                  className="w-3.5 h-3.5 rounded-full border border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-400 text-4xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                  title="Age Info"
                >
                  ?
                </button>
              </div>
              <div className="space-y-2.5">
                {[
                  { id: 'youth', name: 'Youthful', desc: '+10 Stat Points, 1 Profession Slot, 3 Hobby Points.' },
                  { id: 'middle', name: 'Middle Age', desc: '+9 Stat Points, 3 Profession Slots, 4 Hobby Points.' },
                  { id: 'elder', name: 'Elder', desc: '+8 Stat Points, 5 Profession Slots, 5 Hobby Points.' }
                ].map((a) => (
                  <label
                    key={a.id}
                    className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-all duration-200 ${
                      age === a.id
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : 'bg-slate-955/40 border-slate-800 hover:border-slate-750'
                    }`}
                  >
                    <input
                      type="radio"
                      name="age"
                      value={a.id}
                      checked={age === a.id}
                      onChange={() => setAge(a.id)}
                      className="mt-1 accent-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{a.name}</span>
                      <span className="text-4xs text-slate-500 leading-normal block mt-0.5">{a.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Portrait Box */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-2 font-serif">Portrait</h3>
              <div className="relative w-full aspect-square rounded-lg border border-slate-850 bg-slate-950/80 overflow-hidden flex items-center justify-center group mb-3">
                {portraitUrl ? (
                  <img
                    src={portraitUrl}
                    alt="Character Portrait"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="w-10 h-10 rounded-full border border-dashed border-amber-500/20 flex items-center justify-center mx-auto mb-2 text-amber-500/40 font-serif text-sm">
                      ?
                    </div>
                    <span className="text-5xs text-slate-550 uppercase tracking-wider font-semibold">No Portrait</span>
                  </div>
                )}
              </div>
              <p className="text-5xs text-slate-500 leading-normal mb-2">
                Upload a custom image portrait, or select from our pre-generated filtered library.
              </p>
            </div>
            
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadPortrait}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 rounded text-3xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-455 hover:text-amber-400 transition-all cursor-pointer text-center"
              >
                Upload Image
              </button>
              
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="flex-1 py-2 rounded text-3xs font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-455 hover:text-amber-400 transition-all cursor-pointer text-center"
              >
                Preset Gallery
              </button>
            </div>
          </div>

          {/* Elemental Gravitation */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-serif">Elemental Affinity</h3>
              <button
                type="button"
                onClick={() => setActiveInfo(HELP_TEXTS.element)}
                className="w-3.5 h-3.5 rounded-full border border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-400 text-4xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                title="Primal Element Info"
              >
                ?
              </button>
            </div>
            <div className="space-y-2">
              {ELEMENTS_LIST.map((e) => (
                <label
                  key={e.id}
                  className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-all duration-200 ${
                    element === e.id
                      ? 'bg-amber-500/10 border-amber-500/50'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="element"
                    value={e.id}
                    checked={element === e.id}
                    onChange={() => setElement(e.id)}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">{e.name}</span>
                    <span className="text-4xs text-slate-500 leading-normal block mt-0.5">{e.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Stage 2: Attribute Point Allocation */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-5">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-bold text-amber-300 uppercase tracking-wider font-serif">
                Core Attributes
              </h3>
              <button
                type="button"
                onClick={() => setActiveInfo(HELP_TEXTS.attributes)}
                className="w-4 h-4 rounded-full border border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-400 text-3xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                title="Primal Attributes Info"
              >
                ?
              </button>
            </div>
            <span className={`px-3 py-1 text-xs rounded border font-semibold ${
              attributePointsRemaining > 0 
                ? 'bg-amber-950/50 text-amber-400 border-amber-500/30 animate-pulse'
                : 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
            }`}>
              Points Remaining: {attributePointsRemaining}
            </span>
          </div>

          <div className={`grid gap-4 ${isDesktopLayout ? 'grid-cols-4' : 'grid-cols-1'}`}>
            {ATTRIBUTE_LIST.map((attr) => {
              const spent = attributes[attr.id] || 0;
              const elementData = ELEMENTS_LIST.find((e) => e.id === element);
              let elementMod = 0;
              if (elementData && elementData.bonus && elementData.bonus[attr.id]) {
                elementMod = elementData.bonus[attr.id];
              }
              const finalScore = 1 + elementMod + spent;

              return (
                <div key={attr.id} className="p-3 rounded bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 capitalize">{attr.id}</span>
                    <div className="text-4xs text-slate-500 mt-0.5 flex gap-1 font-semibold uppercase">
                      <span>Base 1</span>
                      {elementMod > 0 && (
                        <span className="text-emerald-400">
                          +{elementMod}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAttrChange(attr.id, -1)}
                      disabled={spent <= 0}
                      className="w-6 h-6 rounded bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-slate-400 hover:text-rose-500 hover:border-rose-900/30 disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-amber-450 min-w-4 text-center">
                      {finalScore}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAttrChange(attr.id, 1)}
                      disabled={finalScore >= maxAttributesLimit || attributePointsRemaining <= 0}
                      className="w-6 h-6 rounded bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-slate-400 hover:text-emerald-500 hover:border-emerald-900/30 disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage 3: Starting Professions Slots (Stackable) */}
        <div className={`grid gap-6 ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
          
          {/* Selected Slots List */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-serif">Profession Slots</h3>
                <span className={`px-2 py-0.5 rounded text-3xs font-semibold ${
                  professionSlotsRemaining > 0 
                    ? 'bg-amber-950 text-amber-400'
                    : 'bg-emerald-950 text-emerald-400'
                }`}>
                  Remaining: {professionSlotsRemaining}
                </span>
              </div>
              
              <div className="space-y-2">
                {chosenProfessions.length === 0 ? (
                  <p className="text-xs text-slate-550 italic">No professions assigned.</p>
                ) : (
                  chosenProfessions.map((profId, idx) => {
                    const prof = PROFESSIONS_LIST.find((p) => p.id === profId);
                    return (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-850">
                        <span className="text-xs font-bold text-slate-300">{prof?.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProfession(idx)}
                          className="text-3xs uppercase tracking-wider font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <p className="text-4xs text-slate-550 leading-relaxed mt-4 pt-4 border-t border-slate-850/60">
              *You can select the same profession multiple times to stack and concentrate starting skill bonuses.
            </p>
          </div>

          {/* Profession Selection Grid */}
          <div className="col-span-2 rounded-lg border border-slate-800 bg-slate-900/30 p-5">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3 font-serif">Assign Slots</h3>
            <div className={`grid gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1 ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {PROFESSIONS_LIST.map((prof) => {
                const count = chosenProfessions.filter((p) => p === prof.id).length;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleAddProfession(prof.id)}
                    disabled={professionSlotsRemaining <= 0}
                    className={`p-2.5 rounded border text-left flex justify-between items-center transition-all ${
                      count > 0
                        ? 'bg-amber-500/5 border-amber-500/50'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-750 disabled:opacity-40'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{prof.name}</span>
                      <span className="text-4xs text-slate-500 mt-1 block">
                        {prof.skills.map((s) => s.split('_').join(' ')).join(', ')}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-3xs font-extrabold">
                        x{count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Stage 4: Hobby Skill Points */}
        <div className={`grid gap-6 ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
          
          {/* Selected Hobbies List */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-serif">Hobby Ranks</h3>
                <span className={`px-2 py-0.5 rounded text-3xs font-semibold ${
                  hobbyPointsRemaining > 0 
                    ? 'bg-amber-950 text-amber-400'
                    : 'bg-emerald-950 text-emerald-400'
                }`}>
                  Remaining: {hobbyPointsRemaining}
                </span>
              </div>
              
              <div className="space-y-2">
                {hobbySkills.length === 0 ? (
                  <p className="text-xs text-slate-550 italic">No hobby points spent.</p>
                ) : (
                  hobbySkills.map((skId, idx) => {
                    const sk = SKILLS_LIST.find((s) => s.id === skId);
                    return (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-850">
                        <span className="text-xs font-bold text-slate-300">{sk?.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHobby(idx)}
                          className="text-3xs uppercase tracking-wider font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <p className="text-4xs text-slate-550 leading-relaxed mt-4 pt-4 border-t border-slate-850/60">
              *Hobby points are free-spend points. They can be added to any skill to increase it by `+1` (cannot exceed 5).
            </p>
          </div>

          {/* Skills Grid for Hobbies */}
          <div className="col-span-2 rounded-lg border border-slate-800 bg-slate-900/30 p-5">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3 font-serif">Select Hobbies</h3>
            <div className={`grid gap-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1 ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {SKILLS_LIST.map((sk) => {
                const totalRanks = getSkillRanks(sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => handleAddHobby(sk.id)}
                    disabled={hobbyPointsRemaining <= 0 || totalRanks >= 5}
                    className={`p-2 rounded border text-left flex justify-between items-center transition-all ${
                      totalRanks > 0
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 disabled:opacity-40'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-350 block capitalize">{sk.name}</span>
                      <span className="text-4xs text-slate-550 mt-0.5 block">{sk.desc}</span>
                    </div>
                    {totalRanks > 0 && (
                      <span className="text-2xs font-extrabold text-amber-450">
                        {totalRanks} Ranks
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Stage 5: Alignments & Personality Sliders */}
        <div className={`rounded-lg border border-slate-800 bg-slate-900/30 p-5 grid gap-6 ${isDesktopLayout ? 'grid-cols-2' : 'grid-cols-1'}`}>
          
          {/* Moral Alignments */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-slate-850 pb-2 mb-2 font-serif">
              Moral Alignment
            </h3>
            
            <div className={`grid gap-3 ${isDesktopLayout ? 'grid-cols-3' : 'grid-cols-1'}`}>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-2xs text-slate-400 font-semibold">Philosophy</label>
                  <button
                    type="button"
                    onClick={() => setActiveInfo(HELP_TEXTS.philosophy)}
                    className="w-3.5 h-3.5 rounded-full border border-amber-500/20 text-amber-500/70 hover:text-amber-400 text-5xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ?
                  </button>
                </div>
                <select
                  value={philosophy}
                  onChange={(e) => setPhilosophy(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-955 border border-slate-800 rounded text-slate-200 text-xs font-semibold focus:outline-none"
                >
                  {ALLEGIANCES.map(a => (
                    <option key={a} value={a} className="bg-slate-900 text-slate-200">{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-2xs text-slate-400 font-semibold">Core Virtue</label>
                  <button
                    type="button"
                    onClick={() => setActiveInfo(HELP_TEXTS.virtue)}
                    className="w-3.5 h-3.5 rounded-full border border-amber-500/20 text-amber-500/70 hover:text-amber-400 text-5xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ?
                  </button>
                </div>
                <select
                  value={virtue}
                  onChange={(e) => setVirtue(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-955 border border-slate-800 rounded text-slate-200 text-xs font-semibold focus:outline-none"
                >
                  {VIRTUES.map(v => (
                    <option key={v} value={v} className="bg-slate-900 text-slate-200">{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="block text-2xs text-slate-400 font-semibold">Core Vice</label>
                  <button
                    type="button"
                    onClick={() => setActiveInfo(HELP_TEXTS.vice)}
                    className="w-3.5 h-3.5 rounded-full border border-amber-500/20 text-amber-500/70 hover:text-amber-400 text-5xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ?
                  </button>
                </div>
                <select
                  value={vice}
                  onChange={(e) => setVice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-955 border border-slate-800 rounded text-slate-200 text-xs font-semibold focus:outline-none"
                >
                  {VICES.map(v => (
                    <option key={v} value={v} className="bg-slate-900 text-slate-200">{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Personality Interactive Sliders */}
          <div className="space-y-5">
            <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-2">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-serif">
                Behavioral Sliders
              </h3>
              <button
                type="button"
                onClick={() => setActiveInfo(HELP_TEXTS.behavioral)}
                className="w-3.5 h-3.5 rounded-full border border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-400 text-4xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                title="Sliders Info"
              >
                ?
              </button>
            </div>

            {/* Slider 1: Practicality */}
            <div>
              <div className="flex justify-between text-2xs font-semibold mb-1.5">
                <span className="text-slate-450">Pragmatic (Logical)</span>
                <span className="text-amber-450 font-bold">{practicality > 0 ? `+${practicality}` : practicality}</span>
                <span className="text-slate-450">Idealistic (Heroic)</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                value={practicality}
                onChange={(e) => setPracticality(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 2: Action */}
            <div>
              <div className="flex justify-between text-2xs font-semibold mb-1.5">
                <span className="text-slate-450">Cautious (Analytical)</span>
                <span className="text-amber-450 font-bold">{action > 0 ? `+${action}` : action}</span>
                <span className="text-slate-450">Reckless (Impulsive)</span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                value={action}
                onChange={(e) => setAction(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Submit */}
        <div className="border-t border-slate-900 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={
              !name.trim() ||
              attributePointsRemaining !== 0 ||
              professionSlotsRemaining !== 0 ||
              hobbyPointsRemaining !== 0
            }
            className={`px-8 py-3 rounded text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest hover:brightness-110 cursor-pointer shadow-lg hover:shadow-amber-500/10 active:scale-98 transition-all ${isDesktopLayout ? 'w-auto' : 'w-full'}`}
          >
            Awaken the Chronicle
          </button>
        </div>

      </form>

      {/* Interactive Help Modal Dialog */}
      {activeInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-300">
          <div className="fantasy-panel-gold rounded-xl p-6 max-w-sm w-full relative space-y-4 shadow-2xl border border-amber-500/30">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/30"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/30"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500/30"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/30"></div>
            
            <h3 className="text-md font-bold text-amber-300 font-serif border-b border-amber-500/20 pb-2 flex justify-between items-center">
              <span>{activeInfo.title}</span>
            </h3>
            
            <div className="text-3xs text-slate-300 space-y-2.5 leading-relaxed max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {activeInfo.content}
            </div>
            
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveInfo(null)}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-4xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Portrait Gallery Modal */}
      {isGalleryOpen && (() => {
        const filteredPresets = PRESET_METADATA.filter(p => {
          const matchGender = galleryGenderFilter === 'All' || p.gender.toLowerCase() === galleryGenderFilter.toLowerCase();
          const matchAge = galleryAgeFilter === 'All' || p.age.toLowerCase() === galleryAgeFilter.toLowerCase();
          return matchGender && matchAge;
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
            <div className="w-full max-w-4xl rounded-lg border-2 border-amber-500 bg-slate-900 p-6 shadow-2xl shadow-amber-500/20 text-left relative flex flex-col h-[85vh] max-h-[750px] animate-scaleUp">
              
              {/* Header border */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-2">
                <h2 className="text-xl font-bold text-amber-400 font-serif tracking-wide">
                  PRESET PORTRAIT LIBRARY
                </h2>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="text-slate-450 hover:text-rose-450 text-sm font-bold uppercase cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-800/60 pb-3 mb-4 bg-slate-950/40 p-2.5 rounded">
                <div className="flex items-center gap-4">
                  {/* Gender Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Gender:</span>
                    <select
                      value={galleryGenderFilter}
                      onChange={(e) => {
                        setGalleryGenderFilter(e.target.value);
                      }}
                      className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="All" className="bg-slate-900 text-slate-200">All Genders</option>
                      <option value="Male" className="bg-slate-900 text-slate-200">Male</option>
                      <option value="Female" className="bg-slate-900 text-slate-200">Female</option>
                      <option value="Other" className="bg-slate-900 text-slate-200">Other / Non-binary</option>
                    </select>
                  </div>
                  {/* Age Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Age:</span>
                    <select
                      value={galleryAgeFilter}
                      onChange={(e) => {
                        setGalleryAgeFilter(e.target.value);
                      }}
                      className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="All" className="bg-slate-900 text-slate-200">All Ages</option>
                      <option value="youth" className="bg-slate-900 text-slate-200">Youthful</option>
                      <option value="middle" className="bg-slate-900 text-slate-200">Middle Age</option>
                      <option value="elder" className="bg-slate-900 text-slate-200">Elder</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {filteredPresets.length} Portraits Found
                </div>
              </div>

              {/* Grid display of portraits */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 flex flex-wrap gap-3 pb-4">
                {filteredPresets.map((preset) => {
                  return (
                    <button
                      key={preset.index}
                      type="button"
                      onClick={() => handleSelectPreset(preset.index)}
                      className={`aspect-square relative rounded border border-slate-800 bg-slate-950 overflow-hidden hover:border-amber-500 group transition-all cursor-pointer block ${isDesktopLayout ? 'w-[calc((100%-8*12px)/9)]' : 'w-[calc((100%-3*12px)/4)]'}`}
                    >
                      <img
                        src={preset.path}
                        alt={`Preset ${preset.index}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-0.5 text-center text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Preset {preset.index}
                      </div>
                    </button>
                  );
                })}
                {filteredPresets.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-550 font-serif text-sm">
                    No presets match the selected filters.
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
