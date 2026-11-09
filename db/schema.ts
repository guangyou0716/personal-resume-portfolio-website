import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const portfolioProfile = sqliteTable("portfolio_profile", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const editorLoginAttempts = sqliteTable("editor_login_attempts", {
  key: text("key").primaryKey(),
  failures: integer("failures").notNull(),
  windowStart: integer("window_start").notNull(),
});
