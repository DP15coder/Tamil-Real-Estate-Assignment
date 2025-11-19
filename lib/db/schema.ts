import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Fresh simplified transactions table per new spec
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  surveyNumber: text("survey_number"),
  documentNumber: text("document_number"),
  documentYear: text("document_year"),
  registrationDate: text("registration_date"),
  executionDate: text("execution_date"),
  transactionType: text("transaction_type"),
  executant: text("executant"),
  claimant: text("claimant"),
  plotNumber: text("plot_number"),
  propertyDescription: text("property_description"),
  propertyValue: text("property_value"),
  pdfSource: varchar("pdf_source", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

