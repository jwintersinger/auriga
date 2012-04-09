CREATE TABLE answered_questions (
  question_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL
);

CREATE TABLE answers (
  id INTEGER PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  correct INTEGER NOT NULL
);

CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  body TEXT NOT NULL
);

CREATE TABLE sessions (
  team_id INTEGER NOT NULL,
  token TEXT NOT NULL
);

CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT NOT NULL
);
