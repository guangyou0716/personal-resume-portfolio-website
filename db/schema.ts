import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const portfolioProfile = sqliteTable("portfolio_profile", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
