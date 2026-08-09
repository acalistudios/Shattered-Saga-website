-- Cloud saves + server-authoritative gems.
--
-- Gems previously lived in localStorage (`shattered_gems_<username>`), which made
-- them trivially editable in devtools and lost on cache clear. Since gems are
-- purchased and will buy marketplace items, they must be server-authoritative
-- like energy_balance already is.

ALTER TABLE users ADD COLUMN gems INTEGER NOT NULL DEFAULT 10;

-- JSON array of unlocked save-slot indexes, e.g. "[1,2]". Slots beyond the
-- default two are bought with gems, so this must also be server-side.
ALTER TABLE users ADD COLUMN unlocked_slots TEXT NOT NULL DEFAULT '[1,2]';

-- One row per (user, slot). `data` holds the whole slot payload as JSON; storing
-- it as a single blob keeps the game free to evolve its save shape without
-- schema migrations. `updated_at` drives last-write-wins conflict resolution.
CREATE TABLE IF NOT EXISTS save_slots (
  user_id     TEXT    NOT NULL,
  slot_index  INTEGER NOT NULL,
  data        TEXT    NOT NULL,
  char_name   TEXT,
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, slot_index),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS save_slots_user_idx ON save_slots(user_id);
