# Tamil Transaction Extractor

Extract, translate, and search Tamil real estate transactions from PDF documents.

## What It Does

- Upload Tamil real estate PDF documents
- Extract transaction data automatically
- Translate Tamil names to English
- Store everything in PostgreSQL
- Search and filter transactions

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Drizzle ORM
- **PDF Processing**: pdf-parse + Custom Tamil parser

## Quick Setup

### 1. Prerequisites

```bash
# Install Node.js 18+, PostgreSQL 14+
```

### 2. Clone & Install

```bash
git clone <your-repo>
cd NiranAI
npm install
```

### 3. Database Setup

```bash
# Create database
createdb tamil_transactions

# Run schema
psql -d tamil_transactions -f schema.sql
```

### 4. Configure Environment

Create `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/tamil_transactions
JWT_SECRET=your_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Demo login (default values)
DEMO_USERNAME=admin
DEMO_PASSWORD=demo123
```

### 5. Run

```bash
npm run dev
```

Open `http://localhost:3000`

## Demo Login

```
Username: admin
Password: demo123
```

## How to Use

1. **Login** → Use demo credentials
2. **Upload PDF** → Drag/drop Tamil transaction PDF
3. **View Results** → Check extracted transactions
4. **Search** → Filter by buyer, seller, survey number, etc.

## Project Structure

```
/
├── app/
│   ├── api/                  # API endpoints
│   ├── dashboard/            # Protected pages
│   └── login/                # Auth page
├── lib/
│   ├── db/                   # Database schema & client
│   ├── pdf/                  # PDF extraction logic
│   ├── translation/          # Tamil → English translator
│   └── auth.ts               # JWT authentication
├── components/               # Reusable UI components
├── public/uploads/           # Uploaded PDFs
└── schema.sql               # Database schema
```

## API Endpoints

### POST `/api/login`
Login with credentials

### POST `/api/upload`
Upload PDF (returns extracted transactions)

### GET `/api/transactions`
Get all transactions (supports filters: `buyerName`, `sellerName`, `surveyNumber`, `documentNumber`)

## Database Schema

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  survey_number VARCHAR(255),
  document_number VARCHAR(255),
  registration_date DATE,
  buyer_name_tamil TEXT,
  buyer_name_english TEXT,
  seller_name_tamil TEXT,
  seller_name_english TEXT,
  property_type VARCHAR(255),
  plot_number VARCHAR(255),
  market_value DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Features

### PDF Processing
- Extracts Tamil text using Unicode support
- Identifies transaction boundaries
- Parses dates, numbers, and names
- Handles multi-page documents

### Translation
- Dictionary-based for common terms
- Transliteration for names
- Batch processing for speed

### Search & Filter
- By buyer/seller name
- By survey/document number
- By date range
- Case-insensitive search

## Troubleshooting

**Database connection fails?**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

**PDF upload fails?**
- Max file size: 10MB
- Only PDF format supported

**No transactions extracted?**
- Check PDF format matches Tamil govt documents
- View server logs for errors

## Build for Production

```bash
npm run build
npm start
```

## Security

- JWT authentication with HTTP-only cookies
- SQL injection protection (Drizzle ORM)
- Input validation (Zod schemas)
- Secure file uploads

## License

MIT License

---

**Questions?** Create an issue on GitHub.
