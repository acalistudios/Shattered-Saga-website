/** Opening an unlocked map is not travel: recovery services must stay reachable. */
export function getMapReadiness(character = {}) {
  const stats = character.stats || {};
  const hp = stats.hp ?? 10;
  const maxHp = stats.maxHp ?? 10;
  const fatigue = stats.fatigue ?? stats.maxFatigue ?? 15;
  const minTravelHp = Math.min(maxHp, Math.max(10, Math.floor(maxHp * 0.5)));
  return { hp, maxHp, fatigue, minTravelHp,
    canTravel: hp >= minTravelHp && fatigue > 0,
    canPatrol: hp >= minTravelHp && fatigue > 0,
  };
}
