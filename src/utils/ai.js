// AI Integration Layer for Shattered Saga (V4)

/**
 * Roll a standard die with N sides.
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll the Primary Attribute step die.
 */
export function rollAttributePrimary(score) {
  if (score <= 1) return rollDie(4);
  if (score === 2) return rollDie(6);
  if (score === 3) return rollDie(8);
  if (score === 4) return rollDie(10);
  if (score === 5) return rollDie(12);
  if (score === 6) return rollDie(20);
  // Scaling for monstrous/epic stats
  if (score === 7) return rollDie(20) + rollDie(4);
  if (score === 8) return rollDie(20) + rollDie(6);
  if (score === 9) return rollDie(20) + rollDie(8);
  if (score === 10) return rollDie(20) + rollDie(10);
  return rollDie(20) + rollDie(12); // score 11+
}

/**
 * Roll the Secondary Attribute step die.
 */
export function rollAttributeSecondary(score) {
  if (score <= 1) return rollDie(2);
  if (score === 2) return rollDie(2) + 1;
  if (score === 3) return rollDie(4);
  if (score === 4) return rollDie(4) + 1;
  if (score === 5) return rollDie(6);
  if (score === 6) return rollDie(10);
  // Scaling for monstrous/epic stats
  if (score === 7) return rollDie(10) + rollDie(2);
  if (score === 8) return rollDie(10) + rollDie(4);
  if (score === 9) return rollDie(10) + rollDie(6);
  if (score === 10) return rollDie(10) + rollDie(8);
  return rollDie(10) + rollDie(10); // score 11+
}

/**
 * Roll skill d2 coins (binomial curve).
 */
export function rollSkillRanks(ranks) {
  let total = 0;
  for (let i = 0; i < ranks; i++) {
    total += rollDie(2);
  }
  return total;
}

/**
 * Roll the opposing resistance based on difficulty description.
 */
export function rollResistance(difficulty) {
  const diffLower = difficulty?.toLowerCase() || 'moderate';
  if (diffLower === 'easy' || diffLower === 'novice') {
    return rollDie(6) + (rollDie(2) + 1);
  }
  if (diffLower === 'moderate' || diffLower === 'professional') {
    return rollDie(10) + rollDie(4);
  }
  if (diffLower === 'hard' || diffLower === 'veteran') {
    return rollDie(12) + rollDie(6);
  }
  if (diffLower === 'extreme' || diffLower === 'legendary') {
    return rollDie(12) + rollDie(6) + rollSkillRanks(3); // d12 + d6 + 3d2
  }
  // Fallback
  return rollDie(10) + rollDie(4);
}

/**
 * Performs a complete client-side opposed roll.
 */
export function executeOpposedCheck({
  skillName,
  primaryAttr,
  primaryScore,
  secondaryAttr,
  secondaryScore,
  skillRanks,
  difficulty,
  roleplayModifier = 0,
  resistanceModifier = 0,
  potencyModifier = 0
}) {
  const primaryRoll = rollAttributePrimary(primaryScore);
  const secondaryRoll = rollAttributeSecondary(secondaryScore);
  const skillRoll = rollSkillRanks(skillRanks);
  const playerTotal = primaryRoll + secondaryRoll + skillRoll + roleplayModifier + potencyModifier;

  const resistanceBase = rollResistance(difficulty);
  const resistanceTotal = resistanceBase + resistanceModifier;
  const margin = playerTotal - resistanceTotal;
  const success = margin > 0;
  const tie = margin === 0;

  let resultString = 'Success';
  if (tie) resultString = 'Standoff';
  if (margin < 0) resultString = 'Failure';

  const modifierText = roleplayModifier !== 0 ? ` + Modifier ${roleplayModifier >= 0 ? '+' : ''}${roleplayModifier}` : '';
  const potencyText = potencyModifier !== 0 ? ` + Potency +${potencyModifier}` : '';
  const complexityText = resistanceModifier !== 0 ? ` + Spell Complexity ${resistanceModifier}` : '';

  return {
    playerTotal,
    primaryRoll,
    secondaryRoll,
    skillRoll,
    resistanceTotal,
    margin,
    success,
    tie,
    text: `[Check: ${skillName} vs ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenge. Player Roll: ${playerTotal} (${primaryAttr} ${primaryRoll} + ${secondaryAttr} ${secondaryRoll} + Skill ${skillRoll}${modifierText}${potencyText}), Resistance: ${resistanceTotal} (Base ${resistanceBase}${complexityText}). ${resultString} (${margin >= 0 ? '+' : ''}${margin} margin)]`
  };
}

