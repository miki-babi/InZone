import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  age: int().notNull(),
  email: text().notNull().unique(),
});

export const taskTable = sqliteTable("task_table", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  completed: integer("completed", { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const focusSessionTable = sqliteTable("focus_session_table", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  duration: int().notNull(), // in seconds
  mood: text(), // emoji or text
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const notesTable = sqliteTable("notes_table", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  // type can be 'note' or 'goal'
  type: text().default('note').notNull(),
  category: text().default('General'),
  completed: integer("completed", { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const voiceJournalTable = sqliteTable("voice_journal_table", {
  id: int().primaryKey({ autoIncrement: true }),
  filePath: text("file_path").notNull(), // path to the audio file
  category: text().notNull(), // category like Work, Personal, Ideas
  recordedAt: integer("recorded_at", { mode: "timestamp" }).$defaultFn(() => new Date()), // timestamp in ms
});