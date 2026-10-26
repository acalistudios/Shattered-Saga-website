import { ADVENTURES_LIST } from './adventures';
import { buildPatrolAdventure, isPatrolId } from '../utils/patrolEngine';

// The adventure being played: an authored adventure, or a Road Patrol scene
// built from its travel encounter (utils/patrolEngine.js).
export function getAdventureById(id) {
  if (!id) return null;
  if (isPatrolId(id)) return buildPatrolAdventure(id);
  return ADVENTURES_LIST.find(a => a.id === id) || null;
}