/**
 * Normalizes messages into the format required by the provider.
 */
function formatMessages(provider, systemPrompt, conversationHistory) {
  if (provider === 'gemini') {
    const contents = [];
    conversationHistory.forEach((msg) => {
      if (msg.role === 'system') return;
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const lastMsg = contents[contents.length - 1];
      if (lastMsg && lastMsg.role === role) {
        lastMsg.parts[0].text += `\n\n${msg.content}`;
      } else {
        contents.push({
          role: role,
          parts: [{ text: msg.content }]
        });
      }
    });

    if (contents.length > 0 && contents[0].role === 'model') {
      contents.unshift({
        role: 'user',
        parts: [{ text: 'Begin the adventure.' }]
      });
    }
    return { contents };
  } else {
    const messages = [];
    messages.push({ role: 'system', content: systemPrompt });
    conversationHistory.forEach((msg) => {
      if (msg.role === 'system') return;
      messages.push({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.content
      });
    });
    return { messages };
  }
}

/**
 * Main completion caller.
 */
async function readStream(response, provider, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let accumulatedText = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      if (provider === 'gemini') {
        let match;
        const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
        let currentText = "";
        while ((match = regex.exec(buffer)) !== null) {
          let val = match[1];
          val = val.replace(/\\n/g, "\n")
                   .replace(/\\t/g, "\t")
                   .replace(/\\"/g, '"')
                   .replace(/\\\\/g, '\\');
          currentText += val;
        }
        if (currentText && currentText !== accumulatedText) {
          accumulatedText = currentText;
          onChunk(accumulatedText);
        }
      } else {
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep partial line in buffer

        for (const line of lines) {
          const cleaned = line.trim();
          if (cleaned.startsWith("data: ")) {
            const dataStr = cleaned.slice(6);
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                accumulatedText += content;
                onChunk(accumulatedText);
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return accumulatedText;
}

// Client-side cache for prompt completions to optimize tokens, cost, and latency
const COMPLETIONS_CACHE = {};

export async function generateCompletion(params) {
  const { provider, model, systemPrompt, history, onChunk } = params;
  
  // Generate a key combining the provider, model, system instruction, and the last user input turn
  const lastUserMsg = [...history].reverse().find(m => m.role === 'user')?.content || '';
  const cacheKey = `${provider}||${model}||${systemPrompt}||${lastUserMsg}`;
  
  if (COMPLETIONS_CACHE[cacheKey]) {
    const cachedResponse = COMPLETIONS_CACHE[cacheKey];
    if (onChunk) {
      // Simulate streaming chunks for a smooth, consistent UI feel
      const text = cachedResponse.text;
      const step = Math.ceil(text.length / 5);
      let currentLen = 0;
      for (let i = 0; i < 5; i++) {
        currentLen += step;
        onChunk(text.slice(0, currentLen));
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      onChunk(text);
    }
    return cachedResponse;
  }
  
  const result = await executeRawCompletion(params);
  
  // Cache the response if there was no API error and it has actual text content
  if (result && result.text && !result.error) {
    COMPLETIONS_CACHE[cacheKey] = result;
  }
  
  return result;
}

/**
 * Raw completion caller.
 */
async function executeRawCompletion({
  provider,
  model,
  apiKey,
  systemPrompt,
  history,
  isHandoff = false,
  sandboxMode = false,
  characterData = null,
  currentSituation = null,
  sessionToken = null,
  onChunk = null
}) {
  if (sandboxMode || (!apiKey && !sessionToken)) {
    try {
      const messages = [];
      messages.push({ role: 'system', content: systemPrompt });
      history.forEach((msg) => {
        messages.push({
          role: msg.role === 'model' ? 'assistant' : msg.role,
          content: msg.content
        });
      });

      const requestBody = {
        messages: messages,
        model: isHandoff ? 'openai' : (provider === 'oracle' ? 'openai' : 'llama'),
        jsonMode: isHandoff,
        seed: Math.floor(Math.random() * 1000000)
      };

      if (onChunk) {
        requestBody.stream = true;
      }

      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        if (onChunk && response.body) {
          const text = await readStream(response, 'groq', onChunk);
          return {
            text: text,
            totalTokens: text.split(' ').length + 100,
            error: null
          };
        } else {
          const text = await response.text();
          return {
            text: text,
            totalTokens: text.split(' ').length + 100,
            error: null
          };
        }
      }
    } catch (e) {
      console.warn("Pollinations keyless fallback failed, returning local mock:", e);
    }

    return runSandboxMock(provider, history, isHandoff, characterData, currentSituation);
  }

  // Secure Serverless Proxy Path
  if (sessionToken) {
    try {
      const proxyUrl = import.meta.env.VITE_PROXY_URL || 'https://proxy.shatteredsaga.workers.dev';
      let requestBody = {};
      const headers = {
        'Content-Type': 'application/json',
        'X-Provider': provider,
        'X-Model': model,
        'Authorization': `Bearer ${sessionToken}`
      };

      if (onChunk) {
        headers['X-Stream'] = 'true';
      }

      if (provider === 'gemini') {
        const formatted = formatMessages('gemini', systemPrompt, history);
        requestBody = {
          contents: formatted.contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            maxOutputTokens: isHandoff ? 1000 : 400,
            temperature: isHandoff ? 0.2 : 0.7,
          }
        };

        if (isHandoff) {
          requestBody.generationConfig.responseMimeType = 'application/json';
        }
      } else if (provider === 'groq' || provider === 'cerebras') {
        const formatted = formatMessages(provider, systemPrompt, history);
        requestBody = {
          model: model,
          messages: formatted.messages,
          max_tokens: isHandoff ? 1000 : 400,
          temperature: isHandoff ? 0.2 : 0.7,
        };

        if (onChunk) {
          requestBody.stream = true;
        }

        if (isHandoff) {
          requestBody.response_format = { type: 'json_object' };
        }
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Proxy returned error status ${res.status}`);
      }

      if (onChunk && res.body) {
        const text = await readStream(res, provider, onChunk);
        return { text, totalTokens: text.split(' ').length + 100, error: null };
      }

      const data = await res.json();
      let text = '';
      let totalTokens = 200;

      if (provider === 'gemini') {
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        totalTokens = data.usageMetadata?.totalTokenCount || 200;
      } else {
        text = data.choices?.[0]?.message?.content || '';
        totalTokens = data.usage?.total_tokens || 200;
      }

      return { text, totalTokens, error: null };
    } catch (error) {
      console.error(`Proxy API Call failed for ${provider}:`, error);
      return { text: '', totalTokens: 0, error: error.message };
    }
  }

  // Direct Client-Side Call (BYOK fallback mode for offline/dev configurations)
  try {
    if (provider === 'gemini') {
      const formatted = formatMessages('gemini', systemPrompt, history);
      const action = onChunk ? 'streamGenerateContent' : 'generateContent';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${apiKey}`;
      
      const requestBody = {
        contents: formatted.contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          maxOutputTokens: isHandoff ? 1000 : 400,
          temperature: isHandoff ? 0.2 : 0.7,
        }
      };

      if (isHandoff) {
        requestBody.generationConfig.responseMimeType = 'application/json';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Gemini API returned status ${res.status}`);
      }

      if (onChunk && res.body) {
        const text = await readStream(res, 'gemini', onChunk);
        return { text, totalTokens: text.split(' ').length + 100, error: null };
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const totalTokens = data.usageMetadata?.totalTokenCount || 200;

      return { text, totalTokens, error: null };

    } else if (provider === 'groq' || provider === 'cerebras') {
      const formatted = formatMessages(provider, systemPrompt, history);
      const url = provider === 'groq' 
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.cerebras.ai/v1/chat/completions';
      
      const requestBody = {
        model: model,
        messages: formatted.messages,
        max_tokens: isHandoff ? 1000 : 400,
        temperature: isHandoff ? 0.2 : 0.7,
      };

      if (onChunk) {
        requestBody.stream = true;
      }

      if (isHandoff) {
        requestBody.response_format = { type: 'json_object' };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `${provider} API returned status ${res.status}`);
      }

      if (onChunk && res.body) {
        const text = await readStream(res, provider, onChunk);
        return { text, totalTokens: text.split(' ').length + 100, error: null };
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const totalTokens = data.usage?.total_tokens || 200;

      return { text, totalTokens, error: null };
    }

    throw new Error(`Unsupported provider: ${provider}`);
  } catch (error) {
    console.error(`API Call failed for ${provider}:`, error);
    return { text: '', totalTokens: 0, error: error.message };
  }
}

/**
 * Gets Pollinations AI image URL.
 */
export function getImageUrl(prompt) {
  const cleanPrompt = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=600&height=400&nologo=true`;
}

/**
 * Helper to generate sandbox responses locally for easy playtesting.
 */
function runSandboxMock(provider, history, isHandoff, characterData, currentSituation) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lastUserMsg = [...history].reverse().find(m => m.role === 'user')?.content || 'Begin';
      const charName = characterData?.name || 'Adventurer';

      if (isHandoff) {
        const handoffData = {
          world: {
            setting: characterData?.setting || "High Fantasy",
            tone: characterData?.tone || "Heroic",
            lore_notes: [
              "Ancient leylines flow beneath the valley floor.",
              "A runic portal hums at the top of the mountain.",
              "Ember-kin are gathering in the eastern plains."
            ]
          },
          player: characterData || {},
          npcs: [
            { name: "Sylas the Wise", role: "Sage", disposition: "Helpful" }
          ],
          current_situation: {
            location: currentSituation?.location || "The High Sanctuary",
            immediate_context: `The GM's presence fractures into golden elemental light. A powerful energy transition sweeps over ${charName}.`
          },
          open_plot_threads: ["Unlock the Sanctuary Gate"]
        };

        resolve({
          text: JSON.stringify(handoffData, null, 2),
          totalTokens: 600,
          error: null
        });
        return;
      }

      // Parse out user action check text if it exists
      const checkMatch = lastUserMsg.match(/\[Check:.*?\]/);
      const rollNotes = checkMatch ? checkMatch[0] : '';
      const wasSuccess = rollNotes ? rollNotes.includes('Success') : true;

      // Clean the user message for matching keywords
      const cleanMsg = lastUserMsg.replace(/\[Check:.*?\]/, '').toLowerCase().trim();

      // Determine setting based on character setting
      const setting = characterData?.element || 'fire';

      // Let's create dynamic narratives based on user action keywords
      let actionResponse = '';
      let imagePrompt = '';

      if (setting === 'fire') {
        imagePrompt = 'a volcanic canyon with rivers of lava and massive basalt columns, dark fantasy art, epic scales';
        if (cleanMsg.includes('gate') || cleanMsg.includes('enter') || cleanMsg.includes('go')) {
          actionResponse = wasSuccess
            ? 'You approach the massive Obsidian Gate. With a deep breath, you brace against the scorching heat and push forward. The gate opens with a heavy rumble, revealing a path leading deeper into the magma-filled basalt ridge.'
            : 'You attempt to approach the Obsidian Gate, but a sudden burst of pressurized sulfuric gas erupts from a nearby vent, forcing you to retreat and seek another vantage point.';
        } else if (cleanMsg.includes('vent') || cleanMsg.includes('dampen') || cleanMsg.includes('vapor')) {
          actionResponse = wasSuccess
            ? 'Using your keen reflexes, you block the thermal vents with loose basalt blocks, lowering the temperature in the corridor enough to advance safely.'
            : 'As you try to seal the vent, a jet of superheated steam blasts out, singeing your gear and forcing you back.';
        } else if (cleanMsg.includes('fight') || cleanMsg.includes('attack') || cleanMsg.includes('weapon') || cleanMsg.includes('warden')) {
          actionResponse = wasSuccess
            ? 'You strike at the volcanic wardens! Your weapon connects with high force, shattering their stony armor and sending sparks of embers flying into the dark air.'
            : 'The warden parries your blow with its fiery shield, the shockwave of the impact vibrating up your arms and leaving you off-balance.';
        } else {
          actionResponse = `You decide to ${lastUserMsg.replace(/\[Check:.*?\]/, '').trim()}. ${wasSuccess ? 'Your actions prove successful as you navigate the ash-strewn Basalt Ridge.' : 'The volcanic vents erupt suddenly, complicating your progress.'}`;
        }
      } else if (setting === 'water') {
        imagePrompt = 'a grand mystical library with floating scrolls, soft purple and blue arcane glyphs in the air, high fantasy art';
        if (cleanMsg.includes('shelves') || cleanMsg.includes('inspect') || cleanMsg.includes('look') || cleanMsg.includes('search')) {
          actionResponse = wasSuccess
            ? 'You browse the ancient bookshelves, finding ancient chronicles detailing the Spire\'s history and the locations of its key library wards.'
            : 'You inspect the shelves, but the damp conditions have caused the ink on the remaining scrolls to bleed, rendering the texts unreadable.';
        } else if (cleanMsg.includes('gateway') || cleanMsg.includes('gate') || cleanMsg.includes('go')) {
          actionResponse = wasSuccess
            ? 'You step through the runic gateway. The blue arcane runes flash with soft light, instantly transporting you into the dry sanctuary of the Spire library.'
            : 'As you touch the gateway, a protective ward sparks, sending a mild shock of cold water energy repelling your hand.';
        } else if (cleanMsg.includes('drain') || cleanMsg.includes('water') || cleanMsg.includes('pump')) {
          actionResponse = wasSuccess
            ? 'You successfully locate the drainage lever. With a grind of stone gears, the high-tide waters in the atrium begin to recede.'
            : 'The rusty drainage valves refuse to budge. You will need to find another way to clear the flooded corridors.';
        } else {
          actionResponse = `You attempt to ${lastUserMsg.replace(/\[Check:.*?\]/, '').trim()}. ${wasSuccess ? 'You move through the flooded Spire halls with fluid grace.' : 'A sudden rush of tide water washes through, forcing you to hold your footing.'}`;
        }
      } else {
        // air/default
        imagePrompt = 'a wooden suspension bridge suspended miles above the clouds, swaying gently in the roaring mountain wind, high fantasy';
        if (cleanMsg.includes('bridge') || cleanMsg.includes('cross') || cleanMsg.includes('walk') || cleanMsg.includes('go')) {
          actionResponse = wasSuccess
            ? 'You step onto the swaying Windrunner suspension bridge. Balancing against the roaring mountain wind, you safely traverse the chasm.'
            : 'The high-altitude wind gust knocks you off-balance. You cling tightly to the guide ropes, unable to make forward progress until the storm passes.';
        } else if (cleanMsg.includes('anchor') || cleanMsg.includes('gravity') || cleanMsg.includes('align')) {
          actionResponse = wasSuccess
            ? 'You realign the gravity anchor dial. A localized field of calm surrounds the bridge, stabilizing the sways.'
            : 'The gravity lock sparks violently, reversing its charge temporarily and making your steps feel twice as heavy.';
        } else {
          actionResponse = `You decide to ${lastUserMsg.replace(/\[Check:.*?\]/, '').trim()}. ${wasSuccess ? 'Your agility carries you forward across the floating islands.' : 'A gravity anomaly shifts, throwing off your sense of direction.'}`;
        }
      }

      let text = '';
      const activeRoom = characterData?.setting || 'The Runic Vestibule';
      const outputLocationTag = `[location: ${activeRoom}]`;
      const outputChoices = `\n[choice: Search the room | perception | novice]\n[choice: Inspect the local layout | survival | moderate]\n[choice: Attempt to force your way | athletics | veteran]`;

      if (provider === 'oracle' || provider === 'gemini') {
        text = `*The Oracle peers into the shimmering elemental green waters of her basin, her voice echoey and calm.* 
        
"Fate has taken notice of your actions, ${charName}. ${rollNotes ? `The spirits observe your roll outcome: ${rollNotes}.` : ''} 

${actionResponse}

What shall you attempt next under the weave?"

[image: ${imagePrompt}]`;
      } else if (provider === 'titan' || provider === 'groq') {
        text = `*The Obsidian Titan shifts, molten iron flowing in the seams of his rocky body as he raises a heavy arm.*

"SO BE IT! ${rollNotes ? `THE BEDROCK RE-ALIGNS TO YOUR EFFORT: ${rollNotes}.` : ''}

${actionResponse.toUpperCase()}

DECREE YOUR PATH AND TAKE THE GLORY!"

[image: ${imagePrompt}]`;
      } else {
        text = `*The Ancient archivist strokes his long silver beard, gesturing to the glowing text of a floating parchment.*

"The ancient historical chronicles speak of moments like this, ${charName}. ${rollNotes ? `The archives record a check outcome of: ${rollNotes}.` : ''}

${actionResponse}

Do you wish to continue exploring this path, or take a different action?"

[image: ${imagePrompt}]`;
      }

      // Append mock tags for location and choices to trigger parser updates
      text += `\n\n${outputLocationTag}${outputChoices}`;

      resolve({
        text,
        totalTokens: 520,
        error: null
      });
    }, 1200);
  });
}
