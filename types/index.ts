// New extraction interface aligned with system.txt schema (camelCase keys)
// All fields are nullable strings; subdivisionNumber intentionally excluded.
export interface ExtractedTransaction {
  surveyNumber: string | null;
  documentNumber: string | null;
  documentYear: string | null;
  registrationDate: string | null;
  executionDate: string | null;
  transactionType: string | null;
  executant: string | null; // Tamil sellers combined
  claimant: string | null; // Tamil buyers combined
  plotNumber: string | null;
  propertyDescription: string | null;
  propertyValue: string | null;
}

// After translation we still keep same shape (English text where applicable)
export type TranslatedTransaction = ExtractedTransaction;

// Transaction from database (includes id and timestamps)
export interface Transaction extends ExtractedTransaction {
  id: number;
  pdfSource: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mapping of camelCase to snake_case DB columns
export const TRANSACTION_DB_COLUMN_MAP: Record<keyof ExtractedTransaction, string> = {
  surveyNumber: "survey_number",
  documentNumber: "document_number",
  documentYear: "document_year",
  registrationDate: "registration_date",
  executionDate: "execution_date",
  transactionType: "transaction_type",
  executant: "executant",
  claimant: "claimant",
  plotNumber: "plot_number",
  propertyDescription: "property_description",
  propertyValue: "property_value"
};

export interface User {
  username: string;
  password: string;
}

