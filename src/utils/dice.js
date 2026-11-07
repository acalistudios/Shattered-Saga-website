// Dice expressions such as "2d6+1" or an NPC defense "Coordination d8 + Vigor d4+1".
export function rollDiceExpression(expr, rng = Math.random) {
  if (!expr) return 0;
  // NPC defenses are authored as "Coordination d8 + Vigor d4+1": the words
  // name the attribute each die stands for. Drop them and roll the dice;
  // left in, they made every such term unparseable and the roll 0.
  let clean = String(expr).toLowerCase()
    .replace(/\b(?!\d*d\d+\b)[a-z][a-z_]*\b/g, '')
    .replace(/\s+/g, '');
  const terms = clean.split(/(?=[+-])/);
  let total = 0;
  for (let term of terms) {
    let sign = 1;
    if (term.startsWith('+')) {
      term = term.slice(1);
    } else if (term.startsWith('-')) {
      sign = -1;
      term = term.slice(1);
    }
    if (!term) continue;
    const match = term.match(/^(\d*)d(\d+)$/);
    if (match) {
      const count = match[1] ? parseInt(match[1], 10) : 1;
      const sides = parseInt(match[2], 10);
      let rollSum = 0;
      for (let i = 0; i < count; i++) {
        rollSum += Math.floor(rng() * sides) + 1;
      }
      total += sign * rollSum;
    } else {
      const num = parseInt(term, 10);
      if (!isNaN(num)) {
        total += sign * num;
      }
    }
  }
  return total;
}
