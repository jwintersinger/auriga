CREATE TABLE answers (
  id INTEGER PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body TEXT
);

CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  body TEXT
);

CREATE TABLE sessions (
  team_id INTEGER NOT NULL,
  token TEXT NOT NULL
);

CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT
);
