-- Tamil Real Estate Transactions Database Schema

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  survey_number TEXT,
  document_number TEXT,
  document_year TEXT,
  registration_date TEXT,
  execution_date TEXT,
  transaction_type TEXT,
  executant TEXT,
  claimant TEXT,
  plot_number TEXT,
  property_description TEXT,
  property_value TEXT,
  pdf_source VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_number ON transactions(document_number);
CREATE INDEX IF NOT EXISTS idx_survey_number ON transactions(survey_number);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON transactions(transaction_type);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE transactions IS 'Stores English-translated Tamil EC transaction data (original Tamil not persisted)';
COMMENT ON COLUMN transactions.executant IS 'Seller(s) combined Tamil -> translated to English later';
COMMENT ON COLUMN transactions.claimant IS 'Buyer(s) combined Tamil -> translated to English later';

