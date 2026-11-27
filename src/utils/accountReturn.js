import storage from './storage';

// Where the Account screen returns to after an OAuth or Stripe redirect.
// App.handleOpenAccount writes these just before the player can leave the
// page; they are read exactly once here, so a later sign-in from Splash can't
// "Back" into an old play screen or reopen an old section (grok-bot L1).
export function consumeAccountReturn() {
  const screen = storage.get('account_return_screen');
  const section = storage.get('account_return_section');
  storage.remove('account_return_screen');
  storage.remove('account_return_section');
  return { screen, section };
}

// Back from Account must never open a screen whose data isn't loaded: after
// an account switch the local slots are wiped, and PlayScreen dereferences
// character.stats (grok-bot S2).
export function safeBackScreen(prevScreen, character, activeAdventureId) {
  const hasCharacter = !!(character?.name && character?.stats);
  if (prevScreen === 'play') {
    if (hasCharacter && activeAdventureId) return 'play';
    return hasCharacter ? 'adventure_selection' : 'splash';
  }
  if (prevScreen === 'adventure_selection' && !hasCharacter) return 'splash';
  return prevScreen || 'splash';
}
