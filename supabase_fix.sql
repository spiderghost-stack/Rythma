-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;

-- Recréer avec TEXT pour les IDs (compatible avec les IDs existants)
CREATE TABLE preferences (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  current_week_key TEXT NOT NULL,
  start_hour INT NOT NULL DEFAULT 7,
  end_hour INT NOT NULL DEFAULT 24,
  first_day_of_week INT NOT NULL DEFAULT 1
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  recurring_type TEXT,
  recurring_days TEXT[],
  week_key TEXT
);

CREATE TABLE records (
  task_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  week_key TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  validated_at TIMESTAMPTZ,
  PRIMARY KEY (task_id, week_key)
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  date TEXT NOT NULL
);

-- Activer Row Level Security
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Users own preferences" ON preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own records" ON records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);
